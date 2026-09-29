ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_whatsapp text;

CREATE OR REPLACE FUNCTION public.sync_departure_spots()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  old_count int := 0; new_count int := 0; d record;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status <> 'cancelled' THEN old_count := OLD.guests; END IF;
  IF NEW.status <> 'cancelled' THEN new_count := NEW.guests; END IF;

  IF TG_OP = 'UPDATE' AND OLD.departure_id IS DISTINCT FROM NEW.departure_id THEN
    UPDATE departures SET spots_taken = GREATEST(0, spots_taken - old_count) WHERE id = OLD.departure_id;
    old_count := 0;
  END IF;

  IF new_count - old_count <> 0 THEN
    SELECT * INTO d FROM departures WHERE id = NEW.departure_id FOR UPDATE;
    IF new_count - old_count > 0 AND d.spots_taken + (new_count - old_count) > d.total_spots THEN
      RAISE EXCEPTION 'NOT_ENOUGH_SPOTS: only % spots left on this date', GREATEST(0, d.total_spots - d.spots_taken);
    END IF;
    UPDATE departures SET spots_taken = GREATEST(0, spots_taken + (new_count - old_count)) WHERE id = NEW.departure_id;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS bookings_sync_spots ON public.bookings;
CREATE TRIGGER bookings_sync_spots BEFORE INSERT OR UPDATE OF status, guests, departure_id ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.sync_departure_spots();

UPDATE public.departures d SET spots_taken = COALESCE((
  SELECT SUM(b.guests) FROM public.bookings b WHERE b.departure_id = d.id AND b.status <> 'cancelled'), 0);

DROP POLICY IF EXISTS "Departures can be updated (demo)" ON public.departures;
REVOKE UPDATE ON public.departures FROM anon, authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;