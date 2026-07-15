import type { Schedule, UserForm } from "./types";

export const emptyForm: UserForm = {
  surname: "",
  name: "",
  position: "",
  phone: "",
};

export const defaultSchedule: Schedule = {
  weekdaysStart: 28800,
  weekdaysEnd: 61200,
  allowOffdayCallsWeekdays: false,
  lunchStart: 43200,
  lunchEnd: 46800,
  allowLunchCalls: false,
};
