"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  ADMIN_USER_BLOG_SUBSCRIPTIONS_QUERY,
  CREATE_BLOG_SUBSCRIPTION_MUTATION,
  UPDATE_BLOG_SUBSCRIPTION_MUTATION,
  type AdminUserBlogSubscriptionsResponse,
} from "./queries";
import { BLOG_PRODUCT_OPTIONS } from "./constants";
import type { AdminBlogSubscriptionRow } from "./types";
import { AdminErrorState, AdminStatusBadge } from "./ui";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminUserBlogSubscriptions({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string | null;
}) {
  // También trae las registradas solo con su correo (p. ej. desde el blog antes de crear cuenta).
  const where = useMemo(() => {
    const byUser = { user: { id: { equals: userId } } };
    if (!userEmail) return byUser;
    return { OR: [byUser, { email: { equals: userEmail } }] };
  }, [userId, userEmail]);

  const { data, error, refetch } = useQuery<AdminUserBlogSubscriptionsResponse>(
    ADMIN_USER_BLOG_SUBSCRIPTIONS_QUERY,
    { variables: { where }, fetchPolicy: "network-only" },
  );
  const subscriptions = data?.blogSubscriptions;

  return (
    <section>
      <h4 className="text-sm font-semibold text-[#212121] dark:text-white">
        Suscripción al blog
      </h4>
      <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1 mb-3">
        Cada blog se guarda por separado. Si está pausada, no recibe avisos de
        nuevos artículos.
      </p>
      {error ? (
        <AdminErrorState message="No se pudieron cargar las suscripciones." />
      ) : !subscriptions ? (
        <div className="space-y-3" aria-hidden>
          <div className="h-40 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
          <div className="h-40 rounded-xl bg-[#ececec] dark:bg-[#2a2a2a] animate-pulse" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {BLOG_PRODUCT_OPTIONS.map((product) => {
            const rows = subscriptions.filter(
              (s) => s.product === product.value,
            );
            const cards: Array<AdminBlogSubscriptionRow | null> =
              rows.length > 0 ? rows : [null];
            return cards.map((subscription) => (
              <SubscriptionCard
                key={`${product.value}-${subscription?.id ?? "new"}`}
                userId={userId}
                userEmail={userEmail}
                product={product}
                subscription={subscription}
                onChanged={refetch}
              />
            ));
          })}
        </div>
      )}
    </section>
  );
}

function SubscriptionCard({
  userId,
  userEmail,
  product,
  subscription,
  onChanged,
}: {
  userId: string;
  userEmail: string | null;
  product: (typeof BLOG_PRODUCT_OPTIONS)[number];
  subscription: AdminBlogSubscriptionRow | null;
  onChanged: () => Promise<unknown> | void;
}) {
  const [email, setEmail] = useState(subscription?.email ?? userEmail ?? "");
  const [active, setActive] = useState(subscription?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [createSubscription] = useMutation(CREATE_BLOG_SUBSCRIPTION_MUTATION);
  const [updateSubscription] = useMutation(UPDATE_BLOG_SUBSCRIPTION_MUTATION);

  const trimmedEmail = email.trim();
  const isLinked = subscription?.user?.id === userId;
  const emailError =
    trimmedEmail !== "" && !EMAIL_PATTERN.test(trimmedEmail)
      ? "Revisa el formato del correo."
      : null;
  const isDirty = subscription
    ? trimmedEmail !== (subscription.email ?? "") ||
      active !== Boolean(subscription.active) ||
      !isLinked
    : true;
  const canSave = trimmedEmail !== "" && !emailError && isDirty && !saving;

  async function handleSave() {
    setSaving(true);
    try {
      if (subscription) {
        await updateSubscription({
          variables: {
            where: { id: subscription.id },
            data: {
              email: trimmedEmail,
              active,
              ...(isLinked ? {} : { user: { connect: { id: userId } } }),
            },
          },
        });
      } else {
        await createSubscription({
          variables: {
            data: {
              email: trimmedEmail,
              product: product.value,
              active,
              user: { connect: { id: userId } },
            },
          },
        });
      }
      await onChanged();
      sileo.success({
        title: subscription ? "Suscripción actualizada" : "Suscripción creada",
      });
    } catch (err) {
      sileo.error({
        title: "No se pudo guardar la suscripción",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#212121] dark:text-white">
            {product.label}
          </p>
          <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5">
            {product.description}
          </p>
        </div>
        {subscription ? (
          <AdminStatusBadge
            label={subscription.active ? "Activa" : "Pausada"}
            className={
              subscription.active
                ? "bg-green-500/15 text-green-700 dark:text-green-400"
                : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
            }
          />
        ) : (
          <AdminStatusBadge
            label="Sin suscripción"
            className="bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]"
          />
        )}
      </div>

      {subscription ? (
        <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-2">
          Desde {formatDateShort(subscription.createdAt, false)}
          {isLinked
            ? ""
            : " · Se registró con este correo pero no está ligada a la cuenta; al guardar se liga."}
        </p>
      ) : null}

      <label className="block mt-3">
        <span className="block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1">
          Correo de la suscripción
        </span>
        <input
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={saving}
          className="h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 text-sm"
        />
      </label>
      {emailError ? (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
          {emailError}
        </p>
      ) : null}

      <label className="mt-3 flex items-center gap-3 min-h-11 cursor-pointer">
        <input
          type="checkbox"
          checked={active}
          disabled={saving}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 accent-orange-500"
        />
        <span className="text-sm text-[#212121] dark:text-white">
          Recibir avisos de nuevos artículos
        </span>
      </label>

      <button
        type="button"
        disabled={!canSave}
        onClick={handleSave}
        className="mt-3 h-11 w-full sm:w-auto rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 text-sm font-semibold disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
      >
        {saving ? "Guardando..." : subscription ? "Guardar suscripción" : "Suscribir"}
      </button>
    </div>
  );
}
