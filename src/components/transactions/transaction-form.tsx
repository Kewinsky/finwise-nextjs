'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { createClientForBrowser } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import type { Account } from '@/types/finance.types';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { createTransaction, updateTransaction } from '@/lib/actions/finance-actions';

const baseSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.date(),
  notes: z.string().optional(),
});

const transactionSchema = z.discriminatedUnion('type', [
  baseSchema.extend({
    type: z.literal('income'),
    toAccount: z.string().uuid('Select an account'),
  }),
  baseSchema.extend({
    type: z.literal('expense'),
    fromAccount: z.string().uuid('Select an account'),
  }),
  baseSchema
    .extend({
      type: z.literal('transfer'),
      fromAccount: z.string().uuid('Select a from account'),
      toAccount: z.string().uuid('Select a to account'),
    })
    .refine((data) => data.fromAccount !== data.toAccount, {
      message: 'From and to accounts must be different',
      path: ['toAccount'],
    }),
]);

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: {
    id: string;
    type: string;
    amount: number;
    description: string;
    // Prefer IDs if available; fallback to single account id for legacy data
    fromAccountId?: string | null;
    toAccountId?: string | null;
    account?: string; // legacy single-account id
    category: string;
    date: Date;
    notes?: string;
  };
}

// Categories are static for now; consider loading from server in the future

const mockCategories = {
  income: [
    { id: 'salary', name: 'Salary' },
    { id: 'freelance', name: 'Freelance' },
    { id: 'investment', name: 'Investment' },
    { id: 'gift', name: 'Gift' },
    { id: 'other', name: 'Other' },
  ],
  expense: [
    { id: 'food', name: 'Food & Dining' },
    { id: 'transport', name: 'Transportation' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'utilities', name: 'Utilities' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'other', name: 'Other' },
  ],
  transfer: [{ id: 'transfer', name: 'Transfer' }],
};

