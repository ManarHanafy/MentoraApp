import { API_BASE_URL } from '../config/env';

export interface RegisterRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

export const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        return await response.json();
      }
      
      let errorMessage = 'Login failed';
      try {
        const error = await response.json();
        if (Array.isArray(error.errors) && error.errors.length > 0) {
          // Backend returns [{code, field, description}] — show field-level details first
          errorMessage = error.errors.map((e: any) => e.description || e.message || String(e)).join('\n');
        } else if (error.errors && typeof error.errors === 'object') {
          errorMessage = Object.values(error.errors).flat().join('\n');
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.title && typeof error.title === 'string') {
          errorMessage = error.title;
        }
      } catch {
        errorMessage = `Server Error (${response.status})`;
      }
      throw new Error(errorMessage);
    } catch (e) {
      console.warn('Login error', e);
      throw e;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      // Primary registration endpoint in C# backend is POST /api/Auth/register
      let endpoint = `${API_BASE_URL}/Auth/register`;
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // Fallback endpoint if /api/Auth/register is not available (e.g. older environments)
      if (!response.ok) {
        const fallbackEndpoint = `${API_BASE_URL}/Users`;
        try {
          const fallbackRes = await fetch(fallbackEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (fallbackRes.ok) {
            return await fallbackRes.json();
          }
          // If fallback also failed but got a better status, use it for error extracting
          if (fallbackRes.status !== 404) {
            response = fallbackRes;
          }
        } catch (err) {
          console.warn('Fallback registration error', err);
        }
      }

      if (response.ok) {
        return await response.json();
      }
      
      let errorMessage = 'Registration failed';
      try {
        const error = await response.json();
        if (Array.isArray(error.errors) && error.errors.length > 0) {
          // Backend returns [{code, field, description}] — show field-level details first
          errorMessage = error.errors.map((e: any) => e.description || e.message || String(e)).join('\n');
        } else if (error.errors && typeof error.errors === 'object') {
          errorMessage = Object.values(error.errors).flat().join('\n');
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if (error.title && typeof error.title === 'string') {
          errorMessage = error.title;
        }
      } catch {
        errorMessage = `Server Error (${response.status})`;
      }
      throw new Error(errorMessage);
    } catch (e) {
      console.warn('Registration error', e);
      throw e;
    }
  }
};
