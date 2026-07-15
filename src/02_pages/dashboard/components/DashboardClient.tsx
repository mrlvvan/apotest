"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    listUsers()
      .then((items) => setUsers(items.map(listUserToDashboardUser)))
      .catch(() => setUsers([]))
      .finally(() => setIsLoadingList(false));
  }, []);

  async function openUser(user: DashboardUser) {
    setDrawerMode("loading");
    setShowValidation(false);
    setIsModified(false);

    try {
      const profile = await getUser(user.id);
      setSelectedUser(profile);
      setForm({
        surname: profile.surname,
        name: profile.name,
        position: profile.position,
        phone: profile.phone,
      });
      setSchedule(profile.schedule);
      setDrawerMode("view");
    } catch {
      closeDrawer();
    }
  }

  function openConfirmedUser(user: DashboardUser) {
    setSelectedUser(user);
    setForm({
      surname: user.surname,
      name: user.name,
      position: user.position,
      phone: user.phone,
    });
    setSchedule(user.schedule ?? defaultSchedule);
    setDrawerMode("view");
    setIsModified(false);
    setShowValidation(false);
    setScheduleSet(false);
  }

  function openCreate() {
    setSelectedUser(null);
    setPendingConfirmationUser(null);
    setForm(emptyForm);
    setSchedule(defaultSchedule);
    setScheduleSet(false);
    setDrawerMode("create");
    setIsModified(false);
    setShowValidation(false);
  }

  function closeDrawer() {
    setDrawerMode(null);
    setSelectedUser(null);
    setPendingConfirmationUser(null);
    setPendingPhone("");
    setPhoneConfirmSource("create");
    setSchedule(defaultSchedule);
    setScheduleSet(false);
    setIsModified(false);
    setShowValidation(false);
    setShowUnsavedModal(false);
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
    if (!form.surname || !form.name || !form.position || !form.phone) {
      setShowValidation(true);
      return;
    }

    setDrawerMode("pending");

    try {
      const createdUser = await createUser({
        name: form.name,
        surname: form.surname,
        middlename: " ",
        position: form.position as PositionCode,
        phone: form.phone,
        schedule,
      });

      await sendCode(createdUser.id, form.phone);

      setPendingConfirmationUser(createdUser);
      setPendingPhone(form.phone);
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
    if (!selectedUser || !form.phone) {
      setShowValidation(true);
      return;
    }

    setDrawerMode("pending");

    try {
      await sendCode(selectedUser.id, form.phone);
      setPendingConfirmationUser(selectedUser);
      setPendingPhone(form.phone);
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
        pendingPhone || pendingConfirmationUser.phone,
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
              phone={pendingPhone || form.phone}
              onBack={() =>
                setDrawerMode(phoneConfirmSource === "change" ? "changePhone" : "create")
              }
              onConfirm={handleConfirmPhone}
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
                  phone: selectedUser?.phone || "",
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
