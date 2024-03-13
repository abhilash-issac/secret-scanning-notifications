import * as core from '@actions/core';
import { inputs as getInput } from './utils/inputs';
import { calculateDateRange } from './utils/utils';
import {
  getSecretScanningAlertsForScope,
  filterAlerts,
} from './services/secretscanning';
import { writeToFile } from './utils/utils';
import {
  addToSummary,
  getSummaryMarkdown,
  writeSummary,
} from './services/summary';

async function run(): Promise<void> {
  try {
    const inputs = await getInput();
    core.info(`[✅] Inputs parsed`);

    const minimumDate = await calculateDateRange(inputs.frequency);
    core.info(`[✅] Date range calculated: ${minimumDate}`);

    let alerts = await getSecretScanningAlertsForScope(inputs);

    // Add owner and repo to each alert for summary
    alerts = alerts.map(alert => ({
      ...alert,
      org_owner: inputs.owner, // Use the captured owner
      repo_owner: inputs.repo, // Use the captured repo
    }));

    const [newAlerts, resolvedAlerts] = await filterAlerts(minimumDate, alerts);
    core.debug(`The filtered new alerts is ${JSON.stringify(newAlerts)}`);
    core.info(`[✅] Alerts parsed`);

    writeToFile(inputs.new_alerts_filepath, JSON.stringify(newAlerts));
    writeToFile(inputs.closed_alerts_filepath, JSON.stringify(resolvedAlerts));
    core.info(`[✅] Alerts saved to files`);

    if (process.env.LOCAL_DEV !== 'true') {
      addToSummary('New Alerts', newAlerts);
      addToSummary('Resolved Alerts', resolvedAlerts);
      writeSummary();
    }
    core.setOutput('summary-markdown', getSummaryMarkdown());
    core.info(`[✅] Summary output completed`);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
