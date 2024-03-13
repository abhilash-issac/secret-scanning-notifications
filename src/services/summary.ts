import * as core from '@actions/core'
import { SummaryTableRow } from '@actions/core/lib/summary'
import { SecretScanningAlert } from '../types/common/main'

export function addToSummary(title: string, alerts: SecretScanningAlert[]) {
    const headers = ['Alert Number', 'Secret State', 'Secret Type', 'HTML URL', 'Org Owner', 'Repo Owner']
    // Define the table rows
    const rows = alerts.map(alert => {
        const urlParts = alert.html_url.split('/')
        const orgOwner = urlParts[3] // Assuming the org owner is the fourth element in the URL
        const repoOwner = urlParts[4] // Assuming the repo owner is the fifth element in the URL
        return [
            alert.number.toString(),
            alert.state,
            alert.secret_type,
            alert.html_url,
            orgOwner,
            repoOwner
        ]
    })

    // Add the table to the Action summary
    core.summary
        .addHeading(title)
        .addTable([
            headers.map(header => ({ data: header, header: true })),
            ...rows
        ] as SummaryTableRow[])
        .addBreak()
}

export function writeSummary() {
    core.summary.write()
    core.info(`[✅] Action summary written`)
}

export function getSummaryMarkdown() {
    return core.summary.stringify()
}
