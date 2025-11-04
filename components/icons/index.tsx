import React from 'react';

export const TemperatureIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16.5V9.75m0 0l-3.75 3.75M13 9.75l3.75 3.75m-7.5-3a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
  </svg>
);

export const HumidityIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75 0 4.35 2.863 8.032 6.75 9.313.25.045.5.045.75 0 3.887-1.281 6.75-4.963 6.75-9.313 0-5.385-4.365-9.75-9.75-9.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5a3 3 0 01-3-3" />
  </svg>
);

export const SoilMoistureIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.285 2.827A.75.75 0 002.25 3.5v17a.75.75 0 001.28.53l5.572-5.572a.75.75 0 00-1.06-1.06L3.75 18.172V7.52l4.28 4.28a.75.75 0 001.06-1.06L3.285 2.827z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12c0-4.969-4.031-9-9-9s-9 4.031-9 9c0 4.969 4.031 9 9 9s9-4.031 9-9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const ZoomInIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
);

export const ZoomOutIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
    </svg>
);

export const ResetZoomIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V8m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 0l-5 5" />
    </svg>
);