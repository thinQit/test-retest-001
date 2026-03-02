export interface Feature {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'admin' | 'user';
}
