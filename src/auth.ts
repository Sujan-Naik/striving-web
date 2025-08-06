import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import type { Provider } from "next-auth/providers"
import Google from "@auth/core/providers/google";
import Spotify from "@auth/core/providers/spotify";
import {DrizzleAdapter} from "@auth/drizzle-adapter";
import {db} from "@/lib/db";

const providers: Provider[] = [
  // Credentials({
  //   credentials: { password: { label: "Password", type: "password" } },
  //   authorize(c) {
  //     if (c.password !== "password") return null
  //     return {
  //       id: "test",
  //       name: "Test User",
  //       email: "test@example.com",
  //     }
  //   },
  // }),
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: {
        scope: 'repo project',
      },
    },
  }),
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: {
        access_type: "offline",
        prompt: "consent",
        scope: 'openid profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly', // your scopes here
      },
    },
  }),
]

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider()
      return { id: providerData.id, name: providerData.name }
    } else {
      return { id: provider.id, name: provider.name }
    }
  })
  .filter((provider) => provider.id !== "credentials")

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: "/login",
    signOut: "sign-out",
    error: "/error",
  }


//   callbacks: {
//     authorized: async ({ auth }) => {
//       // Logged in users are authenticated, otherwise redirect to login page
//       return !!auth
//     },
//      jwt: async ({ token, account }) => {
//   if (account) {
//     // Initialize providers object if it doesn't exist
//     if (!token.providers) {
//       token.providers = {};
//     }
//
//     // Only add tokens if they exist
//     // if (account.access_token && account.refresh_token && account.expires_at) {
//     //   console.log('token stored');
//     //   token.providers[account.provider] = {
//     //     accessToken: account.access_token,
//     //     refreshToken: account.refresh_token,
//     //     expiresAt: account.expires_at,
//     //   };
//     // }
//
//      if (account.access_token) {
//       console.log('token stored');
//       token.providers[account.provider] = {
//         accessToken: account.access_token,
//       };
//     }
//   }
//   return token;
// },
//     session: async ({ session, token }) => {
//   if (token?.providers) {
//     session.user = {
//       ...session.user,
//       providers: token.providers,
//     };
//   }
//
//   console.log(session)
//   return session;
// },
//
//     signIn: async ({ user, account, profile }) => {
//     // This is REQUIRED for account linking to work
//       return true
//   },

  // }


})


