"use client"
import { HeadedCard, HeadedLink, VariantEnum } from 'headed-ui';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="relative bg-cover bg-center py-8 px-6">
      <div
        style={{
          backgroundColor: 'var(--base-background)',
          opacity: 0.9,
          borderRadius: 'var(--border-radius)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row'
        }}
      >
        <HeadedCard variant={VariantEnum.Primary} width={isMobile ? "100%" : "20%"}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--foreground-primary)' }}>
                Striving
              </h1>
              <p className="text-lg mb-1" style={{ color: 'var(--foreground-secondary)' }}>
                Constantly and Endlessly Striving
              </p>
              <small style={{ color: 'var(--foreground-tertiary)' }}>
                Made by Sujan Naik
              </small>
            </div>
            {isMobile && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ background: 'none', border: 'none', fontSize: '24px' }}
              >
                ☰
              </button>
            )}
          </div>
        </HeadedCard>

        <HeadedCard
          variant={VariantEnum.Primary}
          width={isMobile ? "100%" : "80%"}
          style={{
            display: isMobile ? (isMenuOpen ? 'flex' : 'none') : 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            flexDirection: isMobile ? 'column' : 'row'
          }}
        >
          <HeadedLink variant={VariantEnum.Primary} href="/">Home</HeadedLink>
          <HeadedLink variant={VariantEnum.Primary} href="/calendar">Calendar</HeadedLink>
          <HeadedLink variant={VariantEnum.Primary} href="/github">GitHub</HeadedLink>
          <HeadedLink variant={VariantEnum.Primary} href="/github/projects">Projects</HeadedLink>
          <HeadedLink variant={VariantEnum.Primary} href="/gmail">Gmail</HeadedLink>
          <HeadedLink variant={VariantEnum.Primary} href="/llm">LLM</HeadedLink>
          <HeadedLink variant={VariantEnum.Primary} href="/spotify">Spotify</HeadedLink>
          <HeadedLink variant={VariantEnum.Primary} href="/login">Login</HeadedLink>
          <HeadedLink variant={VariantEnum.Primary} href="/sign-out">Sign Out</HeadedLink>
        </HeadedCard>
      </div>
    </header>
  );
}