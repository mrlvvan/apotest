export function secondsToTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function timeToSeconds(value: string): number {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 3600 + Number(minutes) * 60;
}

export function policyToLabel(allowed: boolean): string {
  return allowed ? "Можно звонить" : "Не беспокоить";
}

export function labelToPolicy(label: string): boolean {
  return label === "Можно звонить";
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizePhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits ? `+${digits}` : "+";
}

export function normalizeTimeInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}
