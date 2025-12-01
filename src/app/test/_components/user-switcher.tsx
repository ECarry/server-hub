"use client";

import { useSession, authClient } from "@/modules/auth/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, UserPlus, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function UserSwitcher() {
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    });
  };

  if (isPending) {
    return <div className="text-sm text-slate-500">Loading auth...</div>;
  }

  const user = session?.user;
  const role = (user as any)?.role || "guest";

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/sign-in">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-lg border shadow-sm">
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium">{user.email}</span>
        <Badge variant="outline" className="text-xs">
          {role.toUpperCase()}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSignOut}
        title="Sign Out"
        className="text-slate-500 hover:text-red-600"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
