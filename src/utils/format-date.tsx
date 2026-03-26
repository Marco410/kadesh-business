  export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = nowMidnight.getTime() - dateMidnight.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const formatTime = (d: Date) => {
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    if (diffDays === 0) {
      return `Hoy a las ${formatTime(date)}`;
    }
    if (diffDays === 1) {
      return 'Ayer';
    }
    if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    }
    if (diffDays < 30) {
      const weeks = Math.round(diffDays / 7);
      return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
    }

    // Diferencia real en meses de calendario (más preciso que diffDays/30)
    let months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (now.getDate() < date.getDate()) months -= 1;
    if (months < 0) months = 0;

    // ~30 días pero menos de 1 mes natural: redondear a "Hace 1 mes"
    if (months === 0 && diffDays >= 28) {
      months = 1;
    }

    if (months >= 12) {
      const years = Math.floor(months / 12);
      return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
    }
    return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
  };

  export const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  export const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  export function formatDateShort(value: string | null | undefined, showHours: boolean = true): string {
    if (!value) return "—";
    const iso = value.includes("T") ? value : `${value.slice(0, 10)}T12:00:00`;
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: showHours ? "2-digit" : undefined,
      minute: showHours ? "2-digit" : undefined,
    });
  }