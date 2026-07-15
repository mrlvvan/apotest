import type { ApiUser, ApiUserProfile, PositionCode, Schedule } from "../model/types";

const API_HEADERS = {
  "Content-Type": "application/json",
  "x-token": "1234567890",
};

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      ...API_HEADERS,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function listUsers() {
  return apiRequest<ApiUser[]>("/users");
}

export function getUser(id: string) {
  return apiRequest<ApiUserProfile>(`/users/${id}`);
}

export function createUser(body: {
  name: string;
  surname: string;
  middlename: string;
  position: PositionCode;
  phone: string;
  schedule: Schedule;
}) {
  return apiRequest<ApiUserProfile>("/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateUser(
  id: string,
  body: {
    surname: string;
    name: string;
    position: PositionCode;
    schedule: Schedule;
  },
) {
  return apiRequest<ApiUserProfile>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function sendCode(userId: string, phone: string) {
  return apiRequest<{ ok: true }>("/users/send-code", {
    method: "POST",
    body: JSON.stringify({ userId, phone }),
  });
}

export function confirmCode(userId: string, phone: string, code: string) {
  return apiRequest<ApiUserProfile>("/users/confirm-code", {
    method: "POST",
    body: JSON.stringify({ userId, phone, code }),
  });
}
