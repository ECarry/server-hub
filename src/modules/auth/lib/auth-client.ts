import { createAuthClient } from "better-auth/react"
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { ac, admin, pro, user } from "./permissions"
import type { auth } from "./auth"

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac,
      roles: {
        admin,
        pro,
        user,
      }
    })
  ]
})

export const { signIn, signUp, useSession } = authClient