import AsyncStorage from '@react-native-async-storage/async-storage';

const isTokenExpired = (token: string): boolean => {
  try {
    if (!token || token.startsWith('mock_')) return false; // Don't try to decode mock tokens
    
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode base64 URL
    let payloadStr = parts[1];
    payloadStr = payloadStr.replace(/-/g, '+').replace(/_/g, '/');
    while (payloadStr.length % 4) {
      payloadStr += '=';
    }
    
    // Base64 decoding in pure JS
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let decoded = '';
    let buffer = 0;
    let bits = 0;
    
    for (let i = 0; i < payloadStr.length; i++) {
      const char = payloadStr.charAt(i);
      const idx = chars.indexOf(char);
      if (idx === -1 || char === '=') continue;
      
      buffer = (buffer << 6) | idx;
      bits += 6;
      
      if (bits >= 8) {
        bits -= 8;
        const byte = (buffer >> bits) & 0xff;
        decoded += String.fromCharCode(byte);
      }
    }
    
    const payload = JSON.parse(decoded);
    if (payload && typeof payload.exp === 'number') {
      const bufferTime = 60; // 60 seconds buffer — only refresh when genuinely close to expiry
      const isExpired = payload.exp < (Date.now() / 1000) - bufferTime;
      if (isExpired) {
        console.log('[AuthHelper] JWT Token is expired. Exp:', payload.exp, 'Now:', Math.floor(Date.now() / 1000));
      }
      return isExpired;
    }
    return false;
  } catch (e) {
    console.warn('Failed to parse token exp claim:', e);
    return true; // Treat as expired/invalid
  }
};

export const getOrRefreshToken = async (): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem('@mentora_auth_token');
    
    if (!token || isTokenExpired(token)) {
      const email = await AsyncStorage.getItem('@mentora_user_email');
      const password = await AsyncStorage.getItem('@mentora_user_password');
      
      if (email && password) {
        console.log('[AuthHelper] Token missing or expired. Performing silent re-login for:', email);
        const { AuthService } = require('./authService'); // dynamic import to avoid circular dependency
        const data = await AuthService.login(email.trim(), password);
        if (data && data.token) {
          await AsyncStorage.setItem('@mentora_auth_token', data.token);
          console.log('[AuthHelper] Silent re-login successful. New token saved.');
          return data.token;
        }
      }
    }
    return token || '';
  } catch (e) {
    console.error('[AuthHelper] Failed to refresh token silently:', e);
    // Return whatever token we have as fallback
    const fallbackToken = await AsyncStorage.getItem('@mentora_auth_token');
    return fallbackToken || '';
  }
};
