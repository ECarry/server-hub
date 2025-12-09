import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Upload,
  ArrowRight,
  Database,
  LayoutTemplate,
} from "lucide-react";
import { UserSwitcher } from "./_components/user-switcher";

export default function TestDashboardPage() {
  const testModules = [
    {
      title: "Role-Based Access Control",
      description:
        "Test fine-grained permissions, role assignments, and protected resources.",
      href: "/test/role",
      icon: Shield,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "S3 File Uploader",
      description:
        "Test file uploads, presigned URLs, progress tracking, and file management.",
      href: "/test/uploader",
      icon: Upload,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="relative text-center space-y-4">
          <div className="absolute top-0 right-0">
            <UserSwitcher />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent pb-2">
            Test Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Central hub for testing and verifying system modules and components.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group block h-full"
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-blue-200 dark:hover:border-blue-800">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${module.bg} flex items-center justify-center mb-4`}
                  >
                    <module.icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm font-medium text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Open Module{" "}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-slate-900 border">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
              <Database className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="font-medium">Database</h3>
              <p className="text-sm text-slate-500">
                Connected to local Postgres
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-slate-900 border">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
              <LayoutTemplate className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="font-medium">Environment</h3>
              <p className="text-sm text-slate-500">
                {process.env.NODE_ENV || "development"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-slate-900 border">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
              <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="font-medium">Auth</h3>
              <p className="text-sm text-slate-500">Better Auth Enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
