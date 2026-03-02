'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import type { Feature, ContactSubmission, User } from '@/types';
import { useToast } from '@/providers/ToastProvider';
import { api } from '@/lib/api';

export function AdminDashboard() {
  const { user, setUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', iconUrl: '', order: 0 });
  const [featureFormError, setFeatureFormError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', iconUrl: '', order: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  const fetchAdminData = async () => {
    if (!token) return;
    setDataLoading(true);
    setDataError(null);
    try {
      const [featuresRes, contactsRes] = await Promise.all([
        api.get<Feature[]>('/api/features', { headers: authHeaders }),
        api.get<ContactSubmission[]>('/api/contact', { headers: authHeaders })
      ]);
      setFeatures(featuresRes.data ?? []);
      setContacts(contactsRes.data ?? []);
    } catch {
      setDataError('Unable to load admin data.');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      void fetchAdminData();
    }
  }, [token]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post<{ token: string; user: User }>('/api/auth/login', {
        email,
        password
      });
      setToken(response.data.token);
      setUser(response.data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      toast({ title: 'Signed in successfully.' });
    } catch {
      toast({ title: 'Sign in failed. Please check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Admin Dashboard" />
        <CardContent>
          {authLoading || dataLoading ? (
            <div className="flex items-center gap-2">
              <Spinner />
              <span>Loading admin data…</span>
            </div>
          ) : dataError ? (
            <p className="text-red-500">{dataError}</p>
          ) : (
            <div className="space-y-2">
              <p>Welcome back, {user?.name ?? 'Admin'}.</p>
              <p>Features: {features.length}</p>
              <p>Contact submissions: {contacts.length}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!user && (
        <Card>
          <CardHeader title="Admin Login" />
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <Input
                type="email"
                value={email}
                placeholder="Email"
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                type="password"
                value={password}
                placeholder="Password"
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Modal
        open={Boolean(editingFeature)}
        title="Edit Feature"
        onClose={() => setEditingFeature(null)}
      >
        <div className="space-y-3">
          <Input
            value={editForm.title}
            placeholder="Title"
            onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
          />
          <Input
            value={editForm.description}
            placeholder="Description"
            onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
          />
          <Input
            value={editForm.iconUrl}
            placeholder="Icon URL"
            onChange={(event) => setEditForm({ ...editForm, iconUrl: event.target.value })}
          />
          {featureFormError && <p className="text-red-500">{featureFormError}</p>}
        </div>
      </Modal>
    </div>
  );
}
