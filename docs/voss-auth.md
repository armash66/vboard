# Signing in with VOSS

vboard is an OpenID Connect relying party of VOSS, the voss-labs identity provider at accounts.vosslabs.org (repository `voss-labs/vauth`). It is wired the same way as VERP.

## How a sign-in works

1. The login page calls `authClient.signIn.oauth2({ providerId: "voss" })`.
2. Better Auth's `genericOAuth` plugin reads the discovery document, sends the browser to VOSS with PKCE, and handles the callback at `/api/auth/oauth2/callback/voss`.
3. VOSS verifies the `@vit.edu.in` mailbox with a one-time code. vboard never sees a password.
4. vboard creates or links the `user` row (`src/lib/auth.ts`). A non-college address is refused at creation, and `ensureProfile` gives every new account the `student` site role.

## Settings that must not change

| Setting | Why |
| --- | --- |
| `pkce: true` | Better Auth defaults it to false; VOSS requires it, so every sign-in fails at the token endpoint without it |
| `requireIssuerValidation: true` | Rejects tokens whose issuer is not the one discovery advertised |
| `mapProfileToUser` derives a name | `name` is optional in OIDC but required by Better Auth's `user` table |
| `emailAndPassword.enabled: false` | VOSS is the only door; a password would be a second, unwatched one |
| `trustedProviders: ["voss"]` | VOSS verifies the mailbox, so linking by email is safe for this provider only |

`research/integration-issues.md` in `voss-labs/vauth` records how each of these broke VERP before it was set.

## Registering vboard with VOSS

Clients are configuration as code in `voss-labs/vauth`. Add this entry to `clients.config.ts` there through a pull request, then run `npm run clients` in vauth. The client secret is shown once.

```ts
{
  name: "vboard",
  description: "Events and community — clubs post events, students register in one tap.",
  redirectUris: [
    "https://vboard.vosslabs.org/api/auth/oauth2/callback/voss",
    "http://localhost:3000/api/auth/oauth2/callback/voss",
  ],
  scopes: ["openid", "profile", "email"],
  firstParty: true,
},
```

Then set in vboard's environment:

```
VOSS_DISCOVERY_URL="https://accounts.vosslabs.org/api/auth/.well-known/openid-configuration"
VOSS_CLIENT_ID="<from vauth>"
VOSS_CLIENT_SECRET="<from vauth>"
BETTER_AUTH_URL="https://vboard.vosslabs.org"
SUPER_ADMIN_EMAILS="you@vit.edu.in"
```

## Local development without VOSS

A contributor cannot register a VOSS client, so `VBOARD_DEV_AUTH=1` shows a persona switcher on `/login`. It substitutes the signed-in identity only; site roles, community roles and capabilities still come from the database. Three locks keep it out of production:

1. `devAuthEnabled()` returns false whenever `NODE_ENV` is `production`.
2. It needs `VBOARD_DEV_AUTH` to be exactly `1`.
3. `next.config.ts` refuses to build when the flag is set for a production build.
