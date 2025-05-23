"use client";
import React from "react";
import App from '../2048/App';
import '../2048/index.css';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-1 space-y-6 w-full">
      <h1 className="text-white text-4xl font-bold text-center">
        Monad 2048
      </h1>
      <div className="w-full flex flex-col items-center">
        <App />
      </div>
    </div>
  );
}
