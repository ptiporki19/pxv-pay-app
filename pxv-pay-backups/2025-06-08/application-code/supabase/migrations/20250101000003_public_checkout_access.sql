-- Public Checkout Access Migration
-- Allow public access to checkout links and related data for the checkout system

-- Allow public read access to checkout_links for validation
CREATE POLICY "Public can read active checkout links"
ON checkout_links FOR SELECT
USING (is_active = true);

-- Allow public read access to merchant_checkout_settings for checkout customization
CREATE POLICY "Public can read merchant checkout settings"
ON merchant_checkout_settings FOR SELECT
USING (true);

-- Allow public read access to countries for checkout form
CREATE POLICY "Public can read countries"
ON countries FOR SELECT
USING (true);

-- Allow public read access to currencies for checkout form
CREATE POLICY "Public can read currencies"
ON currencies FOR SELECT
USING (true);

-- Allow public read access to payment methods for checkout
CREATE POLICY "Public can read active payment methods"
ON payment_methods FOR SELECT
USING (status = 'active');

-- Allow public insert access to payments for checkout submissions
CREATE POLICY "Public can create payments"
ON payments FOR INSERT
WITH CHECK (true); 