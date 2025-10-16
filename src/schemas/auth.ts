import { z } from 'zod';

// Password validation regex patterns
const passwordRules = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

// Sign up schema
export const signUpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(
        passwordRules.minLength,
        `Password must be at least ${passwordRules.minLength} characters`,
      )
      .regex(passwordRules.hasUpperCase, 'Password must contain at least one uppercase letter')
      .regex(passwordRules.hasLowerCase, 'Password must contain at least one lowercase letter')
      .regex(passwordRules.hasNumber, 'Password must contain at least one number')
      .regex(
        passwordRules.hasSpecialChar,
        'Password must contain at least one special character (!@#$%^&* etc.)',
      ),
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Sign in schema
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Magic link schema
export const magicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Reset password schema
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(
        passwordRules.minLength,
        `Password must be at least ${passwordRules.minLength} characters`,
      )
      .regex(passwordRules.hasUpperCase, 'Password must contain at least one uppercase letter')
      .regex(passwordRules.hasLowerCase, 'Password must contain at least one lowercase letter')
      .regex(passwordRules.hasNumber, 'Password must contain at least one number')
      .regex(
        passwordRules.hasSpecialChar,
        'Password must contain at least one special character (!@#$%^&* etc.)',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Update profile schema
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      return val.length >= 2 && val.length <= 100;
    }, 'Full name must be between 2 and 100 characters'),
});

// Contact us schema
export const contactUsSchema = z.object({
  reason: z.string().min(1, 'Please select a reason for contacting'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Billing address schema
export const billingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

// Contact form schema (for public contact page)
export const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Help form schema (for help page contact form)
export const helpFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  reason: z.string().min(1, 'Please select a reason for contacting'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Type exports
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type MagicLinkFormData = z.infer<typeof magicLinkSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ContactUsFormData = z.infer<typeof contactUsSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
