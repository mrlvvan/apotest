"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Button from "@shared/ui/Button";
import Icon from "@shared/ui/Icon";
import { cn } from "@shared/lib/utils/css";
import UserListItem from "./UserListItem";
import { fa } from "zod/locales";

type DrawerMode = "view" | "create" | "confirmPhone" | "schedule" | "loading";
type PositionCode = "manager" | "specialist" | "intern" | "contractor" | "director";

type Schedule = {
  weekdaysStart: number;
  weekdaysEnd: number;
  allowOffdayCallsWeekdays: boolean;
  lunchStart?: number;
  lunchEnd?: number;
  allowLunchCalls?: boolean;
};

type DashboardUser = {
  id: string;
  surname: string;
  name: string;
  middlename: string;
  position: string;
  phone: string;
  phoneVerified: boolean;
  schedule?: Schedule;
};

type ApiUser = Omit<DashboardUser, "position" | "phone">;
type ApiUserProfile = DashboardUser & {
  position: PositionCode;
  schedule: Schedule;
};

type UserForm = {
  surname: string;
  name: string;
  position: string;
  phone: string;
};

const emptyForm: UserForm = {
  surname: "",
  name: "",
  position: "",
  phone: "",
};

const API_HEADERS = {
  "Content-Type": "application/json",
  "x-token": "1234567890",
};

const defaultSchedule: Schedule = {
  weekdaysStart: 28800,
  weekdaysEnd: 61200,
  allowOffdayCallsWeekdays: false,
  lunchStart: 43200,
  lunchEnd: 46800,
  allowLunchCalls: false,
};

const positionLabels: Record<PositionCode, string> = {
  manager: "Главный бухгалтер",
  specialist: "Менеджер",
  intern: "Специалист",
  contractor: "Руководитель отдела",
  director: "Администратор",
};

const positionOptions = Object.entries(positionLabels).map(([value, label]) => ({
  value: value as PositionCode,
  label,
}));

function secondsToTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function timeToSeconds(value: string): number {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 3600 + Number(minutes) * 60;
}

function policyToLabel(allowed: boolean): string {
  return allowed ? "Можно звонить" : "Не беспокоить";
}

