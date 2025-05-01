import { getSession as getNextAuthSession } from 'next-auth/react';

export interface Session {
  jwt?: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

export async function getSession(): Promise<Session | null> {
  try {
    const session = await getNextAuthSession();
    return session as Session;
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return null;
  }
} 