import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import type { Provider } from "next-auth/providers"
import Google from "@auth/core/providers/google";
import Spotify from "@auth/core/providers/spotify";

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
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
    authorization: {
      params: {
        scope: '',
      },
    },
  }),
  Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
    authorization: {
      params: {
        scope: 'openid profile email https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.readonly', // your scopes here
      },
    },
  }),
  Spotify({
    clientId: process.env.AUTH_SPOTIFY_ID,
    clientSecret: process.env.AUTH_SPOTIFY_SECRET,
    authorization:
      "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-playback-state,user-modify-playback-state,user-read-currently-playing",
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
      if (account) {
                if (account.provider === "google") {

                  token.googleAccessToken = account.access_token;
                  token.googleRefreshToken = account.refresh_token;
                  token.googleExpiresAt = account.expires_at;
                }

        else if (account.provider === "spotify")
        {
          token.spotifyAccessToken = account.access_token;
          token.spotifyRefreshToken = account.refresh_token;
          token.spotifyExpiresAt = account.expires_at;
        }
        
        else if (account.provider === "github")
        {
          token.githubAccessToken = account.access_token;
          token.githubRefreshToken = account.refresh_token;
          token.githubExpiresAt = account.expires_at;
        }
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
      } else if (token?.spotifyAccessToken){
        session.user = {
          ...session.user,
        spotifyAccessToken: token.spotifyAccessToken,
          spotifyRefreshToken: token.spotifyRefreshToken,
          spotifyExpiresAt: token.spotifyExpiresAt,
                  };
      } else if (token?.githubAccessToken){
        session.user = {
          ...session.user,
        githubAccessToken: token.githubAccessToken,
          githubRefreshToken: token.githubRefreshToken,
          githubExpiresAt: token.githubExpiresAt,
                  };
      }
      return session;
    },

  },


})


