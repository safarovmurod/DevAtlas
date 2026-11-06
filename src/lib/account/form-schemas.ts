import { z } from 'zod';

// Zod rules for the account forms. They repeat the limits the inputs already
// declare (required, minLength, maxLength), so the browser and the form agree.

export type AuthMode = 'login' | 'signup' | 'reset';

// Same check as <input type="email">: something@something, no spaces.
const email = z
  .string()
  .trim()
  .max(254)
  .regex(/^[^\s@]+@[^\s@]+$/);

/** Sign in, sign up or password reset. Only the fields of the current mode are checked. */
export const authFormSchema = z
  .object({
    mode: z.enum(['login', 'signup', 'reset']),
    name: z.string().max(60),
    email,
    password: z.string().max(128),
  })
  .superRefine((values, context) => {
    if (values.mode === 'signup' && values.name.trim().length < 2)
      context.addIssue({ code: 'custom', path: ['name'], message: 'name' });
    if (values.mode === 'signup' && values.password.length < 8)
      context.addIssue({ code: 'custom', path: ['password'], message: 'password' });
    if (values.mode === 'login' && values.password.length < 1)
      context.addIssue({ code: 'custom', path: ['password'], message: 'password' });
  });

export type AuthFormValues = z.infer<typeof authFormSchema>;

/** First sign-in: the name shown on the profile. */
export const profileNameSchema = z.object({
  name: z.string().trim().min(2).max(60),
});

/** Six digit code from the authenticator app. */
export const mfaCodeSchema = z.object({
  code: z.string().regex(/^[0-9]{6}$/),
});

/** New password after the reset e-mail. A mismatch is reported on the second field. */
export const newPasswordSchema = z
  .object({
    password: z.string().min(8).max(128),
    confirm: z.string().min(1),
  })
  .refine((values) => values.password === values.confirm, {
    path: ['confirm'],
    message: 'passwordMismatch',
  });
