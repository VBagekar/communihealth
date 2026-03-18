import React from 'react';

export const HeartbeatIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12h4.5L9 5l4 14l2-8l1.5 1h4"></path>
  </svg>
);

export const StethoscopeIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2C8.686 2 6 4.418 6 7.4V14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V7.4C18 4.418 15.314 2 12 2z"></path>
    <path d="M10 18v2a2 2 0 0 0 4 0v-2"></path>
    <circle cx="12" cy="22" r="2"></circle>
  </svg>
);

export const LeafIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1.5 8.3C20 16 16.5 20 11 20z"></path>
    <path d="M11 20v-5c0-1.6.8-2.6 2-3"></path>
  </svg>
);

export const CrossIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 3v7H3v4h7v7h4v-7h7v-4h-7V3h-4z"></path>
  </svg>
);

export const VillageIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21h18"></path>
    <path d="M9 8l-6 6v7h12v-7L9 8z"></path>
    <path d="M15 10l4-4 4 4v11h-2v-9h-6"></path>
    <path d="M9 13v8h-4v-8h4z"></path>
  </svg>
);