export function TransactionForm({ open, onOpenChange, transaction }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const router = useRouter();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    mode: 'onChange',
    defaultValues: {
      type: 'expense',
      date: new Date(),
    },
  });

  const selectedType = form.watch('type');
  const formValues = form.getValues();
  const selectedFromAccount = 'fromAccount' in formValues ? formValues.fromAccount : undefined;

  // Type-safe helpers for conditional fields
  const getAccountValue = (field: 'fromAccount' | 'toAccount'): string => {
    const values = form.getValues();
    if (field in values) {
      return ((values as Record<string, unknown>)[field] as string) || '';
    }
    return '';
  };

  const setAccountValue = (field: 'fromAccount' | 'toAccount', value: string) => {
    if (selectedType === 'income' && field === 'toAccount') {
      form.setValue('toAccount', value);
    } else if (selectedType === 'expense' && field === 'fromAccount') {
      form.setValue('fromAccount', value);
    } else if (selectedType === 'transfer') {
      if (field === 'fromAccount') {
        form.setValue('fromAccount', value);
      } else {
        form.setValue('toAccount', value);
      }
    }
  };

  const getFieldError = (field: 'fromAccount' | 'toAccount') => {
    const errors = form.formState.errors;
    if (field in errors) {
      return (errors as Record<string, { message?: string }>)[field]?.message;
    }
    return undefined;
  };

  const getCategoryIdByName = React.useCallback((name: string, type: string) => {
    const categories = mockCategories[type as keyof typeof mockCategories] || [];
    const category = categories.find((cat) => cat.name === name);
    return category?.id || '';
  }, []);

  // Load accounts from Supabase
  useEffect(() => {
    const supabase = createClientForBrowser();
    const load = async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, name, type, balance, currency, color, is_mandatory')
        .order('name');
      if (error) {
        notifyError('Failed to load accounts', { description: error.message });
        return;
      }
      setAccounts(data as Account[]);
    };
    void load();
  }, []);

  const toAccountOptionsForTransfer = useMemo(() => {
    return accounts.filter((a) => a.id !== selectedFromAccount);
  }, [accounts, selectedFromAccount]);

  // Reset form when transaction changes
  React.useEffect(() => {
    if (transaction) {
      const baseData = {
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.description,
        category: getCategoryIdByName(transaction.category, transaction.type),
        date: transaction.date,
        notes: transaction.notes || '',
      };

      if (transaction.type === 'income') {
        form.reset({
          ...baseData,
          type: 'income',
          toAccount: transaction.toAccountId || '',
        });
      } else if (transaction.type === 'expense') {
        form.reset({
          ...baseData,
          type: 'expense',
          fromAccount: transaction.fromAccountId || '',
        });
      } else {
        form.reset({
          ...baseData,
          type: 'transfer',
          fromAccount: transaction.fromAccountId || '',
          toAccount: transaction.toAccountId || '',
        });
      }
    } else {
      form.reset({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date(),
        fromAccount: '',
      });
    }
  }, [transaction, form, getCategoryIdByName]);

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      const categoryNameByType = (type: 'income' | 'expense' | 'transfer', id: string) => {
        const list = mockCategories[type];
        return list.find((c) => c.id === id)?.name || (type === 'transfer' ? 'Transfer' : 'Other');
      };

      let fromAccountId: string | undefined;
      let toAccountId: string | undefined;

      if (data.type === 'income') {
        toAccountId = data.toAccount;
      } else if (data.type === 'expense') {
        fromAccountId = data.fromAccount;
      } else {
        fromAccountId = data.fromAccount;
        toAccountId = data.toAccount;
      }

      const payload = {
        type: data.type,
        description: data.description,
        category: categoryNameByType(data.type, data.category),
        amount: Number(data.amount),
        date: format(data.date, 'yyyy-MM-dd'),
        notes: data.notes || undefined,
        fromAccountId,
        toAccountId,
      };

      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined) fd.append(k, v === null ? '' : String(v));
      });

      const result = transaction?.id
        ? await updateTransaction(transaction.id, fd)
        : await createTransaction(fd);

      if (result?.success) {
        notifySuccess(`Transaction ${transaction?.id ? 'updated' : 'created'} successfully`);
        onOpenChange(false);
        form.reset();
      } else {
        notifyError('Failed to save transaction', { description: result?.error });
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit' : 'Add'} Transaction</DialogTitle>
          <DialogDescription>
            {transaction
              ? 'Update the details for your transaction.'
              : 'Enter the details for your transaction.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value: 'income' | 'expense' | 'transfer') =>
                  form.setValue('type', value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
              <FormError message={form.formState.errors.type?.message} />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter description"
                {...form.register('description')}
              />
              <FormError message={form.formState.errors.description?.message} />
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
          </div>

          {/* Dynamic account/category controls */}
          {selectedType !== 'transfer' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={selectedType === 'income' ? 'toAccount' : 'fromAccount'}>
                  {selectedType === 'income' ? 'To account' : 'From account'}
                </Label>
                <Select
                  value={getAccountValue(selectedType === 'income' ? 'toAccount' : 'fromAccount')}
                  onValueChange={(value) => {
                    if (value === '__add__') {
                      router.push('/accounts');
                      return;
                    }
                    setAccountValue(selectedType === 'income' ? 'toAccount' : 'fromAccount', value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span>{account.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {account.currency} {Number(account.balance).toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="__add__">+ Add new account</SelectItem>
                  </SelectContent>
                </Select>
                <FormError
                  message={getFieldError(selectedType === 'income' ? 'toAccount' : 'fromAccount')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(value) => form.setValue('category', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories[selectedType]?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormError message={form.formState.errors.category?.message} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccount">From account</Label>
                <Select
                  value={getAccountValue('fromAccount')}
                  onValueChange={(value) => {
                    if (value === '__add__') {
                      router.push('/accounts');
                      return;
                    }
                    setAccountValue('fromAccount', value);
                    // Reset toAccount if it matches fromAccount
                    if (getAccountValue('toAccount') === value) {
                      setAccountValue('toAccount', '');
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select from account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span>{account.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {account.currency} {Number(account.balance).toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="__add__">+ Add new account</SelectItem>
                  </SelectContent>
                </Select>
                <FormError message={getFieldError('fromAccount')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toAccount">To account</Label>
                <Select
                  value={getAccountValue('toAccount')}
                  onValueChange={(value) => {
                    if (value === '__add__') {
                      router.push('/accounts');
                      return;
                    }
                    setAccountValue('toAccount', value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select to account" />
                  </SelectTrigger>
                  <SelectContent>
                    {toAccountOptionsForTransfer.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span>{account.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {account.currency} {Number(account.balance).toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="__add__">+ Add new account</SelectItem>
                  </SelectContent>
                </Select>
                <FormError message={getFieldError('toAccount')} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              className="resize-none h-20 overflow-y-auto"
              {...form.register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !form.formState.isValid}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
