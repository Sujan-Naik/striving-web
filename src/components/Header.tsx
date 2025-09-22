"use client"
import {HeadedCard, HeadedDropdown, HeadedDropdownOption, HeadedLink, VariantEnum} from 'headed-ui';
import {useState, useEffect, useRef} from 'react';

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
  const [isHovered, setIsInView] = useState(false);
const headerRef = useRef<HTMLElement | null>(null);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    console.log(entry.isIntersecting)
    setIsInView(entry.isIntersecting); // true when visible, false when not
  });

  if (headerRef.current) observer.observe(headerRef.current);
  return () => observer.disconnect();
}, []);

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/login", label: "Authenticate" },
  { href: "/sign-out", label: "Sign Out" }
];

// Static CSS inserted once globally (doesn't flicker)
const globalKeyframes = `
@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 10px #6a00ff, 0 0 20px #00d4ff, 0 0 30px #6a00ff;
  }
  100% {
    box-shadow: 0 0 25px #00d4ff, 0 0 50px #6a00ff, 0 0 75px #00d4ff;
  }
}
@keyframes borderSweep {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;

// Ensure keyframes are added only once at module load, not on render
if (typeof document !== "undefined" && !document.getElementById("header-animations")) {
  const style = document.createElement("style");
  style.id = "header-animations";
  style.innerHTML = globalKeyframes;
  document.head.appendChild(style);
}

// Inline styles — no dynamic DOM modification after initial load
const headerStyles = (visible: boolean): React.CSSProperties => ({
  position: "relative",
  width: "100%",
  padding: "1rem",
  color: "white",
  textAlign: "center",
  borderRadius: "0 0 2rem 2rem",
  overflow: "hidden",
  background: visible
    ? "linear-gradient(270deg, #6a00ff, #00d4ff, #ff00d4)"
    : "linear-gradient(135deg, #6a00ff, #00d4ff)",
  backgroundSize: visible ? "600% 600%" : undefined,
  transition: "opacity 0.8s ease, transform 0.8s ease",
  // Don't move it off-screen—just fade and slightly shrink it
  transform: visible ? "scale(1) rotateX(0deg)" : "scale(0.95) rotateX(10deg)",
  opacity: visible ? 1 : 0,
  animation: visible
    ? "pulseGlow 2s ease-in-out infinite alternate, borderSweep 8s ease infinite"
    : "none",
});


return (
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
        transition: 'height 3s ease, max-height 3s ease',
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