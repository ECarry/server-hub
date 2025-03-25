import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { passkeyClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), passkeyClient()],
});

export const { signIn, signUp, useSession } = createAuthClient();
