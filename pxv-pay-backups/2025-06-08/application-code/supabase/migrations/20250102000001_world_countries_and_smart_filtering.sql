-- Migration: World Countries Import and Smart Filtering
-- Purpose: Import all world countries with their currencies and remove currency dependencies for checkout links

-- Remove currency foreign key constraint from countries table if it exists
ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_currency_id_fkey;

-- Clear existing global data to start fresh
DELETE FROM countries WHERE user_id IS NULL;
DELETE FROM currencies WHERE user_id IS NULL;

-- First, insert all world currencies (global data with user_id = NULL)
INSERT INTO currencies (user_id, name, code, symbol, status) VALUES
-- Major Currencies
(NULL, 'US Dollar', 'USD', '$', 'active'),
(NULL, 'Euro', 'EUR', '€', 'active'),
(NULL, 'British Pound', 'GBP', '£', 'active'),
(NULL, 'Japanese Yen', 'JPY', '¥', 'active'),
(NULL, 'Chinese Yuan', 'CNY', '¥', 'active'),
(NULL, 'Canadian Dollar', 'CAD', 'C$', 'active'),
(NULL, 'Australian Dollar', 'AUD', 'A$', 'active'),
(NULL, 'Swiss Franc', 'CHF', 'CHF', 'active'),
(NULL, 'Swedish Krona', 'SEK', 'kr', 'active'),
(NULL, 'Norwegian Krone', 'NOK', 'kr', 'active'),
(NULL, 'Danish Krone', 'DKK', 'kr', 'active'),
-- Asian Currencies
(NULL, 'Indian Rupee', 'INR', '₹', 'active'),
(NULL, 'Singapore Dollar', 'SGD', 'S$', 'active'),
(NULL, 'Hong Kong Dollar', 'HKD', 'HK$', 'active'),
(NULL, 'South Korean Won', 'KRW', '₩', 'active'),
(NULL, 'Thai Baht', 'THB', '฿', 'active'),
(NULL, 'Malaysian Ringgit', 'MYR', 'RM', 'active'),
(NULL, 'Indonesian Rupiah', 'IDR', 'Rp', 'active'),
(NULL, 'Philippine Peso', 'PHP', '₱', 'active'),
(NULL, 'Vietnamese Dong', 'VND', '₫', 'active'),
(NULL, 'Pakistani Rupee', 'PKR', '₨', 'active'),
(NULL, 'Bangladeshi Taka', 'BDT', '৳', 'active'),
(NULL, 'Sri Lankan Rupee', 'LKR', 'Rs', 'active'),
(NULL, 'Nepalese Rupee', 'NPR', 'Rs', 'active'),
-- Middle Eastern Currencies
(NULL, 'UAE Dirham', 'AED', 'د.إ', 'active'),
(NULL, 'Saudi Riyal', 'SAR', '﷼', 'active'),
(NULL, 'Qatari Riyal', 'QAR', '﷼', 'active'),
(NULL, 'Kuwaiti Dinar', 'KWD', 'د.ك', 'active'),
(NULL, 'Bahraini Dinar', 'BHD', '.د.ب', 'active'),
(NULL, 'Omani Rial', 'OMR', '﷼', 'active'),
(NULL, 'Israeli Shekel', 'ILS', '₪', 'active'),
(NULL, 'Turkish Lira', 'TRY', '₺', 'active'),
(NULL, 'Iranian Rial', 'IRR', '﷼', 'active'),
(NULL, 'Lebanese Pound', 'LBP', 'ل.ل', 'active'),
(NULL, 'Jordanian Dinar', 'JOD', 'د.ا', 'active'),
-- African Currencies
(NULL, 'South African Rand', 'ZAR', 'R', 'active'),
(NULL, 'Nigerian Naira', 'NGN', '₦', 'active'),
(NULL, 'Kenyan Shilling', 'KES', 'KSh', 'active'),
(NULL, 'Ghanaian Cedi', 'GHS', 'GH₵', 'active'),
(NULL, 'Egyptian Pound', 'EGP', 'E£', 'active'),
(NULL, 'Moroccan Dirham', 'MAD', 'د.م.', 'active'),
(NULL, 'Tunisian Dinar', 'TND', 'د.ت', 'active'),
(NULL, 'Algerian Dinar', 'DZD', 'د.ج', 'active'),
(NULL, 'Ethiopian Birr', 'ETB', 'Br', 'active'),
(NULL, 'Ugandan Shilling', 'UGX', 'USh', 'active'),
(NULL, 'Tanzanian Shilling', 'TZS', 'TSh', 'active'),
(NULL, 'Rwandan Franc', 'RWF', 'RF', 'active'),
(NULL, 'Zambian Kwacha', 'ZMW', 'ZK', 'active'),
(NULL, 'Botswana Pula', 'BWP', 'P', 'active'),
-- Latin American Currencies
(NULL, 'Mexican Peso', 'MXN', '$', 'active'),
(NULL, 'Brazilian Real', 'BRL', 'R$', 'active'),
(NULL, 'Argentine Peso', 'ARS', '$', 'active'),
(NULL, 'Chilean Peso', 'CLP', '$', 'active'),
(NULL, 'Colombian Peso', 'COP', '$', 'active'),
(NULL, 'Peruvian Sol', 'PEN', 'S/', 'active'),
(NULL, 'Uruguayan Peso', 'UYU', '$U', 'active'),
(NULL, 'Paraguayan Guarani', 'PYG', '₲', 'active'),
(NULL, 'Venezuelan Bolívar', 'VES', 'Bs', 'active'),
(NULL, 'Costa Rican Colón', 'CRC', '₡', 'active'),
(NULL, 'Guatemalan Quetzal', 'GTQ', 'Q', 'active'),
(NULL, 'Panamanian Balboa', 'PAB', 'B/.', 'active'),
(NULL, 'Jamaican Dollar', 'JMD', 'J$', 'active'),
(NULL, 'Dominican Peso', 'DOP', 'RD$', 'active'),
(NULL, 'Ecuadorian Sucre', 'ECS', 'S/.', 'active'),
-- European Currencies (non-Euro)
(NULL, 'Polish Zloty', 'PLN', 'zł', 'active'),
(NULL, 'Czech Koruna', 'CZK', 'Kč', 'active'),
(NULL, 'Hungarian Forint', 'HUF', 'Ft', 'active'),
(NULL, 'Romanian Leu', 'RON', 'lei', 'active'),
(NULL, 'Bulgarian Lev', 'BGN', 'лв', 'active'),
(NULL, 'Croatian Kuna', 'HRK', 'kn', 'active'),
(NULL, 'Serbian Dinar', 'RSD', 'дин', 'active'),
(NULL, 'Ukrainian Hryvnia', 'UAH', '₴', 'active'),
(NULL, 'Russian Ruble', 'RUB', '₽', 'active'),
(NULL, 'Icelandic Krona', 'ISK', 'kr', 'active'),
-- Other Currencies
(NULL, 'New Zealand Dollar', 'NZD', 'NZ$', 'active'),
(NULL, 'Fijian Dollar', 'FJD', 'FJ$', 'active'),
(NULL, 'Papua New Guinea Kina', 'PGK', 'K', 'active'),
(NULL, 'Brunei Dollar', 'BND', 'B$', 'active'),
(NULL, 'Cambodian Riel', 'KHR', '៛', 'active'),
(NULL, 'Laotian Kip', 'LAK', '₭', 'active'),
(NULL, 'Myanmar Kyat', 'MMK', 'K', 'active'),
(NULL, 'Mongolian Tugrik', 'MNT', '₮', 'active'),
(NULL, 'Maldivian Rufiyaa', 'MVR', 'Rf', 'active'),
(NULL, 'Afghan Afghani', 'AFN', '؋', 'active'),
(NULL, 'Kazakhstan Tenge', 'KZT', '₸', 'active'),
(NULL, 'Uzbekistan Som', 'UZS', 'сўм', 'active'),
(NULL, 'Georgian Lari', 'GEL', '₾', 'active'),
(NULL, 'Azerbaijani Manat', 'AZN', '₼', 'active');

