import fs from "fs";
import getDirectusClient from "./directus-client.js";
import { readItems } from "@directus/sdk";

async function fetchSponsorsAndMeetups() {
  const client = await getDirectusClient();

  // Fetch all events with sponsors and sponsor details
  const events = await client.request(
    readItems("Events", {
      fields: ["*.*.*"], // Fetch all fields and relations
      limit: -1,
    })
  );

  // Aggregate sponsors and their sponsored meetups
  const sponsorsMap = new Map();

  for (const event of events) {
    if (!event.sponsors || !Array.isArray(event.sponsors)) continue;
    for (const sponsorEntry of event.sponsors) {
      const sponsor = sponsorEntry.Sponsor_id;
      if (!sponsor) continue;
      const sponsorId = sponsor.id;
      if (!sponsorId) continue;
      // Compose sponsor object
      if (!sponsorsMap.has(sponsorId)) {
        sponsorsMap.set(sponsorId, {
          id: sponsor.id,
          name: sponsor.Name,
          logo: sponsor.Logo, // Directus file ID
          logomark: sponsor.logomark || null, // Directus file ID
          website: sponsor.Website || null,
          description: sponsor.Description || null,
          sponsor_type: sponsor.Sponsor_type || [],
          darkbg: sponsor.darkbg || false,
          meetups: [],
        });
      }
      // Add meetup info to sponsor
      sponsorsMap.get(sponsorId).meetups.push({
        id: event.id,
        title: event.title,
        date: event.Date,
        location: event.Location,
        venue: event.Venue,
        description: event.description,
      });
    }
  }

  // Output as array
  const sponsorsArr = Array.from(sponsorsMap.values());
  fs.writeFileSync(
    "./data/sponsors-raw.json",
    JSON.stringify(sponsorsArr, null, 2),
    "utf-8"
  );
  console.log(`Wrote ${sponsorsArr.length} sponsors to data/sponsors-raw.json`);
}

fetchSponsorsAndMeetups().catch((err) => {
  console.error("Failed to fetch sponsors:", err);
  process.exit(1);
});
