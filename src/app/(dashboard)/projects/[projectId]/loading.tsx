import { Skeleton } from '@/shared/ui/skeleton'

export default function KanbanBoardLoading() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4 space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3].map((col) => (
          <div
            key={col}
            className="w-80 shrink-0 rounded-xl border bg-muted/20 p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}