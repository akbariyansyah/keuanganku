import { Card, CardHeader, CardContent } from '../ui/card';

interface CardSkeletonProps {
  length: number;
}

export function CardSkeleton({ length }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: length }).map((_, i) => (
        <Card
          key={i}
          className="bg-background/60 backdrop-blur border-muted-foreground/20 w-full"
        >
          <CardHeader className="pb-2">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="h-8 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
