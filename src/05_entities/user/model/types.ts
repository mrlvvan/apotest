export type DrawerMode =
  | "view"
  | "create"
  | "confirmPhone"
  | "schedule"
  | "loading"
  | "pending";

export type PositionCode =
  | "manager"
  | "specialist"
  | "intern"
  | "contractor"
  | "director";

export type Schedule = {
  weekdaysStart: number;
  weekdaysEnd: number;
  allowOffdayCallsWeekdays: boolean;
  lunchStart?: number;
  lunchEnd?: number;
  allowLunchCalls?: boolean;
};

export type DashboardUser = {
  id: string;
  surname: string;
  name: string;
  middlename: string;
  position: string;
  phone: string;
  phoneVerified: boolean;
  schedule?: Schedule;
};

export type ApiUser = Omit<DashboardUser, "position" | "phone">;

export type ApiUserProfile = DashboardUser & {
  position: PositionCode;
  schedule: Schedule;
};

export type UserForm = {
  surname: string;
  name: string;
  position: string;
  phone: string;
};
