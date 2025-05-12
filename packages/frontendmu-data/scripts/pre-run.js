// Import functions from directus-dump module
import { loadSpeakers, loadEvents, getPhotos } from "./directus-dump.js";
import { fetchSponsorsAndMeetups } from "./fetch-sponsors.js";

// Import fs module
import fs from "fs";

// Define async function for pre-build steps
async function preBuild() {
  try {
    // Load data sequentially to avoid overloading server
    const speakers = await loadSpeakers();
    const meetups = await loadEvents();
    const photos = await getPhotos();
    await fetchSponsorsAndMeetups(); // Fetch sponsors data

    // Write data to JSON files in data directory
    fs.writeFileSync("data/speakers-raw.json", JSON.stringify(speakers));
    fs.writeFileSync("data/meetups-raw.json", JSON.stringify(meetups));
    fs.writeFileSync("data/photos-raw.json", JSON.stringify(photos));
  } catch (error) {
    console.error('Error during pre-build:', error);
    process.exit(1);
  }
}

// Run the pre-build function
preBuild();
