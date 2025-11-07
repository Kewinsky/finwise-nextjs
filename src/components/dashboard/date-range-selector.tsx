'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  isLoading?: boolean;
}

const PRESET_RANGES = [
  { label: 'Current month', isThisMonth: true },
  { label: 'Last 3 months', months: 3 },
  { label: 'Last 6 months', months: 6 },
  { label: 'Last year', months: 12 },
] as const;

export function DateRangeSelector({
  dateRange,
  onDateRangeChange,
  isLoading = false,
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetRange = (preset: (typeof PRESET_RANGES)[number]) => {
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined;

    if ('months' in preset) {
      from = new Date(now.getFullYear(), now.getMonth() - preset.months + 1, 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if ('isThisMonth' in preset && preset.isThisMonth) {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    onDateRangeChange({ from, to });
    setIsOpen(false);
  };

  const handleClearRange = () => {
    onDateRangeChange({ from: undefined, to: undefined });
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) {
      return 'Select date range';
    }
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`;
    }
    if (dateRange.from) {
      return `From ${format(dateRange.from, 'MMM dd')}`;
    }
    if (dateRange.to) {
      return `Until ${format(dateRange.to, 'MMM dd')}`;
    }
    return 'Select date range';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal text-sm',
            !dateRange.from && !dateRange.to && 'text-muted-foreground',
          )}
          disabled={isLoading}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{formatDateRange()}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preset Ranges */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Quick Select</h4>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_RANGES.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetRange(preset)}
                  disabled={isLoading}
                  className="text-xs justify-start h-8"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div>
            <h4 className="text-sm font-medium">Custom Range</h4>
            <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2">
              <div>
                <label className="text-xs text-muted-foreground">From</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange.from && 'text-muted-foreground',
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {dateRange.from ? format(dateRange.from, 'PPP') : 'Pick a date'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => {
                        onDateRangeChange({ ...dateRange, from: date });
                        if (dateRange.to) {
                          setIsOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">To</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange.to && 'text-muted-foreground',
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {dateRange.to ? format(dateRange.to, 'PPP') : 'Pick a date'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => {
                        onDateRangeChange({ ...dateRange, to: date });
                        if (dateRange.from) {
                          setIsOpen(false);
                        }
                      }}
                      disabled={(date) => !!(dateRange.from && date < dateRange.from)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Button */}
        <Button
          size="sm"
          className="w-full"
          onClick={handleClearRange}
          disabled={(!dateRange.from && !dateRange.to) || isLoading}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </DialogContent>
    </Dialog>
  );
}
