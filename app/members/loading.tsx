export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-muted rounded w-40 mb-4" />
      <div className="h-10 bg-muted rounded mb-4" />
      <div className="border rounded-lg divide-y overflow-hidden">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-4 h-3 bg-muted rounded" />
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-muted rounded w-24" />
              <div className="h-3 bg-muted/60 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
