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

    // Calculate date range
    const minimumDate = await calculateDateRange(inputs.frequency)
    core.info(`[✅] Date range calculated: ${minimumDate}`)

    // Get the alerts for the scope provided
    const alerts = await getSecretScanningAlertsForScope(inputs)

    // Filter new alerts created after the minimum date and before the current date
    const [newAlerts, resolvedAlerts] = await filterAlerts(minimumDate, alerts)

    // Log filtered resolved alerts
    core.debug(
      `The filtered resolved alrets is ${JSON.stringify(resolvedAlerts)}`
    )
    core.debug(`The filtered new alerts is ${JSON.stringify(newAlerts)}`)
    core.info(`[✅] Alerts parsed`)

    // Save newAlerts and resolvedAlerts to file
    writeToFile(inputs.new_alerts_filepath, JSON.stringify(newAlerts))
    writeToFile(inputs.closed_alerts_filepath, JSON.stringify(resolvedAlerts))
    core.info(`[✅] Alerts saved to files`)

    // Print results as Action summary and set it as `summary-markdown` output
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
