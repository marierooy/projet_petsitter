import React from 'react';

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={`w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 ${className}`}
      {...props}
    />
  );
};