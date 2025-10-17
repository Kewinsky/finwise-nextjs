'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormError } from '@/components/ui/form-error';
import { CalendarIcon, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const transferSchema = z
  .object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
      }),
    fromAccount: z.string().min(1, 'From account is required'),
    toAccount: z.string().min(1, 'To account is required'),
    date: z.date(),
    notes: z.string().optional(),
  })
  .refine((data) => data.fromAccount !== data.toAccount, {
    message: 'From and to accounts must be different',
    path: ['toAccount'],
  });

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockAccounts = [
  { id: '1', name: 'Checking Account', balance: 5420.5 },
  { id: '2', name: 'Savings Account', balance: 10000.0 },
  { id: '3', name: 'Credit Card', balance: -250.75 },
];

export function TransferDialog({ open, onOpenChange }: TransferDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const onSubmit = async (data: TransferFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Transfer data:', data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating transfer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  const fromAccount = mockAccounts.find((acc) => acc.id === form.watch('fromAccount'));
  const toAccount = mockAccounts.find((acc) => acc.id === form.watch('toAccount'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer Funds</DialogTitle>
          <DialogDescription>Move money between your accounts.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8"
                {...form.register('amount')}
              />
            </div>
            <FormError message={form.formState.errors.amount?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromAccount">From Account</Label>
              <Select
                value={form.watch('fromAccount')}
                onValueChange={(value) => form.setValue('fromAccount', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {mockAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex flex-col">
                        <span>{account.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Balance: ${account.balance.toLocaleString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormError message={form.formState.errors.fromAccount?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toAccount">To Account</Label>
              <Select
                value={form.watch('toAccount')}
                onValueChange={(value) => form.setValue('toAccount', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {mockAccounts
                    .filter((account) => account.id !== form.watch('fromAccount'))
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex flex-col">
                          <span>{account.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Balance: ${account.balance.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormError message={form.formState.errors.toAccount?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !form.watch('date') && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('date') ? format(form.watch('date'), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch('date')}
                  onSelect={(date) => form.setValue('date', date || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormError message={form.formState.errors.date?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              className="resize-none h-20 overflow-y-auto"
              {...form.register('notes')}
            />
          </div>

          {/* Transfer Summary */}
          {fromAccount && toAccount && form.watch('amount') && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium mb-2">Transfer Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">
                    ${Number(form.watch('amount')).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>From:</span>
                  <span className="font-medium">{fromAccount.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>To:</span>
                  <span className="font-medium">{toAccount.name}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Processing...' : 'Transfer Funds'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
