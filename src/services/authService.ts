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
      // Try /api/Users first (confirmed working — returns 201 with user object)
      // Then fallback to /api/Auth/register if that fails
      const endpoints = [
        `${API_BASE_URL}/Users`,
        `${API_BASE_URL}/Auth/register`,
      ];

      let lastResponse: Response | null = null;
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (res.ok) {
            console.log(`[AuthService] Register succeeded via ${endpoint}`);
            return await res.json();
          }
          // Store last non-ok response for error extraction
          if (res.status !== 404 && res.status !== 405) {
            lastResponse = res;
          }
        } catch (endpointErr) {
          console.warn(`[AuthService] Register endpoint ${endpoint} threw:`, endpointErr);
        }
      }

      // All endpoints failed — extract error from last response
      let errorMessage = 'Registration failed';
      if (lastResponse) {
        try {
          const error = await lastResponse.json();
          if (Array.isArray(error.errors) && error.errors.length > 0) {
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
          errorMessage = `Server Error (${lastResponse.status})`;
        }
      }
      throw new Error(errorMessage);
    } catch (e) {
      console.warn('Registration error', e);
      throw e;
    }
  }
};
