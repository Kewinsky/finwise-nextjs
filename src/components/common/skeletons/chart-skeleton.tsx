import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartSkeletonProps {
  showTabs?: boolean;
  height?: string;
  className?: string;
}

export function ChartSkeleton({
  showTabs = false,
  height = 'h-[400px]',
  className,
}: ChartSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col space-y-4 @sm:flex-row @sm:items-center @sm:justify-between @sm:space-y-0">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          {showTabs && (
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={height}>
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
