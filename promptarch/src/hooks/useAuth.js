import { useState, useEffect, useCallback, useRef } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { apiCall } from '../utils/api';

// Token refresh interval (55 minutes - refresh 5 min before expiry)
const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000;

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState(null);
  
  const refreshIntervalRef = useRef(null);

  // Refresh token with retry logic
  const refreshToken = useCallback(async (forceRefresh = false) => {
    if (!auth.currentUser) return null;
    
    try {
      const newToken = await auth.currentUser.getIdToken(forceRefresh);
      setToken(newToken);
      setAuthError(null);
      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      setAuthError("Session expired. Please log in again.");
      
      // If refresh fails, force logout
      if (error.code === 'auth/user-token-expired' || 
          error.code === 'auth/user-disabled') {
        await signOut(auth);
      }
      return null;
    }
  }, []);

  // Check user status (banned/suspended)
  const checkUserStatus = useCallback(async (userData) => {
    if (!userData) return false;
    
    const status = userData.status || 'active';
    
    if (status === 'banned' || status === 'suspended') {
      setAuthError(`Account ${status}. Contact support for assistance.`);
      await signOut(auth);
      return false;
    }
    return true;
  }, []);

  // Fetch user profile - fast with immediate fallback
  const fetchUserProfile = useCallback(async (idToken, currentUser) => {
    try {
      const res = await apiCall('/users/profile', 'GET', null, idToken);
      
      if (res && !res.error) {
        const isActive = await checkUserStatus(res.user);
        if (!isActive) return null;
        return { ...res.user, uid: currentUser.uid };
      }
    } catch (error) {
      console.log("Profile fetch failed, using fallback:", error);
    }
    
    // Immediate fallback - don't wait for backend sync
    return { 
      uid: currentUser.uid, 
      username: currentUser.email.split('@')[0], 
      is_pro: 0 
    };
  }, [checkUserStatus]);

  // Setup token refresh interval
  const setupTokenRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = setInterval(() => {
      refreshToken(true);
    }, TOKEN_REFRESH_INTERVAL);
  }, [refreshToken]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
          
          const userData = await fetchUserProfile(idToken, currentUser);
          if (userData) {
            setUser(userData);
            setupTokenRefresh();
          }
        } catch (error) {
          console.error("Auth state change error:", error);
          setAuthError("Failed to load user data.");
        }
      } else {
        setUser(null);
        setToken(null);
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchUserProfile, setupTokenRefresh]);

  const login = async (email, password) => {
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (email, password) => {
    try {
      setAuthError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await apiCall('/auth/sync', 'POST', { email }, idToken);
      return { success: true };
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      await signOut(auth);
      setAuthError(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const cancelSubscription = async () => {
    const res = await apiCall('/auth/cancel-subscription', 'POST', null, token);
    if (res.success) {
      setUser(prev => ({ ...prev, auto_renew: 0 }));
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  // Anonymous login - for new users / guest mode
  const loginAnonymously = async () => {
    try {
      setAuthError(null);
      await signInAnonymously(auth);
      return { success: true };
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Link anonymous account with email/password (upgrade to full account)
  const linkAccount = async (email, password) => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'No user logged in' };
      }
      setAuthError(null);
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(auth.currentUser, credential);
      const idToken = await auth.currentUser.getIdToken();
      await apiCall('/auth/sync', 'POST', { email }, idToken);
      // Update user state to reflect linked account
      setUser(prev => ({ ...prev, isAnonymous: false, email }));
      return { success: true };
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Auto-login anonymously on first launch if no user
  useEffect(() => {
    const autoLogin = async () => {
      // Wait for initial auth check to complete
      if (!loading && !user && !auth.currentUser) {
        console.log('No user detected, logging in anonymously...');
        await loginAnonymously();
      }
    };
    autoLogin();
  }, [loading, user]);

  // Check if current user is anonymous
  const isAnonymous = user && auth.currentUser?.isAnonymous;

  // Expose token refresh for manual refresh
  const forceTokenRefresh = () => refreshToken(true);

  return { 
    user, 
    token, 
    loading,
    authError,
    isAnonymous,
    showAuthModal, 
    setShowAuthModal, 
    authMode, 
    setAuthMode, 
    login, 
    register, 
    logout,
    loginAnonymously,
    linkAccount,
    cancelSubscription,
    updateUser,
    forceTokenRefresh
  };
};

// Map Firebase error codes to user-friendly messages
function getAuthErrorMessage(code) {
  const messages = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'Email already in use.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/invalid-login-credentials': 'Invalid email or password.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled.',
    'auth/missing-password': 'Please enter a password.',
    'auth/missing-email': 'Please enter an email address.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
    'auth/firebase-app-check-token-is-invalid': 'App Check token invalid. Please disable App Check for localhost in Firebase Console.',
  };
  if (!messages[code]) {
    console.error('Unhandled Firebase auth error code:', code);
  }
  return messages[code] || 'Authentication failed. Please try again.';
}
