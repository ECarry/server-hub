/* eslint-disable react-hooks/static-components */
"use client";

import { useSession, authClient } from "@/modules/auth/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Shield,
  Lock,
  Eye,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { User } from "@/modules/auth/lib/auth-types";

export default function RoleTestPage() {
  const { data: session, isPending } = useSession();
  const trpc = useTRPC();

  // Test different permission levels
  const publicQuery = useQuery(trpc.rbac.public.queryOptions());
  const protectedQuery = useQuery(trpc.rbac.protected.queryOptions());
  const adminQuery = useQuery(trpc.rbac.admin.queryOptions());
  const proQuery = useQuery(trpc.rbac.pro.queryOptions());

  // Test new permission-based endpoints
  const createProductMutation = useMutation(
    trpc.permissions.createProduct.mutationOptions()
  );
  const readPrivateDocQuery = useQuery(
    trpc.permissions.readPrivateDocument.queryOptions()
  );
  const readPublicDocQuery = useQuery(
    trpc.permissions.readPublicDocument.queryOptions()
  );

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const user = session?.user;
  const role = (user as User)?.role || "guest";

  const ResultBadge = ({
    isSuccess,
    isError,
  }: {
    isSuccess?: boolean;
    isError?: boolean;
  }) => {
    if (isSuccess) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Allowed
        </Badge>
      );
    }
    if (isError) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Forbidden
        </Badge>
      );
    }
    return <Badge variant="secondary">Loading...</Badge>;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Role-Based Access Control Demo
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Testing fine-grained permissions with Better Auth + tRPC
          </p>
        </div>

        {/* User Info Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Current User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Role:</span>
                    <Badge
                      variant={
                        role === "admin"
                          ? "default"
                          : role === "pro"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {role.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 text-center">
                  Not logged in
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline">
                    <Link href="/sign-in">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sign-up">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic RBAC Tests (Deprecated) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Role-Based Procedures (Deprecated)
            </CardTitle>
            <CardDescription>
              Simple role checks - will be replaced by permission-based system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Public Endpoint</span>
                <ResultBadge
                  isSuccess={publicQuery.isSuccess}
                  isError={publicQuery.isError}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Protected Endpoint</span>
                <ResultBadge
                  isSuccess={protectedQuery.isSuccess}
                  isError={protectedQuery.isError}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Admin Only</span>
                <ResultBadge
                  isSuccess={adminQuery.isSuccess}
                  isError={adminQuery.isError}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="font-medium">Pro or Admin</span>
                <ResultBadge
                  isSuccess={proQuery.isSuccess}
                  isError={proQuery.isError}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permission-Based Tests */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Fine-Grained Permissions (New)
            </CardTitle>
            <CardDescription>
              Resource-based access control with specific actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Create Product */}
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Create Product</p>
                    <p className="text-sm text-slate-500">
                      Requires: product:create (Admin only)
                    </p>
                  </div>
                  <button
                    onClick={() => createProductMutation.mutate()}
                    disabled={createProductMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createProductMutation.isPending ? "Testing..." : "Test"}
                  </button>
                </div>
                {createProductMutation.data && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ✓ {createProductMutation.data}
                  </div>
                )}
                {createProductMutation.error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    ✗ {createProductMutation.error.message}
                  </div>
                )}
              </div>

              {/* Read Private Document */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Read Private Document</p>
                    <p className="text-sm text-slate-500">
                      Requires: document:read_private (Pro or Admin)
                    </p>
                  </div>
                  <ResultBadge
                    isSuccess={readPrivateDocQuery.isSuccess}
                    isError={readPrivateDocQuery.isError}
                  />
                </div>
                {readPrivateDocQuery.data && (
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {readPrivateDocQuery.data}
                  </div>
                )}
              </div>

              {/* Read Public Document */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Read Public Document</p>
                    <p className="text-sm text-slate-500">
                      Requires: Authentication only (All users)
                    </p>
                  </div>
                  <ResultBadge
                    isSuccess={readPublicDocQuery.isSuccess}
                    isError={readPublicDocQuery.isError}
                  />
                </div>
                {readPublicDocQuery.data && (
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {readPublicDocQuery.data}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>What each role can do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Action</th>
                    <th className="text-center p-2">User</th>
                    <th className="text-center p-2">Pro</th>
                    <th className="text-center p-2">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Read Public Content</td>
                    <td className="text-center">✓</td>
                    <td className="text-center">✓</td>
                    <td className="text-center">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Read Private Documents</td>
                    <td className="text-center">✗</td>
                    <td className="text-center">✓</td>
                    <td className="text-center">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Create Product</td>
                    <td className="text-center">✗</td>
                    <td className="text-center">✗</td>
                    <td className="text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="p-2">Manage Users</td>
                    <td className="text-center">✗</td>
                    <td className="text-center">✗</td>
                    <td className="text-center">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
