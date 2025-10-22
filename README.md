# Lead Info Extractor

A Chrome extension that extracts lead information (Name, Role, Company, Email) from LinkedIn profiles and web pages using Chrome's built-in AI (Gemini Nano).

## Features

- **AI-Powered Extraction**: Uses Chrome's on-device Gemini Nano AI for intelligent lead information extraction
- **Privacy-First**: All processing happens locally on your device - no external APIs or data transmission
- **One-Click Extraction**: Floating button on every page for quick lead capture
- **Smart Parsing**: Extracts Name, Role, Company, and Email from page content
- **Export Options**: Copy to clipboard or export to CSV
- **Lead Management**: View, manage, and organize extracted leads in the popup interface

## Prerequisites

### Enable Chrome AI (Gemini Nano)

Before using this extension, you need to enable Chrome's built-in AI:

1. **Use Chrome Canary or Dev** (version 127+)
   - Download from: https://www.google.com/chrome/canary/

2. **Enable Required Flags**

   Navigate to `chrome://flags` and enable these flags:
   - `#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
   - `#prompt-api-for-gemini-nano` → **Enabled**

3. **Download AI Model**

   - Go to `chrome://components`
   - Find "Optimization Guide On Device Model"
   - Click "Check for update" to download Gemini Nano
   - Wait for status to show "Ready" (may take several minutes)

4. **Verify AI is Ready**

   Open DevTools Console and run:
   ```javascript
   (await ai.languageModel.capabilities()).available
   ```
   Should return: `"readily"`

## Installation

1. **Clone or Download** this repository
   ```bash
   git clone https://github.com/yourusername/LeadExtract.git
   cd LeadExtract
   ```

2. **Generate Icons** (optional)
   - Open `assets/create-icons.html` in a browser
   - Download all generated icon files to the `assets/` folder
   - Or use your own icons (16x16, 32x32, 48x48, 128x128)

3. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `LeadExtract` folder

4. **Pin Extension** (recommended)
   - Click the puzzle icon in Chrome toolbar
   - Find "Lead Info Extractor"
   - Click the pin icon to keep it visible

## Usage

### Extract Leads from Any Page

1. **Navigate** to any webpage (LinkedIn profile, company website, etc.)

2. **Click** the floating "Extract Lead" button (bottom right of page)
   - Or highlight specific text first, then click the button

3. **Wait** for AI extraction (usually 2-5 seconds)

4. **View Results** by clicking the extension icon in toolbar

### Managing Leads

**View All Leads**
- Click the extension icon to open popup
- See all extracted leads with details

**Copy Individual Lead**
- Click the copy icon on any lead card
- Lead info is copied to clipboard

**Copy All Leads**
- Click "Copy All" button in popup
- All leads copied in text format

**Export to CSV**
- Click "Export CSV" button
- Download spreadsheet with all leads

**Clear All Leads**
- Click "Clear All" to delete all saved leads
- Confirmation required

## How It Works

1. **Content Script** (`content/content.js`)
   - Injects floating "Extract Lead" button on all pages
   - Captures page content and selected text
   - Sends data to background script

2. **Background Service Worker** (`background/service_worker.js`)
   - Initializes Chrome AI (Gemini Nano) session
   - Sends extraction prompt to AI model
   - Parses AI response into structured JSON
   - Stores leads in Chrome storage

3. **Popup UI** (`popup/`)
   - Displays all extracted leads
   - Provides export and management functions
   - Real-time updates when new leads are added

## Project Structure

```
LeadExtract/
├── manifest.json           # Extension configuration
├── background/
│   └── service_worker.js   # AI extraction logic
├── content/
│   ├── content.js          # Page interaction script
│   └── styles.css          # Floating button styles
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.css           # Popup styles
│   └── popup.js            # Popup functionality
├── assets/
│   ├── create-icons.html   # Icon generator
│   └── icon*.png           # Extension icons
└── README.md
```

## Best Practices

- **LinkedIn**: Works great on profile pages - extracts name, title, company
- **Company Websites**: Best results on "About" or "Team" pages
- **Contact Pages**: Can extract email addresses when visible
- **Highlight Text**: For better accuracy, highlight relevant text before extracting
- **Review Results**: AI extraction may not be perfect - always verify important information

## Troubleshooting

**"Chrome AI is not available" Error**
- Ensure you're using Chrome Canary/Dev 127+
- Check that flags are enabled at `chrome://flags`
- Verify model is downloaded at `chrome://components`

**Extraction Not Working**
- Open DevTools Console (F12) and check for errors
- Verify page content is accessible (some sites may block content scripts)
- Try highlighting specific text and extracting again

**Poor Extraction Quality**
- AI works best with clearly formatted content
- Try highlighting just the relevant section
- Some pages may have too much noise/ads

**Extension Not Loading**
- Check `chrome://extensions` for error messages
- Ensure all files are in correct directories
- Try removing and reloading the extension

## Privacy & Security

- ✅ All AI processing happens **on-device** using Gemini Nano
- ✅ **No external API calls** or data transmission
- ✅ Leads stored locally in Chrome storage only
- ✅ No telemetry or tracking
- ✅ Open source - audit the code yourself

## References

This extension was built with reference to:
- [Mail-Bot](https://github.com/vibecodersph/Mail-Bot) - Chrome AI implementation patterns
- [Chrome Built-in AI](https://developer.chrome.com/docs/ai/built-in) - Official documentation

## Contributing

Contributions welcome! Please open an issue or PR for:
- Bug fixes
- Feature enhancements
- Documentation improvements
- Better extraction prompts

## License

MIT License - feel free to use and modify for your projects.

## Credits

Built for VAs and professionals who need efficient lead extraction tools.
