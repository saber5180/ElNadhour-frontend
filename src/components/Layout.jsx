import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();

  /** Bouton « Remonter en haut » qui apparaît après ~520px de scroll */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /** Remet la page en haut à chaque changement de route */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /** Reveal-on-scroll global : observe les .nd-reveal et ajoute .is-visible quand ils entrent en vue.
   *  Le MutationObserver capte les éléments ajoutés plus tard (chargement asynchrone des cartes). */
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined;
    const seen = new WeakSet();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
    );
    const observeAll = () => {
      document.querySelectorAll('.nd-reveal').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Remonter en haut"
          className="nd-fab fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-cafe-900 text-white shadow-[0_18px_38px_-12px_rgba(15,37,41,0.6)] ring-1 ring-cafe-300/30 transition-all hover:-translate-y-0.5 hover:bg-cafe-700 hover:shadow-[0_22px_48px_-12px_rgba(31,90,107,0.6)] md:bottom-8 md:right-8"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Layout;
