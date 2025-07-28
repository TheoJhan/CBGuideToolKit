# CB Guide Toolkit

A Chrome extension that injects dialog boxes based on domain-specific selectors with GitHub integration and local caching.

## Features

✅ **GitHub Integration** - Fetches selector configurations from GitHub repositories  
✅ **Local Caching** - Stores configurations in IndexedDB for offline access  
✅ **Background Updates** - Automatically updates configurations every 5 minutes  
✅ **Modern UI** - Enhanced popup with sync status and manual update button  
✅ **Real-time Settings** - Instant application of popup settings to dialogs  
✅ **Responsive Design** - Dialogs stick to selectors during zoom and scroll  
✅ **Speech Bubble Style** - Dialog boxes with tails and alternating positioning  
✅ **General Dialog System** - Floating instruction dialogs with group navigation  
✅ **Draggable Dialogs** - Move general dialogs around the screen  
✅ **Fixed Positioning** - General dialogs stay in place when scrolling  

## Installation

### Development Version
1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension will automatically start syncing configurations from GitHub

### Production Version (Obfuscated)
1. Clone or download this repository
2. Run the build process:
   ```bash
   npm install
   npm run build
   ```
   Or use the provided batch file:
   ```bash
   build.bat
   ```
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `dist` folder
6. The obfuscated extension will automatically start syncing configurations from GitHub

## Configuration

The extension fetches selector configurations from:
`https://github.com/TheoJhan/CBGuideToolKit/tree/main/selectors`

### Selector File Format

Create JSON files named after your domain (e.g., `example.com.json`):

```json
[
  {
    "general": "Group1",
    "dialogText": "Instructions for group 1"
  },
  {
    "selector": "#element-id",
    "dialogText": "Your dialog text here",
    "groupby": "1"
  },
  {
    "selector": ".class-name",
    "dialogText": "Another dialog text",
    "groupby": "1"
  },
  {
    "general": "Group2",
    "dialogText": "Instructions for group 2"
  }
]
```

### Configuration Types

1. **General Dialogs** - Floating instruction dialogs:
   - `general`: Group identifier (e.g., "Group1", "Group2")
   - `dialogText`: Instructions for the group

2. **Regular Dialogs** - Element-specific dialogs:
   - `selector`: CSS selector for target element
   - `dialogText`: Dialog content
   - `groupby`: Optional group association

## Usage

1. **Enable/Disable**: Use the toggle in the popup to enable or disable dialogs
2. **Customize Appearance**: Adjust font style, background color, and font size
3. **Manual Sync**: Click "Update Now" to manually sync configurations from GitHub
4. **Sync Status**: View the last update time in the popup
5. **General Dialog Navigation**: Use Previous/Next buttons to switch between groups
6. **Move Dialogs**: Drag the general dialog header to reposition it
7. **Hide Dialogs**: Click the × button to hide the general dialog

## General Dialog Features

### Navigation
- **Previous/Next Buttons**: Navigate between different instruction groups
- **Group Indicator**: Shows current group position (e.g., "Group 2 of 3")
- **Automatic Grouping**: Groups are created based on `general` entries

### Interaction
- **Draggable**: Click and drag the header to move the dialog
- **Fixed Position**: Stays in the same screen position when scrolling
- **Hideable**: Click the × button to hide the dialog
- **Responsive**: Adapts to user settings (font, color, size)

### Positioning
- **Default Location**: Top-right corner of the screen
- **Boundary Checking**: Prevents dragging outside the viewport
- **Z-Index**: Always appears above other page content

## Technical Details

- **Background Script**: Continuously syncs configurations every 5 minutes
- **IndexedDB**: Local storage for offline access and fast performance
- **Content Script**: Injects dialogs with real-time settings updates
- **GitHub API**: Fetches raw JSON files from the repository
- **CSS Variables**: Dynamic styling for user customization

## Files Structure

```
├── manifest.json          # Extension configuration
├── background.js          # Background service worker (GitHub sync)
├── content.js            # Content script (dialog injection)
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── style.css             # Base styles
├── lib/
│   └── idb.js           # IndexedDB utility library
└── icons/
    └── icon16.png       # Extension icon
```

## Development

The extension uses:
- **Manifest V3** for modern Chrome extension features
- **IndexedDB** for local data storage
- **GitHub API** for configuration management
- **CSS Variables** for dynamic styling
- **Event-driven Architecture** for real-time updates

### Build Process

The project includes a build system for code obfuscation:

```bash
# Install dependencies
npm install

# Build obfuscated version
npm run build

# Clean build directory
npm run clean

# Development mode with auto-rebuild
npm run watch
```

### Obfuscation

The build process uses `javascript-obfuscator` to protect the source code:
- **Control Flow Flattening**: Makes code flow analysis difficult
- **Dead Code Injection**: Adds meaningless code to confuse analysis
- **String Array Encoding**: Encodes strings in base64
- **Identifier Obfuscation**: Renames variables to hexadecimal
- **Self Defending**: Prevents deobfuscation attempts

The obfuscated files are placed in the `dist/` directory and are ready for distribution.

## Version History

- **v1.0.0**: Initial release with GitHub integration and local caching
- Enhanced popup UI with sync status
- Background updates every 5 minutes
- Real-time settings application
- **v1.1.0**: Added general dialog system with group navigation
- Draggable general dialogs
- Fixed positioning for scroll independence
- Group-based instruction management 