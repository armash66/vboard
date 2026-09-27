import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { genericOAuth } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { db } from "@/db"
import { ensureProfile } from "@/db/queries/profiles"
import { deriveNameFromEmail, isCollegeEmail } from "@/lib/identity"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  // VOSS is the only way in; a password here would be a second, unwatched door.
  emailAndPassword: {
    enabled: false,
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["voss"],
      allowDifferentEmails: false,
    },
  },

  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "voss",
          discoveryUrl: process.env.VOSS_DISCOVERY_URL!,
          clientId: process.env.VOSS_CLIENT_ID!,
          clientSecret: process.env.VOSS_CLIENT_SECRET!,
          scopes: ["openid", "profile", "email"],
          pkce: true,
          requireIssuerValidation: true,
          mapProfileToUser: (profile) => ({
            name: profile.name?.trim() || deriveNameFromEmail(profile.email),
          }),
        },
      ],
    }),
    nextCookies(),
  ],

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isCollegeEmail(user.email)) return false
          return { data: user }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          try {
            await ensureProfile(session.userId)
          } catch (error) {
            console.error("[profile] failed for session", session.userId, error)
          }
        },
      },
    },
  },
})
