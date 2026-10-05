// Demo itinerary and packing content per tour, keyed by tour slug.
// Core tour facts (price, duration, group size, inclusions) live in the database.

export type ItineraryStep = { time: string; title: string; body: string };

export type TourExtras = {
  itinerary: ItineraryStep[];
  whatToBring: string[];
};

export const CANCELLATION_POLICY =
  "No payment is taken online, so cancelling costs nothing. Please cancel or move your date at least 48 hours before departure so the spot can go to another guest. If weather makes the route unsafe, the guide may change the route or move the trip to another date — you never pay for a trip that doesn't run.";

const baseKit = [
  "Comfortable hiking boots with good grip",
  "Warm layer and waterproof jacket — mountain weather changes fast",
  "Sun hat, sunglasses and sunscreen",
  "Reusable water bottle (1.5 L or more)",
  "Passport or ID",
  "Any personal medication",
];

const overnightKit = [
  ...baseKit,
  "Warm hat and gloves — nights are cold even in summer",
  "Headlamp",
  "Small towel and toiletries",
  "Cash in som for snacks and souvenirs",
];

const content: Record<string, TourExtras> = {
  "ala-archa-day-hike": {
    itinerary: [
      { time: "08:00", title: "Pick-up in Bishkek", body: "Meet at the meeting point and drive about 1 hour to Ala-Archa National Park." },
      { time: "09:30", title: "Hike up the valley", body: "Steady climb along the river through juniper forest, with regular breaks." },
      { time: "12:30", title: "Lunch with a view", body: "Picnic lunch near the turnaround point below the glacier views." },
      { time: "14:00", title: "Descent", body: "Walk back down the same trail at a relaxed pace." },
      { time: "17:30", title: "Back in Bishkek", body: "Drop-off at the meeting point." },
    ],
    whatToBring: baseKit,
  },
  "song-kul-adventure": {
    itinerary: [
      { time: "Day 1", title: "Bishkek to Song-Kul", body: "Drive through Kochkor and over the Kalmak-Ashuu pass to the lake. Settle into the yurt camp." },
      { time: "Day 1 evening", title: "Life on the jailoo", body: "Short walk along the shore, dinner with the herding family hosting the camp." },
      { time: "Day 2", title: "Lakeshore walk and return", body: "Morning walk or optional horse ride, then drive back to Bishkek by evening." },
    ],
    whatToBring: overnightKit,
  },
  "kel-suu-adventure": {
    itinerary: [
      { time: "Day 1", title: "Bishkek to Naryn region", body: "Long scenic drive south, overnight in a guesthouse." },
      { time: "Day 2", title: "Drive to the Kel-Suu valley", body: "Off-road drive towards the border zone and camp near the lake." },
      { time: "Day 3", title: "Kel-Suu lake", body: "Walk to the lake and explore the narrow gorge, return to camp." },
      { time: "Day 4", title: "Return to Bishkek", body: "Drive back north, arriving in the evening." },
    ],
    whatToBring: [...overnightKit, "Passport is required — the area needs a border permit, which we arrange"],
  },
  "altyn-arashan-escape": {
    itinerary: [
      { time: "Day 1", title: "Bishkek to Karakol", body: "Drive along Issyk-Kul to Karakol, then up the valley to Altyn-Arashan." },
      { time: "Day 1 evening", title: "Hot springs", body: "Soak in the hot spring pools and overnight in a mountain guesthouse." },
      { time: "Day 2", title: "Valley hike", body: "Hike up the valley towards views of Palatka peak." },
      { time: "Day 3", title: "Return", body: "Walk down to the road and drive back to Bishkek." },
    ],
    whatToBring: [...overnightKit, "Swimwear for the hot springs"],
  },
  "jyrgalan-mountain-trek": {
    itinerary: [
      { time: "Day 1", title: "Bishkek to Jyrgalan", body: "Drive east past Issyk-Kul to the village of Jyrgalan. Guesthouse night." },
      { time: "Day 2", title: "Into the hills", body: "Trek over grassy ridges to a high camp." },
      { time: "Day 3", title: "Pass day", body: "The longest day: cross a high pass with wide Tian Shan views, descend to camp." },
      { time: "Day 4", title: "Valley descent", body: "Easier walk back down to the village." },
      { time: "Day 5", title: "Return to Bishkek", body: "Drive back, arriving in the evening." },
    ],
    whatToBring: [...overnightKit, "Trekking poles (recommended)", "Personal sleeping bag liner"],
  },
  "issyk-kul-mountain-escape": {
    itinerary: [
      { time: "Day 1", title: "Bishkek to the north shore", body: "Drive to Issyk-Kul, afternoon on the beach and a lakeside guesthouse." },
      { time: "Day 2", title: "Gorge walk", body: "Easy walk in one of the gorges above the lake, back for an evening swim." },
      { time: "Day 3", title: "Return", body: "Slow morning by the lake and drive back to Bishkek." },
    ],
    whatToBring: [...baseKit, "Swimwear"],
  },
};

export function tourExtras(slug: string): TourExtras {
  return content[slug] ?? { itinerary: [], whatToBring: baseKit };
}
