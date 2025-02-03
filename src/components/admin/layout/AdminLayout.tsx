import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useCallback, useState } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Container, Engine } from 'tsparticles-engine';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    if (container) {
      container.canvas.element.style.transform = 'translateZ(0)';
      container.canvas.element.style.backfaceVisibility = 'hidden';
    }
  }, []);

  return (
    <div className="relative flex h-[100dvh] overflow-hidden bg-neutral-900">
      {/* Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          id="adminParticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            fullScreen: { enable: false, zIndex: 0 },
            fpsLimit: 60,
            particles: {
              number: { value: 40, density: { enable: true, value_area: 800 } },
              color: { value: "#ffffff" },
              shape: { type: "circle" },
              opacity: { value: 0.15, random: false },
              size: { value: 3, random: true },
              line_linked: {
                enable: true,
                distance: 150,
                color: "#ffffff",
                opacity: 0.1,
                width: 1,
                triangles: { enable: false }
              },
              move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: { enable: false, rotateX: 600, rotateY: 1200 }
              }
            },
            interactivity: {
              detectsOn: "canvas",
              events: {
                onHover: {
                  enable: true,
                  mode: "grab",
                  parallax: { enable: true, smooth: 10, force: 60 }
                },
                onClick: { enable: true, mode: "push" },
                resize: true
              },
              modes: {
                grab: {
                  distance: 140,
                  lineLinked: { opacity: 0.25 }
                },
                push: { particles_nb: 2 }
              }
            },
            retina_detect: true,
            fps_limit: 60,
            detectRetina: true
          }}
          className="absolute inset-0 [transform:translateZ(0)] [backface-visibility:hidden]"
        />
      </div>

      {/* Mobile Navigation */}
      <div className="fixed top-0 z-50 w-full md:hidden">
        <MobileNav onMenuClick={() => setIsSidebarOpen(true)} />
      </div>

      {/* Sidebar - Desktop & Mobile */}
      <AnimatePresence mode="wait">
        {/* Desktop Sidebar */}
        <div className="relative z-10 hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}

        {/* Mobile Sidebar */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: isSidebarOpen ? 0 : "-100%" }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
        >
          <Sidebar mobile onClose={() => setIsSidebarOpen(false)} />
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-auto pt-16 md:pt-0">
        <div className="container mx-auto h-full px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
