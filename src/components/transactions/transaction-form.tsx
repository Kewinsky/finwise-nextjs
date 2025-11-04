'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { notifyError, notifySuccess } from '@/lib/notifications';
import { createTransaction, updateTransaction } from '@/lib/actions/finance-actions';
import { LoadingSpinner } from '@/components/ui/custom-spinner';
import { transactionFormSchema, TransactionFormData } from '@/validation/finance';
import type { Account, TransactionFormProps } from '@/types';

import { TRANSACTION_CATEGORIES } from '@/config/app';

const categories = TRANSACTION_CATEGORIES;

const defaultFormValues = {
  amount: '',
  description: '',
  category: '',
  date: new Date(),
  notes: '',
  fromAccount: '',
  toAccount: '',
};

export function TransactionForm({
  open,
  onOpenChange,
  onSuccess,
  defaultType,
  transaction,
}: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isFormReady, setIsFormReady] = useState(false);
  const router = useRouter();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    mode: 'onBlur',
    defaultValues: {
      type: defaultType || 'expense',
      ...defaultFormValues,
    },
  });

  const selectedType = form.watch('type');
  const fromAccount = form.watch('fromAccount');
  const toAccount = form.watch('toAccount');

  const resetForm = useCallback(
    (values: Partial<TransactionFormData>) => {
      form.reset(values);
      if (!values.fromAccount) {
        form.setValue('fromAccount', '');
      }
      if (!values.toAccount) {
        form.setValue('toAccount', '');
      }
      if (!values.category) {
        form.setValue('category', '');
      }
    },
    [form],
  );

  const loadAccounts = useCallback(async () => {
    const supabase = createClientForBrowser();
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, type, balance, color, is_mandatory')
      .order('name');

    if (error) {
      notifyError('Failed to load accounts', { description: error.message });
      return;
    }
    setAccounts(data as Account[]);
  }, []);

  const getCategoryId = useCallback((categoryName: string, type: string) => {
    const categoryList = categories[type as keyof typeof categories] || [];
    return categoryList.find((cat) => cat.name === categoryName)?.id || '';
  }, []);

  const getCategoryName = useCallback((categoryId: string, type: string) => {
    const categoryList = categories[type as keyof typeof categories] || [];
    return categoryList.find((cat) => cat.id === categoryId)?.name || 'Other';
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (!accounts.length) return;

    if (transaction) {
      const categoryId = getCategoryId(transaction.category, transaction.type);

      if (form) {
        resetForm({
          type: transaction.type as 'income' | 'expense' | 'transfer',
          amount: Math.abs(transaction.amount).toString(),
          description: transaction.description,
          category: categoryId,
          date: transaction.date,
          notes: transaction.notes || '',
          fromAccount: transaction.fromAccountId || '',
          toAccount: transaction.toAccountId || '',
        });
      }
    } else {
      if (form) {
        resetForm({
          type: defaultType || 'expense',
          ...defaultFormValues,
        });
      }
    }
    setIsFormReady(true);
  }, [transaction, accounts, resetForm, getCategoryId, defaultType, form]);

  useEffect(() => {
    const currentCategory = form.getValues('category');

    // For transfers, automatically set category to 'transfer'
    if (selectedType === 'transfer') {
      const transferCategory = categories.transfer[0];
      if (transferCategory && currentCategory !== transferCategory.id) {
        form.setValue('category', transferCategory.id);
      }
      return;
    }

    // For other types, validate category exists
    if (currentCategory) {
      const categoryList = categories[selectedType as keyof typeof categories] || [];
      const categoryExists = categoryList.some((cat) => cat.id === currentCategory);
      if (!categoryExists) {
        form.setValue('category', '');
      }
    }
  }, [selectedType, form]);

  useEffect(() => {
    setIsFormReady(false);
  }, [open]);

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      // Validate form data before submitting
      if (data.type === 'transfer' && (!data.fromAccount || !data.toAccount)) {
        notifyError('Please select both from and to accounts for transfer');
        setIsLoading(false);
        return;
      }

      if (data.type === 'transfer' && data.fromAccount === data.toAccount) {
        notifyError('From and to accounts must be different');
        setIsLoading(false);
        return;
      }

      // For transfers, use 'transfer' as category if not set
      const categoryId = data.category || (data.type === 'transfer' ? 'transfer' : '');
      const categoryName = getCategoryName(categoryId, data.type);

      const payload = {
        type: data.type,
        description: data.description,
        category: categoryName,
        amount: Number(data.amount),
        date: format(data.date, 'yyyy-MM-dd'),
        notes: data.notes || undefined,
        fromAccountId: data.fromAccount || undefined,
        toAccountId: data.toAccount || undefined,
      };

      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined) fd.append(k, v === null ? '' : String(v));
      });

      const result = transaction?.id
        ? await updateTransaction(transaction.id, fd)
        : await createTransaction(fd);

      if (!result) {
        notifyError('Failed to save transaction', { description: 'No response from server' });
        setIsLoading(false);
        return;
      }

      if (result.success) {
        notifySuccess(`Transaction ${transaction?.id ? 'updated' : 'created'} successfully`);

        if (!transaction?.id && result.success && 'data' in result) {
          onSuccess?.(result.data, undefined);
        } else if (transaction?.id && result.success && 'data' in result) {
          onSuccess?.(undefined, result.data);
        }

        onOpenChange(false);
        resetForm({ type: defaultType || 'expense', ...defaultFormValues });
        // router.refresh() removed - revalidatePath in server actions + refetch() in parent is sufficient
      } else {
        notifyError('Failed to save transaction', { description: result?.error });
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      notifyError('Failed to save transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm({ type: defaultType || 'expense', ...defaultFormValues });
  };

  const handleAccountChange = (value: string, field: 'fromAccount' | 'toAccount') => {
    if (value === '__add__') {
      router.push('/accounts');
      return;
    }
    form.setValue(field, value);
    if (field === 'fromAccount' && toAccount === value) {
      form.setValue('toAccount', '');
    }
  };

  const AccountSelect = ({
    value,
    onChange,
    placeholder,
    error,
    excludeAccountId,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    error?: string | undefined;
    excludeAccountId?: string;
  }) => {
    const availableAccounts = excludeAccountId
      ? accounts.filter((account) => account.id !== excludeAccountId)
      : accounts;

    return (
      <div className="space-y-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {availableAccounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                <div className="flex items-center justify-between gap-3 w-full">
                  <span>{account.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {Number(account.balance).toLocaleString()}
                  </span>
                </div>
              </SelectItem>
            ))}
            <SelectItem value="__add__">+ Add new account</SelectItem>
          </SelectContent>
        </Select>
        {error && <FormError message={error} />}
      </div>
    );
  };

  const CategorySelect = ({
    value,
    onChange,
    error,
  }: {
    value: string;
    onChange: (value: string) => void;
    error?: string | undefined;
  }) => (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories[selectedType]?.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormError message={error} />
    </div>
  );

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

        {!isFormReady ? (
          <LoadingSpinner message="Loading..." size="default" variant="default" />
        ) : (
          <form
            onSubmit={form.handleSubmit(
              (data) => {
                // Ensure category is set for transfers before submission
                if (data.type === 'transfer' && !data.category) {
                  const transferCategory = categories.transfer[0];
                  if (transferCategory) {
                    data.category = transferCategory.id;
                  }
                }
                onSubmit(data);
              },
              () => {
                notifyError('Please fix form errors', {
                  description: 'Check all required fields are filled correctly',
                });
              },
            )}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select
                  value={selectedType}
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

            {selectedType === 'income' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="toAccount">To Account</Label>
                  <AccountSelect
                    value={toAccount || ''}
                    onChange={(value) => handleAccountChange(value, 'toAccount')}
                    placeholder="Select account"
                    error={form.formState.errors.toAccount?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <CategorySelect
                    value={form.watch('category') || ''}
                    onChange={(value) => form.setValue('category', value)}
                    error={form.formState.errors.category?.message}
                  />
                </div>
              </div>
            )}

            {selectedType === 'expense' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromAccount">From Account</Label>
                  <AccountSelect
                    value={fromAccount || ''}
                    onChange={(value) => handleAccountChange(value, 'fromAccount')}
                    placeholder="Select account"
                    error={form.formState.errors.fromAccount?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <CategorySelect
                    value={form.watch('category') || ''}
                    onChange={(value) => form.setValue('category', value)}
                    error={form.formState.errors.category?.message}
                  />
                </div>
              </div>
            )}

            {selectedType === 'transfer' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromAccount">From Account</Label>
                  <AccountSelect
                    value={fromAccount || ''}
                    onChange={(value) => handleAccountChange(value, 'fromAccount')}
                    placeholder="Select from account"
                    error={form.formState.errors.fromAccount?.message}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toAccount">To Account</Label>
                  <AccountSelect
                    value={toAccount || ''}
                    onChange={(value) => handleAccountChange(value, 'toAccount')}
                    placeholder="Select to account"
                    error={form.formState.errors.toAccount?.message}
                    excludeAccountId={fromAccount}
                  />
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
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Transaction'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
