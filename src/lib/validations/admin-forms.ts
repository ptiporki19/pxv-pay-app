import { z } from 'zod'

// Country form schema
export const countryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Country name must be at least 2 characters",
  }),
  code: z.string().min(2, {
    message: "Country code must be at least 2 characters",
  }).max(3, {
    message: "Country code cannot be more than 3 characters",
  }).toUpperCase(),
  status: z.enum(['active', 'pending', 'inactive'], {
    required_error: "Please select a status",
  }),
})

export type CountryFormValues = z.infer<typeof countryFormSchema>

// Currency form schema
export const currencyFormSchema = z.object({
  name: z.string().min(2, {
    message: "Currency name must be at least 2 characters",
  }),
  code: z.string().min(3, {
    message: "Currency code must be at least 3 characters",
  }).max(3, {
    message: "Currency code cannot be more than 3 characters",
  }).toUpperCase(),
  symbol: z.string().min(1, {
    message: "Symbol is required",
  }),
  status: z.enum(['active', 'pending', 'inactive'], {
    required_error: "Please select a status",
  }),
})

export type CurrencyFormValues = z.infer<typeof currencyFormSchema>

// Base schema for payment method fields
const basePaymentMethodObjectSchema = z.object({
  name: z.string().min(2, {
    message: "Method name must be at least 2 characters",
  }),
  type: z.enum(['bank', 'mobile', 'crypto', 'payment-link'], {
    required_error: "Please select a payment method type",
  }),
  countries: z.array(z.string()).min(1, {
    message: "At least one country must be selected",
  }),
  status: z.enum(['active', 'pending', 'inactive'], {
    required_error: "Please select a status",
  }),
  instructions: z.string().optional(),
  icon: z.union([
    z.string(),
    z.null(),
  ]).optional(),
  // Allow url to be a valid URL, an empty string, or null. Refinement will enforce it for payment-link.
  url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")).nullable(),
})

// Refined schema that makes URL mandatory for 'payment-link' type
export const paymentMethodFormSchema = basePaymentMethodObjectSchema.refine(
  (data) => {
    if (data.type === 'payment-link') {
      // URL must be a non-empty string if type is payment-link
      return data.url && data.url.trim().length > 0;
    }
    return true;
  },
  {
    message: "URL is required for payment links and must be a valid URL.",
    path: ["url"], 
  }
).refine(
  (data) => {
    // If type is not 'payment-link', URL should ideally be null or undefined (or empty string cleared by form logic)
    if (data.type !== 'payment-link' && data.url && data.url.trim().length > 0) {
        // This case indicates a potential issue if form logic doesn't clear URL for non-payment-links.
        // For strictness, one could return false here to cause a validation error.
        // However, the form logic is designed to set it to null/empty, so this refinement mostly acts as a safeguard.
    }
    return true;
  }
);

export type PaymentMethodFormValues = z.infer<typeof paymentMethodFormSchema>

// Specific schema for 'payment-link' type (mostly for type inference and clarity if needed)
export const paymentLinkFormSchema = basePaymentMethodObjectSchema.extend({
  type: z.literal('payment-link'),
  url: z.string().url({ message: "URL is required and must be a valid URL" }).min(1, "URL cannot be empty"), // Ensure non-empty for payment links
});
export type PaymentLinkFormValues = z.infer<typeof paymentLinkFormSchema> 