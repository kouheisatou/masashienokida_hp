import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold tracking-wide transition-all duration-300 rounded-full hover-glow';

  const variantStyles = {
    primary: 'bg-maroon text-off-white hover:bg-maroon/90',
    secondary: 'bg-metallic-gold text-rich-black hover:bg-metallic-gold/90',
    outline: 'border-2 border-metallic-gold text-metallic-gold hover:bg-metallic-gold hover:text-rich-black',
  };

  const sizeStyles = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
