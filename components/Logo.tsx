import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  const { branding } = useTheme();

  const logoSrc = branding.logo_url || "https://e-lance.com.br/wp-content/uploads/2025/06/logo-png.png";

  return (
    <img
      src={logoSrc}
      alt="E-lance Logo"
      className={`h-10 md:h-12 w-auto object-contain ${className}`}
    />
  );
};