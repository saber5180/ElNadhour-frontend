import { useEffect } from 'react';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

/**
 * Ensemble d’IDs « pending » déjà connus ; partagé entre tous les appels au hook et `markAllReservationsSeen`.
 * Évite les doublons si le hook est monté plusieurs fois.
 */
let baselinePendingIds = null;

/**
 * Considérer toutes les réservations en attente comme vues — plus de toast pour celles-ci.
 * @param {Array<{ id: number, status?: string }>} reservations Liste renvoyée par GET /reservations.
 */
export function markAllReservationsSeen(reservations) {
  if (!Array.isArray(reservations)) return;
  const ids = new Set(
    reservations.filter((row) => row.status === 'pending').map((row) => row.id)
  );
  baselinePendingIds = ids;
}

/**
 * Sondage des réservations admin toutes les 20 s.
 * Toast uniquement pour les nouvelles réservations « pending » (pas lors du tout premier jeu de données).
 */
export function useAdminReservationAlerts() {
  const { data: reservations, refetch } = useQuery(
    'admin-reservations',
    () => api.get('/reservations').then((r) => r.data),
    {
      refetchInterval: 20_000,
      refetchOnWindowFocus: true,
      staleTime: 0,
      retry: 1,
    }
  );

  useEffect(() => {
    if (!Array.isArray(reservations)) return;

    const pendings = reservations.filter((row) => row.status === 'pending');
    const pendingIds = new Set(pendings.map((row) => row.id));

    if (baselinePendingIds === null) {
      baselinePendingIds = pendingIds;
      return;
    }

    const prev = baselinePendingIds;
    pendings.forEach((row) => {
      if (!prev.has(row.id)) {
        const who = row.customer_name?.trim() || row.phone;
        toast.success(
          `Nouvelle réservation en attente — #${row.id}${who ? ` · ${who}` : ''}`
        );
      }
    });

    baselinePendingIds = new Set([...prev, ...pendingIds]);
  }, [reservations]);

  return {
    reservations: reservations ?? [],
    pendingCount: (reservations ?? []).filter((r) => r.status === 'pending').length,
    refetchReservations: refetch,
  };
}

export default useAdminReservationAlerts;
