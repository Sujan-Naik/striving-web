import {redirect} from "next/navigation"
import {auth, providerMap, signIn} from "@/auth"
import {AuthError} from "next-auth"
import {getUserAccounts} from "@/lib/accounts"
import {HeadedLink, VariantEnum} from "headed-ui";

const SIGNIN_ERROR_URL = "/error"

export default async function SignInPage(props: {
  searchParams: { callbackUrl: string | undefined }
}) {
  const searchParams = await Promise.resolve(props.searchParams)
  const callbackUrl = searchParams?.callbackUrl ?? "/login"
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
          <HeadedLink variant={VariantEnum.Primary} href={'/'}>Main Page</HeadedLink>
          <p>Signed in as {session.user?.email}</p>
          <p>Connected providers: {connectedAccounts.map((acc) => acc.provider).join(", ")}</p>
          <details>
            <summary>Account Details</summary>
            <pre>{JSON.stringify(connectedAccounts, null, 2)}</pre>
          </details>
        </div>
      )}

      {Object.values(providerMap).map((provider) => {
        const isConnected = connectedAccounts.some((acc) => acc.provider === provider.id)

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
              <span>{isConnected ? `✓ ${provider.name} Connected` : `Connect ${provider.name}`}</span>
            </button>
          </form>
        )
      })}
    </div>
  )
}
