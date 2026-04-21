import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { mediaUrl } from '../utils/mediaUrl';

const HeroBackground = () => {
  const { data: images, isLoading, isError } = useQuery(
    'hero-images',
    () => api.get('/hero-images').then((res) => res.data),
    { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: false }
  );

  const slides = useMemo(() => {
    if (isError) return [];
    if (!images?.length) return [];
    if (images.length === 1) {
      return Array(8).fill(images[0]);
    }
    return images;
  }, [images, isError]);

  if (isLoading || !slides.length) {
    return null;
  }

  const track = [...slides, ...slides];

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="flex h-full w-max animate-hero-marquee">
        {track.map((item, index) => (
          <img
            key={`${item.id}-${index}`}
            src={mediaUrl(item.image_url)}
            alt=""
            className="h-full min-h-[100vh] w-[min(85vw,380px)] shrink-0 object-cover sm:w-[min(70vw,420px)] md:w-[min(55vw,480px)]"
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBackground;
