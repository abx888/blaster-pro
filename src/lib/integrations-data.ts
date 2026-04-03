export interface Integration {
  id: string;
  name: string;
  category: string;
  icon: string;
  fields: { key: string; label: string; type: string; placeholder: string }[];
}

export const integrations: Integration[] = [
  // SMS
  { id: 'twilio', name: 'Twilio', category: 'SMS', icon: '📱', fields: [{ key: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'AC...' }, { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Token' }, { key: 'fromNumber', label: 'From Number', type: 'text', placeholder: '+1...' }] },
  { id: 'vonage', name: 'Vonage', category: 'SMS', icon: '📲', fields: [{ key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Key' }, { key: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Secret' }] },
  { id: 'plivo', name: 'Plivo', category: 'SMS', icon: '💬', fields: [{ key: 'authId', label: 'Auth ID', type: 'text', placeholder: 'ID' }, { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Token' }] },
  { id: 'messagebird', name: 'MessageBird', category: 'SMS', icon: '🐦', fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Key' }] },
  // Email
  { id: 'sendgrid', name: 'SendGrid', category: 'Email', icon: '📧', fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'SG...' }] },
  { id: 'mailgun', name: 'Mailgun', category: 'Email', icon: '✉️', fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Key' }, { key: 'domain', label: 'Domain', type: 'text', placeholder: 'mg.example.com' }] },
  { id: 'ses', name: 'Amazon SES', category: 'Email', icon: '📨', fields: [{ key: 'accessKey', label: 'Access Key', type: 'text', placeholder: 'AKIA...' }, { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Secret' }, { key: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1' }] },
  { id: 'postmark', name: 'Postmark', category: 'Email', icon: '📮', fields: [{ key: 'serverToken', label: 'Server Token', type: 'password', placeholder: 'Token' }] },
  // Chat
  { id: 'telegram', name: 'Telegram Bot', category: 'Chat', icon: '✈️', fields: [{ key: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'Token' }] },
  { id: 'whatsapp', name: 'WhatsApp Business', category: 'Chat', icon: '💚', fields: [{ key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Token' }, { key: 'phoneId', label: 'Phone Number ID', type: 'text', placeholder: 'ID' }] },
  { id: 'discord', name: 'Discord Bot', category: 'Chat', icon: '🎮', fields: [{ key: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'Token' }, { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...' }] },
  { id: 'slack', name: 'Slack', category: 'Chat', icon: '💼', fields: [{ key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/...' }] },
  // Push
  { id: 'firebase', name: 'Firebase', category: 'Push', icon: '🔥', fields: [{ key: 'serverKey', label: 'Server Key', type: 'password', placeholder: 'Key' }] },
  { id: 'onesignal', name: 'OneSignal', category: 'Push', icon: '🔔', fields: [{ key: 'appId', label: 'App ID', type: 'text', placeholder: 'ID' }, { key: 'restApiKey', label: 'REST API Key', type: 'password', placeholder: 'Key' }] },
  { id: 'pusher', name: 'Pusher', category: 'Push', icon: '⚡', fields: [{ key: 'appId', label: 'App ID', type: 'text', placeholder: 'ID' }, { key: 'key', label: 'Key', type: 'text', placeholder: 'Key' }, { key: 'secret', label: 'Secret', type: 'password', placeholder: 'Secret' }] },
  // Cloud
  { id: 'aws-sns', name: 'AWS SNS', category: 'Cloud', icon: '☁️', fields: [{ key: 'accessKey', label: 'Access Key', type: 'text', placeholder: 'AKIA...' }, { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'Secret' }, { key: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1' }] },
  { id: 'gcloud', name: 'Google Cloud', category: 'Cloud', icon: '🌐', fields: [{ key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'my-project' }, { key: 'serviceKey', label: 'Service Account Key', type: 'password', placeholder: 'JSON key' }] },
  { id: 'azure', name: 'Azure', category: 'Cloud', icon: '🔷', fields: [{ key: 'connectionString', label: 'Connection String', type: 'password', placeholder: 'Endpoint=...' }] },
  { id: 'cloudflare', name: 'Cloudflare Workers', category: 'Cloud', icon: '🟠', fields: [{ key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Token' }, { key: 'accountId', label: 'Account ID', type: 'text', placeholder: 'ID' }] },
  // DevOps
  { id: 'docker', name: 'Docker', category: 'DevOps', icon: '🐳', fields: [{ key: 'registryUrl', label: 'Registry URL', type: 'text', placeholder: 'https://...' }, { key: 'token', label: 'Token', type: 'password', placeholder: 'Token' }] },
  { id: 'github-actions', name: 'GitHub Actions', category: 'DevOps', icon: '🐙', fields: [{ key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...' }, { key: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' }] },
  { id: 'digitalocean', name: 'DigitalOcean', category: 'DevOps', icon: '🌊', fields: [{ key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Token' }] },
  { id: 'hetzner', name: 'Hetzner VPS', category: 'DevOps', icon: '🖥️', fields: [{ key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Token' }] },
  // CRM
  { id: 'hubspot', name: 'HubSpot', category: 'CRM', icon: '🟧', fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Key' }] },
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', icon: '☁️', fields: [{ key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'ID' }, { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Secret' }, { key: 'instanceUrl', label: 'Instance URL', type: 'text', placeholder: 'https://...' }] },
  { id: 'pipedrive', name: 'Pipedrive', category: 'CRM', icon: '🟢', fields: [{ key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Token' }] },
  { id: 'zoho', name: 'Zoho', category: 'CRM', icon: '🔴', fields: [{ key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'ID' }, { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Secret' }] },
  // Analytics
  { id: 'mixpanel', name: 'Mixpanel', category: 'Analytics', icon: '📊', fields: [{ key: 'projectToken', label: 'Project Token', type: 'text', placeholder: 'Token' }] },
  { id: 'amplitude', name: 'Amplitude', category: 'Analytics', icon: '📈', fields: [{ key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Key' }] },
  { id: 'segment', name: 'Segment', category: 'Analytics', icon: '🟩', fields: [{ key: 'writeKey', label: 'Write Key', type: 'password', placeholder: 'Key' }] },
  { id: 'ga', name: 'Google Analytics', category: 'Analytics', icon: '📉', fields: [{ key: 'measurementId', label: 'Measurement ID', type: 'text', placeholder: 'G-...' }] },
];

export const integrationCategories = [...new Set(integrations.map(i => i.category))];
