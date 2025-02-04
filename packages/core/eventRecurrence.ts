import { addDays, addMonths, addYears, isSameDay, parseISO } from "date-fns";

export type RecurrenceRule = {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  byWeekday?: string[]; // Dias da semana
  exceptions?: string[]; // Datas de exceção
};

const incrementDate = {
  daily: (date: Date, interval: number) => addDays(date, interval),
  weekly: (date: Date, interval: number) => addDays(date, interval * 7),
  monthly: (date: Date, interval: number) => addMonths(date, interval),
  yearly: (date: Date, interval: number) => addYears(date, interval),
};

export function generateRecurringEvents(startDate: string, endDate: string, rule: RecurrenceRule): string[] {
  const events: string[] = [];
  let currentDate = parseISO(startDate);
  const end = parseISO(endDate);

  const isException = (date: Date) =>
    rule.exceptions?.some((exception) => isSameDay(date, parseISO(exception)));

  if (!(rule.frequency in incrementDate)) {
    throw new Error("Frequência não suportada");
  }

  while (currentDate <= end) {
    if (!isException(currentDate)) {
      events.push(currentDate.toISOString().split("T")[0]);
    }

    currentDate = incrementDate[rule.frequency](currentDate, rule.interval);
  }

  return events;
}
