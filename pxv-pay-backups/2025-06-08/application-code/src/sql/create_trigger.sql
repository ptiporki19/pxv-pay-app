-- Create trigger function for payment status changes

-- Function to create a notification when a payment status changes
CREATE OR REPLACE FUNCTION create_payment_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_description TEXT;
BEGIN
  -- Set notification title and description based on the new status
  IF NEW.status = 'completed' THEN
    notification_title := 'Payment Completed';
    notification_description := 'Your payment of $' || NEW.amount || ' has been completed.';
  ELSIF NEW.status = 'pending' THEN
    notification_title := 'Payment Processing';
    notification_description := 'Your payment of $' || NEW.amount || ' is being processed.';
  ELSIF NEW.status = 'failed' THEN
    notification_title := 'Payment Failed';
    notification_description := 'Your payment of $' || NEW.amount || ' has failed. Please check details.';
  ELSIF NEW.status = 'refunded' THEN
    notification_title := 'Payment Refunded';
    notification_description := 'Your payment of $' || NEW.amount || ' has been refunded.';
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (title, description, type, user_id)
  VALUES (notification_title, notification_description, 'payment', NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if the function was created
SELECT pg_get_functiondef('create_payment_notification'::regproc);

-- Create the trigger (drop first if it exists)
DROP TRIGGER IF EXISTS payment_status_change_trigger ON public.payments;

CREATE TRIGGER payment_status_change_trigger
AFTER INSERT OR UPDATE OF status ON public.payments
FOR EACH ROW
EXECUTE FUNCTION create_payment_notification();

-- Verify the trigger was created
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.payments'::regclass::oid;

-- Test the trigger by inserting a new payment
INSERT INTO public.payments (amount, payment_method, status, user_id)
SELECT 
  '750.00', 
  'Mobile Money', 
  'pending', 
  id
FROM public.users 
LIMIT 1;

-- Update the payment to generate another notification
UPDATE public.payments
SET status = 'completed'
WHERE amount = '750.00';

-- View the notifications
SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 5; 