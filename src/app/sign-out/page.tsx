"use client";  // Add this at the top

import { signOut } from "next-auth/react";  // Import client-side signOut
import { FaSignOutAlt } from "react-icons/fa";
import Link from "next/link";

export default function SignOutPage() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });  // Client-side sign-out with redirect
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 'var(--modal-min-width)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: '50%',
          border: '1px solid var(--border-color)'
        }}>
          <FaSignOutAlt style={{
            width: '28px',
            height: '28px',
            color: 'var(--foreground-primary)'
          }} />
        </div>

        <h5 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--foreground-primary)',
          margin: 0,
          textAlign: 'center'
        }}>
          Are you sure you want to sign out?
        </h5>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: '100%'
        }}>
          <button
            onClick={handleSignOut}  // Use onClick instead of form action
            className="signout-button"
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              borderRadius: 'var(--border-radius)',
              fontWeight: '600',
              fontSize: '1rem',
              color: 'var(--foreground-primary)',
              backgroundColor: '#d32f2f',
              border: '1px solid #b71c1c',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Yes, Sign Out
          </button>

          <Link
            href="/"
            style={{
              width: '100%',
              display: 'block',
              textDecoration: 'none'
            }}
          >
            <button
              type="button"
              className="cancel-button"
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                borderRadius: 'var(--border-radius)',
                fontWeight: '600',
                fontSize: '1rem',
                color: 'var(--foreground-secondary)',
                backgroundColor: 'var(--background-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Cancel
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}