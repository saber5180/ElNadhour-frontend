import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  Phone,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatPriceDT } from '../../utils/formatPrice';
import { markAllReservationsSeen } from '../../hooks/useAdminReservationAlerts.jsx';

const STATUS_OPTS = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'cancelled', label: 'Annulées / refusées' },
];

/** @param {*} raw */
function parseItems(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** @param {*} line */
function lineTotal(line) {
  const q = Number(line.quantity) || 0;
  const u = Number(line.unit_price) || 0;
  return q * u;
}

function statusBadge(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'confirmed')
    return 'rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-900';
  if (s === 'cancelled')
    return 'rounded-full bg-red-100 px-3 py-0.5 text-xs font-semibold text-red-900';
  return 'rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-950';
}

function statusLabelFr(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'confirmed') return 'Confirmée';
  if (s === 'cancelled') return 'Annulée';
  return 'En attente';
}

export default function ReservationsManager() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: reservations = [], isLoading, error } = useQuery(
    'admin-reservations',
    () => api.get('/reservations').then((r) => r.data),
    { staleTime: 30 * 1000 }
  );

  useEffect(() => {
    if (Array.isArray(reservations)) {
      markAllReservationsSeen(reservations);
    }
  }, [reservations]);

  const filtered = useMemo(() => {
    if (!Array.isArray(reservations)) return [];
    if (filter === 'all') return reservations;
    return reservations.filter((r) => String(r.status).toLowerCase() === filter);
  }, [reservations, filter]);

  const updateStatus = useMutation(
    ({ id, status }) => api.patch(`/reservations/${id}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-reservations');
        toast.success('Statut mis à jour.');
      },
      onError: (err) => {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.msg ||
          'Mise à jour impossible.';
        toast.error(typeof msg === 'string' ? msg : 'Erreur lors de la mise à jour.');
      },
    }
  );

  return (
    <div className="space-y-8 pb-24">
      <div className="border-b border-cafe-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-cafe-600">Réservations</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-cafe-900 md:text-4xl">
          Demandes clients
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-cafe-700 md:text-base">
          Filtrez par statut, confirmez ou refusez une demande (refus = « annulée »).
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-900">
          Impossible de charger les réservations. Vérifiez la connexion ou reconnectez-vous à
          l’administration.
          <button
            type="button"
            className="ml-3 font-semibold underline"
            onClick={() => queryClient.invalidateQueries('admin-reservations')}
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-cafe-800">
          <Filter className="h-4 w-4 shrink-0 text-cafe-600" />
          Filtrer
        </span>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                filter === opt.value
                  ? 'border-cafe-700 bg-cafe-700 text-white shadow-md shadow-cafe-700/20'
                  : 'border-cafe-200 bg-white text-cafe-800 hover:bg-cafe-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Chargement des réservations…" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cafe-300 bg-cafe-50/70 py-16 text-center text-cafe-800">
          <Calendar className="mx-auto mb-3 h-10 w-10 text-cafe-500" />
          <p className="font-medium">Aucune réservation pour ce filtre.</p>
          <button
            type="button"
            className="mt-4 inline-flex rounded-lg border border-cafe-200 bg-white px-4 py-2 text-sm font-semibold text-cafe-900 hover:bg-cafe-50"
            onClick={() => setFilter('all')}
          >
            Afficher tout
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((row) => {
            const items = parseItems(row.items);
            const itemsGrandTotal = items.reduce((acc, l) => acc + lineTotal(l), 0);

            const isPending =
              String(row.status || '').toLowerCase() === 'pending';

            return (
              <article
                key={row.id}
                className="overflow-hidden rounded-2xl border border-cafe-200/90 bg-white shadow-sm transition hover:border-cafe-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between lg:p-7">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={statusBadge(row.status)}>{statusLabelFr(row.status)}</span>
                      <span className="rounded-full bg-cafe-50 px-2.5 py-0.5 text-xs font-bold tabular-nums text-cafe-800">
                        #{row.id}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-2 text-sm text-cafe-900">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cafe-600" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-cafe-600">
                            Téléphone
                          </p>
                          <a href={`tel:${String(row.phone).replace(/\s/g, '')}`} className="font-semibold underline-offset-2 hover:underline">
                            {row.phone}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-cafe-900">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-cafe-600" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-cafe-600">
                            Nom
                          </p>
                          <p className="font-medium">{row.customer_name?.trim() || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-cafe-900">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-cafe-600" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-cafe-600">
                            Date & heure
                          </p>
                          <p className="font-semibold capitalize">
                            {row.reservation_date
                              ? new Date(row.reservation_date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : '—'}
                            {' · '}
                            {row.reservation_time
                              ? String(row.reservation_time).slice(0, 5)
                              : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-cafe-900">
                        <Users className="mt-0.5 h-4 w-4 shrink-0 text-cafe-600" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-cafe-600">
                            Convives
                          </p>
                          <p className="font-semibold tabular-nums">{row.guest_count}</p>
                        </div>
                      </div>
                    </div>

                    {row.notes && (
                      <div className="rounded-xl bg-cafe-50/90 px-4 py-3 text-sm leading-relaxed text-cafe-900">
                        <p className="text-xs font-bold uppercase tracking-wide text-cafe-700">Notes</p>
                        <p className="mt-1">{row.notes}</p>
                      </div>
                    )}

                    {items.length > 0 && (
                      <div className="rounded-xl border border-cafe-100 bg-cafe-50/40 p-4">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-cafe-700">
                          Précommande
                        </p>
                        <ul className="space-y-2 text-sm">
                          {items.map((line, idx) => (
                            <li
                              key={`${row.id}-${line.menu_item_id ?? idx}-${line.name}`}
                              className="flex justify-between gap-4 border-b border-cafe-100/80 pb-2 last:border-0 last:pb-0"
                            >
                              <span className="min-w-0">
                                <span className="font-semibold tabular-nums text-cafe-800">
                                  {line.quantity}×
                                </span>{' '}
                                <span className="font-medium text-cafe-950">{line.name}</span>
                              </span>
                              <span className="shrink-0 tabular-nums font-semibold text-cafe-800">
                                {formatPriceDT(lineTotal(line))}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex justify-between border-t border-cafe-200 pt-3 text-sm font-bold text-cafe-900">
                          <span>Total indicatif</span>
                          <span className="tabular-nums">{formatPriceDT(itemsGrandTotal)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-2 sm:w-48">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cafe-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cafe-800 disabled:opacity-50"
                          disabled={updateStatus.isLoading}
                          onClick={() => updateStatus.mutate({ id: row.id, status: 'confirmed' })}
                        >
                          {updateStatus.isLoading && updateStatus.variables?.id === row.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Confirmer
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900 transition hover:bg-red-100 disabled:opacity-50"
                          disabled={updateStatus.isLoading}
                          onClick={() => updateStatus.mutate({ id: row.id, status: 'cancelled' })}
                        >
                          <XCircle className="h-4 w-4" />
                          Refuser
                        </button>
                      </>
                    ) : (
                      <p className="rounded-xl border border-cafe-100 bg-cafe-50/60 px-3 py-2 text-center text-xs font-medium text-cafe-700">
                        Cette demande est déjà traitée (statut différent).
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-cafe-100 bg-cafe-50/40 px-5 py-3 text-xs text-cafe-600 lg:px-7">
                  <Clock className="h-3.5 w-3.5" />
                  Demandé le{' '}
                  {row.created_at
                    ? new Date(row.created_at).toLocaleString('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : '—'}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
