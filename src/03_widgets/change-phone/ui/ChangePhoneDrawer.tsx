"use client";

import { isPhoneComplete, normalizePhoneInput } from "@shared/lib/phone";
import Button from "@shared/ui/Button";
import DrawerHeader from "@shared/ui/DrawerHeader";
import DrawerInput from "@shared/ui/DrawerInput";

interface ChangePhoneDrawerProps {
  phone: string;
  showValidation: boolean;
  onClose: () => void;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
}

export default function ChangePhoneDrawer({
  phone,
  showValidation,
  onClose,
  onPhoneChange,
  onSubmit,
}: ChangePhoneDrawerProps) {
  return (
    <div className="flex min-h-dvh flex-col pb-8 pt-12">
      <DrawerHeader title="Изменить номер" onClose={onClose} />

      <form className="flex flex-col" action="">
        <div className="grid gap-2">
          <label className="text-s text-symb-primary">Введите новый номер</label>
          <DrawerInput
            value={phone}
            placeholder="+7 (000)000 00 00"
            inputMode="numeric"
            maxLength={17}
            normalizeValue={normalizePhoneInput}
            error={showValidation && !isPhoneComplete(phone) ? "Обязательное поле" : undefined}
            onChange={onPhoneChange}
          />
          <div className="rounded-m bg-background-med px-4 py-2 text-s text-symb-primary">
            Требуется подтверждение
          </div>
          <p className="text-s text-symb-secondary">
            Вышлем SMS-код. Без подтверждения пользователь не будет добавлен
          </p>
        </div>

        <Button className="mt-8 self-end" size="M" variant="primary" onClick={onSubmit}>
          Подтвердить
        </Button>
      </form>
    </div>
  );
}
