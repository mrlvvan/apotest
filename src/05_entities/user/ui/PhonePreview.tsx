"use client";

import { formatPhone } from "@shared/lib/phone";
import Icon from "@shared/ui/Icon";

interface PhonePreviewProps {
  phone: string;
  verified: boolean;
  onClick?: () => void;
}

export default function PhonePreview({ phone, verified, onClick }: PhonePreviewProps) {
  const displayPhone = formatPhone(phone);

  if (verified) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="h-12 w-full rounded-m bg-background-med px-4 text-left text-s text-symb-secondary transition-colors hover:bg-neutral-min"
      >
        {displayPhone}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full overflow-hidden rounded-m text-left text-s transition-opacity hover:opacity-95"
    >
      <span className="flex h-12 items-center justify-between bg-background-error px-4 text-symb-primary">
        <span>{displayPhone}</span>
        <Icon name="info" className="text-[18px] text-symb-primary" />
      </span>
      <span className="bg-background-med px-4 py-2 text-s text-symb-primary">
        Требуется подтверждение
      </span>
    </button>
  );
}