-- Add currency_code column to countries table (without foreign key constraint)
ALTER TABLE countries ADD COLUMN IF NOT EXISTS currency_code TEXT;

-- Insert all world countries with their respective currencies (global data with user_id = NULL)
INSERT INTO countries (user_id, name, code, currency_code, status) VALUES
-- Major Countries (A-C)
(NULL, 'Afghanistan', 'AF', 'AFN', 'active'),
(NULL, 'Albania', 'AL', 'EUR', 'active'),
(NULL, 'Algeria', 'DZ', 'DZD', 'active'),
(NULL, 'Argentina', 'AR', 'ARS', 'active'),
(NULL, 'Australia', 'AU', 'AUD', 'active'),
(NULL, 'Austria', 'AT', 'EUR', 'active'),
(NULL, 'Bangladesh', 'BD', 'BDT', 'active'),
(NULL, 'Belgium', 'BE', 'EUR', 'active'),
(NULL, 'Brazil', 'BR', 'BRL', 'active'),
(NULL, 'Canada', 'CA', 'CAD', 'active'),
(NULL, 'China', 'CN', 'CNY', 'active'),
(NULL, 'Colombia', 'CO', 'COP', 'active'),
-- Major Countries (D-H)
(NULL, 'Denmark', 'DK', 'DKK', 'active'),
(NULL, 'Egypt', 'EG', 'EGP', 'active'),
(NULL, 'Finland', 'FI', 'EUR', 'active'),
(NULL, 'France', 'FR', 'EUR', 'active'),
(NULL, 'Germany', 'DE', 'EUR', 'active'),
(NULL, 'Ghana', 'GH', 'GHS', 'active'),
(NULL, 'Greece', 'GR', 'EUR', 'active'),
(NULL, 'Hong Kong', 'HK', 'HKD', 'active'),
-- Major Countries (I-M)
(NULL, 'India', 'IN', 'INR', 'active'),
(NULL, 'Indonesia', 'ID', 'IDR', 'active'),
(NULL, 'Ireland', 'IE', 'EUR', 'active'),
(NULL, 'Israel', 'IL', 'ILS', 'active'),
(NULL, 'Italy', 'IT', 'EUR', 'active'),
(NULL, 'Japan', 'JP', 'JPY', 'active'),
(NULL, 'Kenya', 'KE', 'KES', 'active'),
(NULL, 'Malaysia', 'MY', 'MYR', 'active'),
(NULL, 'Mexico', 'MX', 'MXN', 'active'),
-- Major Countries (N-R)
(NULL, 'Netherlands', 'NL', 'EUR', 'active'),
(NULL, 'New Zealand', 'NZ', 'NZD', 'active'),
(NULL, 'Nigeria', 'NG', 'NGN', 'active'),
(NULL, 'Norway', 'NO', 'NOK', 'active'),
(NULL, 'Pakistan', 'PK', 'PKR', 'active'),
(NULL, 'Philippines', 'PH', 'PHP', 'active'),
(NULL, 'Poland', 'PL', 'PLN', 'active'),
(NULL, 'Portugal', 'PT', 'EUR', 'active'),
(NULL, 'Russia', 'RU', 'RUB', 'active'),
-- Major Countries (S-Z)
(NULL, 'Saudi Arabia', 'SA', 'SAR', 'active'),
(NULL, 'Singapore', 'SG', 'SGD', 'active'),
(NULL, 'South Africa', 'ZA', 'ZAR', 'active'),
(NULL, 'South Korea', 'KR', 'KRW', 'active'),
(NULL, 'Spain', 'ES', 'EUR', 'active'),
(NULL, 'Sweden', 'SE', 'SEK', 'active'),
(NULL, 'Switzerland', 'CH', 'CHF', 'active'),
(NULL, 'Thailand', 'TH', 'THB', 'active'),
(NULL, 'Turkey', 'TR', 'TRY', 'active'),
(NULL, 'United Arab Emirates', 'AE', 'AED', 'active'),
(NULL, 'United Kingdom', 'GB', 'GBP', 'active'),
(NULL, 'United States', 'US', 'USD', 'active'),
(NULL, 'Vietnam', 'VN', 'VND', 'active'),
-- Additional African Countries
(NULL, 'Angola', 'AO', 'USD', 'active'),
(NULL, 'Botswana', 'BW', 'BWP', 'active'),
(NULL, 'Cameroon', 'CM', 'EUR', 'active'),
(NULL, 'Democratic Republic of Congo', 'CD', 'USD', 'active'),
(NULL, 'Ethiopia', 'ET', 'ETB', 'active'),
(NULL, 'Ivory Coast', 'CI', 'EUR', 'active'),
(NULL, 'Madagascar', 'MG', 'USD', 'active'),
(NULL, 'Morocco', 'MA', 'MAD', 'active'),
(NULL, 'Mozambique', 'MZ', 'USD', 'active'),
(NULL, 'Rwanda', 'RW', 'RWF', 'active'),
(NULL, 'Senegal', 'SN', 'EUR', 'active'),
(NULL, 'Tanzania', 'TZ', 'TZS', 'active'),
(NULL, 'Tunisia', 'TN', 'TND', 'active'),
(NULL, 'Uganda', 'UG', 'UGX', 'active'),
(NULL, 'Zambia', 'ZM', 'ZMW', 'active'),
(NULL, 'Zimbabwe', 'ZW', 'USD', 'active'),
-- Additional Asian Countries
(NULL, 'Cambodia', 'KH', 'KHR', 'active'),
(NULL, 'Iran', 'IR', 'IRR', 'active'),
(NULL, 'Iraq', 'IQ', 'USD', 'active'),
(NULL, 'Jordan', 'JO', 'JOD', 'active'),
(NULL, 'Kazakhstan', 'KZ', 'KZT', 'active'),
(NULL, 'Kuwait', 'KW', 'KWD', 'active'),
(NULL, 'Lebanon', 'LB', 'LBP', 'active'),
(NULL, 'Myanmar', 'MM', 'MMK', 'active'),
(NULL, 'Nepal', 'NP', 'NPR', 'active'),
(NULL, 'Oman', 'OM', 'OMR', 'active'),
(NULL, 'Qatar', 'QA', 'QAR', 'active'),
(NULL, 'Sri Lanka', 'LK', 'LKR', 'active'),
(NULL, 'Syria', 'SY', 'USD', 'active'),
(NULL, 'Taiwan', 'TW', 'USD', 'active'),
(NULL, 'Uzbekistan', 'UZ', 'UZS', 'active'),
(NULL, 'Yemen', 'YE', 'USD', 'active'),
-- Additional European Countries
(NULL, 'Bulgaria', 'BG', 'BGN', 'active'),
(NULL, 'Croatia', 'HR', 'EUR', 'active'),
(NULL, 'Czech Republic', 'CZ', 'CZK', 'active'),
(NULL, 'Estonia', 'EE', 'EUR', 'active'),
(NULL, 'Hungary', 'HU', 'HUF', 'active'),
(NULL, 'Iceland', 'IS', 'ISK', 'active'),
(NULL, 'Latvia', 'LV', 'EUR', 'active'),
(NULL, 'Lithuania', 'LT', 'EUR', 'active'),
(NULL, 'Luxembourg', 'LU', 'EUR', 'active'),
(NULL, 'Malta', 'MT', 'EUR', 'active'),
(NULL, 'Romania', 'RO', 'RON', 'active'),
(NULL, 'Serbia', 'RS', 'RSD', 'active'),
(NULL, 'Slovakia', 'SK', 'EUR', 'active'),
(NULL, 'Slovenia', 'SI', 'EUR', 'active'),
(NULL, 'Ukraine', 'UA', 'UAH', 'active'),
-- Additional Americas Countries
(NULL, 'Chile', 'CL', 'CLP', 'active'),
(NULL, 'Costa Rica', 'CR', 'CRC', 'active'),
(NULL, 'Cuba', 'CU', 'USD', 'active'),
(NULL, 'Dominican Republic', 'DO', 'DOP', 'active'),
(NULL, 'Ecuador', 'EC', 'USD', 'active'),
(NULL, 'Guatemala', 'GT', 'GTQ', 'active'),
(NULL, 'Haiti', 'HT', 'USD', 'active'),
(NULL, 'Honduras', 'HN', 'USD', 'active'),
(NULL, 'Jamaica', 'JM', 'JMD', 'active'),
(NULL, 'Nicaragua', 'NI', 'USD', 'active'),
(NULL, 'Panama', 'PA', 'PAB', 'active'),
(NULL, 'Paraguay', 'PY', 'PYG', 'active'),
(NULL, 'Peru', 'PE', 'PEN', 'active'),
(NULL, 'Uruguay', 'UY', 'UYU', 'active'),
(NULL, 'Venezuela', 'VE', 'VES', 'active'),
-- Additional Oceania Countries
(NULL, 'Fiji', 'FJ', 'FJD', 'active'),
(NULL, 'Papua New Guinea', 'PG', 'PGK', 'active'),
-- Additional Countries
(NULL, 'Bahrain', 'BH', 'BHD', 'active'),
(NULL, 'Brunei', 'BN', 'BND', 'active'),
(NULL, 'Cyprus', 'CY', 'EUR', 'active'),
(NULL, 'Georgia', 'GE', 'GEL', 'active'),
(NULL, 'Laos', 'LA', 'LAK', 'active'),
(NULL, 'Maldives', 'MV', 'MVR', 'active'),
(NULL, 'Mongolia', 'MN', 'MNT', 'active'),
(NULL, 'Montenegro', 'ME', 'EUR', 'active'),
(NULL, 'North Macedonia', 'MK', 'EUR', 'active');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS countries_global_idx ON countries(code) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS countries_currency_idx ON countries(currency_code);
CREATE INDEX IF NOT EXISTS currencies_global_idx ON currencies(code) WHERE user_id IS NULL;

-- Add comment
COMMENT ON TABLE countries IS 'Countries table with global country data (user_id = NULL) for worldwide coverage with proper currencies';
COMMENT ON TABLE currencies IS 'Currencies table with global currency data (user_id = NULL) for worldwide coverage';

-- Grant appropriate permissions
GRANT SELECT ON countries TO authenticated;
GRANT SELECT ON countries TO anon;
GRANT SELECT ON currencies TO authenticated;
GRANT SELECT ON currencies TO anon; 