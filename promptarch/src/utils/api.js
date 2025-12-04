// Use env variable for API URL, default to empty for same-origin requests
export const API_URL = import.meta.env.VITE_API_URL || '';

// Generate idempotency key for safe retries
export const generateIdempotencyKey = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Default options
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

export const apiCall = async (
  endpoint, 
  method = 'GET', 
  body = null, 
  token = null, 
  options = {}
) => {
  const { 
    timeout = DEFAULT_TIMEOUT, 
    retries = method === 'GET' ? MAX_RETRIES : 1,
    idempotencyKey = null 
  } = options;

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
  
  let lastError = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const text = await res.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server Error: ${res.status} ${res.statusText}`);
      }
      
      // Handle specific error codes
      if (res.status === 401) {
        return { error: '401 Unauthorized', needsReauth: true };
      }
      
      if (res.status === 403) {
        return { error: '403 Forbidden', ...data };
      }
      
      if (!res.ok) {
        throw new Error(data.error || `API Error: ${res.status}`);
      }
      
      return data;
      
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      
      // Don't retry on abort (timeout) or non-network errors
      if (err.name === 'AbortError') {
        return { error: 'Request timeout. Please try again.', timeout: true };
      }
      
      // Retry on network errors only
      if (attempt < retries - 1 && err.message.includes('fetch')) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }
  
  console.error('API call failed:', lastError);
  return { error: lastError?.message || 'Network error. Please check your connection.' };
};

// Helper for mutations with idempotency
export const apiMutate = async (endpoint, method, body, token) => {
  const idempotencyKey = generateIdempotencyKey();
  return apiCall(endpoint, method, { ...body, idempotencyKey }, token, { idempotencyKey });
};
