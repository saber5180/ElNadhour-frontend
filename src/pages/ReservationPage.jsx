import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import toast from 'react-hot-toast';
import {
  Calendar,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock,
  Minus,
  Phone,
  Plus,
  Search,
  Send,
  User,
  Users,
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { mediaUrl } from '../utils/mediaUrl';
import { formatPriceDT } from '../utils/formatPrice';
import {
  RESTAURANT_PHONE,
  RESTAURANT_PHONE_TEL,
} from '../config/contact';

const PLACEHOLDER = '/placeholder-food.svg';

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function itemUnitPrice(item) {
  const promo = item.promotion_price != null && item.promotion_price !== '';
  if (promo) return Number(item.promotion_price);
  return Number(item.price) || 0;
}

/**
 * Résumé ligne panier pour l’API
 * @param {Map<number,{ item: object, qty: number }>} cart
 */
function cartToPayload(cart) {
  const lines = [];
  cart.forEach(({ item, qty }) => {
    if (qty <= 0) return;
    const price = itemUnitPrice(item);
    lines.push({
      menu_item_id: item.id,
      name: item.name,
      quantity: qty,
      unit_price: price,
    });
  });
  return lines;
}

function cartTotals(cart) {
  let count = 0;
  let total = 0;
  cart.forEach(({ item, qty }) => {
    if (qty <= 0) return;
    count += qty;
    const price = itemUnitPrice(item);
    total += price * qty;
  });
  return { count, total };
}

export default function ReservationPage() {
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [reservationDate, setReservationDate] = useState(todayISO());
  const [reservationTime, setReservationTime] = useState('12:30');
  const [guestCount, setGuestCount] = useState(2);
  const [notes, setNotes] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  /** @type {[Map<number, { item: object, qty: number }>, function]} */
  const [cart, setCart] = useState(() => new Map());
  const [success, setSuccess] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const { data: categories = [], isLoading: catLoading } = useQuery(
    'reservation-categories',
    () => api.get('/categories').then((r) => r.data),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: menuItems = [], isLoading: itemsLoading } = useQuery(
    'reservation-menu-items',
    () => api.get('/menu-items').then((r) => r.data),
    { staleTime: 2 * 60 * 1000 }
  );

  const mutation = useMutation(
    (payload) => api.post('/reservations', payload),
    {
      onSuccess: () => {
        toast.success('Demande de réservation envoyée.');
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: (err) => {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.msg ||
          err.message ||
          'Envoi impossible. Réessayez.';
        toast.error(typeof msg === 'string' ? msg : 'Une erreur est survenue.');
      },
    }
  );

  const filteredItems = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    return menuItems.filter((item) => {
      if (categoryId && String(item.category_id) !== String(categoryId)) {
        return false;
      }
      if (!q) return true;
      const name = (item.name || '').toLowerCase();
      const cat = (item.category_name || '').toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  }, [menuItems, menuSearch, categoryId]);

  const { count: cartCount, total: cartTotal } = cartTotals(cart);

  const adjustQty = (item, delta) => {
    setCart((prev) => {
      const next = new Map(prev);
      const row = next.get(item.id) || { item, qty: 0 };
      const q = Math.max(0, Math.min(99, row.qty + delta));
      if (q === 0) next.delete(item.id);
      else next.set(item.id, { item, qty: q });
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = phone.trim();
    if (p.length < 6) {
      toast.error('Indiquez un numéro de téléphone valide (au moins 6 caractères).');
      return;
    }
    const gc = Number(guestCount);
    if (!Number.isFinite(gc) || gc < 1 || gc > 50) {
      toast.error('Le nombre de convives doit être entre 1 et 50.');
      return;
    }

    const payload = {
      customer_name: customerName.trim() || undefined,
      phone: p,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      guest_count: gc,
      notes: notes.trim() || undefined,
      items: cartToPayload(cart),
    };

    mutation.mutate(payload);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cafe-50/50 via-white to-cafe-50/30 pb-28 lg:pb-12">
        <div className="mx-auto max-w-lg px-4 py-14 text-center sm:py-20">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cafe-700 text-white shadow-lg shadow-cafe-900/20">
            <Calendar className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-cafe-900 sm:text-3xl">
            Merci !
          </h1>
          <p className="mt-3 text-base leading-relaxed text-cafe-800">
            Votre demande a bien été enregistrée. Nous vous contacterons rapidement pour confirmer
            votre table.
          </p>
          <p className="mt-6 text-sm text-cafe-700">
            Une question urgente ?
          </p>
          <a
            href={`tel:${RESTAURANT_PHONE_TEL}`}
            className="btn-primary mx-auto mt-3 inline-flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Appeler — {RESTAURANT_PHONE}
          </a>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/carte" className="btn-secondary inline-block text-sm">
              Voir la carte
            </Link>
            <Link to="/" className="text-sm font-semibold text-cafe-800 underline-offset-4 hover:underline">
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const loading = catLoading || itemsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cafe-50/40 via-white to-cafe-50/25 pb-[calc(8rem+env(safe-area-inset-bottom))] lg:pb-12">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-cafe-600">
            El Nadhour
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Réserver une table
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
            Renseignez votre créneau et, si vous le souhaitez, vos choix depuis la carte pour une
            pré-commande indicative.
          </p>
        </header>

        {loading ? (
          <LoadingSpinner text="Chargement…" />
        ) : (
          <form
            id="reservation-form-main"
            onSubmit={handleSubmit}
            className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-8"
          >
            {/* Formulaire */}
            <div className="lg:col-span-7 space-y-6">
              <section className="card border-cafe-100 p-6 shadow-md">
                <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-cafe-900">
                  <User className="h-5 w-5 text-cafe-700" />
                  Informations & créneau
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="res-phone" className="form-label">
                      Téléphone <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="res-phone"
                      type="tel"
                      autoComplete="tel"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex. +216 55 123 456"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="res-name" className="form-label">
                      Nom (optionnel)
                    </label>
                    <input
                      id="res-name"
                      type="text"
                      autoComplete="name"
                      className="form-input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-date" className="form-label">
                      Date <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cafe-500" />
                      <input
                        id="res-date"
                        type="date"
                        min={todayISO()}
                        className="form-input pl-11"
                        value={reservationDate}
                        onChange={(e) => setReservationDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="res-time" className="form-label">
                      Heure <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cafe-500" />
                      <input
                        id="res-time"
                        type="time"
                        required
                        className="form-input pl-11"
                        value={reservationTime}
                        onChange={(e) => setReservationTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="res-guests" className="form-label">
                      Nombre de convives <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Users className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cafe-500" />
                      <input
                        id="res-guests"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={50}
                        className="form-input pl-11"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="res-notes" className="form-label">
                      Notes (allergies, occasion…)
                    </label>
                    <textarea
                      id="res-notes"
                      rows={3}
                      className="form-input resize-y"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Informations complémentaires pour la table"
                      maxLength={1000}
                    />
                  </div>
                </div>
              </section>

              {/* Menu picker */}
              <section className="card overflow-hidden border-cafe-100 p-4 shadow-md sm:p-6">
                <div className="mb-5">
                  <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-cafe-900">
                    <ChefHat className="h-5 w-5 shrink-0 text-cafe-700" />
                    Votre commande
                  </h2>
                  <p className="mt-1 text-sm text-cafe-600">
                    Optionnel — touchez + pour ajouter un plat à votre réservation.
                  </p>
                </div>

                <div className="relative mb-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cafe-400" />
                  <input
                    type="search"
                    className="form-input w-full min-w-0 pl-10 text-base"
                    placeholder="Rechercher un plat…"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    type="button"
                    onClick={() => setCategoryId('')}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                      categoryId === ''
                        ? 'bg-cafe-700 text-white shadow-sm'
                        : 'bg-cafe-100 text-cafe-800 hover:bg-cafe-200'
                    }`}
                  >
                    Tout
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(String(cat.id))}
                      className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                        categoryId === String(cat.id)
                          ? 'bg-cafe-700 text-white shadow-sm'
                          : 'bg-cafe-100 text-cafe-800 hover:bg-cafe-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {filteredItems.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-cafe-200 bg-cafe-50/60 py-12 text-center text-sm text-cafe-700">
                    Aucun plat ne correspond à votre recherche.
                  </p>
                ) : (
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {filteredItems.map((item) => {
                      const row = cart.get(item.id);
                      const qty = row?.qty || 0;
                      const src = mediaUrl(item.image_url) || PLACEHOLDER;
                      const price = itemUnitPrice(item);
                      const hasPromo =
                        item.promotion_price != null && item.promotion_price !== '';

                      return (
                        <li
                          key={item.id}
                          className={`overflow-hidden rounded-2xl border bg-white transition ${
                            qty > 0
                              ? 'border-cafe-400 ring-2 ring-cafe-400/25 shadow-md'
                              : 'border-cafe-100 shadow-sm hover:border-cafe-200 hover:shadow-md'
                          }`}
                        >
                          {/* Mobile : ligne horizontale */}
                          <div className="flex items-stretch gap-3 p-3 sm:hidden">
                            <div className="relative h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-xl bg-cafe-100">
                              <img
                                src={src}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                                onError={(ev) => {
                                  ev.target.src = PLACEHOLDER;
                                }}
                              />
                              {qty > 0 && (
                                <span className="absolute right-1 top-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-cafe-700 px-1.5 text-[11px] font-bold text-white">
                                  {qty}
                                </span>
                              )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                              <div>
                                <p className="line-clamp-2 text-sm font-semibold leading-snug text-cafe-950">
                                  {item.name}
                                </p>
                                <p className="mt-1 text-sm font-bold text-cafe-800">
                                  {formatPriceDT(price)}
                                  {hasPromo && (
                                    <span className="ml-1.5 text-xs font-normal text-cafe-500 line-through">
                                      {formatPriceDT(item.price)}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cafe-200 bg-white text-cafe-800 disabled:opacity-40"
                                  onClick={() => adjustQty(item, -1)}
                                  disabled={qty <= 0}
                                  aria-label={`Retirer ${item.name}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-5 text-center text-sm font-bold tabular-nums">{qty}</span>
                                <button
                                  type="button"
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cafe-700 text-white"
                                  onClick={() => adjustQty(item, 1)}
                                  disabled={qty >= 99}
                                  aria-label={`Ajouter ${item.name}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Tablette / desktop : carte verticale */}
                          <div className="hidden flex-col sm:flex">
                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-cafe-100">
                              <img
                                src={src}
                                alt={item.name}
                                className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                                loading="lazy"
                                onError={(ev) => {
                                  ev.target.src = PLACEHOLDER;
                                }}
                              />
                              {qty > 0 && (
                                <span className="absolute right-2 top-2 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-cafe-700 px-2 text-xs font-bold text-white shadow-md">
                                  {qty}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col p-3.5">
                              <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-cafe-950">
                                {item.name}
                              </p>
                              {item.category_name && (
                                <p className="mt-0.5 truncate text-xs text-cafe-500">{item.category_name}</p>
                              )}
                              <p className="mt-1.5 text-sm font-bold tabular-nums text-cafe-800">
                                {formatPriceDT(price)}
                                {hasPromo && (
                                  <span className="ml-1.5 text-xs font-normal text-cafe-500 line-through">
                                    {formatPriceDT(item.price)}
                                  </span>
                                )}
                              </p>
                              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                                <button
                                  type="button"
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cafe-200 bg-white text-cafe-800 transition hover:bg-cafe-50 disabled:opacity-40"
                                  onClick={() => adjustQty(item, -1)}
                                  disabled={qty <= 0}
                                  aria-label={`Retirer ${item.name}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-bold tabular-nums text-cafe-900">{qty}</span>
                                <button
                                  type="button"
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cafe-700 text-white transition hover:bg-cafe-800 disabled:opacity-40"
                                  onClick={() => adjustQty(item, 1)}
                                  disabled={qty >= 99}
                                  aria-label={`Ajouter ${item.name}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Desktop submit */}
              <div className="hidden lg:flex lg:justify-end">
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? (
                    <>Envoi…</>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer la demande
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Résumé desktop */}
            <aside className="mt-10 hidden lg:col-span-5 lg:block">
              <div className="sticky top-24 rounded-2xl border border-cafe-200 bg-white p-6 shadow-xl shadow-cafe-900/10">
                <p className="text-xs font-semibold uppercase tracking-widest text-cafe-600">
                  Récapitulatif
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-cafe-900">
                  Votre sélection
                </h3>
                {cartCount === 0 ? (
                  <p className="mt-6 text-sm text-cafe-700">
                    Aucune pré-commande sélectionnée — vous pouvez envoyer tout de même la demande de
                    table.
                  </p>
                ) : (
                  <ul className="mt-6 max-h-72 space-y-3 overflow-y-auto pr-1">
                    {[...cart.values()].map(({ item, qty }) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 border-b border-cafe-100 pb-3 text-sm text-cafe-900"
                      >
                        <span className="font-semibold tabular-nums text-cafe-700">{qty}×</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-cafe-600">{formatPriceDT(itemUnitPrice(item))} l’unité</p>
                        </div>
                        <span className="shrink-0 font-semibold tabular-nums text-cafe-800">
                          {formatPriceDT(itemUnitPrice(item) * qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-cafe-100 pt-4 text-base font-bold text-cafe-900">
                  <span>Total indicatif</span>
                  <span className="tabular-nums">{formatPriceDT(cartTotal)}</span>
                </div>
                <button
                  type="submit"
                  className="btn-primary mt-6 flex w-full justify-center gap-2 disabled:opacity-60"
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? 'Envoi…' : <>Envoyer la demande</>}
                </button>
              </div>
            </aside>
          </form>
        )}
      </div>

      {/* Mobile : barre fixe + résumé (formulaire lié par id) */}
      {!success && !loading && (
        <>
          {/* Panneau résumé repliable */}
          <div
            className={`lg:hidden fixed inset-x-0 z-[45] rounded-t-2xl border-x border-t border-cafe-200 bg-white shadow-[0_-12px_36px_-12px_rgba(15,37,41,0.25)] transition-transform duration-300 ease-out max-h-[min(52vh,360px)] flex flex-col ${
              mobileSummaryOpen
                ? 'pointer-events-auto translate-y-0 bottom-[calc(4.55rem+env(safe-area-inset-bottom))]'
                : 'pointer-events-none translate-y-full bottom-[calc(4.55rem+env(safe-area-inset-bottom))]'
            }`}
            aria-hidden={!mobileSummaryOpen}
          >
            <div className="flex max-h-[min(52vh,360px)] flex-col px-4 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-cafe-600">
                Détail précommande
              </p>
              {cartCount === 0 ? (
                <p className="mt-4 shrink-0 text-sm text-cafe-700 pb-24">
                  Aucun article sélectionné.
                </p>
              ) : (
                <ul className="mt-3 max-h-[40vh] min-h-0 space-y-2 overflow-y-auto pb-28 text-sm text-cafe-900">
                  {[...cart.values()].map(({ item, qty }) => (
                    <li key={item.id} className="flex justify-between gap-2 border-b border-cafe-50 py-2">
                      <span>
                        <span className="font-semibold">{qty}×</span> {item.name}
                      </span>
                      <span className="shrink-0 tabular-nums font-medium text-cafe-800">
                        {formatPriceDT(itemUnitPrice(item) * qty)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-cafe-200 bg-white/95 px-4 py-3 shadow-[0_-8px_32px_-12px_rgba(15,37,41,0.2)] backdrop-blur-md pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto flex max-w-lg flex-col gap-3">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-cafe-100 bg-cafe-50/80 px-3 py-2 text-sm text-cafe-900"
                onClick={() => setMobileSummaryOpen((v) => !v)}
              >
                <span>
                  <strong className="tabular-nums">{cartCount}</strong> article
                  {cartCount !== 1 ? 's' : ''}
                  {' · '}
                  <span className="font-semibold tabular-nums">{formatPriceDT(cartTotal)}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-cafe-700">
                  Résumé
                  {mobileSummaryOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </span>
              </button>

              <button
                type="submit"
                form="reservation-form-main"
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3.5 disabled:opacity-60"
                disabled={mutation.isLoading}
              >
                <Send className="h-4 w-4" />
                {mutation.isLoading ? 'Envoi…' : 'Envoyer la demande'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
