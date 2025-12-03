'use client';

import Image from 'next/image';

interface CardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Card({
  title,
  description,
  imageUrl,
  children,
  onClick,
  className = '',
}: CardProps) {
  return (
    <div
      className={`glass rounded hover-glow overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative h-48 overflow-hidden gradient-overlay">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-metallic-gold mb-2">{title}</h3>
        {description && (
          <p className="text-off-white/70 text-sm leading-relaxed mb-4">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
