import React from 'react';

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={`w-xs px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};