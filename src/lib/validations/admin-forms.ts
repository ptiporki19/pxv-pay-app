import { z } from 'zod'

// Country form schema
export const countryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Country name must be at least 2 characters",
  }),
  code: z.string().min(2, {
    message: "Country code must be at least 2 characters",
  }).max(5, {
    message: "Country code cannot be more than 5 characters",
  }).toUpperCase(),
  currency_id: z.string().min(1, {
    message: "Currency selection is required",
  }),
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

// Custom field schema for manual payment methods
const customFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(['text', 'number', 'email', 'tel', 'textarea']),
  placeholder: z.string().optional(),
  required: z.boolean(),
  value: z.string().optional(),
})

// Country-specific details schema
const countrySpecificDetailsSchema = z.object({
  custom_fields: z.array(customFieldSchema).optional(),
  instructions: z.string().optional(),
  url: z.string().url({ message: "Please enter a valid URL starting with http:// or https://" }).optional().or(z.literal("")).nullable(),
  additional_info: z.string().optional(),
})

// Base schema for payment method fields
const basePaymentMethodObjectSchema = z.object({
  name: z.string().min(2, {
    message: "Method name must be at least 2 characters",
  }),
  type: z.enum(['manual', 'payment-link'], {
    required_error: "Please select a payment method type",
  }),
  countries: z.array(z.string()).min(1, {
    message: "At least one country must be selected",
  }),
  status: z.enum(['active', 'pending', 'inactive'], {
    required_error: "Please select a status",
  }),
  instructions: z.string().optional(),
  instructions_for_checkout: z.string().optional(),
  description: z.string().optional(),
  custom_fields: z.array(customFieldSchema).optional(),
  country_specific_details: z.record(z.string(), countrySpecificDetailsSchema).optional(),
  display_order: z.number().optional(),
  icon: z.union([
    z.string(),
    z.null(),
  ]).optional(),
  // Enhanced URL validation - must be valid URL format and non-empty for payment-link types
  url: z.union([
    z.string().url({ message: "Please enter a valid URL starting with http:// or https://" }),
    z.literal(""),
    z.null(),
    z.undefined()
  ]).optional().nullable(),
  // Image URL field for payment method images
  image_url: z.union([
    z.string().url({ message: "Please enter a valid image URL" }),
    z.literal(""),
    z.null(),
    z.undefined()
  ]).optional().nullable(),
})

// Refined schema that makes URL mandatory for 'payment-link' type with enhanced validation
export const paymentMethodFormSchema = basePaymentMethodObjectSchema.refine(
  (data) => {
    if (data.type === 'payment-link') {
      // URL must be a non-empty string and a valid URL format
      if (!data.url || data.url.trim().length === 0) {
        return false;
      }
      // Additional check to ensure it starts with http:// or https://
      const urlPattern = /^https?:\/\/.+/i;
      return urlPattern.test(data.url.trim());
    }
    return true;
  },
  {
    message: "Payment URL is required for payment links and must be a valid URL starting with http:// or https://",
    path: ["url"], 
  }
).refine(
  (data) => {
    // Enhanced validation for payment-link URLs to check for common mistakes
    if (data.type === 'payment-link' && data.url && data.url.trim().length > 0) {
      const url = data.url.trim();
      
      // Check if it's just text without proper URL format
      if (!url.includes('://')) {
        return false;
      }
      
      // Check if domain exists (basic check)
      const domainPattern = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\/?/;
      return domainPattern.test(url);
    }
    return true;
  },
  {
    message: "Please enter a complete and valid URL (e.g., https://example.com/payment)",
    path: ["url"],
  }
);

export type PaymentMethodFormValues = z.infer<typeof paymentMethodFormSchema>
export type CustomFieldType = z.infer<typeof customFieldSchema>

// Specific schema for 'payment-link' type (mostly for type inference and clarity if needed)
export const paymentLinkFormSchema = basePaymentMethodObjectSchema.extend({
  type: z.literal('payment-link'),
  url: z.string().url({ message: "URL is required and must be a valid URL" }).min(1, "URL cannot be empty"), // Ensure non-empty for payment links
});
export type PaymentLinkFormValues = z.infer<typeof paymentLinkFormSchema> 