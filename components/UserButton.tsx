"use client";

import { User } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";

export function UserButton({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-2">
      {user.image && (
        <Image
          src={user.image}
          alt={user.name || "User"}
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.name}</span>
        <button
          onClick={() => signOut()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </div>
    </div>
  );
} 