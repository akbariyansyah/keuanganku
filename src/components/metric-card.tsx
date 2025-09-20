
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export type MetricItem = {
    title: string;
    value: string;
    delta: number | null; // positive = up, negative = down, null = hide badge

};

export default function MetricCard({ title, value, delta }: MetricItem) {
    return (
        <Card className="w-65 bg-background/60 backdrop-blur border-muted-foreground/20">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>

                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="text-2xl font-semibold tracking-tight">{value}</div>
            </CardContent>
        </Card>
    );
}
