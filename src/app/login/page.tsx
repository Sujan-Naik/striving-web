import { redirect } from "next/navigation";
import { auth, providerMap, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { getUserAccounts } from "@/lib/accounts";
import { isTokenExpired } from "@/lib/utils/token";
import { FaGithub } from "react-icons/fa";
import { cookies } from "next/headers";

const SIGNIN_ERROR_URL = "/error";

interface SignInPageProps {
  searchParams: {
    callbackUrl?: string;
  };
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const session = await auth();

  // Get user's connected accounts if signed in
  let connectedAccounts: any[] = [];
  if (session?.user?.id) {
    connectedAccounts = await getUserAccounts(session.user.id);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "var(--modal-min-width)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              backgroundColor: "var(--background-secondary)",
              borderRadius: "50%",
              border: "1px solid var(--border-color)",
            }}
          >
            <FaGithub
              style={{
                width: "32px",
                height: "32px",
                color: "var(--foreground-primary)",
              }}
            />
          </div>
          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "var(--foreground-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Connect Your Account
            </h1>
            <p style={{ color: "var(--foreground-tertiary)" }}>
              Sign in to access your repositories
            </p>
          </div>
        </div>

        {/* If user is already signed in */}
        {session && (
          <div
            style={{
              padding: "var(--padding-thickness)",
              backgroundColor: "var(--background-secondary)",
              borderRadius: "var(--border-radius)",
              border: `var(--border-thickness) solid var(--border-color)`,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--foreground-secondary)",
                margin: 0,
              }}
            >
              <span style={{ fontWeight: "600" }}>Signed in as:</span>{" "}
              {session.user?.email}
            </p>
            {connectedAccounts.length > 0 && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--foreground-secondary)",
                  margin: 0,
                }}
              >
                <span style={{ fontWeight: "600" }}>Connected:</span>{" "}
                {connectedAccounts.map((acc) => acc.provider).join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Provider Buttons + Passcode */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {Object.values(providerMap).map((provider) => {
            const accountData = connectedAccounts.find(
              (acc) => acc.provider === provider.id
            );
            const isTrulyConnected =
              accountData &&
              accountData.accessToken &&
              !isTokenExpired(accountData.expiresAt);

            return (
              <form
                key={provider.id}
                action={async (formData) => {
                  "use server";
                  try {
                    // Grab passcode from form
                    const passcode = formData.get("passcode") as string;

                    // Validate passcode
                    if (passcode !== process.env.ALPHA_PASSCODE) {
                      return redirect(`${SIGNIN_ERROR_URL}?error=InvalidPasscode`);
                    }

                    // Set short-lived approval cookie
                    (await cookies()).set("alpha_approval", "true", {
                      httpOnly: true,
                      secure: process.env.NODE_ENV === "production",
                      path: "/",
                      maxAge: 60, // 1 minute, enough for auth flow
                    });

                    // Proceed with sign-in
                    await signIn(provider.id, {
                      redirectTo: callbackUrl,
                    });
                  } catch (error) {
                    if (error instanceof AuthError) {
                      return redirect(
                        `${SIGNIN_ERROR_URL}?error=${error.type}`
                      );
                    }
                    throw error;
                  }
                }}
              >
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                    border: "1px solid rgba(255, 152, 0, 0.3)",
                    borderRadius: "var(--border-radius)",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#ffb74d",
                      margin: 0,
                    }}
                  >
                    As we are in Alpha, only invited users can make accounts or login
                  </p>
                </div>

                {/* Invite code input */}
                <input
                  name="passcode"
                  type="text"
                  placeholder="Enter invite code"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    marginBottom: "0.75rem",
                    borderRadius: "var(--border-radius)",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--background-secondary)",
                    color: "var(--foreground-primary)",
                    fontSize: "1rem",
                  }}
                />

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    padding: "1rem 1.5rem",
                    borderRadius: "var(--border-radius)",
                    fontWeight: "600",
                    color: "var(--foreground-primary)",
                    backgroundColor: isTrulyConnected
                      ? "#2e7d32"
                      : "var(--highlight)",
                    border: `var(--border-thickness) solid ${
                      isTrulyConnected ? "#1b5e20" : "var(--hover)"
                    }`,
                    cursor: "pointer",
                    fontSize: "1rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  <FaGithub style={{ width: "20px", height: "20px" }} />
                  <span>
                    {isTrulyConnected
                      ? `✓ ${provider.name} Connected`
                      : `Connect with ${provider.name}`}
                  </span>
                </button>
              </form>
            );
          })}
        </div>

        {/* Warning Message */}
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "rgba(255, 152, 0, 0.1)",
            border: "1px solid rgba(255, 152, 0, 0.3)",
            borderRadius: "var(--border-radius)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              color: "#ffb74d",
              margin: 0,
            }}
          >
            ⚠️ This integration requires broad repository access permissions
          </p>
        </div>
      </div>
    </div>
  );
}