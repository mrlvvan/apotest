"use client";

import Image from "next/image";

interface DrawerShellProps {
  children: React.ReactNode;
  pending?: boolean;
  onClose?: () => void;
}

export default function DrawerShell({
  children,
  pending = false,
  onClose,
}: DrawerShellProps) {
  return (
    <div
      className="fixed inset-0 z-30 bg-[#c9ccd3]/85"
      onClick={pending ? undefined : onClose}
    >
      <aside
        className="relative min-h-dvh w-[clamp(390px,33vw,475px)] overflow-y-auto rounded-r-xl bg-background-none shadow-[18px_0_40px_rgba(8,20,35,0.08)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute left-4 top-11 z-10">
          <Image src="/LogoIcon.svg" alt="Логотип" width={44} height={36} priority />
        </div>

        {pending ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background-none">
            <div className="size-7 animate-spin rounded-full border-2 border-stroke-med border-t-basic-max" />
          </div>
        ) : (
          <div className="min-h-dvh pl-[clamp(72px,7vw,110px)] pr-[clamp(16px,2.2vw,31px)]">
            {children}
          </div>
        )}
      </aside>
    </div>
  );
}
