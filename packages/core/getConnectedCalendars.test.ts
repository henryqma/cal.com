import { describe, it, expect, vi } from "vitest";

import { getConnectedCalendars } from "./CalendarManager";

vi.mock("./utils", () => ({
  safeStringify: vi.fn((input: any) => JSON.stringify(input)),
}));

describe("Testando getConnectedCalendars", () => {
  it("CT1: Credenciais Vazias", async () => {
    const result = await getConnectedCalendars([], []);
    expect(result.connectedCalendars).toEqual([]);
    expect(result.destinationCalendar).toBeUndefined();
  });

  it("CT2: Credencial sem calendário", async () => {
    const calendarCredentials = [{ credential: { id: "cred1" }, calendar: null }];

    const result = await getConnectedCalendars(calendarCredentials, []);
    expect(result.connectedCalendars).toEqual([{ integration: undefined, credentialId: "cred1" }]);
    expect(result.destinationCalendar).toBeUndefined();
  });

  it("CT3: Calendário identificado", async () => {
    const calendarCredentials = [
      {
        credential: { id: "cred1" },
        calendar: { listCalendars: vi.fn().mockResolvedValue([{ externalId: "abc", primary: false }]) },
        integration: {},
      },
    ];

    const selectedCalendars = [{ externalId: "abc" }];
    const destinationCalendarExternalId = "abc";

    const result = await getConnectedCalendars(
      calendarCredentials,
      selectedCalendars,
      destinationCalendarExternalId
    );

    expect(result.connectedCalendars).toHaveLength(1);
    expect(result.destinationCalendar?.externalId).toBe("abc");
  });

  it("CT4: Sem calendário principal", async () => {
    const calendarCredentials = [
      {
        credential: { id: "cred1" },
        calendar: { listCalendars: vi.fn().mockResolvedValue([]) },
        integration: {},
      },
    ];

    const result = await getConnectedCalendars(calendarCredentials, []);

    expect(result.connectedCalendars).toEqual([
      expect.objectContaining({
        error: { message: "No primary calendar found" },
        integration: {},
      }),
    ]);
    expect(result.destinationCalendar).toBeUndefined();
  });

  it("CT5: Calendário principal válido", async () => {
    const calendarCredentials = [
      {
        credential: { id: "cred1" },
        calendar: {
          listCalendars: vi.fn().mockResolvedValue([
            {
              primary: true,
              externalId: "primary-id",
              credentialId: "cred1",
              isSelected: false,
              readOnly: false,
            },
          ]),
        },
        integration: {},
      },
    ];

    const result = await getConnectedCalendars(calendarCredentials, []);

    expect(result.connectedCalendars[0]).toEqual({
      credentialId: "cred1",
      primary: {
        credentialId: "cred1",
        externalId: "primary-id",
        isSelected: false,
        primary: true,
        readOnly: false,
      },
      calendars: [
        {
          credentialId: "cred1",
          externalId: "primary-id",
          isSelected: false,
          primary: true,
          readOnly: false,
        },
      ],
      integration: {},
    });

    expect(result.destinationCalendar).toBeUndefined();
  });

  it("CT6: Destination congelado", async () => {
    const frozenCalendar = Object.freeze({ externalId: "abc", primary: false });
    const calendarCredentials = [
      {
        credential: { id: "cred1" },
        calendar: { listCalendars: vi.fn().mockResolvedValue([frozenCalendar]) },
        integration: {},
      },
    ];

    const result = await getConnectedCalendars(calendarCredentials, []);
    expect(Object.isFrozen(result.destinationCalendar)).toBe(true);
  });

  it("CT7: Destination modificado e congelado", async () => {
    const calendarCredentials = [
      {
        credential: { id: "cred1" },
        calendar: { listCalendars: vi.fn().mockResolvedValue([{ primary: true, externalId: "primary-id" }]) },
        integration: { credentials: { id: "cred1" } },
      },
    ];

    const selectedCalendars = [{ externalId: "primary-id" }];
    const destinationCalendarExternalId = "primary-id";

    const result = await getConnectedCalendars(
      calendarCredentials,
      selectedCalendars,
      destinationCalendarExternalId
    );

    expect(result.connectedCalendars).toHaveLength(1);
    expect(result.destinationCalendar?.externalId).toBe(destinationCalendarExternalId);
  });

  it('CT8: Erro "invalid_grant"', async () => {
    const calendarCredentials = [
      {
        credential: { id: "cred1" },
        calendar: {
          listCalendars: vi.fn().mockRejectedValue(new Error("invalid_grant")),
        },
        integration: {
          credentials: { id: "cred1" },
        },
      },
    ];

    try {
      const result = await getConnectedCalendars(calendarCredentials, []);

      expect(result.connectedCalendars[0].error.message).toBe("invalid_grant");
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it("CT9: Outro erro", async () => {
    const calendarCredentials = [
      {
        credential: { id: "cred1" },
        calendar: {
          listCalendars: vi.fn().mockRejectedValue(new Error("Outro erro")),
        },
        integration: {
          credentials: { id: "cred1" },
          credentialId: "cred1",
        },
      },
    ];

    try {
      const result = await getConnectedCalendars(calendarCredentials, []);

      expect(result.connectedCalendars[0].error.message).toBe("Outro erro");
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
