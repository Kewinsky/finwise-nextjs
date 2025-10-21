import { z } from 'zod';

// Profile schema (for profile forms)
export const profileSchema = z.object({
  fullName: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      return val.length >= 2 && val.length <= 100;
    }, 'Full name must be between 2 and 100 characters'),
});

// Type export
export type ProfileFormData = z.infer<typeof profileSchema>;
