import React from 'react';

const MAX_SEGMENT_LEN = 48;

function splitIntoSegments(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const byComma = normalized.split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean);
  if (byComma.length >= 2) return byComma;
  const bySlash = normalized.split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
  if (bySlash.length >= 2) return bySlash;
  const byBullet = normalized.split(/\s*[·•]\s*/).map((s) => s.trim()).filter(Boolean);
  if (byBullet.length >= 2) return byBullet;
  return [normalized];
}

function isShortList(parts) {
  if (parts.length < 2) return false;
  return Math.max(...parts.map((p) => p.length)) <= MAX_SEGMENT_LEN;
}

/** Première lettre en majuscule, le reste en minuscules (chaque élément de liste). */
function capitalizeFirstLetter(segment) {
  const s = segment.trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Une seule phrase : seule la toute première lettre est forcée en majuscule. */
function capitalizeSentenceStart(text) {
  const s = text.trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Chaque morceau (ingrédients séparés par virgule, / ou ·) dans un cadre ;
 * première lettre en majuscule par cadre. Texte long → un seul cadre.
 */
const MenuItemDescription = ({ text, className = '' }) => {
  if (!text?.trim()) return null;

  const normalized = text.replace(/\s+/g, ' ').trim();
  const rawParts = splitIntoSegments(normalized);
  const useMultipleFrames = rawParts.length >= 2 && isShortList(rawParts);
  const parts = useMultipleFrames ? rawParts : [normalized];

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {parts.map((part, i) => {
        const label = useMultipleFrames
          ? capitalizeFirstLetter(part)
          : capitalizeSentenceStart(part);
        return (
          <span
            key={i}
            className="inline-flex max-w-full items-center rounded border border-cafe-200/90 bg-cafe-50/80 px-2 py-0.5 text-xs font-medium text-cafe-800 shadow-sm"
          >
            <span className="truncate">{label}</span>
          </span>
        );
      })}
    </div>
  );
};

export default MenuItemDescription;
