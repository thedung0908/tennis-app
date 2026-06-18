export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-muted rounded w-28 mb-4" />
      <div className="flex border-b mb-4">
        <div className="h-9 bg-muted rounded w-20 mr-2" />
        <div className="h-9 bg-muted rounded w-20" />
      </div>
      <div className="space-y-4">
        {[0, 1].map((g) => (
          <div key={g}>
            <div className="h-4 bg-muted rounded w-36 mb-2" />
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="h-7 bg-muted/40 border-b" />
                  <div className="h-9 bg-green-50/60" />
                  <div className="h-9 bg-rose-50/60 border-t" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
