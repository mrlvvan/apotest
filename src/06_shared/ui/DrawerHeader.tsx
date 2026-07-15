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

function DrawerCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Закрыть"
      onClick={onClick}
      className="absolute right-0 box-border flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-m border-0 bg-background-min p-0 text-symb-secondary hover:bg-background-med"
    >
      <Icon name="close" className="text-[16px]" />
    </button>
  );
}

export default function DrawerHeader({
  title,
  back = false,
  onBack,
  onClose,
}: DrawerHeaderProps) {
  return (
    <header className="relative mb-10 flex h-[36px] items-center justify-center">
      {back ? (
        <RectIconButton
          alt="Назад"
          size="back"
          onClick={onBack}
          className="absolute left-0"
        >
          <BackIcon />
        </RectIconButton>
      ) : null}
      <h2 className="text-l font-normal">{title}</h2>
      {!back ? <DrawerCloseButton onClick={onClose} /> : null}
    </header>
  );
}
