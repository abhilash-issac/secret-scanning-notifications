import * as core from '@actions/core';
import { SummaryTableRow } from '@actions/core/lib/summary';
import { SecretScanningAlert } from '../types/common/main';

export function addToSummary(title: string, alerts: SecretScanningAlert[]) {
  const headers = ['Alert Number', 'Secret State', 'Secret Type', 'HTML URL', 'Org Owner', 'Repo Owner'];
  const rows = alerts.map(alert => [
    alert.number.toString(),
    alert.state,
    alert.secret_type,
    alert.html_url,
    alert.org_owner, // Directly using the org_owner property
    alert.repo_owner, // Directly using the repo_owner property
  ]);

  core.summary
    .addHeading(title)
    .addTable([
      headers.map(header => ({ data: header, header: true })),
      ...rows,
    ] as SummaryTableRow[])
    .addBreak();
}

export function writeSummary() {
  core.summary.write();
  core.info(`[✅] Action summary written`);
}

export function getSummaryMarkdown() {
  return core.summary.stringify();
}
