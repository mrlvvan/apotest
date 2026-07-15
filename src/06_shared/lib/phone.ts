export function onlyPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** +7 (999)123 45 67 */
export function formatPhone(value: string): string {
  let digits = onlyPhoneDigits(value);

  if (!digits) {
    return "+7 ";
  }

  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }

  if (!digits.startsWith("7")) {
    digits = `7${digits}`;
  }

  digits = digits.slice(0, 11);
  const rest = digits.slice(1);

  if (!rest.length) {
    return "+7 ";
  }

  let result = `+7 (${rest.slice(0, 3)}`;
  if (rest.length <= 3) {
    return result;
  }

  result += `)${rest.slice(3, 6)}`;
  if (rest.length <= 6) {
    return result;
  }

  result += ` ${rest.slice(6, 8)}`;
  if (rest.length <= 8) {
    return result;
  }

  return `${result} ${rest.slice(8, 10)}`;
}

export function normalizePhoneInput(value: string): string {
  return formatPhone(value);
}

export function phoneToApi(value: string): string {
  const digits = onlyPhoneDigits(value).slice(0, 11);
  return digits ? `+${digits}` : "";
}

export function isPhoneComplete(value: string): boolean {
  return onlyPhoneDigits(value).length === 11;
}
