'use client'
import { useSession } from "next-auth/react";
import { UserProvider, useUser } from "@/context/UserContext";
import React from "react";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useUser();

  if (loading) return <div>Loading user data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      {children}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session?.user?.name) return <div>Please sign in to github</div>;

  return (
    <UserProvider username={session.user.name}>
      <LayoutContent>{children}</LayoutContent>
    </UserProvider>
  );
}