import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import type { Provider } from "next-auth/providers"
import Google from "@auth/core/providers/google";
import Spotify from "@auth/core/providers/spotify";
import {DrizzleAdapter} from "@auth/drizzle-adapter";
import {db} from "@/lib/db";
import {getUserAccounts} from "@/lib/accounts";
import userService from "@/services/userService";
import {githubApi} from "@/lib/api-client";
import dbConnect from "@/lib/mongodb";

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
    profile(profile){
      return {
        id: profile.id.toString(),
        name: profile.login,
        email: profile.email,
        image: profile.avatar_url
      }
    },
    authorization: {
      params: {
        scope: 'repo project user:email',
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
        scope: 'openid profile https://www.googleapis.com/auth/calendar.app.created ' +
            'https://www.googleapis.com/auth/calendar.events.freebusy ' +
            'https://www.googleapis.com/auth/calendar.events.public.readonly ' +
            'https://www.googleapis.com/auth/calendar.settings.readonly '
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
  },
  callbacks: {

    signIn: async ({ user, account}) => {

      if (!account?.provider){
        return false;
      }

      if (!account?.access_token) {
            return false;
      }

      switch(account.provider) {
        case("github"):
        {

          // const username = await fetch('https://api.github.com/user', {
          //   headers: { 'Authorization': `Bearer ${account.access_token}` }
          // }).then(res => res.json()).then(data => data.login);
          //
          if (!user.name){
            return false;
          }

          // initially user.name is the github username (the actual one not the display)
          // username is a display name for Mongodb and githubId is the github name
          await dbConnect()
          try {
              await userService.createUser({
                username: user.name,
              githubId: user.name,
              email: user.email!,
              avatarUrl: user.image!,
            });
              return true;
          }
          catch (e){
            return false;
          }

        }
      }
      return true;
    },
  },


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


