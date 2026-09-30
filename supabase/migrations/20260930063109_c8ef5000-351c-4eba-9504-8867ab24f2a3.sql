ALTER TABLE public.departures ADD COLUMN departure_time time NOT NULL DEFAULT '08:00';
ALTER TABLE public.bookings ADD COLUMN reminder_status text NOT NULL DEFAULT 'pending'
  CHECK (reminder_status IN ('pending','sending','sent','failed'));
ALTER TABLE public.bookings ADD COLUMN reminder_error text;
UPDATE public.bookings SET reminder_status='sent' WHERE reminder_sent_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.reset_reminder_on_reschedule()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.departure_id IS DISTINCT FROM OLD.departure_id THEN
    NEW.reminder_status := 'pending';
    NEW.reminder_sent_at := NULL;
    NEW.reminder_error := NULL;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER bookings_reset_reminder BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.reset_reminder_on_reschedule();

-- Atomically claim bookings due for a reminder (or one specific booking).
CREATE OR REPLACE FUNCTION public.claim_due_reminders(_booking_id uuid DEFAULT NULL)
RETURNS TABLE(id uuid) LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE bookings b SET reminder_status = 'sending', reminder_error = NULL
  FROM departures d
  WHERE b.departure_id = d.id
    AND b.status = 'confirmed'
    AND (b.reminder_status IN ('pending','failed') OR (b.reminder_status='sending' AND b.updated_at < now() - interval '15 minutes'))
    AND b.customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (
      (_booking_id IS NOT NULL AND b.id = _booking_id)
      OR (_booking_id IS NULL AND b.reminder_status <> 'failed'
          AND ((d.departure_date + d.departure_time) AT TIME ZONE 'Asia/Bishkek') BETWEEN now() AND now() + interval '24 hours 30 minutes')
    )
  RETURNING b.id;
$$;
REVOKE ALL ON FUNCTION public.claim_due_reminders(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_due_reminders(uuid) TO service_role;