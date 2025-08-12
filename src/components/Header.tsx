"use client"
import {HeadedCard, HeadedDropdown, HeadedDropdownOption, HeadedLink, VariantEnum} from 'headed-ui';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        flexDirection: isMobile ? 'column' : 'row',
        gap: '1rem',
        height: isHovered ? 'auto' : '60px',
        overflow: 'hidden',
        transition: 'height 0.3s ease'
      }}>
        <HeadedCard variant={VariantEnum.Primary} width={isMobile ? "100%" : "300px"}>
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
                margin: '0 0 0.25rem 0',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}>
                Constantly and Endlessly Striving
              </p>
              <small style={{
                color: 'var(--foreground-tertiary)',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}>
                Made by Sujan Naik
              </small>
            </div>
            {isMobile && (
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
            )}
          </div>
        </HeadedCard>

        <HeadedCard
          variant={VariantEnum.Primary}
          width={isMobile ? "100%" : "auto"}
          style={{
            display: isMobile ? (isMenuOpen ? 'block' : 'none') : (isHovered ? 'block' : 'none'),
            flex: 1
          }}
        >
          <nav style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
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