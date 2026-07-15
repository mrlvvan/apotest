"use client";

import type { DashboardUser } from "@entities/user";
import { UserListItem } from "@entities/user";
import { actionIcons } from "@shared/lib/icons";
import RectIconButton from "@shared/ui/RectIconButton";

interface UserListProps {
  users: DashboardUser[];
  isLoading?: boolean;
  onOpenUser: (user: DashboardUser) => void;
  onCreate: () => void;
}

function UserListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-12 w-full animate-pulse rounded-m bg-background-med"
        />
      ))}
    </>
  );
}

export default function UserList({
  users,
  isLoading = false,
  onOpenUser,
  onCreate,
}: UserListProps) {
  return (
    <section className="mx-0 w-full px-10 pb-10 pt-12">
      <h1 className="text-center text-l font-normal">Пользователи</h1>

      <div className="mt-14 grid gap-3">
        {isLoading ? (
          <UserListSkeleton />
        ) : (
          users.map((user) => (
            <UserListItem
              key={user.id}
              fullName={`${user.surname} ${user.name} ${user.middlename}`}
              phoneVerified={user.phoneVerified}
              onClick={() => onOpenUser(user)}
            />
          ))
        )}
      </div>

      {!isLoading ? (
        <RectIconButton
          src={actionIcons.plus}
          alt="Создать пользователя"
          className="mt-3"
          onClick={onCreate}
        />
      ) : null}
    </section>
  );
}
