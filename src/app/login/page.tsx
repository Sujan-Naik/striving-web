import {redirect} from "next/navigation"
import {auth, providerMap, signIn} from "@/auth"
import {AuthError} from "next-auth"
import {getUserAccounts} from "@/lib/accounts"
import {isTokenExpired} from "@/lib/utils/token"
import Link from "next/link"; // Import the utility function

const SIGNIN_ERROR_URL = "/error"

interface SignInPageProps {
  searchParams: {
    callbackUrl?: string;
  };
}

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const {callbackUrl} = await searchParams;
  const session = await auth()

  // Get user's connected accounts if signed in
  let connectedAccounts: any[] = []
  if (session?.user?.id) {
    connectedAccounts = await getUserAccounts(session.user.id)
  }

  return (
    <div className="flex flex-col gap-2">
      {session && (
        <div className="mb-4 p-4 rounded">
          <Link href={"/"}>
            Main Page
          </Link>
          <p>Signed in as {session.user?.email}</p>
          <p>Connected providers: {connectedAccounts.map((acc) => acc.provider).join(", ")}</p>
          <details>
            <summary>Account Details</summary>
            <pre>{JSON.stringify(connectedAccounts, null, 2)}</pre>
          </details>
        </div>
      )}

      {Object.values(providerMap).map((provider) => {
        // Find the specific account data for this provider
        const accountData = connectedAccounts.find((acc) => acc.provider === provider.id)

        // Determine if the provider is truly connected (has an access token and it's not expired)
        const isTrulyConnected = accountData && accountData.accessToken && !isTokenExpired(accountData.expiresAt)

        return (
          <form
            key={provider.id}
            action={async () => {
              "use server"
              try {
                await signIn(provider.id, {
                  redirectTo: callbackUrl,
                })
              } catch (error) {
                if (error instanceof AuthError) {
                  return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
                }
                throw error
              }
            }}
          >
            <button type="submit">
              <span>{isTrulyConnected ? `✓ ${provider.name} Connected` : `Connect ${provider.name}`}</span>
            </button>
          </form>
        )
      })}
    </div>
  )
}
