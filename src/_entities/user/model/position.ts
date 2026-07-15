import type { PositionCode } from "./types";

export const positionLabels: Record<PositionCode, string> = {
  manager: "Главный бухгалтер",
  specialist: "Менеджер",
  intern: "Специалист",
  contractor: "Руководитель отдела",
  director: "Администратор",
};

export const positionOptions = Object.entries(positionLabels).map(([value, label]) => ({
  value: value as PositionCode,
  label,
}));
