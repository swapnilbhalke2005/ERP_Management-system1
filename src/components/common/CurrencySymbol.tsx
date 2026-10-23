import React from 'react';

/**
 * CurrencySymbol Component
 * Renders the Indian Rupee (₹) symbol cleanly using an inline SVG icon or styled span,
 * preventing empty square glyph boxes on systems/containers without localized fonts.
 */
export const Rupee: React.FC<{ className?: string }> = ({ className = 'w-3 h-3 inline-block mr-0.5' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="M6 13l8.5 8" />
      <path d="M6 13h3a4.5 4.5 0 0 0 0-9" />
    </svg>
  );
};
