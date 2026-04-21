import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { FACEBOOK_PAGE_URL } from '../config/social';

const FacebookGlyph = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#0f2529] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Marque */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-white/95 p-1.5 shadow-sm ring-1 ring-white/20">
                <img src="/icon.png" alt="" className="h-full w-full object-contain" />
              </div>
              <span className="font-display text-xl font-semibold tracking-tight text-white">
                El Nadhour
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/70 max-w-xs">
              Restaurant & café — spécialités artisanales, ambiance chaleureuse.
            </p>
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-white/5 px-3 py-2 text-sm text-white/90 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-[#1877F2]/40"
              aria-label="Page Facebook El Nadhour"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white">
                <FacebookGlyph className="h-4 w-4" />
              </span>
              <span className="font-medium">Facebook</span>
            </a>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7eb8c4] mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#5eead4] mt-0.5" aria-hidden />
                <span>123 Rue de la Paix, 75001 Paris</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#5eead4] mt-0.5" aria-hidden />
                <a href="tel:+33123456789" className="hover:text-white transition-colors">
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#5eead4] mt-0.5" aria-hidden />
                <a href="mailto:contact@elnadhour.com" className="hover:text-white transition-colors break-all">
                  contact@elnadhour.com
                </a>
              </li>
            </ul>
          </div>

          {/* Horaires */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7eb8c4] mb-4">
              Horaires
            </h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 text-[#5eead4] mt-0.5" aria-hidden />
                <div>
                  <div className="font-medium text-white/95">Lun – Ven</div>
                  <div>7h00 – 19h00</div>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 text-[#5eead4] mt-0.5" aria-hidden />
                <div>
                  <div className="font-medium text-white/95">Sam – Dim</div>
                  <div>8h00 – 20h00</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre bas — sobre */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45">
          <p>&copy; {new Date().getFullYear()} El Nadhour. Tous droits réservés.</p>
          <Link
            to="/admin"
            className="text-white/25 hover:text-white/50 transition-colors px-2 py-1"
            aria-label="Administration"
          >
            ·
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
