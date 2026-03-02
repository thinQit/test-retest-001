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
    const [featuresRes, contactsRes] = await Promise.all([
      api.get<Feature[]>('/api/features', { headers: authHeaders }),
      api.get<ContactSubmission[]>('/api/contact', { headers: authHeaders })
    ]);

    if (feat
... [truncated]
