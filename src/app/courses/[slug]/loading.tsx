/**
 * Course Detail Loading State
 */

export default function CourseDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-4 animate-pulse">
          {/* Breadcrumb */}
          <div className="h-5 w-48 bg-muted rounded" />
          
          {/* Title */}
          <div className="h-12 w-3/4 bg-muted rounded-lg" />
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded w-full" />
            <div className="h-5 bg-muted rounded w-5/6" />
            <div className="h-5 bg-muted rounded w-4/6" />
          </div>
          
          {/* Meta Info */}
          <div className="flex gap-4 flex-wrap">
            <div className="h-6 w-32 bg-muted rounded-full" />
            <div className="h-6 w-24 bg-muted rounded-full" />
            <div className="h-6 w-28 bg-muted rounded-full" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 animate-pulse">
          <div className="h-10 w-32 bg-muted rounded-lg" />
          <div className="h-10 w-28 bg-muted rounded-lg" />
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Section 1 */}
            <div className="border rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-11/12" />
                <div className="h-4 bg-muted rounded w-10/12" />
              </div>
            </div>

            {/* Section 2 */}
            <div className="border rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-6 w-40 bg-muted rounded" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border rounded-lg p-6 space-y-4 animate-pulse">
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
