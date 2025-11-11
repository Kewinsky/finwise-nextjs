import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AISuggestionsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 @md:gap-3 @lg:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-auto min-h-[100px] @sm:min-h-[120px] py-3 @sm:py-4 flex flex-col items-center justify-center gap-2 border rounded-md"
            >
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="text-center space-y-0.5 w-full px-2">
                <Skeleton className="h-3.5 w-20 mx-auto" />
                <Skeleton className="h-2.5 w-24 mx-auto hidden @sm:block" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
