export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 bg-muted rounded w-24 mb-4" />
      <div className="flex border-b mb-4">
        <div className="h-9 bg-muted rounded w-20 mr-2" />
        <div className="h-9 bg-muted rounded w-20" />
      </div>
      <div className="flex gap-2 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-muted rounded w-16" />
        ))}
      </div>
      <div className="h-4 bg-muted rounded w-40 mb-4" />
      <div className="space-y-1">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-14 border rounded-lg bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
