import * as core from '@actions/core'
import {inputs as getInput} from './utils/inputs'
import {calculateDateRange} from './utils/utils'
import {
  getSecretScanningAlertsForScope,
  filterAlerts
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

    // Get the alerts for the scope provided without date filtering
    const alerts = await getSecretScanningAlertsForScope(inputs)
    core.info(`[✅] Alerts fetched`)

    // Since we're not filtering by dates, treat all fetched alerts as "new" for simplicity
    const newAlerts = alerts.filter(alert => alert.state === 'open');
    const resolvedAlerts = alerts.filter(alert => alert.state === 'resolved');
    core.debug(`All alerts are treated based on their current state without date filtering.`)

    // Continue with the rest of the original logic...
    writeToFile(inputs.new_alerts_filepath, JSON.stringify(newAlerts))
    writeToFile(inputs.closed_alerts_filepath, JSON.stringify(resolvedAlerts))
    core.info(`[✅] Alerts saved to files`)

    if (process.env.LOCAL_DEV !== 'true') {
      addToSummary('New Alerts', newAlerts)
      addToSummary('Resolved Alerts', resolvedAlerts)
      writeSummary()
    }
    core.setOutput('summary-markdown', getSummaryMarkdown())
    core.info(`[✅] Summary output completed`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
