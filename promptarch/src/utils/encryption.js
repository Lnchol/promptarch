import CryptoJS from 'crypto-js';

const STORAGE_SECRET = "local_storage_encryption_key_123";

export const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), STORAGE_SECRET).toString();
  } catch (e) { console.error("Encryption failed", e); return null; }
};

export const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, STORAGE_SECRET);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) { return null; }
};
