import Particles, {initParticlesEngine} from "@tsparticles/react";
import {type Engine, ISourceOptions} from "@tsparticles/engine";
import {useEffect, useState} from "react";
import {loadFull} from "tsparticles";
import {HeadedTextAnim, TextAnimationType} from "headed-ui";

const options: ISourceOptions = {
    fpsLimit: 60,
    particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        width: 500,
          height: 500
      }
    },
    color: {
      value: ["#ffffff"]
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 1
    },
    size: {
      value: 4,
        animation: {
          mode: "random",
            startValue: "min"
      }
    },
    move: {
      size: true,
      enable: true,
      speed: 0.5,
      direction: "none",
      random: false,
      straight: false,
      outModes: {
        default: "out"
      },
      attract: {
        enable: false,
          rotate: {
            x: 600,
              y: 1200
          }
      },
      trail: {
        enable: true,

        length: 5,
          fill: {
            color: "#222"
          }
      },
      warp: true
    }
  },
  interactivity: {
    detectsOn: "canvas",
    events: {
      onClick: {
        enable: true,
        mode: "push"
      },
    },
    modes: {
      push: {
        quantity: 4
      }
    }
  },
  absorbers: {
    orbits: true,
    destroy: false,
    opacity: 1,
    color: "#000",
    size: {
      value: 300,
      limit: 500,
      random: true,
      density: 1000
    },
    position: {
      x: 50,
      y: 50
    }
  },
  background: {
    color: "#222"
  }
};


export default function Load() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadFull(engine);
    }).then(() => setInit(true));
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        overflow: "hidden",
        backgroundColor: "white",
      }}
    >
      {init && (
        <Particles
          options={options}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      )}

      <div
  style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) scale(0.1)",
    transformOrigin: "center center",
    margin: 0,                  // remove default h1 margins
    lineHeight: 1,              // prevent vertical offset

    textAlign: "center",
    animation: "expandText 5s ease-out forwards",
    pointerEvents: "none",
  }}
>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Striving
            </h1>
            <div className="max-w-2xl">
              <HeadedTextAnim
                className="text-xl md:text-2xl lg:text-3xl leading-relaxed"
                animation={TextAnimationType.TYPEWRITER}
                colors={['var(--foreground-primary)']}
                delay={0}
                speed={10}
              >
                Collaborate on software projects and generate documentation and user-ready manuals effortlessly
              </HeadedTextAnim>
            </div>
</div>

<style>
  {`
    @keyframes expandText {
      0% {
        transform: translate(-50%, -50%) scale(0.1);
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
  `}
</style>
    </div>
  );
}