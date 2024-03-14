export {inputsReturned, scopeInput, SecretScanningAlert, RateLimitOptions}

type inputsReturned = {
  frequency: number
  scope: scopeInput
  api_token: string
  apiURL: string
  repo: string
  owner: string
  org: string // added this line 
  enterprise: string
  new_alerts_filepath: string
  closed_alerts_filepath: string
}

type scopeInput = 'organisation' | 'repository' | 'enterprise'

type SecretScanningAlert = {
  number: number
  created_at: string
  updated_at: string
  resolved_at: string | null
  url: string
  html_url: string
  state: string
  secret_type: string
  org_owner: string // added this line
  repo_owner: string // added this line
}

type RateLimitOptions = {
  request: {
    retryCount: number
  }
}
