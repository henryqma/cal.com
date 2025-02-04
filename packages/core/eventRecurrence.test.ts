import { describe, it, expect } from "vitest";

import type { RecurrenceRule } from "./eventRecurrence";
import { generateRecurringEvents } from "./eventRecurrence";

describe("recorrência com exceções", () => {
  it("recorrência diária", () => {
    const rule: RecurrenceRule = {
      frequency: "daily",
      interval: 1, // Todos os dias
      exceptions: ["2023-10-03", "2023-10-05"], // Pular dias 03/10 e 05/10
    };

    const startDate = "2023-10-01"; // Data inicial
    const endDate = "2023-10-07"; // Data final

    const events = generateRecurringEvents(startDate, endDate, rule);

    // Verifica se os eventos foram gerados corretamente
    expect(events).toEqual([
      "2023-10-01", // Dia 1
      "2023-10-02", // Dia 2
      // Dia 3 foi pulado (exceção)
      "2023-10-04", // Dia 4
      // Dia 5 foi pulado (exceção)
      "2023-10-06", // Dia 6
      "2023-10-07", // Dia 7
    ]);
  });

  it("recorrência semanal", () => {
    const rule: RecurrenceRule = {
      frequency: "weekly", // Semanal
      interval: 1, // Toda semana
      byWeekday: ["MO"], // Toda segunda-feira
      exceptions: ["2023-10-09"], // Pular o dia 09/10/2023
    };

    const startDate = "2023-10-02"; // Data inicial
    const endDate = "2023-10-30"; // Data final

    const events = generateRecurringEvents(startDate, endDate, rule);

    // Verifica se os eventos foram gerados corretamente
    expect(events).toEqual([
      "2023-10-02", // Segunda-feira
      "2023-10-16", // Segunda-feira (pulou o dia 09/10)
      "2023-10-23", // Segunda-feira
      "2023-10-30", // Segunda-feira
    ]);
  });

  it("recorrência mensal", () => {
    const rule: RecurrenceRule = {
      frequency: "monthly",
      interval: 1, // Todo mês
      exceptions: ["2023-11-15"], // Pular dia 15/11
    };

    const startDate = "2023-10-15"; // Data inicial
    const endDate = "2024-01-15"; // Data final

    const events = generateRecurringEvents(startDate, endDate, rule);

    // Verifica se os eventos foram gerados corretamente
    expect(events).toEqual([
      "2023-10-15", // Outubro
      // Novembro foi pulado (exceção)
      "2023-12-15", // Dezembro
      "2024-01-15", // Janeiro
    ]);
  });

  it("recorrência anual", () => {
    const rule: RecurrenceRule = {
      frequency: "yearly",
      interval: 1, // Todo ano
      exceptions: ["2024-12-25"], // Pular dia 25/12/2024
    };

    const startDate = "2023-12-25"; // Data inicial
    const endDate = "2025-12-25"; // Data final

    const events = generateRecurringEvents(startDate, endDate, rule);

    // Verifica se os eventos foram gerados corretamente
    expect(events).toEqual([
      "2023-12-25", // 2023
      // 2024 foi pulado (exceção)
      "2025-12-25", // 2025
    ]);
  });
});
