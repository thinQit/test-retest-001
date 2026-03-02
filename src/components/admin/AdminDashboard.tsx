'use client';

import { useEffect, useState } from 'react';
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
    const [featuresRes, contactsRes] = await Promise.all([
      api.get<Feature[]>('/api/features', { headers: authHeaders }),
      api.get<ContactSubmission[]>('/api/contact', { headers: authHeaders })
    ]);

    if (featuresRes.error || contactsRes.error) {
      setDataError(featuresRes.error || contactsRes.error || 'Failed to load admin data');
      setFeatures(featuresRes.data || []);
      setContacts(contactsRes.data || []);
    } else {
      setFeatures(featuresRes.data || []);
      setContacts(contactsRes.data || []);
    }
    setDataLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  const handleLogin = async () => {
    setLoading(true);
    const response = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
    if (response.error || !response.data) {
      toast(response.error || 'Login failed', { variant: 'error' });
      setLoading(false);
      return;
    }
    localStorage.setItem('token', response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    toast('Logged in', { variant: 'success' });
    setLoading(false);
  };

  const validateFeatureForm = () => {
    if (!featureForm.title.trim() || !featureForm.description.trim()) {
      setFeatureFormError('Title and description are required.');
      return false;
    }
    setFeatureFormError(null);
    return true;
  };

  const createFeature = async () => {
    if (!token || !validateFeatureForm()) return;
    const response = await api.post<Feature>('/api/features', featureForm, { headers: authHeaders });
    if (response.error) {
      toast(response.error, { variant: 'error' });
      return;
    }
    setFeatureForm({ title: '', description: '', iconUrl: '', order: 0 });
    toast('Feature created', { variant: 'success' });
    fetchAdminData();
  };

  const openEdit = (feature: Feature) => {
    setEditingFeature(feature);
    setEditForm({
      title: feature.title,
      description: feature.description,
      iconUrl: feature.iconUrl || '',
      order: feature.order ?? 0
    });
  };

  const updateFeature = async () => {
    if (!token || !editingFeature) return;
    const response = await api.put<Feature>(`/api/features/${editingFeature.id}`, editForm, { headers: authHeaders });
    if (response.error) {
      toast(response.error, { variant: 'error' });
      return;
    }
    toast('Feature updated', { variant: 'success' });
    setEditingFeature(null);
    fetchAdminData();
  };

  const deleteFeature = async (id: string) => {
    if (!token) return;
    const confirmed = window.confirm('Delete this feature?');
    if (!confirmed) return;
    const response = await api.delete<{}>(`/api/features/${id}`, { headers: authHeaders });
    if (response.error) {
      toast(response.error, { variant: 'error' });
      return;
    }
    toast('Feature deleted', { variant: 'success' });
    fetchAdminData();
  };

  const deleteContact = async (id: string) => {
    if (!token) return;
    const confirmed = window.confirm('Delete this submission?');
    if (!confirmed) return;
    const response = await api.delete<{}>(`/api/contact/${id}`, { headers: authHeaders });
    if (response.error) {
      toast(response.error, { variant: 'error' });
      return;
    }
    toast('Submission deleted', { variant: 'success' });
    fetchAdminData();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold">Admin Login</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={handleLogin} loading={loading} fullWidth>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage features and review contact submissions.</p>
      </section>

      {dataLoading && (
        <div className="flex items-center justify-center py-6">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {dataError && <p className="text-sm text-error">{dataError}</p>}

      <section className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Create Feature</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              label="Title"
              value={featureForm.title}
              onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
            />
            <Input
              label="Description"
              value={featureForm.description}
              onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })}
            />
            <Input
              label="Icon URL"
              value={featureForm.iconUrl}
              onChange={(e) => setFeatureForm({ ...featureForm, iconUrl: e.target.value })}
            />
            <Input
              label="Order"
              type="number"
              value={featureForm.order}
              onChange={(e) => setFeatureForm({ ...featureForm, order: Number(e.target.value) })}
            />
            {featureFormError && <p className="text-sm text-error">{featureFormError}</p>}
            <Button onClick={createFeature} fullWidth>
              Create
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Features</h2>
          </CardHeader>
          <CardContent>
            {features.length === 0 ? (
              <p className="text-sm text-muted-foreground">No features created yet.</p>
            ) : (
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature.id} className="border-b border-border pb-3 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {feature.createdAt ? new Date(feature.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(feature)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteFeature(feature.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Contact Submissions</h2>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              <ul className="space-y-3">
                {contacts.map((contact) => (
                  <li key={contact.id} className="border-b border-border pb-3 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {contact.name} ({contact.email})
                        </p>
                        <p className="text-sm text-muted-foreground">{contact.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Received: {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => deleteContact(contact.id)}>
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <Modal open={!!editingFeature} title="Edit Feature" onClose={() => setEditingFeature(null)}>
        <div className="space-y-3">
          <Input
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <Input
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
          <Input
            label="Icon URL"
            value={editForm.iconUrl}
            onChange={(e) => setEditForm({ ...editForm, iconUrl: e.target.value })}
          />
          <Input
            label="Order"
            type="number"
            value={editForm.order}
            onChange={(e) => setEditForm({ ...editForm, order: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingFeature(null)}>
              Cancel
            </Button>
            <Button onClick={updateFeature}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
