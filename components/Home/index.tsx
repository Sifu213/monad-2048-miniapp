"use client";

import { FarcasterActions } from "@/components/Home/FarcasterActions";
import { User } from "@/components/Home/User";
import { WalletActions } from "@/components/Home/WalletActions";
import React from "react";
import ReactDOM from "react-dom/client";
import App from '../2048/App';
import '../2048/index.css';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Monad 2048 MiniApp
      </h1>
      <div className="w-full max-w-4xl space-y-6">
        
        <App />
        
        
      </div>
    </div>
  );
}
