import { Session } from 'next-auth';

// Étendre le type Session de next-auth
declare module 'next-auth' {
  interface Session {
    jwt?: string;
    user?: {
      id: number;
      email: string;
      username?: string;
    };
  }
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface Vote {
  id: number;
  value: number;
  date: string;
  author: User;
  team: Team;
  resource: Resource;
}

export interface Comment {
  id: number;
  content: string;
  date: string;
  author: User;
  team: Team;
  resource: Resource;
}

export interface Team {
  id: number;
  name: string;
  color: string;
  isWelcomeTeam: boolean;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  link: string | null;
  isPublic: boolean;
  author: User;
  teams: Team[];
  votes: Vote[];
  comments: Comment[];
}

export interface StrapiResponse<T> {
  data: {
    id: number;
    attributes: T;
  }[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
} 