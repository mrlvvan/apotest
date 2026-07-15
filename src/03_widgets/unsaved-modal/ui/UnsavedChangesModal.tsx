"use client";

import Button from "@shared/ui/Button";
import Icon from "@shared/ui/Icon";

interface UnsavedChangesModalProps {
  onBack: () => void;
  onDiscard: () => void;
}

export default function UnsavedChangesModal({
  onBack,
  onDiscard,
}: UnsavedChangesModalProps) {
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