function labelToPolicy(label: string): boolean {
  return label === "Можно звонить";
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizePhoneInput (value: string): string {
  const digits = value.replace(/\D/g, "").slice(0,11);
  return digits ? `+${digits}`: "+";
}

function normalizeTimeInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
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

function listUserToDashboardUser(user: ApiUser): DashboardUser {
  return {
    ...user,
    position: "",
    phone: "",
  };
}

export default function DashboardClient() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [scheduleReturnMode, setScheduleReturnMode] = useState<"view" | "create">("view");
  const [scheduleSet, setScheduleSet] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [pendingConfirmationUser, setPendingConfirmationUser] = useState<DashboardUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule);
  const [isModified, setIsModified] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  useEffect(() => {
    apiRequest<ApiUser[]>("/users")
      .then((items) => setUsers(items.map(listUserToDashboardUser)))
      .catch(() => setUsers([]));
  }, []);

  async function openUser(user: DashboardUser) {
    setDrawerMode("loading");
    setShowValidation(false);
    setIsModified(false);

    try {
      const profile = await apiRequest<ApiUserProfile>(`/users/${user.id}`);
      setSelectedUser(profile);
      setForm({
        surname: profile.surname,
        name: profile.name,
        position: profile.position,
        phone: profile.phone,
      });
      setSchedule(profile.schedule);
      setDrawerMode("view");
    } catch {
      closeDrawer();
    }
  }

  function openConfirmedUser(user: DashboardUser) {
    setSelectedUser(user);
    setForm({
      surname: user.surname,
      name: user.name,
      position: user.position,
      phone: user.phone,
    });
    setSchedule(user.schedule ?? defaultSchedule);
    setDrawerMode("view");
    setIsModified(false);
    setShowValidation(false);
    setScheduleSet(false);
    }

  function openCreate() {
    setSelectedUser(null);
    setPendingConfirmationUser(null);
    setForm(emptyForm);
    setSchedule(defaultSchedule);
    setDrawerMode("create");
    setIsModified(false);
    setShowValidation(false);
  }

  function closeDrawer() {
    setDrawerMode(null);
    setSelectedUser(null);
    setPendingConfirmationUser(null);
    setSchedule(defaultSchedule);
    setIsModified(false);
    setShowValidation(false);
    setShowUnsavedModal(false);
  }

  function requestCloseDrawer() {
    if (isModified && drawerMode !== "loading") {
      setShowUnsavedModal(true);
      return;
    }

    closeDrawer();
  }

  function updateField(field: keyof UserForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setIsModified(true);
  }

  async function handleCreateSubmit() {
    if (!form.surname || !form.name || !form.position || !form.phone) {
      setShowValidation(true);
      return;
    }

    setDrawerMode("loading");

    try {
      const createdUser = await apiRequest<ApiUserProfile>("/users", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          surname: form.surname,
          middlename: " ",
          position: form.position as PositionCode,
          phone: form.phone,
          schedule,
        }),
      });

      await apiRequest<{ ok: true }>("/users/send-code", {
        method: "POST",
        body: JSON.stringify({
          userId: createdUser.id,
          phone: form.phone,
        }),
      });

      setPendingConfirmationUser(createdUser);
      setDrawerMode("confirmPhone");
    } catch {
      setDrawerMode("create");
      setShowValidation(true);
    }
  }

  async function handleSaveExisting() {
    if (!selectedUser) {
      return;
    }

    setDrawerMode("loading");

    try {
      const updatedUser = await apiRequest<ApiUserProfile>(`/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          surname: form.surname,
          name: form.name,
          position: form.position as PositionCode,
          schedule,
        }),
      });

      setUsers((current) =>
        current.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
        ),
      );
      openConfirmedUser(updatedUser);
    } catch {
      setDrawerMode("view");
    }
  }

  async function handleSaveSchedule(nextSchedule: Schedule) {
    setSchedule(nextSchedule);

    if (scheduleReturnMode === "create" || !selectedUser) {
      setSchedule(nextSchedule);
      setScheduleSet(true);
      setIsModified(true);
      setDrawerMode(scheduleReturnMode);
      return;
    }

    setDrawerMode("loading");

    try {
      const updatedUser = await apiRequest<ApiUserProfile>(`/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify({
          surname: form.surname,
          name: form.name,
          position: form.position as PositionCode,
          schedule: nextSchedule,
        }),
      });

      setUsers((current) =>
        current.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
        ),
      );
      openConfirmedUser(updatedUser);
    } catch {
      setDrawerMode(scheduleReturnMode);
    }
  }

  async function handleConfirmPhone() {
    if (!pendingConfirmationUser) {
      return;
    }

    setDrawerMode("loading");

    try {
      const confirmedUser = await apiRequest<ApiUserProfile>("/users/confirm-code", {
        method: "POST",
        body: JSON.stringify({
          userId: pendingConfirmationUser.id,
          phone: pendingConfirmationUser.phone,
          code: "1111",
        }),
      });

      setUsers((current) => [confirmedUser, ...current]);
      setPendingConfirmationUser(null);
      window.setTimeout(() => {
        openConfirmedUser(confirmedUser);
      }, 700);
    } catch {
      setDrawerMode("confirmPhone");
    }
  }

  return (
    <div className="min-h-dvh min-w-[640px] overflow-x-hidden bg-background-none text-symb-primary">
      <aside className="fixed inset-y-0 left-0 z-10 w-[76px] border-r border-stroke-med bg-background-none">
        <div className="flex justify-center pt-11">
          <Image src="/LogoIcon.svg" alt="Логотип" width={44} height={36} priority />
        </div>
      </aside>

      <main className="ml-[76px] min-h-dvh">
        <section className="mx-0 w-full px-10 pb-10 pt-12">
          <h1 className="text-center text-l font-normal">Пользователи</h1>

          <div className="mt-14 grid gap-3">
            {users.map((user) => (
              <UserListItem
                key={user.id}
                fullName={`${user.surname} ${user.name} ${user.middlename}`}
                phoneVerified={user.phoneVerified}
                onClick={() => openUser(user)}
              />
            ))}
          </div>

          <Button
            aria-label="Создать пользователя"
            className="mt-3 h-10 w-[52px] rounded-m border border-stroke-med bg-background-none p-0 text-l text-symb-primary hover:border-stroke-max"
            variant="tertiary"
            onClick={openCreate}
          >
            +
          </Button>
        </section>
      </main>

      {drawerMode && (
        <DrawerShell>
          {drawerMode === "loading" ? (
            <DrawerLoading />
          ) : drawerMode === "schedule" ? (
            <ScheduleDrawer
              schedule={schedule}
              onBack={() => setDrawerMode(scheduleReturnMode)}
              onSave={handleSaveSchedule}
            />
          ) : (
            <UserDrawer
              mode={drawerMode}
              form={form}
              schedule={schedule}
              scheduleSet={scheduleSet}
              isModified={isModified}
              selectedUser={selectedUser}
              showValidation={showValidation}
              onClose={requestCloseDrawer}
              onFieldChange={updateField}
              onOpenSchedule={() => {
                setScheduleReturnMode(drawerMode === "create" ? "create" : "view");
                setDrawerMode("schedule");
              }}
              onBackFromConfirm={() => setDrawerMode("create")}
              onSubmitCreate={handleCreateSubmit}
              onSave={handleSaveExisting}
              onConfirmPhone={handleConfirmPhone}
            />
          )}
        </DrawerShell>
      )}

      {showUnsavedModal ? (
        <UnsavedChangesModal
          onBack={() => setShowUnsavedModal(false)}
          onDiscard={closeDrawer}
        />
      ) : null}
    </div>
  );
}

function DrawerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 bg-[#c9ccd3]/85">
      <aside className="relative min-h-dvh w-[clamp(390px,33vw,475px)] overflow-y-auto rounded-r-xl bg-background-none shadow-[18px_0_40px_rgba(8,20,35,0.08)]">
        <div className="absolute left-4 top-11">
          <Image src="/LogoIcon.svg" alt="Логотип" width={44} height={36} priority />
        </div>
        <div className="min-h-dvh pl-[clamp(72px,7vw,110px)] pr-[clamp(16px,2.2vw,31px)]">
          {children}
        </div>
      </aside>
    </div>
  );
}

interface UserDrawerProps {
  mode: Exclude<DrawerMode, "schedule" | "loading">;
  form: UserForm;
  schedule: Schedule;
  scheduleSet:boolean
  selectedUser: DashboardUser | null;
  isModified: boolean;
  showValidation: boolean;
  onClose: () => void;
  onOpenSchedule: () => void;
  onFieldChange: (field: keyof UserForm, value: string) => void;
  onBackFromConfirm: () => void;
  onSubmitCreate: () => void;
  onSave: () => void;
  onConfirmPhone: () => void;
}

function UserDrawer({
  mode,
  form,
  schedule,
  scheduleSet,  
  selectedUser,
  isModified,
  showValidation,
  onClose,
  onOpenSchedule,
  onFieldChange,
  onBackFromConfirm,
  onSubmitCreate,
  onSave,
  onConfirmPhone,
}: UserDrawerProps) {
  const isCreate = mode === "create" || mode === "confirmPhone";
  const isConfirmPhone = mode === "confirmPhone";

  if (isConfirmPhone) {
    return (
      <ConfirmPhoneDrawer
        phone={form.phone}
        onBack={onBackFromConfirm}
        onConfirm={onConfirmPhone}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-8 pt-12">
      <DrawerHeader
        title={isCreate ? "Новый пользователь" : "Пользователь"}
        onClose={onClose}
      />

      <form className="flex flex-1 flex-col" action="">
        <div className="grid gap-4">
          <DrawerInput
            value={form.surname}
            placeholder="Фамилия*"
            error={showValidation && !form.surname ? "Обязательное поле" : undefined}
            onChange={(value) => onFieldChange("surname", value)}
          />
          <DrawerInput
            value={form.name}
            placeholder="Имя*"
            error={showValidation && !form.name ? "Обязательное поле" : undefined}
            onChange={(value) => onFieldChange("name", value)}
          />

          <DrawerSelect
            value={positionLabels[(form.position || selectedUser?.position) as PositionCode] || ""}
            placeholder="Должность"
            invalid={showValidation && !form.position}
            options={positionOptions}
            onSelect={(value) => onFieldChange("position", value)}
          />

          <SchedulePreview
            empty={isCreate && !scheduleSet}
            schedule={schedule}
            onClick={onOpenSchedule}
          />

          {isCreate ? (
            <div className="mt-3 grid gap-2">
              <label className="text-s text-symb-primary">Номер телефона*</label>
              <DrawerInput
                value={form.phone}
                placeholder="+ 7 (000) 000–00–00"
                inputMode="numeric"
                maxLength={12}
                pattern="[0-9]*"
                normalizeValue={normalizePhoneInput}
                error={showValidation && !form.phone ? "Обязательное поле" : undefined}
                onChange={(value) => onFieldChange("phone", value)}
              />
              <p className="text-xs text-symb-secondary">
                Вышлем SMS-код. Без подтверждения пользователь не будет добавлен
              </p>
            </div>
          ) : (
            <PhonePreview
              phone={selectedUser?.phone || ""}
              verified={selectedUser?.phoneVerified ?? true}
            />
          )}
        </div>

        <Button
          className="mt-auto self-end"
          size="M"
          variant="primary"
          onClick={isCreate ? onSubmitCreate : onSave}
        >
          {isCreate ? "Подтвердить" : "Сохранить"}
        </Button>
      </form>
    </div>
  );
}

interface DrawerHeaderProps {
  title: string;
  back?: boolean;
  onBack?: () => void;
  onClose: () => void;
}

function DrawerHeader({ title, back = false, onBack, onClose }: DrawerHeaderProps) {
  return (
    <header className="relative mb-10 flex h-10 items-center justify-center">
      {back ? (
        <button
          type="button"
          aria-label="Назад"
          onClick={onBack}
          className="absolute left-0 flex size-10 items-center justify-center rounded-m bg-background-min text-symb-secondary hover:bg-background-med"
        >
          <Icon name="arrow_back" />
        </button>
      ) : null}
      <h2 className="text-l font-normal">{title}</h2>
      {!back ? (
        <button
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
          className="absolute right-0 flex size-10 items-center justify-center rounded-m bg-background-min text-symb-secondary hover:bg-background-med"
        >
          <Icon name="close" />
        </button>
      ) : null}
    </header>
  );
}

interface DrawerInputProps {
  value: string;
  placeholder?: string;
  error?: string;
  inputMode?: "text" | "numeric";
  maxLength?: number;
  pattern?: string;
  normalizeValue?: (value: string) => string;
  onChange: (value: string) => void;
}

function DrawerInput({
  value,
  placeholder,
  error,
  inputMode = "text",
  maxLength,
  pattern,
  normalizeValue,
  onChange,
}: DrawerInputProps) {
  return (
    <label className="grid gap-1">
      <input
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        pattern={pattern}
        onChange={(event) => onChange(normalizeValue?.(event.target.value) ?? event.target.value)}
        className={cn(
          "h-12 rounded-m border bg-background-none px-4 text-l text-symb-primary outline-none transition-colors placeholder:text-symb-secondary",
          error ? "border-stroke-error" : "border-stroke-med focus:border-stroke-active",
        )}
      />
      {error ? <span className="text-xs text-symb-error">{error}</span> : null}
    </label>
  );
}

interface DrawerSelectProps {
  value: string;
  placeholder: string;
  invalid?: boolean;
  options: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
}

function DrawerSelect({
  value,
  placeholder,
  invalid = false,
  options,
  onSelect,
}: DrawerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-m border bg-background-none px-4 text-left text-l",
          "transition-colors duration-300 ease-in-out",
          invalid
            ? "border-stroke-error text-symb-secondary"
            : "border-stroke-med text-symb-primary hover:border-stroke-max",
          isOpen && "border-stroke-active",
        )}
      >
        <span>{value || placeholder}</span>
        <Icon
          name={isOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          className="text-symb-secondary"
        />
      </button>

      {invalid ? (
        <span className="text-xs text-symb-error">Обязательное поле</span>
      ): null}

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-44 overflow-y-auto rounded-m bg-background-none py-2 text-s text-symb-primary shadow-[0_10px_28px_rgba(8,20,35,0.08)]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex h-10 w-full items-center px-4 text-left transition-colors hover:bg-background-med",
                option.label === value && "bg-background-med",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface SchedulePreviewProps {
  empty?: boolean;
  schedule: Schedule;
  onClick?: () => void;
}

function SchedulePreview({ empty = false, schedule, onClick }: SchedulePreviewProps) {
  const workTime = `${secondsToTime(schedule.weekdaysStart)} до ${secondsToTime(schedule.weekdaysEnd)}`;
  const hasLunch = schedule.lunchStart !== undefined && schedule.lunchEnd !== undefined;

  if (empty) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex h-12 items-center justify-between rounded-m bg-background-med px-4 text-left text-s text-symb-primary transition-colors hover:bg-neutral-min"
      >
        <span>Укажите график работы</span>
        <span className="flex size-8 items-center justify-center rounded-s bg-background-none">
          <Icon name="chevron_right" className="text-symb-primary" />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group grid rounded-m bg-background-med px-4 py-3 text-left text-s text-symb-primary transition-colors hover:bg-neutral-min"
    >
      <span className="grid grid-cols-[76px_minmax(132px,1fr)_32px] items-start gap-y-2">
        <span className="text-symb-secondary">Пн–Чт</span>
        <span className="whitespace-nowrap font-medium">{workTime}</span>
        <span
          className={cn(
            "flex size-8 items-center justify-center justify-self-end rounded-s bg-background-none opacity-0 transition-opacity group-hover:opacity-100",
            hasLunch ? "row-span-3" : "row-span-2",
          )}
        >
          <Icon name="chevron_right" className="text-symb-primary" />
        </span>
        <span className="text-symb-secondary">Пт</span>
        <span className="whitespace-nowrap font-medium">{workTime}</span>
        {hasLunch ? (
          <>
            <span className="text-symb-secondary">Обед</span>
            <span className="whitespace-nowrap font-medium">
              {secondsToTime(schedule.lunchStart!)} до {secondsToTime(schedule.lunchEnd!)}
            </span>
          </>
        ) : null}
      </span>
    </button>
  );
}

