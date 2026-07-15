"use client";

import Icon from "@shared/ui/Icon";

interface PhonePreviewProps {
  phone: string;
  verified: boolean;
}

export default function PhonePreview({ phone, verified }: PhonePreviewProps) {
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
