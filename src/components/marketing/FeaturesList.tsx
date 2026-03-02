'use client';

import { useEffect, useState } from 'react';
import type { Feature } from '@/types';
import FeatureCard from '@/components/marketing/FeatureCard';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

export function FeaturesList() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      setLoading(true);
      const response = await api.get<Feature[]>('/api/features');
      if (response.error) {
        setError(response.error);
        setFeatures([]);
      } else {
        setError(null);
        setFeatures(response.data || []);
      }
      setLoading(false);
    };

    fetchFeatures();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-error">Failed to load features: {error}</p>;
  }

  if (features.length === 0) {
    return <p className="text-sm text-muted-foreground">No features available yet.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}

export default FeaturesList;