function PhonePreview({ phone, verified }: { phone: string; verified: boolean }) {
  if (verified) {
    return (
      <button
        type="button"
        className="h-12 rounded-m bg-background-med px-4 text-left text-s text-symb-secondary"
      >
        {phone}
      </button>
    );
  }

  return (
    <button type="button" className="grid overflow-hidden rounded-m text-left text-s">
      <span className="flex h-12 items-center justify-between bg-background-error px-4 text-symb-primary">
        <span>{phone}</span>
        <Icon name="info" className="text-[18px] text-symb-primary" />
      </span>
      <span className="bg-background-med px-4 py-2 text-s text-symb-primary">
        Требуется подтверждение
      </span>
    </button>
  );
}

function ConfirmPhoneDrawer({
  phone,
  onBack,
  onConfirm,
}: {
  phone: string;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [hasError, setHasError] = useState(false);
  const joinedCode = code.join("");
  const canSubmit = joinedCode.length === 4 && !hasError;
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  function updateCode(index: number, value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    setCode((current) => current.map((item, i) => (i === index ? "" : item)));
    return;
  }

  setCode((current) => {
    const next = [...current];
    const chars = digits.slice(0, 4 - index).split("");
    chars.forEach((char, offset) => {
      next[index + offset] = char;
    });
    return next;
  });
  setHasError(false);

  const nextIndex = Math.min(index + digits.length, 3);
  inputsRef.current[nextIndex]?.focus();
}

  function submitCode() {
    if (joinedCode === "1111") {
      onConfirm();
      return;
    }

    setHasError(true);
  }

  return (
    <div className="flex min-h-dvh flex-col pb-8 pt-12">
      <DrawerHeader title="Подтвердить номер" back onBack={onBack} onClose={onBack} />

      <div className="mx-auto mt-8 grid w-[220px] justify-items-center gap-8 text-center">
        <p className="text-l leading-[1.35] text-symb-primary">
          Отправили код подтверждения на номер {phone || "+ 7 (998) 673–21–34"}
        </p>

        <div className="flex gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
              inputsRef.current[index] = el;
              }}
              value={digit}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              onChange={(event) => updateCode(index, event.target.value)}
              onKeyDown={(event) => {
              if (event.key === "Backspace" && !code[index] && index > 0) {
              inputsRef.current[index - 1]?.focus();
              }
}}
              className={cn(
                "size-14 rounded-m border bg-background-none text-center text-h1 outline-none transition-colors",
                hasError
                  ? "border-stroke-error text-symb-error"
                  : "border-stroke-med text-symb-primary focus:border-stroke-active",
              )}
            />
          ))}
        </div>

        <Button
          className="w-full"
          disabled={!canSubmit}
          size="M"
          variant="primary"
          onClick={submitCode}
        >
          Подтвердить
        </Button>

        {hasError ? (
          <Button className="w-full" disabled size="M" variant="tertiary">
            Отправить код снова&nbsp; 02:56
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function DrawerLoading() {
  return (
    <div className="relative h-full">
      <div className="absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-stroke-med border-t-basic-max" />
    </div>
  );
}

function UnsavedChangesModal({
  onBack,
  onDiscard,
}: {
  onBack: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#c9ccd3]/55 p-6">
      <section className="w-[408px] max-w-[calc(100vw-48px)] rounded-l bg-background-none p-8 shadow-[0_16px_48px_rgba(8,20,35,0.14)]">
        <div className="mb-5 flex items-start justify-between gap-6">
          <h2 className="text-h2">Изменения не будут сохранены</h2>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-s text-symb-secondary hover:bg-background-med"
          >
            <Icon name="close" />
          </button>
        </div>
        <p className="mb-8 max-w-[270px] text-s text-symb-primary">
          Если вы покинете эту страницу, ваши данные будут утеряны
        </p>
        <div className="flex justify-end gap-4">
          <Button size="M" variant="tertiary" onClick={onBack}>
            Назад
          </Button>
          <Button size="M" variant="primary" onClick={onDiscard}>
            Не сохранять
          </Button>
        </div>
      </section>
    </div>
  );
}

function ScheduleDrawer({
  schedule,
  onBack,
  onSave,
}: {
  schedule: Schedule;
  onBack: () => void;
  onSave: (schedule: Schedule) => void;
}) {
  const [hasLunch, setHasLunch] = useState(
    schedule.lunchStart !== undefined && schedule.lunchEnd !== undefined,
  );
  const [workStart, setWorkStart] = useState(secondsToTime(schedule.weekdaysStart));
  const [workEnd, setWorkEnd] = useState(secondsToTime(schedule.weekdaysEnd));
  const [lunchStart, setLunchStart] = useState(
    secondsToTime(schedule.lunchStart ?? defaultSchedule.lunchStart!),
  );
  const [lunchEnd, setLunchEnd] = useState(
    secondsToTime(schedule.lunchEnd ?? defaultSchedule.lunchEnd!),
  );
  const [offHoursPolicy, setOffHoursPolicy] = useState(
    policyToLabel(schedule.allowOffdayCallsWeekdays),
  );
  const [lunchPolicy, setLunchPolicy] = useState(
    policyToLabel(schedule.allowLunchCalls ?? false),
  );

  function saveSchedule() {
    const nextSchedule: Schedule = {
      weekdaysStart: timeToSeconds(workStart),
      weekdaysEnd: timeToSeconds(workEnd),
      allowOffdayCallsWeekdays: labelToPolicy(offHoursPolicy),
    };

    if (hasLunch) {
      nextSchedule.lunchStart = timeToSeconds(lunchStart);
      nextSchedule.lunchEnd = timeToSeconds(lunchEnd);
      nextSchedule.allowLunchCalls = labelToPolicy(lunchPolicy);
    }

    onSave(nextSchedule);
  }

  return (
    <div className="flex min-h-dvh flex-col pb-8 pt-12">
      <DrawerHeader title="График работы" back onBack={onBack} onClose={onBack} />

      <div className="grid gap-8">
        <p className="text-l leading-[1.35] text-symb-primary">
          Укажите время, в которое специалист застанет вас на работе (по вашему местному времени)
        </p>

        <div className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-x-3 gap-y-3">
          <span className="text-l">Пн–Пт</span>
          <div className="flex min-w-0 items-center gap-2">
            <TimeInput value={workStart} onChange={setWorkStart} />
            <span className="text-symb-secondary">–</span>
            <TimeInput value={workEnd} onChange={setWorkEnd} />
          </div>
          <span className="text-l text-symb-secondary">В нерабочее время</span>
          <CallPolicySelect value={offHoursPolicy} onChange={setOffHoursPolicy} />
        </div>

        <div className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-x-3 gap-y-3">
          <span className="text-l">Обед</span>
          {hasLunch ? (
            <div className="flex min-w-0 items-center gap-2">
              <TimeInput value={lunchStart} onChange={setLunchStart} />
              <span className="text-symb-secondary">–</span>
              <TimeInput value={lunchEnd} onChange={setLunchEnd} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHasLunch(true)}
              className="flex size-10 items-center justify-center rounded-m border border-stroke-med bg-background-none text-l"
            >
              +
            </button>
          )}
          {hasLunch ? (
            <>
              <span className="text-l text-symb-secondary">В обеденное время</span>
              <CallPolicySelect value={lunchPolicy} onChange={setLunchPolicy} />
              <span />
              <button
                type="button"
                onClick={() => setHasLunch(false)}
                className="flex size-10 items-center justify-center rounded-m border border-stroke-med bg-background-none text-l"
              >
                <Icon name="delete" className="text-[18px]" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      <Button className="mt-auto self-end" size="M" variant="primary" onClick={saveSchedule}>
        Сохранить
      </Button>
    </div>
  );
}

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      value={value}
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={5}
      onChange={(event) => onChange(normalizeTimeInput(event.target.value))}
      className="h-10 w-16 rounded-m border border-stroke-med bg-background-none px-2 text-center text-l text-symb-primary outline-none transition-colors focus:border-stroke-active"
    />
  );
}

function CallPolicySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const options = ["Не беспокоить", "Можно звонить"];

  return (
    <div className="relative w-full min-w-0 max-w-48">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-m bg-background-med px-3 text-left text-s text-symb-primary",
          "transition-colors duration-300 ease-in-out hover:bg-neutral-min",
          isOpen && "bg-background-med",
        )}
      >
        <span className="min-w-0 truncate">{value}</span>
        <Icon
          name={isOpen ? "unfold_less" : "unfold_more"}
          className="text-symb-secondary"
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-m bg-background-none py-1 shadow-[0_10px_28px_rgba(8,20,35,0.08)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={cn(
                "flex h-9 w-full items-center px-4 text-left text-s text-symb-primary hover:bg-background-med",
                option === value && "bg-background-med",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
