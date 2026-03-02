export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconUrl?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  source?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
