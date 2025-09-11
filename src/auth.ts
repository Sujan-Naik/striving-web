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

      switch (account.provider) {
        case "github": {
          if (!user.name || !user.email || !user.image) {
            return false;
          }

          // Prepare the payload
          const payload = {
            name: user.name,
            email: user.email,
            avatarUrl: user.image,
          };

          try {
            // Send POST request to your API endpoint
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/project/user`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              return true;
            } else {
              // Optionally handle different error statuses
              console.error('Failed to create user:', await response.json());
              return false;
            }
          } catch (error) {
            console.error('Error during user creation:', error);
            return false;
          }
        }
      }
      return true;
    },
  },
})


