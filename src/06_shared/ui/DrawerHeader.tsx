"use client";

import { BackIcon } from "@shared/ui/ActionIcons";
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
    <header className="relative mb-10 flex h-9 items-center justify-center">
      {back ? (
        <RectIconButton
          alt="Назад"
          onClick={onBack}
          className="absolute left-0 h-9 w-[44px]"
        >
          <BackIcon />
        </RectIconButton>
      ) : null}
      <h2 className="text-l font-normal">{title}</h2>
      {!back ? (
        <button
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
          className="absolute right-0 flex size-9 items-center justify-center rounded-m bg-background-min text-symb-secondary hover:bg-background-med"
        >
          <Icon name="close" />
        </button>
      ) : null}
    </header>
  );
}
