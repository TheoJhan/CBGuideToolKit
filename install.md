# Quick Installation Guide

## Step 1: Prepare the Extension

1. **Add Icons** (Required)
   - Add your extension icons to the `icons/` folder:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)

2. **Configure GitHub Repository** (Required)
   - Edit `background.js`
   - Update line 4 with your GitHub repository URL:
   ```javascript
   this.githubUrl = 'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/contents/selector-config.json';
   ```

3. **Create GitHub Configuration** (Required)
   - Create a new repository on GitHub
   - Add a file named `selector-config.json` with content like:
   ```json
   {
     "selector": "body",
     "dialogContent": "<h3>Hello World!</h3><p>This is a dynamic dialog.</p>",
     "style": {
       "position": "fixed",
       "top": "20px",
       "right": "20px",
       "backgroundColor": "#fff",
       "border": "1px solid #ccc",
       "padding": "15px",
       "borderRadius": "5px",
       "zIndex": "10000"
     }
   }
   ```

## Step 2: Load in Chrome

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select this extension folder
6. The extension should now appear in your extensions list

## Step 3: Test

1. Open any website
2. You should see a dialog appear based on your configuration
3. Click the extension icon to see the popup interface
4. Use the popup to manually update or refresh

## Troubleshooting

- **Extension not working?** Check the browser console for errors
- **Dialog not appearing?** Verify your CSS selector exists on the page
- **GitHub issues?** Make sure your repository is public and the file exists

## Next Steps

- Customize the dialog content and styling in your GitHub configuration
- Add more complex selectors for specific elements
- Implement additional features as needed

For detailed documentation, see `README.md`. 