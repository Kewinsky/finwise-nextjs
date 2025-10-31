import { useChart } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';

interface SimpleChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    color?: string;
    payload?: {
      label?: string;
      name?: string;
      fill?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
  labelKey?: 'label' | 'name';
}

/**
 * Simple, readable tooltip component for charts
 * Displays label/name and value in a clean single-line format with color indicator
 */
export function SimpleChartTooltip({
  active,
  payload,
  labelKey = 'label',
}: SimpleChartTooltipProps) {
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  const label =
    labelKey === 'label' ? (data.payload?.label as string) : (data.payload?.name as string);
  const value = Number(data.value) || 0;

  if (!label) {
    return null;
  }

  // Get color from payload fill, item color, chart config, or fallback to a default
  const dataKey = (data.dataKey as string) || (data.name as string);
  const indicatorColor =
    (data.payload?.fill as string) ||
    (data.color as string) ||
    (dataKey && config?.[dataKey]?.color ? (config[dataKey].color as string) : undefined) ||
    'hsl(var(--primary))';

  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-lg">
      <div className="flex items-center gap-2">
        {/* Color indicator square */}
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
          style={{
            backgroundColor: indicatorColor,
          }}
        />
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-mono font-medium tabular-nums text-foreground">
          {formatCurrency(value)}
        </span>
      </div>
    </div>
  );
}
