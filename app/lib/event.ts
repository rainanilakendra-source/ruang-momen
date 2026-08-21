import { EventType } from "../generated/prisma/enums";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  WEDDING: "Pernikahan",
  BIRTHDAY: "Ulang Tahun",
  GATHERING: "Gathering",
  GRADUATION: "Wisuda",
  REUNION: "Reuni",
  CORPORATE: "Acara Kantor",
  OTHER: "Lainnya",
};

export const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS) as EventType[];

export function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}
