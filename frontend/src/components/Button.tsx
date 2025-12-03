import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'velvet' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'gold',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = `
    relative font-bold tracking-[0.15em] uppercase
    transition-all duration-500 overflow-hidden
    rounded-sm
    before:content-[''] before:absolute before:inset-0
    before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
    before:translate-x-[-200%] hover:before:translate-x-[200%]
    before:transition-transform before:duration-700
  `;

  const variantStyles = {
    gold: `
      bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700]
      text-black shadow-[0_0_20px_rgba(255,215,0,0.3)]
      hover:shadow-[0_0_40px_rgba(255,215,0,0.6)]
      hover:scale-105
      border border-[#FFD700]
    `,
    velvet: `
      bg-gradient-to-br from-[#8B0000] to-[#4a0e0e]
      text-[#FFD700] shadow-[0_0_20px_rgba(139,0,0,0.5)]
      hover:shadow-[0_0_40px_rgba(139,0,0,0.8)]
      hover:scale-105
      border border-[#8B0000]
    `,
    outline: `
      bg-transparent
      text-[#FFD700] border-2 border-[#FFD700]
      hover:bg-[#FFD700] hover:text-black
      shadow-[inset_0_0_20px_rgba(255,215,0,0.1)]
      hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]
    `,
  };

  const sizeStyles = {
    sm: 'px-6 py-2.5 text-xs',
    md: 'px-10 py-3.5 text-sm',
    lg: 'px-14 py-4.5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
