import * as core from '@actions/core';
import { inputs as getInput } from './utils/inputs';
// import { calculateDateRange } from './utils/utils'; // Removed as not needed
import { Octokit } from "@octokit/core"; // Make sure to import Octokit
import { writeToFile } from './utils/utils';
import { addToSummary, getSummaryMarkdown, writeSummary } from './services/summary';

// Assuming Octokit is set up and authenticated elsewhere in your code
const octokit = new Octokit({ auth: `token YOUR_PERSONAL_ACCESS_TOKEN` });

async function getSecretScanningAlertsForScope(inputs) {
  let allAlerts = [];
  let currentPage = 1;
  let fetchPages = true;

  while (fetchPages) {
    const response = await octokit.request('GET /repos/{owner}/{repo}/secret-scanning/alerts', {
      owner: inputs.owner,
      repo: inputs.repo,
      per_page: 100,
      page: currentPage
    });

    allAlerts = allAlerts.concat(response.data);

    if (response.data.length < 100) {
      // If we received fewer alerts than the maximum, it means this is the last page
      fetchPages = false;
    } else {
      currentPage++; // Move to the next page
    }
  }

  return allAlerts;
}

async function run(): Promise<void> {
  try {
    const inputs = await getInput();
    core.info(`[✅] Inputs parsed`);

    // Get all the alerts for the scope provided
    const alerts = await getSecretScanningAlertsForScope(inputs);
    core.info(`[✅] All alerts fetched`);

    // Since we're fetching all alerts without filtering, we consider all alerts as "new" for simplicity
    const newAlerts = alerts;
    const resolvedAlerts = []; // Placeholder for resolved alerts if needed

    // Save alerts to file
    writeToFile(inputs.new_alerts_filepath, JSON.stringify(newAlerts));
    writeToFile(inputs.closed_alerts_filepath, JSON.stringify(resolvedAlerts));
    core.info(`[✅] Alerts saved to files`);

    // Add to summary
    if (process.env.LOCAL_DEV !== 'true') {
      addToSummary('New Alerts', newAlerts);
      // Adjusted to only include new alerts in summary
      writeSummary();
    }
    core.setOutput('summary-markdown', getSummaryMarkdown());
    core.info(`[✅] Summary output completed`);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
