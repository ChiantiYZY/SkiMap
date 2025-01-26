"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { 
        callbackUrl: "/app",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to SkiMap</h1>
        <p className="text-gray-400">Sign in to access your ski adventures</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 border border-gray-300 rounded-lg transition-all duration-200 disabled:opacity-70"
        >
          <Image
            src="/google.svg"
            alt="Google logo"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          {isLoading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By continuing, you agree to our</p>
          <div className="space-x-2">
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            <span>and</span>
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
} 