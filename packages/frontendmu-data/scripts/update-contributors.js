import fs from "fs";
import { execSync } from "child_process";

const owner = "frontendmu";
const branch = "main"; // Replace with the default branch of your repository

const contributorsFile = "./data/contributors.json";
const configSource = `https://raw.githubusercontent.com/${owner}/frontend.mu/${branch}/packages/frontendmu-data/scripts/update-contributors.config.json`

async function updateContributors() {
  try {
    const config = await loadConfig();
    const includedRepositories = config.includedRepositories;
    const excludedContributors = config.excludedContributors;

    const allPublicRepositoriesList = await fetch(
      `https://api.github.com/users/${owner}/repos`
    ).then((response) => response.json());

    const allPublicRepositories = allPublicRepositoriesList.map(
      (repo) => repo.name
    );

    const contributorsMap = {};

    for (const repo of allPublicRepositories) {
      if (!includedRepositories.includes(repo)) {
        continue;
      }
      const contributorsList = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors`
      ).then((response) => response.json());

      contributorsList.forEach((contributor) => {
        if (!excludedContributors.includes(contributor.login)) {
          if (contributorsMap[contributor.login]) {
            contributorsMap[contributor.login] += contributor.contributions;
          } else {
            contributorsMap[contributor.login] = contributor.contributions;
          }
        }
      });
    }
    const updatedContributors = Object.entries(contributorsMap).map(([username, contributions]) => ({
      username,
      contributions
    }));
    const contributorsData = JSON.stringify(updatedContributors, null, 2);

    console.log(contributorsData)

    if (
      JSON.stringify(updatedContributors) !==
      JSON.stringify(getExistingContributors())
    ) {
      fs.writeFileSync(
        contributorsFile,
        contributorsData
      );

      // Configure Git user and email for the commit
      execSync('git config user.name "GitHub Action"');
      execSync('git config user.email "action@github.com"');

      // Stage the changes
      execSync("git add .");

      // Create the commit
      execSync(`git commit -m "Update contributors.json [skip ci]"`);

      // Push the changes to the repository
      execSync(`git push origin ${branch}`);

      console.log("Changes committed and pushed to the repository.");
    } else {
      console.log(
        "No changes detected in contributors. Skipping commit and push."
      );
    }
  } catch (error) {
    console.error("Error updating contributors:", error);
  }
}

function getExistingContributors() {
  if (fs.existsSync(contributorsFile)) {
    return JSON.parse(fs.readFileSync(contributorsFile));
  }
  return [];
}

async function loadConfig() {
  return await fetch(configSource).then((response) => response.json());
}

updateContributors();
