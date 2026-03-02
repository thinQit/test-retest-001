export type Feature = {
  id: string;
  title: string;
  description: string;
  iconUrl?: string | null;
  order?: number | null;
  createdAt?: string | Date | null;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt?: string | Date | null;
};

export type User = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
};
