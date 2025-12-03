'use client';

import Image from 'next/image';

interface CardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'velvet' | 'stage';
}

export default function Card({
  title,
  description,
  imageUrl,
  children,
  onClick,
  className = '',
  variant = 'velvet',
}: CardProps) {
  const variantStyles = {
    velvet: 'velvet-card',
    stage: 'velvet-card stage-gradient',
  };

  return (
    <div
      className={`${variantStyles[variant]} overflow-hidden cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative h-64 overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFD700]/0 to-[#FFD700]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-3 text-[#FFD700] group-hover:text-[#FFA500] transition-colors duration-300">
          {title}
        </h3>
        {description && (
          <p className="text-[#f0f0f0]/80 leading-relaxed mb-4">
            {description}
          </p>
        )}
        {children}
      </div>

      {/* 装飾的な角のアクセント */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#FFD700]/30 transition-all duration-300 group-hover:border-[#FFD700]/60" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#FFD700]/30 transition-all duration-300 group-hover:border-[#FFD700]/60" />
    </div>
  );
}
