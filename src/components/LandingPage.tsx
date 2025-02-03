import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallback } from 'react';
import type { Container, Engine } from 'tsparticles-engine';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { Button } from './ui/button';

export function LandingPage() {
  const particlesInit = useCallback(async (engine: Engine) => await loadFull(engine), []);
  const particlesLoaded = useCallback(async (container?: Container) => {
    if (container) {
      Object.assign(container.canvas.element.style, {
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      });
    }
  }, []);

  return (
    <div className="relative min-h-[100dvh] bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          fullScreen: { enable: false, zIndex: 1 },
          fpsLimit: 60,
          particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: "#fff" },
            shape: { type: "circle" },
            opacity: { value: 0.3 },
            size: { value: 3, random: true },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#fff",
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1.5,
              out_mode: "out",
            },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab", parallax: { enable: true, smooth: 10, force: 60 } },
              onClick: { enable: true, mode: "push" },
              resize: true,
            },
            modes: {
              grab: { distance: 140, lineLinked: { opacity: 0.5 } },
              push: { particles_nb: 3 },
            },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 [transform:translateZ(0)] [backface-visibility:hidden]"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[100dvh] flex-col items-center justify-center py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl px-4 sm:px-6 lg:px-8"
          >
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Bienvenido
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-neutral-200 sm:mt-6 sm:text-lg md:text-xl">
              No hay instrucciones. Solo la siguiente etapa.
            </p>
            <div className="mt-6 sm:mt-8 md:mt-10">
              <Link to="/questionnaire">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button
                    size="lg"
                    className="group relative bg-white text-neutral-900 transition-all duration-300 hover:bg-neutral-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    <span className="relative z-10">Continuar</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
