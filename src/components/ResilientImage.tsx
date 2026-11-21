import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'SIBONTA Finance Ltd',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#082E43] via-[#0D3A52] to-[#05202F] text-white p-8 text-center ${className}`}
      >
        <Building2 className="w-10 h-10 text-[#F59E0B] mb-3" aria-hidden="true" />
        <p className="font-display text-lg font-medium tracking-tight">{fallbackTitle}</p>
        <p className="text-xs text-white/80 mt-1 max-w-xs">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
