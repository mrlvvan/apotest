import { cn } from "@shared/lib/utils/css";
import { ErrorIcon } from "@shared/ui/ActionIcons";
import Icon from "@shared/ui/Icon";

interface UserListItemProps {
  fullName: string;
  phoneVerified?: boolean;
  onClick?: () => void;
}

export default function UserListItem({
  fullName,
  phoneVerified = true,
  onClick,
}: UserListItemProps) {
  const isUnverified = !phoneVerified;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-12 w-full items-center justify-between rounded-m px-5 text-left text-s text-symb-primary",
        "transition-colors duration-300 ease-in-out",
        isUnverified
          ? "bg-background-error hover:bg-neutral-min"
          : "bg-background-med hover:bg-neutral-min",
      )}
    >
      <span className="truncate">{fullName}</span>
      <span className="relative ml-4 flex size-8 shrink-0 items-center justify-center rounded-s">
        {isUnverified ? (
          <ErrorIcon className="absolute opacity-100 transition-opacity group-hover:opacity-0" />
        ) : null}
        <span className="absolute flex size-8 items-center justify-center rounded-s bg-background-med opacity-0 transition-opacity group-hover:opacity-100">
          <Icon name="chevron_right" className="text-[20px] text-symb-primary" />
        </span>
      </span>
    </button>
  );
}
