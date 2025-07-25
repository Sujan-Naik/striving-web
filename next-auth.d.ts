declare module "next-auth" {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    // You can add custom user fields here if needed
  }

  /**
   * The shape of the account object returned in the OAuth providers' `account` callback,
   * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
   */
  interface Account {
    // You can add custom account fields here if needed
  }

  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  interface Session {
    user: {
      // existing fields
      name?: string | null;
      email?: string | null;
      image?: string | null;

      // Add your custom Google token fields here
      googleAccessToken?: string | null;
      googleRefreshToken?: string | null;
      googleExpiresAt?: number | null;
      
        spotifyAccessToken?: string | null;
      spotifyRefreshToken?: string | null;
      spotifyExpiresAt?: number | null;
    } & DefaultSession["user"];
  }
}

// The `JWT` interface can be found in the `next-auth/jwt` submodule
import { JWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    // existing fields
    idToken?: string;

    // Your custom Google token fields
    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleExpiresAt?: number;
    
      spotifyAccessToken?: string;
    spotifyRefreshToken?: string;
    spotifyExpiresAt?: number;
  }
}