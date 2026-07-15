"use client";

import { actionIcons } from "@shared/lib/icons";
import Icon from "@shared/ui/Icon";
import RectIconButton from "@shared/ui/RectIconButton";

interface DrawerHeaderProps {
  title: string;
  back?: boolean;
  onBack?: () => void;
  onClose: () => void;
}

export default function DrawerHeader({
  title,
  back = false,
  onBack,
  onClose,
}: DrawerHeaderProps) {
  return (
    <header className="relative mb-10 flex h-10 items-center justify-center">
      {back ? (
        <RectIconButton
          src={actionIcons.back}
          alt="Назад"
          onClick={onBack}
          className="absolute left-0"
        />
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
