"use client"
import {HeadedCard, HeadedDropdown, HeadedDropdownOption, HeadedLink, VariantEnum} from 'headed-ui';
import {useState, useEffect, useRef} from 'react';
import {useSession} from "next-auth/react";

export default function Header() {
  const [isHovered, setIsInView] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      console.log(entry.isIntersecting);
      setIsInView(entry.isIntersecting); // true when visible, false when not
    }, {
      threshold: 0.5, // Require 50% visibility to reduce accidental triggers from zoom/screen changes
    });

    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  let navLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/llm", label: "LLM" },
    { href: "/github", label: "Github" },
    { href: "/sign-out", label: "Sign Out" }
  ];

  const session = useSession();
  if (!session.data?.user){
     navLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/llm", label: "LLM" },
    { href: "/github", label: "Github" },
    { href: "/login", label: "Login" },
     ];
  }

  // Inline styles — no dynamic DOM modification after initial load
  const headerStyles = (visible: boolean): React.CSSProperties => ({
    position: "relative", // Back to relative for scrollable behavior
    width: "100%",
    padding: "1rem",
    color: "white",
    textAlign: "center",
    borderRadius: "0 0 2rem 2rem",
    overflow: "hidden",
    backgroundSize: visible ? "600% 600%" : undefined,
    height: visible ? 'auto' : 0,
    transition: "opacity 0.8s ease, transform 0.8s ease",
    // Don't move it off-screen—just fade and slightly shrink it
    transform: visible ? "scale(1) rotateX(0deg)" : "scale(0.95) rotateX(10deg)",
    opacity: visible ? 1 : 0,
  });

  // Function to scroll to top smoothly
  const scrollToTop = () => {
    setIsInView(true)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>

      <header
        ref={headerRef}
        className="bg-cover bg-center py-4 px-4"
        style={headerStyles(isHovered)}
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
                AI-powered Software Docs and User Manuals
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

    </>
  );
}