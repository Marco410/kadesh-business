/** "Buenos días" hasta las 11:59, "Buenas tardes" hasta las 18:59, luego "Buenas noches". */
export function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}
