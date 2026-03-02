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
      toast({ title: 'Error', description: 'Failed to load admin data.', variant: 'error' });
    } finally {
      setDataLoading(false);
    }
  }, [authHeaders, token, toast]);

  useEffect(() => {
    void fetchAdminData();
  }, [fetchAdminData]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post<{ token: string; user: User } | null>('/api/auth/login', { email, password });
      if (!response.data) {
        throw new Error('Invalid login response');
      }
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      toast({ title: 'Welcome back', description: 'You are now logged in.' });
      await fetchAdminData();
    } catch (error) {
      toast({ title: 'Login failed', description: 'Check your credentials and try again.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleFeatureSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFeatureFormError(null);
    if (!token) return;
    try {
      const payload = { ...featureForm, order: Number(featureForm.order) };
      await api.post('/api/features', payload, { headers: authHeaders });
      setFeatureForm({ title: '', description: '', iconUrl: '', order: 0 });
      toast({ title: 'Feature created', description: 'Your feature has been added.' });
      await fetchAdminData();
    } catch (error) {
      setFeatureFormError('Failed to create feature.');
      toast({ title: 'Error', description: 'Failed to create feature.', variant: 'error' });
    }
  };

  const handleEditSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !editingFeature) return;
    try {
      const payload = { ...editForm, order: Number(editForm.order) };
      await api.put(`/api/features/${editingFeature.id}`, payload, { headers: authHeaders });
      toast({ title: 'Feature updated', description: 'Your changes have been saved.' });
      setEditingFeature(null);
      await fetchAdminData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update feature.', variant: 'error' });
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (!token) return;
    try {
      await api.delete(`/api/features/${featureId}`, { headers: authHeaders });
      toast({ title: 'Feature deleted', description: 'The feature has been removed.' });
      await fetchAdminData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete feature.', variant: 'error' });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-10">
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
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <Button variant="secondary" onClick={handleLogout}>
          Sign out
        </Button>
      </div>

      {dataLoading && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Spinner size="sm" /> Loading data…
        </div>
      )}

      {dataError && <p className="text-sm text-red-500">{dataError}</p>}

      <Card>
        <CardHeader title="Create Feature" />
        <CardContent>
          <form onSubmit={handleFeatureSubmit} className="grid gap-4 md:grid-cols-2">
            <Input
              label="Title"
              value={featureForm.title}
              onChange={(event) => setFeatureForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <Input
              label="Icon URL"
              value={featureForm.iconUrl}
              onChange={(event) => setFeatureForm((prev) => ({ ...prev, iconUrl: event.target.value }))}
            />
            <Input
              label="Description"
              value={featureForm.description}
              onChange={(event) => setFeatureForm((prev) => ({ ...prev, description: event.target.value }))}
              required
            />
            <Input
              type="number"
              label="Order"
              value={featureForm.order}
              onChange={(event) => setFeatureForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
            />
            {featureFormError && <p className="text-sm text-red-500">{featureFormError}</p>}
            <Button type="submit">Add Feature</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Features" />
        <CardContent>
          <div className="space-y-3">
            {features.length === 0 && <p className="text-sm text-muted">No features yet.</p>}
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted">{feature.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingFeature(feature);
                      setEditForm({
                        title: feature.title,
                        description: feature.description,
                        iconUrl: feature.iconUrl ?? '',
                        order: feature.order
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteFeature(feature.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Contact Submissions" />
        <CardContent>
          <div className="space-y-3">
            {contacts.length === 0 && <p className="text-sm text-muted">No submissions yet.</p>}
            {contacts.map((contact) => (
              <div key={contact.id} className="border-b pb-2">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted">{contact.email}</p>
                <p className="text-sm">{contact.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal open={Boolean(editingFeature)} onOpenChange={(open) => !open && setEditingFeature(null)}>
        <Card>
          <CardHeader title="Edit Feature" />
          <CardContent>
            <form onSubmit={handleEditSubmit} className="grid gap-4">
              <Input
                label="Title"
                value={editForm.title}
                onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
              <Input
                label="Icon URL"
                value={editForm.iconUrl}
                onChange={(event) => setEditForm((prev) => ({ ...prev, iconUrl: event.target.value }))}
              />
              <Input
                label="Description"
                value={editForm.description}
                onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                required
              />
              <Input
                type="number"
                label="Order"
                value={editForm.order}
                onChange={(event) => setEditForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setEditingFeature(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Modal>
    </div>
  );
}
