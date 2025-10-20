'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormError } from '@/components/ui/form-error';
import { cn } from '@/lib/utils';
import { X, Save } from 'lucide-react';
import { createAccount, updateAccount } from '@/lib/actions/finance-actions';
import { notifySuccess, notifyError } from '@/lib/notifications';
import type { Account } from '@/types/finance.types';

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['checking', 'savings', 'creditcard', 'investment']),
  balance: z
    .string()
    .min(1, 'Balance is required')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Balance must be a valid number',
    }),
  currency: z.string().min(1, 'Currency is required'),
  color: z.string().min(1, 'Color is required'),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account;
  colors: string[];
}

const accountTypes = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'creditcard', label: 'Credit Card' },
  { value: 'investment', label: 'Investment' },
];

const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
];

export function AccountForm({ open, onOpenChange, account, colors }: AccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'checking',
      balance: '',
      currency: 'USD',
      color: colors[0],
    },
  });

  // Reset form when account changes
  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        type: account.type as 'checking' | 'savings' | 'creditcard' | 'investment',
        balance: account.balance.toString(),
        currency: account.currency,
        color: account.color || colors[0],
      });
    } else {
      form.reset({
        name: '',
        type: 'checking',
        balance: '',
        currency: 'USD',
        color: colors[0],
      });
    }
  }, [account, form, colors]);

  const onSubmit = async (data: AccountFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('balance', data.balance);
      formData.append('currency', data.currency);
      formData.append('color', data.color);

      let result;
      if (account) {
        result = await updateAccount(account.id, formData);
      } else {
        result = await createAccount(formData);
      }

      if (result.success) {
        notifySuccess(account ? 'Account updated successfully' : 'Account created successfully');
        onOpenChange(false);
        form.reset();
      } else {
        notifyError('Failed to save account', {
          description: result.error,
        });
      }
    } catch {
      notifyError('Failed to save account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  const selectedColor = form.watch('color');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Add Account'}</DialogTitle>
          <DialogDescription>
            {account
              ? 'Update your account information.'
              : 'Create a new account to track your finances.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" placeholder="Enter account name" {...form.register('name')} />
            <FormError message={form.formState.errors.name?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Account Type</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value: 'checking' | 'savings' | 'creditcard' | 'investment') =>
                  form.setValue('type', value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormError message={form.formState.errors.type?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  min={0}
                  className="pl-8"
                  {...form.register('balance')}
                />
              </div>
              <FormError message={form.formState.errors.balance?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={form.watch('currency')}
              onValueChange={(value) => form.setValue('currency', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormError message={form.formState.errors.currency?.message} />
          </div>

          <div className="space-y-3">
            <Label>Account Color</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                    selectedColor === color
                      ? 'border-gray-900 ring-2 ring-gray-300'
                      : 'border-gray-300 hover:border-gray-400',
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => form.setValue('color', color)}
                />
              ))}
            </div>
            <FormError message={form.formState.errors.color?.message} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
