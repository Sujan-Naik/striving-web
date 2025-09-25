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
        <HeadedCard variant={VariantEnum.Primary} width={"100vw"} height={"50vh"} className={'center-column'}
                    style={{position: 'relative', overflow: 'hidden', padding: '0', boxSizing: 'content-box'}}>
            <HeadedCard variant={VariantEnum.Secondary} className={'center-column'}
                        style={{position: 'absolute', overflow: 'hidden', zIndex: '1'}}>

                <HeadedLink variant={VariantEnum.Outline} href={'/login'}>
                    <FaGithub/> Login with Github to Create a Project
                </HeadedLink>
                <HeadedLink variant={VariantEnum.Outline} href={'/projects'}>
                    <FaProjectDiagram/> View Existing Projects
                </HeadedLink>

                <HeadedCarousel variant={VariantEnum.Outline}>
                    <HeadedCard variant={VariantEnum.Primary}>
                        <div className="flex items-center gap-3 p-4">

                            <div>
                                <h3 className="font-semibold"><FaProjectDiagram className="text-2xl"/> Projects</h3>
                                <p className="text-sm opacity-75">
                                    Create a project to organize features, developer-focused documentation, and manuals
                                    for end users.
                                </p>
                            </div>
                        </div>
                    </HeadedCard>

                    <HeadedCard variant={VariantEnum.Primary}>
                        <div className="flex items-center gap-3 p-4">
                            <div>
                                <h3 className="font-semibold"><FaCubes className="text-2xl"/> Features</h3>
                                <p className="text-sm opacity-75">
                                    Break down your project into features that own their docs and manuals.
                                </p>
                            </div>
                        </div>
                    </HeadedCard>

                    <HeadedCard variant={VariantEnum.Primary}>
                        <div className="flex items-center gap-3 p-4">
                            <div>
                                <h3 className="font-semibold"><FaBook className="text-2xl"/> Docs & Manuals</h3>
                                <p className="text-sm opacity-75">
                                    Generate developer docs and user manuals side by side, always in sync.
                                </p>
                            </div>
                        </div>
                    </HeadedCard>

                    <HeadedCard variant={VariantEnum.Primary}>
                        <div className="flex items-center gap-3 p-4">
                            <div>
                                <h3 className="font-semibold"><FaExchangeAlt className="text-2xl"/> Flexible Structure
                                </h3>
                                <p className="text-sm opacity-75">
                                    Reorder documentation and manual sections at any time as features evolve.
                                </p>
                            </div>
                        </div>
                    </HeadedCard>
                </HeadedCarousel>

            </HeadedCard>
            {init && (

                // parent
            <div style={{ position: 'relative', overflow: 'hidden', /* give it a height */ minHeight: '60vh' }}>
              <Particles
                id="tsparticles"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 0,
                  pointerEvents: 'none', // optional, lets clicks go through
                }}
                options={{
                  fullScreen: { enable: false, zIndex: 0 }, // note: object, not boolean
                  particles: {
                    number: {
                      value: 300,
                      density: {
                        enable: true,
                        width: 1000,
                        height: 1000
                      } },
                    color: { value: '#ffffff' },
                    shape: { type: 'circle' },
                    opacity: { value: 0.5 },
                    size: { value: { min: 1, max: 3 } },
                    links: { enable: true, distance: 100, color: '#ffffff', opacity: 0.4, width: 1 },
                    move: { enable: true, speed: 3 },
                  },
                  interactivity: {
                    events: {
                      onHover: { enable: true, mode: 'repulse' },
                      onClick: { enable: true, mode: 'push' },
                    },
                    modes: {
                      grab: { distance: 400, links: { opacity: 1 } },
                      bubble: { distance: 400, size: 40, duration: 2, opacity: 0.8 },
                      repulse: { distance: 200 },
                      push: { quantity: 4 },
                      remove: { quantity: 2 },
                    },
                  },
                  responsive: [
                    { options: { particles: { color: { value: '#ffffff' }, number: { value: 100 } } } },
                  ],
                  background: { color: 'var(--background-primary)' },
                }}
                particlesLoaded={particlesLoaded}
              />

            </div>
            )}
        </HeadedCard>
    );
}