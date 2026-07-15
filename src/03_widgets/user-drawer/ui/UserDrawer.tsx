"use client";

import type { DashboardUser, PositionCode, Schedule, UserForm } from "@entities/user";
import { PhonePreview, SchedulePreview, positionLabels, positionOptions } from "@entities/user";
import { normalizePhoneInput } from "@shared/lib/schedule";
import Button from "@shared/ui/Button";
import DrawerHeader from "@shared/ui/DrawerHeader";
import DrawerInput from "@shared/ui/DrawerInput";
import DrawerSelect from "@shared/ui/DrawerSelect";
import { ConfirmPhoneDrawer } from "@widgets/confirm-phone";

type UserDrawerMode = "view" | "create" | "confirmPhone";

interface UserDrawerProps {
  mode: UserDrawerMode;
  form: UserForm;
  schedule: Schedule;
  scheduleSet: boolean;
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

export default function UserDrawer({
  mode,
  form,
  schedule,
  scheduleSet,
  selectedUser,
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
