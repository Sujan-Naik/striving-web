import {useEffect, useState} from "react";
import Particles, {initParticlesEngine} from "@tsparticles/react";
import type {Container, Engine} from "@tsparticles/engine";
import {loadSlim} from "@tsparticles/slim";
import {HeadedCard, HeadedCarousel, HeadedLink, VariantEnum} from "headed-ui";
import {FaBook, FaCubes, FaExchangeAlt, FaGithub, FaProjectDiagram} from "react-icons/fa";

const particlesLoaded = async (container?: Container): Promise<void> => {
  console.log(container);
};

export default function Hero() {
  const [init, setInit] = useState(false);
  const [cssVars, setCssVars] = useState<{
    backgroundColor: string;
    color: string;
    hoverColor: string;
  } | null>(null);

  useEffect(() => {
    // Read CSS variables once on mount
    const rootStyles = getComputedStyle(document.documentElement);
    setCssVars({
      backgroundColor: rootStyles.getPropertyValue('--background-color').trim(),
      color: rootStyles.getPropertyValue('--color').trim(),
      hoverColor: rootStyles.getPropertyValue('--hover').trim(),
    });
  }, []);

  useEffect(() => {
    // Initialize particles engine once
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!cssVars) {
    // Optionally, render nothing or a loader until CSS vars are loaded
    return null;
  }

  return (
    <HeadedCard variant={VariantEnum.Primary} width={"100vw"} height={"50vh"} className={'center-column'}  style={{ position: 'relative', overflow: 'hidden', padding: '0', boxSizing: 'content-box' }} >
      <HeadedCard variant={VariantEnum.Secondary} className={'center-column'} style={{ position: 'absolute', overflow: 'hidden', zIndex: '1' } } >

        <HeadedLink variant={VariantEnum.Outline} href={'/login'}>
          <FaGithub /> Login with Github to Create a Project
        </HeadedLink>
        <HeadedLink variant={VariantEnum.Outline} href={'/projects'}>
          <FaProjectDiagram /> View Existing Projects
        </HeadedLink>

        <HeadedCarousel variant={VariantEnum.Outline}>
        <HeadedCard variant={VariantEnum.Primary}>
          <div className="flex items-center gap-3 p-4">

            <div>
              <h3 className="font-semibold"><FaProjectDiagram className="text-2xl" />  Projects</h3>
              <p className="text-sm opacity-75">
                Create a project to organize features, developer-focused documentation, and manuals for end users.
              </p>
            </div>
          </div>
        </HeadedCard>

        <HeadedCard variant={VariantEnum.Primary}>
          <div className="flex items-center gap-3 p-4">
            <div>
              <h3 className="font-semibold"> <FaCubes className="text-2xl" />  Features</h3>
              <p className="text-sm opacity-75">
                Break down your project into features that own their docs and manuals.
              </p>
            </div>
          </div>
        </HeadedCard>

        <HeadedCard variant={VariantEnum.Primary}>
          <div className="flex items-center gap-3 p-4">
            <div>
              <h3 className="font-semibold"> <FaBook className="text-2xl" />  Docs & Manuals</h3>
              <p className="text-sm opacity-75">
                Generate developer docs and user manuals side by side, always in sync.
              </p>
            </div>
          </div>
        </HeadedCard>

        <HeadedCard variant={VariantEnum.Primary}>
          <div className="flex items-center gap-3 p-4">
            <div>
              <h3 className="font-semibold"><FaExchangeAlt className="text-2xl" />  Flexible Structure</h3>
              <p className="text-sm opacity-75">
                Reorder documentation and manual sections at any time as features evolve.
              </p>
            </div>
          </div>
        </HeadedCard>
      </HeadedCarousel>

      </HeadedCard>
      {init && (


        <Particles
          id="tsparticles"
          options={{
            fullScreen: false,
            background: {
              color: { value: cssVars.backgroundColor },
            },
            fpsLimit: 60,
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: true, mode: "repulse" },
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 200, duration: 0.4 },
              },
            },
            particles: {
              color: { value: cssVars.color },
              links: {
                color: cssVars.hoverColor,
                distance: 150,
                enable: true,
                opacity: 1.0,
                width: 2,
              },
              move: {
                direction: "outside",
                enable: true,
                outModes: { default: "bounce" },
                random: true,
                speed: 10,
                straight: false,
              },
              number: {
                density: { enable: true },
                value: 50,
              },
              opacity: { value: 100 },
              shape: { type: "circle" },
              size: { value: { min: 0.1, max: 1 } },
            },
            detectRetina: true,
          }}
          particlesLoaded={particlesLoaded}
        />
      )}
    </HeadedCard>
  );
}