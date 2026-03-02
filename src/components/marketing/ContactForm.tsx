'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';
import { api } from '@/lib/api';
import type { ContactSubmission } from '@/types';

export function ContactForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const nextErrors: { name?: string; email?: string; message?: string } = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email.includes('@')) nextErrors.email = 'Valid email is required';
    if (form.message.trim().length < 10) nextErrors.message = 'Message must be at least 10 characters';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);
    const response = await api.post<ContactSubmission>('/api/contact', form);
    if (response.error) {
      const message = response.error || 'Submission failed';
      setSubmitError(message);
      toast(message, { variant: 'error' });
      setLoading(false);
      return;
    }
    toast('Message sent successfully', { variant: 'success' });
    setLoading(false);
    router.push('/thank-you');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
      <Input
        label="Name"
        name="name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
        placeholder="Your name"
        required
      />
      <Input
        label="Email"
        type="email"
        name="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        placeholder="you@example.com"
        required
      />
      <div className="space-y-1">
        <label htmlFor="message" className="block text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-border"
          rows={5}
          required
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-sm text-error">{errors.message}</p>}
      </div>
      {submitError && <p className="text-sm text-error">{submitError}</p>}
      <Button type="submit" loading={loading} fullWidth>
        Send Message
      </Button>
    </form>
  );
}

export default ContactForm;
