import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import Google from "@auth/core/providers/google";
import Spotify from "@auth/core/providers/spotify";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { user as userTable } from "@/lib/schema"; // ensure path correct for your schema
import { cookies } from "next/headers";

const providers: Provider[] = [
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.AUTH_GITHUB_SECRET,
    allowDangerousEmailAccountLinking: true,
    profile(profile) {
      return {
        id: profile.id.toString(),
        name: profile.login,
        email: profile.email,
        image: profile.avatar_url,
      };
    },
    authorization: {
      params: {
        scope: "repo project user:email",
      },
    },
  }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: "/login",
    signOut: "/sign-out",
    error: "/error",
  },
  callbacks: {
    /**
     * Require ALPHA_PASSCODE for first-time users
     */
    signIn: async ({ user, account }) => {
      if (!account?.provider) return false;
      if (!account?.access_token) return false;

      // 🔹 Check if user already exists
      const existingUser = await db.query.user.findFirst({
        where: eq(userTable.email, user.email!),
      });

      // 🔹 Check for approval cookie (set in login form if passcode valid)
      const approvalCookie = (await cookies()).get("alpha_approval")?.value;
      const isApproved = approvalCookie === "true";

      // 🔹 If this is a new user or not yet approved, require approval
      if (!existingUser || !existingUser.alphaApproved) {
        if (!isApproved) {
          console.error("Missing or invalid alpha approval");
          return false;
        }

        // Mark as approved
        if (existingUser) {
          await db
            .update(userTable)
            .set({ alphaApproved: true })
            .where(eq(userTable.email, user.email!));
        } else {
          // For new users, mutate user object so adapter saves it on creation
          (user as any).alphaApproved = true;
        }

        // Clear the cookie for security
        (await cookies()).delete("alpha_approval");
      }

      // 🔹 Handle provider-specific logic
      switch (account.provider) {
        case "github": {
          if (!user.name || !user.email || !user.image) return false;

          const payload = {
            name: user.name,
            email: user.email,
            avatarUrl: user.image,
          };

          try {
            const response = await fetch(
              `${process.env.NEXTAUTH_URL}/api/project/user`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );

            if (!response.ok) {
              console.error("Failed to create user:", await response.json());
              return false;
            }
          } catch (error) {
            console.error("Error during user creation:", error);
            return false;
          }
        }
      }

      return true;
    },
  },
});