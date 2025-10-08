/**
 * Courses List Loading State
 */

export default function CoursesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-6 w-96 bg-muted rounded animate-pulse" />
      </div>

      {/* Courses Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border rounded-lg overflow-hidden animate-pulse"
          >
            {/* Image placeholder */}
            <div className="h-48 bg-muted" />
            
            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="h-6 bg-muted rounded w-3/4" />
              
              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
              
              {/* Tags */}
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-muted rounded-full" />
                <div className="h-6 w-20 bg-muted rounded-full" />
              </div>
              
              {/* Footer */}
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 w-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
