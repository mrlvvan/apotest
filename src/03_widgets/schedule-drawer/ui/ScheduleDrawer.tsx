"use client";

import { useState } from "react";
import type { Schedule } from "@entities/user";
import { defaultSchedule } from "@entities/user";
import {
  labelToPolicy,
  policyToLabel,
  secondsToTime,
  timeToSeconds,
} from "@shared/lib/schedule";
import Button from "@shared/ui/Button";
import CallPolicySelect from "@shared/ui/CallPolicySelect";
import DrawerHeader from "@shared/ui/DrawerHeader";
import Icon from "@shared/ui/Icon";
import TimeInput from "@shared/ui/TimeInput";

interface ScheduleDrawerProps {
  schedule: Schedule;
  onBack: () => void;
  onSave: (schedule: Schedule) => void;
}

export default function ScheduleDrawer({ schedule, onBack, onSave }: ScheduleDrawerProps) {
  const [hasLunch, setHasLunch] = useState(
    schedule.lunchStart !== undefined && schedule.lunchEnd !== undefined,
  );
  const [workStart, setWorkStart] = useState(secondsToTime(schedule.weekdaysStart));
  const [workEnd, setWorkEnd] = useState(secondsToTime(schedule.weekdaysEnd));
  const [lunchStart, setLunchStart] = useState(
    secondsToTime(schedule.lunchStart ?? defaultSchedule.lunchStart!),
  );
  const [lunchEnd, setLunchEnd] = useState(
    secondsToTime(schedule.lunchEnd ?? defaultSchedule.lunchEnd!),
  );
  const [offHoursPolicy, setOffHoursPolicy] = useState(
    policyToLabel(schedule.allowOffdayCallsWeekdays),
  );
  const [lunchPolicy, setLunchPolicy] = useState(
    policyToLabel(schedule.allowLunchCalls ?? false),
  );

  function saveSchedule() {
    const nextSchedule: Schedule = {
      weekdaysStart: timeToSeconds(workStart),
      weekdaysEnd: timeToSeconds(workEnd),
      allowOffdayCallsWeekdays: labelToPolicy(offHoursPolicy),
    };

    if (hasLunch) {
      nextSchedule.lunchStart = timeToSeconds(lunchStart);
      nextSchedule.lunchEnd = timeToSeconds(lunchEnd);
      nextSchedule.allowLunchCalls = labelToPolicy(lunchPolicy);
    }

    onSave(nextSchedule);
  }

  return (
    <div className="flex min-h-dvh flex-col pb-8 pt-12">
      <DrawerHeader title="График работы" back onBack={onBack} onClose={onBack} />

      <div className="grid gap-8">
        <p className="text-l leading-[1.35] text-symb-primary">
          Укажите время, в которое специалист застанет вас на работе (по вашему местному времени)
        </p>

        <div className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-x-3 gap-y-3">
          <span className="text-l">Пн–Пт</span>
          <div className="flex min-w-0 items-center gap-2">
            <TimeInput value={workStart} onChange={setWorkStart} />
            <span className="text-symb-secondary">–</span>
            <TimeInput value={workEnd} onChange={setWorkEnd} />
          </div>
          <span className="text-l text-symb-secondary">В нерабочее время</span>
          <CallPolicySelect value={offHoursPolicy} onChange={setOffHoursPolicy} />
        </div>

        <div className="grid grid-cols-[104px_minmax(0,1fr)] items-center gap-x-3 gap-y-3">
          <span className="text-l">Обед</span>
          {hasLunch ? (
            <div className="flex min-w-0 items-center gap-2">
              <TimeInput value={lunchStart} onChange={setLunchStart} />
              <span className="text-symb-secondary">–</span>
              <TimeInput value={lunchEnd} onChange={setLunchEnd} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHasLunch(true)}
              className="flex h-10 w-[52px] items-center justify-center rounded-m border border-stroke-med bg-background-none text-l text-symb-primary hover:border-stroke-max"
            >
              +
            </button>
          )}
          {hasLunch ? (
            <>
              <span className="text-l text-symb-secondary">В обеденное время</span>
              <CallPolicySelect value={lunchPolicy} onChange={setLunchPolicy} />
              <span />
              <button
                type="button"
                onClick={() => setHasLunch(false)}
                className="flex h-10 w-[52px] items-center justify-center rounded-m border border-stroke-med bg-background-none text-symb-primary hover:border-stroke-max"
              >
                <Icon name="delete" className="text-[16px] text-symb-secondary" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      <Button className="mt-auto self-end" size="M" variant="primary" onClick={saveSchedule}>
        Сохранить
      </Button>
    </div>
  );
}
