import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import type { Provider } from "next-auth/providers"
import Google from "@auth/core/providers/google";

const providers: Provider[] = [
  Credentials({
    credentials: { password: { label: "Password", type: "password" } },
    authorize(c) {
      if (c.password !== "password") return null
      return {
        id: "test",
        name: "Test User",
        email: "test@example.com",
      }
    },
  }),
  GitHub,
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        scope: 'openid profile email https://www.googleapis.com/auth/calendar.readonly', // your scopes here
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
  pages: {
    signIn: "/login",
    signOut: "sign-out",
    error: "/error",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth
    },
    jwt: async ({ token, account }) => {
      if (account && account.provider === "google") {
        token.googleAccessToken = account.access_token;
        token.googleRefreshToken = account.refresh_token;
        token.googleExpiresAt = account.expires_at;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Assign the token values to session.user
      if (token?.googleAccessToken) {
        session.user = {
          ...session.user,
          googleAccessToken: token.googleAccessToken,
          googleRefreshToken: token.googleRefreshToken,
          googleExpiresAt: token.googleExpiresAt,
        };
      }
      return session;
    },
  },

})