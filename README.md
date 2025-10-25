# ApplyMate

A Chrome extension that extracts lead and job information (Name, Role, Company, Email, Job details) from LinkedIn profiles and web pages using Chrome's built-in AI (Gemini Nano / LanguageModel).

## Features

- AI-powered on-device extraction of job & contact details
- Privacy-first: processing happens locally, no external APIs
- One-click extraction via floating button or selection
- Exports: copy to clipboard, export CSV
- Lead management in popup: view, copy, delete, export

## Prerequisites

### Enable Chrome AI (Gemini Nano)

1. Use Chrome Canary or Dev (version 127+)
2. Enable flags at `chrome://flags`:
   - `#optimization-guide-on-device-model` → Enabled
   - `#prompt-api-for-gemini-nano` → Enabled
3. Download model at `chrome://components`:
   - Find "Optimization Guide On Device Model" → Check for update → wait until "Ready"
4. Verify AI ready:
   ```javascript
   (await ai.languageModel.capabilities()).available
   ```
   Should return: `"readily"`

## Installation

1. Clone or download:
   ```bash
   git clone https://github.com/yourusername/LeadExtract.git
   cd LeadExtract
   ```
2. (Optional) Generate icons via `assets/create-icons.html`
3. Load unpacked extension:
   - Go to `chrome://extensions`, enable Developer mode, click "Load unpacked", select this folder
4. Pin extension (optional) via Chrome toolbar puzzle icon

## Usage

### Extract Leads
1. Open any webpage (LinkedIn, company site, job board)
2. Click the floating "Extract Lead" button or highlight text then click
3. Wait for AI extraction (2–10s)
4. Open extension popup to view results

### Manage Leads
- Copy individual lead to clipboard
- Copy all leads
- Export CSV
- Delete individual leads or clear all (confirmation required)

## How It Works

- content/content.js — injects floating button, captures page/selection, sends to background
- background/service_worker.js — runs AI prompt, parses JSON response, stores leads in chrome.storage.local
- popup/ — UI to view/manage leads (popup.html, popup.css, popup.js)

## Data Format

The AI returns structured JSON used by the UI. Typical fields:
- job_title
- job_description
- job_description_summary (short concise summary)
- contact_details: { contact_person, email, phone } or contacts array
- company: { name, member_since, total_job_posts }
- salary
- hours_per_week
- url, timestamp

Rules:
- Return null for missing fields
- Keep summary short and concise for popup display

## Troubleshooting

- CSP inline handler error: remove inline onclicks; bind event listeners in popup JS
- CSV export error (cell.replace is not a function): ensure exported values are strings
- "refusing to merge unrelated histories": consider `git pull --allow-unrelated-histories` only after backup

## Project Structure

```
LeadExtract/
├── manifest.json
├── background/
│   └── service_worker.js
├── content/
│   ├── content.js
│   └── styles.css
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── assets/
│   └── create-icons.html
└── README.md
```

## Contributing

Fork, create a branch, open a PR to `https://github.com/vibecodersph/LeadExtract.git`. For destructive upstream changes, ensure you have permission and backups.

## License

MIT (add LICENSE file as needed)

## Credits

Built for VAs and professionals to streamline lead/job info extraction.
