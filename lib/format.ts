export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export function monthLabel(date: Date) {
  const value = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function currentMonthLabel() {
  return monthLabel(new Date());
}
