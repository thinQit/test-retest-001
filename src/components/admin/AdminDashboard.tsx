'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
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

  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    setDataError(null);
    try {
      const [featuresRes, contactsRes] = await Promise.all([
        api.get<Feature[] | null>('/api/features', { headers: authHeaders }),
        api.get<ContactSubmission[] | null>('/api/contact', { headers: authHeaders })
      ]);
      setFeatures(featuresRes.data ?? []);
      setContacts(contactsRes.data ?? []);
    } catch (error) {
      setDataError('Failed to load admin data.');
    } finally {
      setDataLoading(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    if (token) {
      void fetchAdminData();
    }
  }, [token, fetchAdminData]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setFeatureFormError(null);
    try {
      const response = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
      void fetchAdminData();
    } catch (error) {
      toast('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader title="Admin Login" />
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Admin Dashboard" />
        <CardContent>
          {dataLoading && (
            <div className="flex items-center justify-center py-6">
              <Spinner />
            </div>
          )}
          {dataError && <p className="text-sm text-red-500">{dataError}</p>}
          {!dataLoading && !dataError && (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold">Features</h3>
                <ul className="mt-2 space-y-2">
                  {features.map((feature) => (
                    <li key={feature.id} className="text-sm text-slate-700">
                      {feature.title}
                    </li>
                  ))}
                  {features.length === 0 && <li className="text-sm text-slate-500">No features yet.</li>}
                </ul>
              </section>
              <section>
                <h3 className="text-lg font-semibold">Contact Submissions</h3>
                <ul className="mt-2 space-y-2">
                  {contacts.map((contact) => (
                    <li key={contact.id} className="text-sm text-slate-700">
                      {contact.name} — {contact.email}
                    </li>
                  ))}
                  {contacts.length === 0 && <li className="text-sm text-slate-500">No submissions yet.</li>}
                </ul>
              </section>
            </div>
          )}
        </CardContent>
      </Card>

      {editingFeature && (
        <Modal isOpen onClose={() => setEditingFeature(null)} title="Edit Feature">
          <div className="space-y-4">
            <Input
              label="Title"
              value={editForm.title}
              onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <Input
              label="Description"
              value={editForm.description}
              onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <Button onClick={() => setEditingFeature(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
