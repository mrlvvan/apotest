"use client";

import type { Schedule } from "@entities/user/model/types";
import { secondsToTime } from "@shared/lib/schedule";
import { cn } from "@shared/lib/utils/css";
import Icon from "@shared/ui/Icon";

interface SchedulePreviewProps {
  empty?: boolean;
  schedule: Schedule;
  onClick?: () => void;
}

export default function SchedulePreview({
  empty = false,
  schedule,
  onClick,
}: SchedulePreviewProps) {
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
        <span className="whitespace-nowrap">{workTime}</span>
        <span
          className={cn(
            "flex size-8 items-center justify-center justify-self-end rounded-s bg-background-none opacity-0 transition-opacity group-hover:opacity-100",
            hasLunch ? "row-span-3" : "row-span-2",
          )}
        >
          <Icon name="chevron_right" className="text-symb-primary" />
        </span>
        <span className="text-symb-secondary">Пт</span>
        <span className="whitespace-nowrap">{workTime}</span>
        {hasLunch ? (
          <>
            <span className="text-symb-secondary">Обед</span>
            <span className="whitespace-nowrap">
              {secondsToTime(schedule.lunchStart!)} до {secondsToTime(schedule.lunchEnd!)}
            </span>
          </>
        ) : null}
      </span>
    </button>
  );
}
