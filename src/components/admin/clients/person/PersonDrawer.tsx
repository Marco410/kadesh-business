"use client";

import { useQuery } from "@apollo/client";
import type { PersonTab } from "../../constants";
import { AdminDrawer, formatPersonName } from "../../ui";
import {
  ADMIN_PERSON_HEADER_QUERY,
  type AdminPersonHeaderResponse,
} from "../clients-queries";
import PersonPanels from "./PersonPanels";

/** Persona dentro del 360 de su empresa: editar datos/roles, ver accesos y actividad. */
export default function PersonDrawer({
  userId,
  initialTab,
  onClose,
}: {
  userId: string | null;
  initialTab?: PersonTab;
  onClose: () => void;
}) {
  const { data } = useQuery<AdminPersonHeaderResponse>(ADMIN_PERSON_HEADER_QUERY, {
    variables: { id: userId ?? "" },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });
  const person = data?.user;

  return (
    <AdminDrawer
      open={Boolean(userId)}
      onClose={onClose}
      ariaLabel="Detalle de la persona"
      title={
        person
          ? formatPersonName(person.name, person.lastName, person.secondLastName)
          : "Persona"
      }
      subtitle={person?.email ?? undefined}
    >
      {userId ? <PersonPanels key={userId} userId={userId} initialTab={initialTab} /> : null}
    </AdminDrawer>
  );
}
