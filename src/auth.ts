import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import type { Provider } from "next-auth/providers"
import {DrizzleAdapter} from "@auth/drizzle-adapter";
import {db} from "@/lib/db";
import userService from "@/services/userService";
// import dbConnect from "@/lib/mongodb";

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

      switch(account.provider) {
        case("github"):
        {
          if (!user.name){
            return false;
          }

          // initially user.name is the github username (the actual one not the display)
          // username is a display name for Mongodb and githubId is the github name
          const { default: dbConnect } = await import('@/lib/mongodb');
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
})


