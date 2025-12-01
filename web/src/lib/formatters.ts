const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

const formatter = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

export function formatRelativeTimeFromNow(dateInput: string) {
  const now = Date.now();
  const value = new Date(dateInput).getTime();
  if (Number.isNaN(value)) {
    return "";
  }
  const diff = (value - now) / 1000;

  let duration = diff;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return formatter.format(Math.round(duration), "years");
}

