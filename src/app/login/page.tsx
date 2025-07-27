import { redirect } from "next/navigation"
import { signIn, auth, providerMap } from "@/auth"
import { AuthError } from "next-auth"

const SIGNIN_ERROR_URL = "/error"

export default async function SignInPage(props: {
  searchParams: { callbackUrl: string | undefined }
}) {
  const searchParams = await Promise.resolve(props.searchParams);
  const callbackUrl = searchParams?.callbackUrl ?? "/login";

  const session = await auth();

  return (
    <div className="flex flex-col gap-2">
      {session && (
      <div className="mb-4 p-4 rounded">
        <p>Signed in as {session.user?.email}</p>
        <p>Connected: {Object.keys(session.user?.providers || {}).join(", ")}</p>
        <pre>{JSON.stringify(session.user?.providers, null, 2)}</pre>
      </div>
    )}

      {Object.values(providerMap).map((provider) => (
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
      <span>Sign in with {provider.name}</span>
    </button>
  </form>
))}
    </div>
  )
}