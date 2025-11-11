'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Filter, Calendar as CalendarIcon, DollarSign, Search, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn, capitalizeFirst } from '@/lib/utils';
import type { TransactionFilters, Account } from '@/types/finance.types';
import { TRANSACTION_CATEGORIES } from '@/config/app';

interface TransactionFiltersProps {
  accounts: Account[];
  onFiltersChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

// Flatten all categories from TRANSACTION_CATEGORIES for the filter dropdown
const allCategories = [
  ...TRANSACTION_CATEGORIES.income.map((cat) => cat.name),
  ...TRANSACTION_CATEGORIES.expense.map((cat) => cat.name),
  ...TRANSACTION_CATEGORIES.transfer.map((cat) => cat.name),
];

const transactionTypes = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
];

export function TransactionFiltersComponent({
  accounts,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFilterChange = (
    key: keyof TransactionFilters,
    value: string | number | undefined,
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    handleFilterChange('dateFrom', date ? format(date, 'yyyy-MM-dd') : undefined);
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    handleFilterChange('dateTo', date ? format(date, 'yyyy-MM-dd') : undefined);
  };

  const handleClearFilters = () => {
    setFilters({});
    setDateFrom(undefined);
    setDateTo(undefined);
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type) count++;
    if (filters.category) count++;
    if (filters.accountId) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.minAmount !== undefined) count++;
    if (filters.maxAmount !== undefined) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4 @md:space-y-6">
      {/* Search Bar and Toggle Button */}
      <div className="flex flex-col space-y-3 @md:flex-row @md:items-center @md:space-y-0 @md:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full @sm:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          <span className="hidden @sm:inline">{isOpen ? 'Hide Filters' : 'Show Filters'}</span>
          <span className="@sm:hidden">{isOpen ? 'Hide' : 'Filters'}</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Section */}
      {isOpen && (
        <Card className="gap-0">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Advanced Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                disabled={activeFiltersCount === 0 || isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 @md:space-y-4">
            {/* Basic Filters Row */}
            <div className="grid grid-cols-1 gap-4 @lg:grid-cols-3">
              {/* Transaction Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('type', value === 'all' ? undefined : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all">All types</SelectItem>
                    {transactionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('category', value === 'all' ? undefined : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all">All categories</SelectItem>
                    {allCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {capitalizeFirst(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Account */}
              <div className="space-y-2">
                <Label htmlFor="accountId">Account</Label>
                <Select
                  value={filters.accountId || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('accountId', value === 'all' ? undefined : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all">All accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range Row */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">From</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dateFrom && 'text-muted-foreground',
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {dateFrom ? format(dateFrom, 'PPP') : 'Pick a date'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={handleDateFromChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">To</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dateTo && 'text-muted-foreground',
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {dateTo ? format(dateTo, 'PPP') : 'Pick a date'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={handleDateToChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Amount Range Row */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Amount Range</label>
              <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Min Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      min={0}
                      value={filters.minAmount || ''}
                      onChange={(e) =>
                        handleFilterChange(
                          'minAmount',
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      className="pl-10 w-full"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Max Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="1000.00"
                      min={0}
                      value={filters.maxAmount || ''}
                      onChange={(e) =>
                        handleFilterChange(
                          'maxAmount',
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      className="pl-10 w-full"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
