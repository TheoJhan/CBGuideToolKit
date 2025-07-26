# Dynamic Dialog Extension

A Chrome extension that dynamically inserts dialog boxes into web pages based on selector configurations fetched from GitHub.

## Features

✅ **Dynamic Dialog Insertion** - Inserts dialog boxes into specific elements on web pages  
✅ **GitHub Integration** - Fetches selector configurations from GitHub repositories  
✅ **Local Caching** - Stores configurations in IndexedDB for offline access  
✅ **Background Updates** - Automatically updates configurations every 5 minutes  
✅ **Real-time Updates** - Content scripts receive updates when configurations change  
✅ **Beautiful UI** - Modern popup interface with status monitoring  
✅ **Dialog Toggle** - Show/hide dialogs on demand via popup toggle  
✅ **Customizable Appearance** - Adjust background color, font style, and font size  
✅ **User Settings Persistence** - Settings are saved and persist across sessions  

## Project Structure

```
my-extension/
│
├── manifest.json          # Extension manifest and permissions
├── background.js          # Background service worker (fetches GitHub data)
├── content.js             # Content script (inserts dialogs)
├── lib/
│   └── idb.js             # IndexedDB wrapper for local storage
├── popup/                 # Extension popup interface
│   ├── popup.html         # Popup HTML with modern UI
│   └── popup.js           # Popup functionality
├── icons/                 # Extension icons (16x16, 48x48, 128x128)
├── sample-selector-config.json  # Example GitHub configuration
└── README.md              # This file
```

## Installation

### 1. Clone or Download
Download this extension folder to your local machine.

### 2. Add Icons
Add your extension icons to the `icons/` directory:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

### 3. Configure GitHub Repository
Update the GitHub URL in `background.js`:

```javascript
this.githubUrl = 'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/contents/selector-config.json';
```

### 4. Create GitHub Configuration
Create a `selector-config.json` file in your GitHub repository with the following structure:

```json
{
  "selector": "body",
  "dialogContent": "<h3>Your Dialog Title</h3><p>Your dialog content here...</p>",
  "style": {
    "position": "fixed",
    "top": "20px",
    "right": "20px",
    "backgroundColor": "#ffffff",
    "border": "2px solid #667eea",
    "borderRadius": "10px",
    "padding": "20px",
    "boxShadow": "0 4px 20px rgba(102, 126, 234, 0.3)",
    "zIndex": "10000"
  }
}
```

### 5. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the extension folder
5. The extension should now appear in your extensions list

## Configuration Options

### Selector Configuration

The GitHub configuration file supports the following options:

| Property | Type | Description |
|----------|------|-------------|
| `selector` | string | CSS selector for target element |
| `dialogContent` | string | HTML content for the dialog |
| `style` | object | CSS styles for the dialog |
| `animation` | object | Animation settings |
| `autoClose` | object | Auto-close settings |
| `responsive` | object | Responsive design settings |

### Example Configuration

```json
{
  "selector": "#main-content",
  "dialogContent": "<h3>Important Notice</h3><p>This is a dynamic dialog!</p>",
  "style": {
    "position": "fixed",
    "top": "50%",
    "left": "50%",
    "transform": "translate(-50%, -50%)",
    "backgroundColor": "#fff",
    "border": "1px solid #ccc",
    "padding": "20px",
    "borderRadius": "8px",
    "boxShadow": "0 4px 20px rgba(0,0,0,0.2)",
    "zIndex": "10000"
  },
  "autoClose": {
    "enabled": true,
    "delay": 5000
  }
}
```

## Usage

### Automatic Operation
- The extension automatically fetches configuration updates every 5 minutes
- Dialogs are inserted when pages load based on the current configuration
- Updates are applied in real-time across all open tabs

### Manual Controls
- Click the extension icon to open the popup
- Use "Update Selector Data" to manually fetch latest configuration
- Use "Refresh Current Page" to reload the page and apply changes

### Dialog Controls
- **Toggle Dialog**: Use the toggle switch to show/hide the dialog on the current page
- **Background Color**: Choose any color for the dialog background
- **Font Style**: Select from various font families (Segoe UI, Arial, Times New Roman, etc.)
- **Font Size**: Adjust font size from 8px to 32px

### Status Monitoring
The popup shows:
- Extension status (Active/Fallback Mode/Inactive)
- Last update time
- Current target selector
- Real-time status updates

## Technical Details

### Background Service Worker
- Fetches configuration from GitHub API every 5 minutes
- Stores data in Chrome's local storage
- Notifies content scripts of updates
- Handles fallback data when GitHub is unavailable

### Content Script
- Runs on all web pages
- Inserts dialogs based on selector configuration
- Handles DOM manipulation and styling
- Provides smooth animations and user interactions

### IndexedDB Storage
- Local caching for offline access
- Fallback storage when Chrome storage is unavailable
- Efficient data retrieval and updates

### Popup Interface
- Modern, responsive design with gradient background
- Real-time status updates
- Manual control buttons
- Dialog toggle and customization settings
- User settings persistence across sessions
- User-friendly interface with smooth animations

## Troubleshooting

### Extension Not Working
1. Check if the extension is enabled in `chrome://extensions/`
2. Verify the GitHub URL in `background.js`
3. Check browser console for error messages
4. Ensure the GitHub repository and file exist

### Dialog Not Appearing
1. Verify the CSS selector in your configuration
2. Check if the target element exists on the page
3. Ensure the page has loaded completely
4. Check browser console for JavaScript errors

### GitHub API Issues
1. Verify the repository is public or you have proper access
2. Check GitHub API rate limits
3. Ensure the configuration file is valid JSON
4. Check network connectivity

## Development

### Local Development
1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test the changes

### Debugging
- Use Chrome DevTools to debug content scripts
- Check the background service worker in `chrome://extensions/`
- Monitor network requests in DevTools
- Check IndexedDB in Application tab

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the browser console for errors
3. Verify your configuration file format
4. Test with the sample configuration provided 