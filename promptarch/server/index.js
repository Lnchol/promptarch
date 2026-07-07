import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Firebase Admin and Iyzico
import { db, auth } from './firebase.js';
import iyzico from './iyzico.js';
import { PaymentStates, calculateEndDate } from './PaymentStates.js';

const app = express();
const PORT = 3001;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

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

// Smart local fallback generator for when Gemini API key is invalid/fails
function generateSmartFallback(promptText, schema) {
  const prompt = (promptText || '').toLowerCase();
  
  // Default values
  let role = "Expert Software Engineer";
  let task = "Build a high-performance application with clean architecture and modern practices.";
  let focus = "Clean Code, Performance, and Security";
  let tone = "balanced";
  let style = "modern";
  let rules = [
    "Write modular, reusable, and self-documenting code.",
    "Follow industry-standard design patterns.",
    "Avoid unnecessary external dependencies."
  ];
  let skills = ["codeGeneration", "architecture", "debugging"];
  let stack = {};

  // Detect category/stack from prompt
  if (prompt.includes('claude.md') || prompt.includes('claude_md') || prompt.includes('guidelines') || prompt.includes('claude')) {
    role = "Expert AI Coding Assistant Guidelines Specialist";
    task = "Generate a clear, token-efficient CLAUDE.md file containing developer guidelines, styling rules, and commands.";
    focus = "Token efficiency, clear developer workflows, and precise coding rules.";
    tone = "instructive";
    style = "concise";
    stack = {
      skipFiller: true,
      codeDiffs: true,
      noExplanation: true,
      dryRunOnly: false
    };
    rules = [
      "Respond strictly using XML tags for guidelines structure.",
      "Never rewrite entire files; output only target changes or diff blocks.",
      "Minimize non-code conversational elements to save tokens.",
      "Verify all code edits before completing the instruction task."
    ];
  } else if (prompt.includes('web') || prompt.includes('react') || prompt.includes('html') || prompt.includes('website') || prompt.includes('site')) {
    role = "Expert Website Developer";
    task = "Develop a responsive, visually stunning website using modern layout and CSS/JS standards.";
    focus = "Responsive UI, smooth micro-interactions, and visual excellence.";
    stack = { react: true, tailwind: true };
    rules.push("Ensure full mobile responsiveness.", "Use modern styling methods (Tailwind or CSS modules).");
  } else if (prompt.includes('mobile') || prompt.includes('ios') || prompt.includes('android') || prompt.includes('flutter')) {
    role = "Senior Mobile App Developer";
    task = "Design and build a cross-platform mobile application with fluid navigation and native-like feel.";
    focus = "Smooth animations, offline support, and touch optimization.";
    stack = { flutter: true };
    rules.push("Optimize touch hit targets.", "Implement proper state management.");
  } else if (prompt.includes('game') || prompt.includes('3d') || prompt.includes('threejs')) {
    role = "3D Creative Web Developer";
    task = "Create an immersive, interactive 3D web experience with WebGL and smooth physics.";
    focus = "Framerate optimization (60 FPS), realistic lighting, and premium shaders.";
    stack = { react: true, threejs: true };
    rules.push("Optimize WebGL render cycles to avoid memory leaks.", "Use requestAnimationFrame for smooth animations.");
  } else if (prompt.includes('engineering') || prompt.includes('simulation') || prompt.includes('matlab') || prompt.includes('fluent')) {
    role = "Computational Science & Engineering Specialist";
    task = "Analyze and solve complex engineering problems using numerical simulations and math modeling.";
    focus = "Precision, boundary conditions, and code efficiency.";
    stack = { matlab: true, python_sci: true };
    rules.push("Document all mathematical formulations in LaTeX.", "State all modeling assumptions explicitly.");
  }

  // Populate dynamic rules based on keywords
  if (prompt.includes('auth') || prompt.includes('secure') || prompt.includes('login')) {
    rules.push("Implement secure password hashing and JWT token expiration.", "Validate and sanitize all user inputs to prevent injection attacks.");
  }
  if (prompt.includes('database') || prompt.includes('sql') || prompt.includes('sqlite')) {
    rules.push("Use prepared statements/ORMs to protect against SQL injections.", "Ensure database transactions are atomic and properly indexed.");
  }

  // Build schema matching output
  const output = {};
  if (schema && schema.properties) {
    for (const key of Object.keys(schema.properties)) {
      if (key === 'role') output.role = role;
      else if (key === 'task') output.task = task;
      else if (key === 'focus') output.focus = focus;
      else if (key === 'tone') output.tone = tone;
      else if (key === 'style') output.style = style;
      else if (key === 'customRules') output.customRules = rules;
      else if (key === 'suggestedSecurityChecks') {
        const sec = [];
        if (prompt.includes('auth') || prompt.includes('secure') || prompt.includes('login') || prompt.includes('web') || prompt.includes('react') || prompt.includes('site') || prompt.includes('website')) {
          sec.push('inputValidation', 'xssProtection');
        }
        if (prompt.includes('database') || prompt.includes('sql')) {
          sec.push('sqlInjection');
        }
        if (sec.length === 0) {
          sec.push('inputValidation');
        }
        output.suggestedSecurityChecks = sec;
      }
      else if (key === 'suggestedSkills') {
        output.suggestedSkills = skills;
      }
      else if (key === 'stack') {
        output.stack = {};
        if (schema.properties.stack && schema.properties.stack.properties) {
          for (const sKey of Object.keys(schema.properties.stack.properties)) {
            output.stack[sKey] = !!stack[sKey];
          }
        }
      }
    }
  }

  return output;
}

