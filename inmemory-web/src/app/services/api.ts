import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { getToken } from '../utils/auth';

interface ApiResponse<T = any> {
  data: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;
  private maxRetries: number = 3;
  private logoutCallback: (() => void) | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  }

  setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  private async getHeaders(): Promise<Headers> {
    const token = getToken();
    console.log('🔍 Debug - Token récupéré:', token);
    
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
    
    if (token) {
      const authHeader = `Bearer ${token}`;
      headers.append('Authorization', authHeader);
      
      try {
        // Décodage du token pour logging
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Debug - Token décodé:', tokenPayload);
        
        // Vérification basique de l'expiration
        const now = Math.floor(Date.now() / 1000);
        if (tokenPayload.exp && tokenPayload.exp < now) {
          console.error('❌ Token expiré');
          if (this.logoutCallback) {
            this.logoutCallback();
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du décodage du token:', error);
      }
    } else {
      console.warn('⚠️ Pas de token disponible pour la requête');
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    if (response.ok) {
      return isJson ? response.json() : response.text() as unknown as T;
    }

    if (response.status === 401) {
      console.error('Erreur 401 - Headers:', Object.fromEntries(response.headers.entries()));
      throw new Error('Session expirée');
    }

    const error = isJson ? await response.json() : await response.text();
    throw new Error(typeof error === 'string' ? error : error.message || 'Une erreur est survenue');
  }

  async get<T>(url: string, retryCount = 0): Promise<T> {
    try {
      const headers = await this.getHeaders();
      console.log('Headers de la requête:', Object.fromEntries(headers.entries()));
      
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'GET',
        headers,
        credentials: 'include',
        mode: 'cors'
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('Erreur lors de la requête GET:', error);
      
      if (error instanceof Error && error.message === 'Session expirée' && retryCount < this.maxRetries) {
        console.log(`Tentative de retry ${retryCount + 1}/${this.maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.get<T>(url, retryCount + 1);
      }
      throw error;
    }
  }

  async post<T>(url: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data)
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(url: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data)
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
      mode: 'cors'
    });
    return this.handleResponse<T>(response);
  }
}

export const apiService = new ApiService();

// Hook personnalisé pour utiliser le service d'API avec le contexte d'authentification
export function useApi() {
  const { token, logout } = useAuth();

  // Mettre à jour le token dans le service d'API quand il change
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
    // Configurer le callback de déconnexion
    apiService.setLogoutCallback(() => {
      logout();
    });
  }, [token, logout]);

  return apiService;
} 