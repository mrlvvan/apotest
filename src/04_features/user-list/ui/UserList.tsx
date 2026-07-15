"use client";

import type { DashboardUser } from "@entities/user";
import { UserListItem } from "@entities/user";
import Button from "@shared/ui/Button";

interface UserListProps {
  users: DashboardUser[];
  onOpenUser: (user: DashboardUser) => void;
  onCreate: () => void;
}

export default function UserList({ users, onOpenUser, onCreate }: UserListProps) {
  return (
    <section className="mx-0 w-full px-10 pb-10 pt-12">
      <h1 className="text-center text-l font-normal">Пользователи</h1>

      <div className="mt-14 grid gap-3">
        {users.map((user) => (
          <UserListItem
            key={user.id}
            fullName={`${user.surname} ${user.name} ${user.middlename}`}
            phoneVerified={user.phoneVerified}
            onClick={() => onOpenUser(user)}
          />
        ))}
      </div>

      <Button
        aria-label="Создать пользователя"
        className="mt-3 h-10 w-[52px] rounded-m border border-stroke-med bg-background-none p-0 text-l text-symb-primary hover:border-stroke-max"
        variant="tertiary"
        onClick={onCreate}
      >
        +
      </Button>
    </section>
  );
}
