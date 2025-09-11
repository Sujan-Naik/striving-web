"use client"
import {HeadedCard, HeadedDropdown, HeadedDropdownOption, HeadedLink, VariantEnum} from 'headed-ui';
import { useState, useEffect } from 'react';

// Mobile Header Component
function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
    { href: "/calendar", label: "Calendar" },
    { href: "/github", label: "GitHub" },
    { href: "/github/projects", label: "Github Projects" },
    { href: "/gmail", label: "Gmail" },
    { href: "/llm", label: "LLM" },
    { href: "/login", label: "Authenticate" },
    { href: "/sign-out", label: "Sign Out" }
  ];

  return (
    <header className="bg-cover bg-center py-4 px-4">
      <div style={{
        backgroundColor: 'var(--base-background)',
        opacity: 0.9,
        borderRadius: 'var(--border-radius)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <HeadedCard variant={VariantEnum.Primary} width="100%">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                color: 'var(--foreground-primary)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: '0 0 0.5rem 0'
              }}>
                Striving
              </h1>
              <p style={{
                color: 'var(--foreground-secondary)',
                fontSize: '0.9rem',
                margin: '0 0 0.25rem 0'
              }}>
                FOSS Documentation and User Manuals
              </p>
              <small style={{ color: 'var(--foreground-tertiary)' }}>
                Made by Sujan Naik
              </small>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ☰
            </button>
          </div>
        </HeadedCard>

        {isMenuOpen && (
          <HeadedCard variant={VariantEnum.Primary} width="100%">
            <nav style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.5rem'
            }}>
              {navLinks.map(({ href, label }) => (
                <HeadedLink key={href} variant={VariantEnum.Primary} href={href}>
                  {label}
                </HeadedLink>
              ))}
            </nav>
          </HeadedCard>
        )}
      </div>
    </header>
  );
}

// PC Header Component
function PCHeader() {
  const [isHovered, setIsHovered] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/login", label: "Authenticate" },
    { href: "/sign-out", label: "Sign Out" }
  ];

  return (
    <header
      className="bg-cover bg-center py-4 px-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        backgroundColor: 'var(--base-background)',
        opacity: 0.9,
        borderRadius: 'var(--border-radius)',
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
        height: isHovered ? 'auto' : '10vh',
        maxHeight: isHovered ? 'none' : '10vh',
        overflow: 'hidden',
        transition: 'height 0.3s ease, max-height 0.3s ease'
      }}>
        <HeadedCard variant={VariantEnum.Primary} width="300px">
          <div>
            <h1 style={{
              color: 'var(--foreground-primary)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0'
            }}>
              Striving
            </h1>
            <p style={{
              color: 'var(--foreground-secondary)',
              fontSize: '0.9rem',
              margin: '0 0 0.25rem 0',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}>
              FOSS Documentation and User Manuals
            </p>
            <small style={{
              color: 'var(--foreground-tertiary)',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}>
              Made by Sujan Naik
            </small>
          </div>
        </HeadedCard>

        <HeadedCard
          variant={VariantEnum.Primary}
          width="auto"
          style={{
            display: isHovered ? 'block' : 'none',
            flex: 1
          }}
        >
          <nav style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {navLinks.map(({ href, label }) => (
              <HeadedLink key={href} variant={VariantEnum.Primary} href={href}>
                {label}
              </HeadedLink>
            ))}
          </nav>
        </HeadedCard>
      </div>
    </header>
  );
}

// Main Header Component
export default function Header() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileHeader /> : <PCHeader />;
}