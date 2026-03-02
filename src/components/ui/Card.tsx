import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

type CardSectionProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardSectionProps) {
  return <div className={`border-b px-4 py-3 ${className ?? ''}`} {...props} />;
}

export function CardContent({ className, ...props }: CardSectionProps) {
  return <div className={`px-4 py-3 ${className ?? ''}`} {...props} />;
}

export default function Card({ className, ...props }: CardProps) {
  return <div className={`rounded-lg border bg-white shadow-sm ${className ?? ''}`} {...props} />;
}
