import * as core from '@actions/core'
import {inputs as getInput} from './utils/inputs'
// Removed import for calculateDateRange as it's not needed anymore
import {
  getSecretScanningAlertsForScope,
  // Removed filterAlerts import since we won't filter by date anymore
} from './services/secretscanning'
import {writeToFile} from './utils/utils'
import {
  addToSummary,
  getSummaryMarkdown,
  writeSummary
} from './services/summary'

async function run(): Promise<void> {
  try {
    // Get inputs
    const inputs = await getInput()
    core.info(`[✅] Inputs parsed`)

    // Removed date range calculation as it's not needed

    // Get the alerts for the scope provided
    const alerts = await getSecretScanningAlertsForScope(inputs)

    // Since we're not filtering by date, all alerts are considered "new"
    const newAlerts = alerts;
    // Assume there are no resolved alerts since we're not filtering
    const resolvedAlerts = []; 

    // Log alerts (removed filtering log)
    core.debug(`All alerts: ${JSON.stringify(newAlerts)}`)
    core.info(`[✅] Alerts fetched`)

    // Save newAlerts (and resolvedAlerts, if any) to file
    writeToFile(inputs.new_alerts_filepath, JSON.stringify(newAlerts))
    writeToFile(inputs.closed_alerts_filepath, JSON.stringify(resolvedAlerts))
    core.info(`[✅] Alerts saved to files`)

    // Print results as Action summary and set it as `summary-markdown` output
    if (process.env.LOCAL_DEV !== 'true') {
      addToSummary('Alerts', newAlerts)
      // Since resolved alerts are not filtered, you might not add them or adjust accordingly
      writeSummary()
    }
    core.setOutput('summary-markdown', getSummaryMarkdown())
    core.info(`[✅] Summary output completed`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

