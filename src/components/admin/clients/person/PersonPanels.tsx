"use client";

import { useMemo, useState } from "react";
import ActivityTimeline from "../../activity/ActivityTimeline";
import { useActivityFeed } from "../../activity/useActivityFeed";
import AdminUserProfileForm from "../../AdminUserProfileForm";
import { PERSON_TABS, type PersonTab } from "../../constants";
import { AdminSegmented } from "../../ui";
import AuthLogList from "./AuthLogList";
import PersonControl from "./PersonControl";

function PersonActivity({ userId }: { userId: string }) {
  const input = useMemo(() => ({ userId, take: 20 }), [userId]);
  const feed = useActivityFeed(input);
  return (
    <ActivityTimeline
      items={feed.items}
      loading={feed.loading}
      error={feed.error}
      hasMore={feed.hasMore}
      loadingMore={feed.loadingMore}
      onLoadMore={feed.loadMore}
      showCompany={false}
      emptyTitle="Sin actividad de esta persona"
      emptyDescription="Sus accesos, extracciones, uso de IA y movimientos del CRM aparecen aquí."
    />
  );
}

/** Perfil, accesos, actividad y control de acceso de una persona. */
export default function PersonPanels({
  userId,
  initialTab = PERSON_TABS.PROFILE,
}: {
  userId: string;
  initialTab?: PersonTab;
}) {
  const [tab, setTab] = useState<PersonTab>(initialTab);

  return (
    <div className="flex flex-col gap-4">
      <AdminSegmented
        ariaLabel="Detalle de la persona"
        items={[
          { id: PERSON_TABS.PROFILE, label: "Perfil" },
          { id: PERSON_TABS.ACCESS, label: "Accesos" },
          { id: PERSON_TABS.ACTIVITY, label: "Actividad" },
          { id: PERSON_TABS.CONTROL, label: "Control" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === PERSON_TABS.PROFILE ? <AdminUserProfileForm userId={userId} /> : null}
      {tab === PERSON_TABS.ACCESS ? <AuthLogList userId={userId} /> : null}
      {tab === PERSON_TABS.ACTIVITY ? <PersonActivity userId={userId} /> : null}
      {tab === PERSON_TABS.CONTROL ? <PersonControl userId={userId} /> : null}
    </div>
  );
}
