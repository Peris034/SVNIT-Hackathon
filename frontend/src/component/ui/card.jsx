import React from "react";
export function Card({ children, className }) {
    return <div className={`bg-white shadow-md p-4 rounded-lg ${className}`}>{children}</div>;
  }
  export function CardContent({ children }) {
    return <div>{children}</div>;
  }
  