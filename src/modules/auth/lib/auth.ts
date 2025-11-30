import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import * as schema from "@/db/schema";
import { admin } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { ac, admin as adminRole, pro as proRole, user as userRole } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      }
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    admin({
      ac,
      roles: {
        admin: adminRole,
        pro: proRole,
        user: userRole,
      },
    }),
    passkey()
  ],
});