export default function DrawerLoading() {
  return (
    <div className="flex min-h-dvh flex-col pb-8 pt-12">
      <div className="mb-10 flex h-10 items-center justify-center">
        <div className="h-6 w-40 animate-pulse rounded-s bg-background-med" />
      </div>

      <div className="grid flex-1 gap-4">
        <div className="h-12 animate-pulse rounded-m bg-background-med" />
        <div className="h-12 animate-pulse rounded-m bg-background-med" />
        <div className="h-12 animate-pulse rounded-m bg-background-med" />
        <div className="h-20 animate-pulse rounded-m bg-background-med" />
        <div className="mt-3 h-12 animate-pulse rounded-m bg-background-med" />
        <div className="h-8 w-2/3 animate-pulse rounded-s bg-background-med" />
      </div>

      <div className="mt-auto flex justify-end pt-8">
        <div className="h-10 w-28 animate-pulse rounded-m bg-background-med" />
      </div>
    </div>
  );
}
