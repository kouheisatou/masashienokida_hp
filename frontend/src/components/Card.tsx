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
      className={`card overflow-hidden cursor-pointer group p-6 ${className}`}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative h-48 overflow-hidden mb-6 -mx-6 -mt-6">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-all duration-500 group-hover:brightness-100"
          />
        </div>
      )}
      <div>
        <h3 className="text-lg font-normal mb-3 text-white">
          {title}
        </h3>
        {description && (
          <p className="text-[#888888] leading-relaxed mb-4 text-sm">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
