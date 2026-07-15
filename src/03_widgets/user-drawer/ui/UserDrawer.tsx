"use client";

import type { DashboardUser, PositionCode, Schedule, UserForm } from "@entities/user";
import { PhonePreview, SchedulePreview, positionLabels, positionOptions } from "@entities/user";
import { isPhoneComplete, normalizePhoneInput } from "@shared/lib/phone";
import Button from "@shared/ui/Button";
import DrawerHeader from "@shared/ui/DrawerHeader";
import DrawerInput from "@shared/ui/DrawerInput";
import DrawerSelect from "@shared/ui/DrawerSelect";

type UserDrawerMode = "view" | "create";

interface UserDrawerProps {
  mode: UserDrawerMode;
  form: UserForm;
  schedule: Schedule;
  scheduleSet: boolean;
  selectedUser: DashboardUser | null;
  showValidation: boolean;
  onClose: () => void;
  onOpenSchedule: () => void;
  onOpenPhoneChange: () => void;
  onFieldChange: (field: keyof UserForm, value: string) => void;
  onSubmitCreate: () => void;
  onSave: () => void;
}

export default function UserDrawer({
  mode,
  form,
  schedule,
  scheduleSet,
  selectedUser,
  showValidation,
  onClose,
  onOpenSchedule,
  onOpenPhoneChange,
  onFieldChange,
  onSubmitCreate,
  onSave,
}: UserDrawerProps) {
  const isCreate = mode === "create";

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
            value={
              positionLabels[(form.position || selectedUser?.position) as PositionCode] || ""
            }
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
                placeholder="+7 (000)000 00 00"
                inputMode="numeric"
                maxLength={17}
                normalizeValue={normalizePhoneInput}
                error={showValidation && !isPhoneComplete(form.phone) ? "Обязательное поле" : undefined}
                onChange={(value) => onFieldChange("phone", value)}
              />
              <p className="text-s text-symb-secondary">
                Вышлем SMS-код. Без подтверждения пользователь не будет добавлен
              </p>
            </div>
          ) : (
            <PhonePreview
              phone={selectedUser?.phone || ""}
              verified={selectedUser?.phoneVerified ?? true}
              onClick={onOpenPhoneChange}
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