// --- AI GENERATION (Server-side - keeps API key secure) ---
app.post('/api/generate', async (req, res) => {
  const { prompt, schema, language } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    try {
      const fallbackData = generateSmartFallback(prompt, schema);
      return res.json(fallbackData);
    } catch (fallbackError) {
      return res.status(503).json({ error: "Gemini API Key missing and fallback failed." });
    }
  }

  try {
    const langInstruction = language ? `Respond in ${language} language.` : "";
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt + ` \n\n${langInstruction}\nRespond strictly with valid JSON matching this schema: ` + JSON.stringify(schema) }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    let responseText = result.response.text();
    
    // Safety check: try to extract JSON if it's wrapped in other text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }
    
    res.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Gemini Error:", error);
    try {
      const fallbackData = generateSmartFallback(prompt, schema);
      res.json(fallbackData);
    } catch (fallbackError) {
      console.error("Fallback Error:", fallbackError);
      res.status(500).json({ error: "AI Generation Failed: " + error.message });
    }
  }
});

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

// Serve static assets and handle routing for frontend
const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  app.get('/{*splat}', (req, res, next) => {
    // If it's an API route that didn't match any handlers, return 404
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // Otherwise, serve index.html for SPA routing
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist doesn't exist, show a helpful message during development
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prompt Architect Backend API</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f0f11; color: #e4e4e7; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .container { max-width: 600px; background: #18181b; padding: 40px; border-radius: 12px; border: 1px solid #27272a; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
            h1 { color: #f4f4f5; margin-bottom: 16px; font-size: 24px; }
            p { color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
            a { color: #6366f1; text-decoration: none; font-weight: 500; border-bottom: 2px solid transparent; transition: all 0.2s; }
            a:hover { border-bottom-color: #6366f1; }
            .badge { background: #27272a; color: #e4e4e7; padding: 6px 12px; border-radius: 9999px; font-size: 14px; font-weight: 500; display: inline-block; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge">API Server Running</div>
            <h1>Cannot GET ${req.path}</h1>
            <p>
              This is the backend API server. If you want to access the application UI:
            </p>
            <p>
              1. <strong>Local Development:</strong> Open <a href="http://localhost:5173" target="_blank">http://localhost:5173</a> (Vite Dev Server).<br/>
              2. <strong>Production:</strong> Run <code>npm run build</code> to compile the frontend, then refresh this page.
            </p>
          </div>
        </body>
      </html>
    `);
  });
}

// Export app for Netlify Functions
export { app };

// Only start server if not running in Netlify Functions
if (!process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
