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
      setDataError(error instanceof Error ? error.message : 'Failed to load admin data.');
    } finally {
      setDataLoading(false);
    }
  }, [authHeaders, token]);

  useEffect(() => {
    void fetchAdminData();
  }, [fetchAdminData]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post<{ token: string; user: User } | null>('/api/auth/login', {
        email,
        password
      });
      if (!response.data?.token || !response.data.user) {
        throw new Error('Invalid login response.');
      }
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      toast({ title: 'Signed in', description: 'Welcome back!' });
      void fetchAdminData();
    } catch (error) {
      toast({
        title: 'Sign in failed',
        description: error instanceof Error ? error.message : 'Unable to sign in.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleCreateFeature = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setFeatureFormError(null);
    try {
      await api.post('/api/features', featureForm, { headers: authHeaders });
      setFeatureForm({ title: '', description: '', iconUrl: '', order: 0 });
      void fetchAdminData();
    } catch (error) {
      setFeatureFormError(error instanceof Error ? error.message : 'Unable to create feature.');
    }
  };

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature);
    setEditForm({
      title: feature.title,
      description: feature.description,
      iconUrl: feature.iconUrl ?? '',
      order: feature.order
    });
  };

  const handleUpdateFeature = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingFeature || !token) return;
    await api.put(`/api/features/${editingFeature.id}`, editForm, { headers: authHeaders });
    setEditingFeature(null);
    void fetchAdminData();
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (!token) return;
    await api.delete(`/api/features/${featureId}`, { headers: authHeaders });
    void fetchAdminData();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader title="Admin Login" description="Sign in to manage content." />
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
            <Input label="Password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage features and contact submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => void fetchAdminData()} disabled={dataLoading}>
            Refresh
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>

      {dataError && <p className="text-sm text-red-500">{dataError}</p>}

      <Card>
        <CardHeader title="Create Feature" description="Add a new feature highlight." />
        <CardContent>
          <form onSubmit={handleCreateFeature} className="space-y-4">
            <Input label="Title" value={featureForm.title} onChange={(event) => setFeatureForm({ ...featureForm, title: event.target.value })} required />
            <Input label="Description" value={featureForm.description} onChange={(event) => setFeatureForm({ ...featureForm, description: event.target.value })} required />
            <Input label="Icon URL" value={featureForm.iconUrl} onChange={(event) => setFeatureForm({ ...featureForm, iconUrl: event.target.value })} />
            <Input label="Order" type="number" value={featureForm.order} onChange={(event) => setFeatureForm({ ...featureForm, order: Number(event.target.value) })} />
            {featureFormError && <p className="text-sm text-red-500">{featureFormError}</p>}
            <Button type="submit">Create feature</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Features" description="Manage existing features." />
        <CardContent>
          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditFeature(feature)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => void handleDeleteFeature(feature.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {!features.length && <p className="text-sm text-muted-foreground">No features yet.</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Contact Submissions" description="Recent messages from the contact form." />
        <CardContent>
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="border-b pb-2">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">{contact.email}</p>
                <p className="text-sm">{contact.message}</p>
              </div>
            ))}
            {!contacts.length && <p className="text-sm text-muted-foreground">No messages yet.</p>}
          </div>
        </CardContent>
      </Card>

      {editingFeature && (
        <Modal title="Edit Feature" onClose={() => setEditingFeature(null)}>
          <form onSubmit={handleUpdateFeature} className="space-y-4">
            <Input label="Title" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} required />
            <Input label="Description" value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} required />
            <Input label="Icon URL" value={editForm.iconUrl} onChange={(event) => setEditForm({ ...editForm, iconUrl: event.target.value })} />
            <Input label="Order" type="number" value={editForm.order} onChange={(event) => setEditForm({ ...editForm, order: Number(event.target.value) })} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingFeature(null)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
