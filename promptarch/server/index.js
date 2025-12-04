import { createRequire } from "module";
const require = createRequire(import.meta.url);
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Import Firebase Admin and Iyzico
import { db, auth } from './firebase.js';
import iyzico from './iyzico.js';
import { PaymentStates, calculateEndDate } from './PaymentStates.js';

const app = express();
const PORT = 3001;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// --- MIDDLEWARE ---
app.use(helmet());
app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: "Too many requests, please try again later."
});
app.use('/api/auth/', authLimiter);

// --- AUTH MIDDLEWARE ---
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting Firebase ID Token

  if (!token) return res.sendStatus(401);

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.sendStatus(403);
  }
};

// --- AUTH ROUTES ---
// Sync user from Client Auth to Firestore
app.post('/api/auth/sync', authenticateToken, async (req, res) => {
  const { email } = req.body;
  const uid = req.user.uid;

  try {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        email,
        username: email.split('@')[0], // Default username
        is_pro: 0,
        subscription_type: 'free',
        created_at: new Date(),
        auto_renew: 1
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/cancel-subscription', authenticateToken, async (req, res) => {
  const uid = req.user.uid;
  try {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    
    if (!doc.exists) return res.status(404).json({ error: "User not found" });
    const userData = doc.data();

    if (userData.subscription_type === 'yearly') {
      return res.status(400).json({ error: "Yearly subscriptions cannot be cancelled early." });
    }

    await userRef.update({ auto_renew: 0 });
    res.json({ success: true, auto_renew: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- USER PROFILE ---
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userDoc.data();
    
    // Get Prompts
    const promptsSnapshot = await db.collection('prompts')
      .where('user_id', '==', req.user.uid)
      .orderBy('created_at', 'desc')
      .get();

    const prompts = [];
    promptsSnapshot.forEach(doc => prompts.push({ id: doc.id, ...doc.data() }));

    res.json({
      user: userData,
      prompts,
      promptCount: prompts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PROMPTS ---
app.get('/api/prompts/trending', async (req, res) => {
  try {
    const snapshot = await db.collection('prompts')
      .where('is_shared', '==', true)
      .orderBy('likes', 'desc')
      .limit(50)
      .get();

    const prompts = [];
    snapshot.forEach(doc => prompts.push({ id: doc.id, ...doc.data() }));
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/prompts', authenticateToken, async (req, res) => {
  const { role, task, content, idempotencyKey } = req.body;
  const uid = req.user.uid;

  // Idempotency check - prevent duplicate requests
  if (idempotencyKey) {
    const idempotencyRef = db.collection('idempotency').doc(`prompt_${uid}_${idempotencyKey}`);
    const idempotencyDoc = await idempotencyRef.get();
    
    if (idempotencyDoc.exists) {
      console.log('Duplicate request detected:', idempotencyKey);
      return res.json(idempotencyDoc.data().response);
    }
  }

  try {
    // Use Firestore transaction for atomic check-and-insert
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(uid);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('USER_NOT_FOUND');
      }
      
      const userData = userDoc.data();

      // Check limits atomically within transaction
      if (userData.is_pro === 0) {
        const promptsRef = db.collection('prompts').where('user_id', '==', uid);
        const countSnapshot = await transaction.get(promptsRef);
        
        if (countSnapshot.size >= 3) {
          throw new Error('LIMIT_REACHED');
        }
      }

      // Create prompt within transaction
      const promptRef = db.collection('prompts').doc();
      const newPrompt = {
        user_id: uid,
        username: userData.username,
        role,
        task,
        content,
        is_shared: false,
        likes: 0,
        created_at: new Date().toISOString()
      };
      
      transaction.set(promptRef, newPrompt);

      // Store idempotency key if provided
      if (idempotencyKey) {
        const idempotencyRef = db.collection('idempotency').doc(`prompt_${uid}_${idempotencyKey}`);
        transaction.set(idempotencyRef, {
          response: { id: promptRef.id, success: true },
          created_at: new Date(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hour TTL
        });
      }

      return { id: promptRef.id, success: true };
    });

    res.json(result);
  } catch (error) {
    if (error.message === 'LIMIT_REACHED') {
      return res.status(403).json({ error: "Limit reached. Upgrade to Pro.", limitReached: true });
    }
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: "User not found" });
    }
    console.error('Prompt save error:', error);
    res.status(500).json({ error: error.message });
  }
});


app.patch('/api/prompts/:id/share', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { isShared } = req.body;
  
  try {
    const promptRef = db.collection('prompts').doc(id);
    const doc = await promptRef.get();
    
    if (!doc.exists) return res.status(404).json({ error: 'Prompt not found' });
    if (doc.data().user_id !== req.user.uid) return res.status(403).json({ error: 'Unauthorized' });

    await promptRef.update({ is_shared: isShared });
    res.json({ success: true, isShared });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI GENERATION (DEPRECATED: Now handled client-side via Firebase Vertex AI) ---
/*
app.post('/api/generate', async (req, res) => {
  const { prompt, schema, language } = req.body;
  
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "Gemini API Key missing." });

  try {
    const langInstruction = language ? `Respond in ${language} language.` : "";
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt + ` \n\n${langInstruction}\nRespond strictly with valid JSON matching this schema: ` + JSON.stringify(schema) }] }],
    });
    
    let responseText = result.response.text();
    console.log("Gemini Raw Response:", responseText);
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI Generation Failed: " + error.message });
  }
});
*/

// --- IYZICO PAYMENTS ---

// Payment initialization with state tracking
app.post('/api/payments/iyzico/initialize', authenticateToken, async (req, res) => {
  const { subscriptionType } = req.body; // 'monthly' or 'yearly'
  const uid = req.user.uid;
  
  try {
    // Check for existing pending payment - prevent multiple payment sessions
    const existingPayment = await db.collection('payments')
      .where('user_id', '==', uid)
      .where('status', 'in', [PaymentStates.PENDING, PaymentStates.PROCESSING])
      .limit(1)
      .get();

    if (!existingPayment.empty) {
      const payment = existingPayment.docs[0].data();
      return res.status(409).json({
        error: 'Payment already in progress',
        existingPaymentId: payment.conversation_id,
        checkoutFormContent: payment.checkout_form_content
      });
    }

    const price = subscriptionType === 'monthly' ? '12.99' : '107.88';
    const conversationId = `${uid}_${Date.now()}`;
    const callbackUrl = `${req.protocol}://${req.get('host')}/api/payments/iyzico/callback`;
    
    // Create payment record BEFORE calling Iyzico
    const paymentRef = db.collection('payments').doc();
    await paymentRef.set({
      user_id: uid,
      subscription_type: subscriptionType,
      amount: price,
      status: PaymentStates.PENDING,
      conversation_id: conversationId,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 min timeout
    });

    const request = {
      locale: 'tr',
      conversationId: conversationId,
      price: price,
      paidPrice: price,
      currency: 'USD',
      basketId: 'B' + Date.now(),
      paymentGroup: 'PRODUCT',
      callbackUrl: callbackUrl,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: uid,
        name: 'John', // In a real app, collect this info
        surname: 'Doe',
        gsmNumber: '+905350000000',
        email: req.user.email || 'email@email.com',
        identityNumber: '74300864791',
        lastLoginDate: '2015-10-05 12:43:35',
        registrationDate: '2013-04-21 15:12:09',
        registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        ip: req.ip,
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34732'
      },
      shippingAddress: {
        contactName: 'Jane Doe',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34742'
      },
      billingAddress: {
        contactName: 'Jane Doe',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: '34742'
      },
      basketItems: [
        {
          id: subscriptionType,
          name: `Pro ${subscriptionType} Subscription`,
          category1: 'Subscription',
          itemType: 'VIRTUAL',
          price: price
        }
      ]
    };

    iyzico.checkoutFormInitialize.create(request, async (err, result) => {
      if (err) {
        await paymentRef.update({ status: PaymentStates.FAILED, error: JSON.stringify(err) });
        return res.status(500).json({ error: err });
      }
      
      // Update payment with Iyzico token
      await paymentRef.update({
        payment_token: result.token,
        checkout_form_content: result.checkoutFormContent,
        status: PaymentStates.PROCESSING
      });
      
      res.json(result);
    });
  } catch (error) {
    console.error('Payment init error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Idempotent payment callback
app.post('/api/payments/iyzico/callback', async (req, res) => {
  const { token } = req.body;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    // Find payment record by token
    const paymentSnapshot = await db.collection('payments')
      .where('payment_token', '==', token)
      .limit(1)
      .get();

    if (paymentSnapshot.empty) {
      console.error('Payment not found for token:', token);
      return res.redirect(`${clientUrl}?payment=not_found`);
    }

    const paymentDoc = paymentSnapshot.docs[0];
    const paymentData = paymentDoc.data();

    // IDEMPOTENCY CHECK: If already processed, skip processing
    if (paymentData.status === PaymentStates.SUCCESS) {
      console.log('Duplicate callback ignored for:', token);
      return res.redirect(`${clientUrl}?payment=success`);
    }

    // Verify with Iyzico
    iyzico.checkoutForm.retrieve({ token }, async (err, result) => {
      if (err || result.status !== 'success') {
        await paymentDoc.ref.update({
          status: PaymentStates.FAILED,
          iyzico_response: result ? JSON.stringify(result) : null,
          error: err ? JSON.stringify(err) : 'Payment failed',
          updated_at: new Date()
        });
        return res.redirect(`${clientUrl}?payment=failed`);
      }

      const uid = paymentData.user_id;
      const type = paymentData.subscription_type;
      const endDate = calculateEndDate(type);

      // Use transaction to update both payment and user atomically
      try {
        await db.runTransaction(async (transaction) => {
          // Re-check payment status within transaction (double-check locking)
          const currentPayment = await transaction.get(paymentDoc.ref);
          if (currentPayment.data().status === PaymentStates.SUCCESS) {
            console.log('Payment already processed within transaction:', token);
            return;
          }

          // Update user
          const userRef = db.collection('users').doc(uid);
          transaction.update(userRef, {
            is_pro: 1,
            subscription_type: type,
            subscription_end_date: endDate.toISOString(),
            auto_renew: 1,
            last_payment_id: result.paymentId
          });

          // Update payment status
          transaction.update(paymentDoc.ref, {
            status: PaymentStates.SUCCESS,
            iyzico_payment_id: result.paymentId,
            completed_at: new Date(),
            iyzico_response: JSON.stringify(result)
          });
        });

        res.redirect(`${clientUrl}?payment=success`);
      } catch (error) {
        console.error('Transaction Error:', error);
        await paymentDoc.ref.update({
          status: PaymentStates.FAILED,
          error: error.message,
          updated_at: new Date()
        });
        res.redirect(`${clientUrl}?payment=error`);
      }
    });
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect(`${clientUrl}?payment=error`);
  }
});

// Cleanup expired payments endpoint (call via cron job every 5 min)
app.post('/api/payments/cleanup-expired', async (req, res) => {
  try {
    const now = new Date();
    
    const expiredPayments = await db.collection('payments')
      .where('status', 'in', [PaymentStates.PENDING, PaymentStates.PROCESSING])
      .where('expires_at', '<', now)
      .get();

    if (expiredPayments.empty) {
      return res.json({ cleaned: 0 });
    }

    const batch = db.batch();
    expiredPayments.forEach(doc => {
      batch.update(doc.ref, { 
        status: PaymentStates.TIMEOUT,
        updated_at: now
      });
    });

    await batch.commit();
    res.json({ cleaned: expiredPayments.size });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export app for Netlify Functions
export { app };

// Only start server if not running in Netlify Functions
if (!process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
