"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type {
  ApiUser,
  DashboardUser,
  DrawerMode,
  PositionCode,
  Schedule,
  UserForm,
} from "@entities/user";
import {
  confirmCode,
  createUser,
  defaultSchedule,
  emptyForm,
  getUser,
  listUsers,
  sendCode,
  updateUser,
} from "@entities/user";
import { UserList } from "@features/user-list";
import { formatPhone, isPhoneComplete, phoneToApi } from "@shared/lib/phone";
import DrawerLoading from "@shared/ui/DrawerLoading";
import DrawerShell from "@shared/ui/DrawerShell";
import { ChangePhoneDrawer } from "@widgets/change-phone";
import { ConfirmPhoneDrawer } from "@widgets/confirm-phone";
import { ScheduleDrawer } from "@widgets/schedule-drawer";
import { UnsavedChangesModal } from "@widgets/unsaved-modal";
import { UserDrawer } from "@widgets/user-drawer";

function listUserToDashboardUser(user: ApiUser): DashboardUser {
  return {
    ...user,
    position: "",
    phone: "",
  };
}

export default function DashboardClient() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);
  const [scheduleReturnMode, setScheduleReturnMode] = useState<"view" | "create">("view");
  const [scheduleSet, setScheduleSet] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [pendingConfirmationUser, setPendingConfirmationUser] = useState<DashboardUser | null>(
    null,
  );
  const [pendingPhone, setPendingPhone] = useState("");
  const [phoneConfirmSource, setPhoneConfirmSource] = useState<"create" | "change">("create");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [schedule, setSchedule] = useState<Schedule>(defaultSchedule);
  const [isModified, setIsModified] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);
  const loadRequestIdRef = useRef(0);

  useEffect(() => {
    listUsers()
      .then((items) => setUsers(items.map(listUserToDashboardUser)))
      .catch(() => setUsers([]))
      .finally(() => setIsLoadingList(false));
  }, []);

  function invalidatePendingLoads() {
    loadRequestIdRef.current += 1;
  }

  function resetDrawerContent() {
    setSelectedUser(null);
    setPendingConfirmationUser(null);
    setPendingPhone("");
    setPhoneConfirmSource("create");
    setForm(emptyForm);
    setSchedule(defaultSchedule);
    setScheduleSet(false);
    setIsModified(false);
    setShowValidation(false);
    setShowUnsavedModal(false);
  }

  async function openUser(user: DashboardUser) {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    resetDrawerContent();
    setDrawerKey((current) => current + 1);
    setDrawerMode("loading");

    try {
      const profile = await getUser(user.id);
      if (requestId !== loadRequestIdRef.current) {
        return;
      }

      setSelectedUser(profile);
      setForm({
        surname: profile.surname,
        name: profile.name,
        position: profile.position,
        phone: formatPhone(profile.phone),
      });
      setSchedule(profile.schedule);
      setDrawerMode("view");
    } catch {
      if (requestId !== loadRequestIdRef.current) {
        return;
      }
      closeDrawer();
    }
  }

  function openConfirmedUser(user: DashboardUser) {
    invalidatePendingLoads();
    setSelectedUser(user);
    setForm({
      surname: user.surname,
      name: user.name,
      position: user.position,
      phone: formatPhone(user.phone),
    });
    setSchedule(user.schedule ?? defaultSchedule);
    setDrawerKey((current) => current + 1);
    setDrawerMode("view");
    setIsModified(false);
    setShowValidation(false);
    setScheduleSet(false);
  }

  function openCreate() {
    invalidatePendingLoads();
    resetDrawerContent();
    setDrawerKey((current) => current + 1);
    setDrawerMode("create");
  }

  function closeDrawer() {
    invalidatePendingLoads();
    setDrawerMode(null);
    resetDrawerContent();
  }

  function requestCloseDrawer() {
    if (isModified && drawerMode !== "loading" && drawerMode !== "pending") {
      setShowUnsavedModal(true);
      return;
    }

    closeDrawer();
  }

  function updateField(field: keyof UserForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setIsModified(true);
  }

  async function handleCreateSubmit() {
    if (!form.surname || !form.name || !form.position || !isPhoneComplete(form.phone)) {
      setShowValidation(true);
      return;
    }

    setDrawerMode("pending");

    try {
      const phone = phoneToApi(form.phone);
      const createdUser = await createUser({
        name: form.name,
        surname: form.surname,
        middlename: " ",
        position: form.position as PositionCode,
        phone,
        schedule,
      });

      await sendCode(createdUser.id, phone);

      setPendingConfirmationUser(createdUser);
      setPendingPhone(phone);
      setPhoneConfirmSource("create");
      setDrawerMode("confirmPhone");
    } catch {
      setDrawerMode("create");
      setShowValidation(true);
    }
  }

  async function handleSaveExisting() {
    if (!selectedUser) {
      return;
    }

    setDrawerMode("pending");

    try {
      const updatedUser = await updateUser(selectedUser.id, {
        surname: form.surname,
        name: form.name,
        position: form.position as PositionCode,
        schedule,
      });

      setUsers((current) =>
        current.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
        ),
      );
      openConfirmedUser(updatedUser);
    } catch {
      setDrawerMode("view");
    }
  }

  async function handleSaveSchedule(nextSchedule: Schedule) {
    setSchedule(nextSchedule);

    if (scheduleReturnMode === "create" || !selectedUser) {
      setScheduleSet(true);
      setIsModified(true);
      setDrawerMode(scheduleReturnMode);
      return;
    }

    setDrawerMode("pending");

    try {
      const updatedUser = await updateUser(selectedUser.id, {
        surname: form.surname,
        name: form.name,
        position: form.position as PositionCode,
        schedule: nextSchedule,
      });

      setUsers((current) =>
        current.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user,
        ),
      );
      openConfirmedUser(updatedUser);
    } catch {
      setDrawerMode(scheduleReturnMode);
    }
  }

  async function handlePhoneChangeSubmit() {
    if (!selectedUser || !isPhoneComplete(form.phone)) {
      setShowValidation(true);
      return;
    }

    setDrawerMode("pending");

    try {
      const phone = phoneToApi(form.phone);
      await sendCode(selectedUser.id, phone);
      setPendingConfirmationUser(selectedUser);
      setPendingPhone(phone);
      setPhoneConfirmSource("change");
      setShowValidation(false);
      setDrawerMode("confirmPhone");
    } catch {
      setDrawerMode("changePhone");
      setShowValidation(true);
    }
  }

  async function handleConfirmPhone() {
    if (!pendingConfirmationUser) {
      return;
    }

    setDrawerMode("pending");

    try {
      const confirmedUser = await confirmCode(
        pendingConfirmationUser.id,
        phoneToApi(pendingPhone || pendingConfirmationUser.phone),
        "1111",
      );

      if (phoneConfirmSource === "create") {
        setUsers((current) => [confirmedUser, ...current]);
      } else {
        setUsers((current) =>
          current.map((user) =>
            user.id === confirmedUser.id ? { ...user, ...confirmedUser } : user,
          ),
        );
      }

      setPendingConfirmationUser(null);
      setPendingPhone("");
      window.setTimeout(() => {
        openConfirmedUser(confirmedUser);
      }, 700);
    } catch {
      setDrawerMode("confirmPhone");
    }
  }

  async function handleResendCode() {
    if (!pendingConfirmationUser) {
      return;
    }

    await sendCode(
      pendingConfirmationUser.id,
      phoneToApi(pendingPhone || pendingConfirmationUser.phone),
    );
  }

  return (
    <div className="min-h-dvh min-w-[640px] overflow-x-hidden bg-background-none text-symb-primary">
      <aside className="fixed inset-y-0 left-0 z-10 w-[76px] border-r border-stroke-med bg-background-none">
        <div className="flex justify-center pt-11">
          <Image src="/LogoIcon.svg" alt="Логотип" width={44} height={36} priority />
        </div>
      </aside>

      <main className="ml-[76px] min-h-dvh">
        <UserList
          users={users}
          isLoading={isLoadingList}
          onOpenUser={openUser}
          onCreate={openCreate}
        />
      </main>

      {drawerMode ? (
        <DrawerShell
          key={drawerKey}
          pending={drawerMode === "pending"}
          onClose={requestCloseDrawer}
        >
          {drawerMode === "loading" ? (
            <DrawerLoading />
          ) : drawerMode === "pending" ? null : drawerMode === "changePhone" ? (
            <ChangePhoneDrawer
              phone={form.phone}
              showValidation={showValidation}
              onClose={requestCloseDrawer}
              onPhoneChange={(value) => {
                setForm((current) => ({ ...current, phone: value }));
                setIsModified(true);
              }}
              onSubmit={handlePhoneChangeSubmit}
            />
          ) : drawerMode === "schedule" ? (
            <ScheduleDrawer
              schedule={schedule}
              onBack={() => setDrawerMode(scheduleReturnMode)}
              onSave={handleSaveSchedule}
            />
          ) : drawerMode === "confirmPhone" ? (
            <ConfirmPhoneDrawer
              key={pendingPhone || form.phone}
              phone={pendingPhone || form.phone}
              onBack={() =>
                setDrawerMode(phoneConfirmSource === "change" ? "changePhone" : "create")
              }
              onConfirm={handleConfirmPhone}
              onResend={handleResendCode}
            />
          ) : (
            <UserDrawer
              mode={drawerMode}
              form={form}
              schedule={schedule}
              scheduleSet={scheduleSet}
              selectedUser={selectedUser}
              showValidation={showValidation}
              onClose={requestCloseDrawer}
              onFieldChange={updateField}
              onOpenSchedule={() => {
                setScheduleReturnMode(drawerMode === "create" ? "create" : "view");
                setDrawerMode("schedule");
              }}
              onOpenPhoneChange={() => {
                setForm((current) => ({
                  ...current,
                  phone: formatPhone(selectedUser?.phone || ""),
                }));
                setShowValidation(false);
                setDrawerMode("changePhone");
              }}
              onSubmitCreate={handleCreateSubmit}
              onSave={handleSaveExisting}
            />
          )}
        </DrawerShell>
      ) : null}

      {showUnsavedModal ? (
        <UnsavedChangesModal
          onBack={() => setShowUnsavedModal(false)}
          onDiscard={closeDrawer}
        />
      ) : null}
    </div>
  );
}
