'use client'
import { useSession } from "next-auth/react";
import { UserProvider, useUser } from "@/context/UserContext";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className={'center-column'}>Loading...</div>;
  if (!session?.user?.name)
    return  <div className={'center-column'}>{children}</div>

  return (
    <UserProvider username={session.user.name}>
      <div className={'center-column'}>{children}</div>
    </UserProvider>
  );
}