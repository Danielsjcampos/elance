import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <img 
      src="https://e-lance.com.br/wp-content/uploads/2025/06/logo-png.png" 
      alt="E-lance Logo" 
      className={`h-10 md:h-12 w-auto object-contain ${className}`}
    />
  );
};