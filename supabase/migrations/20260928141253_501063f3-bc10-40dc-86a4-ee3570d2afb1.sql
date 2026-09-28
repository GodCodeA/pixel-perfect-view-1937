CREATE TABLE public.tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  summary text NOT NULL,
  description text NOT NULL,
  region text NOT NULL,
  difficulty text NOT NULL,
  duration_days integer NOT NULL DEFAULT 1,
  price_per_person integer NOT NULL,
  max_group_size integer NOT NULL DEFAULT 8,
  highlights text[] NOT NULL DEFAULT '{}',
  included text[] NOT NULL DEFAULT '{}',
  not_included text[] NOT NULL DEFAULT '{}',
  meeting_point text NOT NULL DEFAULT 'Bishkek city centre',
  image_key text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.departures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  departure_date date NOT NULL,
  total_spots integer NOT NULL DEFAULT 8,
  spots_taken integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tour_id, departure_date)
);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  departure_id uuid NOT NULL REFERENCES public.departures(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  total_price integer NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'confirmed',
  reminder_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_departures_tour ON public.departures(tour_id, departure_date);
CREATE INDEX idx_bookings_departure ON public.bookings(departure_id);

GRANT SELECT ON public.tours TO anon, authenticated;
GRANT ALL ON public.tours TO service_role;
GRANT SELECT, UPDATE ON public.departures TO anon, authenticated;
GRANT ALL ON public.departures TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.bookings TO anon, authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tours are publicly readable" ON public.tours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Departures are publicly readable" ON public.departures FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Departures can be updated (demo)" ON public.departures FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Bookings are readable (demo)" ON public.bookings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Bookings can be created (demo)" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Bookings can be updated (demo)" ON public.bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.tours (slug, name, summary, description, region, difficulty, duration_days, price_per_person, max_group_size, highlights, included, not_included, meeting_point, image_key, sort_order) VALUES
('ala-archa-day-hike', 'Ala-Archa Day Hike', 'A crisp alpine day in the gorge on Bishkek''s doorstep.', 'Forty minutes from the city, the Ala-Archa gorge opens into pine forest, glacier-fed rivers and granite walls. We walk the Ak-Sai trail to the waterfall viewpoint, stop for lunch above the treeline, and are back in Bishkek by early evening. A perfect first taste of the Kyrgyz mountains.', 'Chuy', 'Easy', 1, 55, 10, ARRAY['Ak-Sai waterfall viewpoint','Glacier river crossings','Picnic lunch above the treeline'], ARRAY['Round-trip transport from Bishkek','English-speaking mountain guide','Park entrance fee','Picnic lunch and tea'], ARRAY['Personal gear','Travel insurance','Tips'], 'Ala-Too Square, Bishkek — 07:30', 'ala-archa', 1),
('song-kul-adventure', 'Song-Kul Adventure', 'Two nights in a yurt camp beside a high alpine lake.', 'Song-Kul sits at 3,016 m, ringed by summer pastures where herder families still move their yurts each season. We drive over the Kalmak-Ashuu pass, ride horses along the shoreline, eat with a shepherd family and sleep under one of the clearest skies in Central Asia.', 'Naryn', 'Moderate', 3, 285, 8, ARRAY['Two nights in a traditional yurt camp','Horse riding on the jailoo','Unbelievable night skies'], ARRAY['Private transport','Guide','2 nights yurt accommodation','All meals','Horse riding session'], ARRAY['Sleeping bag (rental available)','Alcohol','Tips'], 'Your Bishkek accommodation — 07:00', 'song-kul', 2),
('kel-suu-adventure', 'Kel-Suu Adventure', 'A remote border-zone lake between vertical cliffs.', 'Kel-Suu is the trip people come back for. Four days deep into Naryn province, through the Kok-Kiya valley and into a restricted border zone, ending at a fjord-like lake walled by rock. Permits, camp and logistics are all handled — you just walk.', 'Naryn', 'Challenging', 4, 520, 6, ARRAY['Border-zone permit arranged for you','Fjord-like lake beneath vertical cliffs','Wild camping in Kok-Kiya valley'], ARRAY['4x4 transport','Border permit','Guide and cook','Camping equipment','All meals'], ARRAY['Personal trekking gear','Insurance','Tips'], 'Your Bishkek accommodation — 06:30', 'kel-suu', 3),
('altyn-arashan-escape', 'Altyn-Arashan Escape', 'Hot springs, wooden cabins and a valley of snow peaks.', 'A rough uphill track from Karakol leads to Altyn-Arashan — "golden spa" — where thermal pools sit beside a glacial river. Two days of walking, soaking and slow evenings in a guesthouse with a wood stove.', 'Issyk-Kul', 'Moderate', 2, 190, 8, ARRAY['Natural hot spring soak','Valley walk towards Ala-Kul pass','Wood-fired guesthouse dinner'], ARRAY['Transport from Karakol','Guide','1 night guesthouse','Meals','Hot spring access'], ARRAY['Transport Bishkek–Karakol','Insurance','Tips'], 'Karakol central mosque — 09:00', 'altyn-arashan', 4),
('jyrgalan-mountain-trek', 'Jyrgalan Mountain Trek', 'Ridge walking through a former coal village turned trekking hub.', 'Jyrgalan is green, quiet and criss-crossed with ridge trails. Three days of walking between village guesthouses, over the Boz-Uchuk lakes and along flower-covered ridgelines with the Terskey Ala-Too always on the horizon.', 'Issyk-Kul', 'Moderate', 3, 260, 8, ARRAY['Boz-Uchuk alpine lakes','Community guesthouse stays','Wildflower ridgelines in June–July'], ARRAY['Guide','2 nights guesthouse','All meals','Luggage transfer between villages'], ARRAY['Transport to Jyrgalan','Insurance','Tips'], 'Jyrgalan village square — 09:00', 'jyrgalan', 5),
('issyk-kul-mountain-escape', 'Issyk-Kul & Mountain Escape', 'Lake shore mornings, mountain afternoons.', 'A relaxed five-day loop around the world''s second-largest alpine lake: Skazka canyon, Jeti-Oguz red rocks, a night in Karakol and long afternoons on the quiet southern shore. Good for families and anyone who wants mountains without long trekking days.', 'Issyk-Kul', 'Easy', 5, 430, 10, ARRAY['Skazka (Fairytale) canyon','Jeti-Oguz red rock formations','Southern shore swimming stops'], ARRAY['Private transport for 5 days','Guide','4 nights accommodation','Breakfast and dinner','All entrance fees'], ARRAY['Lunches','Insurance','Tips'], 'Your Bishkek accommodation — 08:00', 'issyk-kul', 6);

INSERT INTO public.departures (tour_id, departure_date, total_spots, spots_taken)
SELECT t.id,
       (CURRENT_DATE + (g.n * (CASE WHEN t.duration_days > 2 THEN 7 ELSE 3 END) + t.sort_order))::date,
       t.max_group_size,
       LEAST(t.max_group_size, ((g.n * 3 + t.sort_order) % (t.max_group_size + 1)))
FROM public.tours t
CROSS JOIN generate_series(1, 8) AS g(n);

INSERT INTO public.bookings (tour_id, departure_id, customer_name, customer_email, customer_phone, guests, total_price, status, notes, created_at)
SELECT d.tour_id, d.id, c.name, c.email, c.phone, c.guests, c.guests * t.price_per_person, c.status, c.notes, now() - (c.rn || ' days')::interval
FROM (
  VALUES
    (1, 'Marta Kowalski', 'marta.kowalski@example.com', '+48 601 224 118', 2, 'confirmed', 'Vegetarian meals please'),
    (2, 'Daniel Reyes', 'daniel.reyes@example.com', '+34 655 902 331', 1, 'confirmed', NULL),
    (3, 'Yuki Tanaka', 'yuki.tanaka@example.com', '+81 90 4412 8830', 4, 'confirmed', 'Family with two teenagers'),
    (4, 'Sophie Laurent', 'sophie.laurent@example.com', '+33 6 41 77 20 55', 2, 'pending', 'Asked about sleeping bag rental'),
    (5, 'Tom Whitfield', 'tom.whitfield@example.com', '+44 7700 900412', 3, 'confirmed', NULL),
    (6, 'Aida Osmonova', 'aida.osmonova@example.com', '+996 555 331 204', 2, 'cancelled', 'Cancelled — flight changed')
) AS c(rn, name, email, phone, guests, status, notes)
JOIN LATERAL (
  SELECT d.* FROM public.departures d
  JOIN public.tours tt ON tt.id = d.tour_id
  WHERE tt.sort_order = c.rn AND d.departure_date >= CURRENT_DATE
  ORDER BY d.departure_date LIMIT 1
) d ON true
JOIN public.tours t ON t.id = d.tour_id;