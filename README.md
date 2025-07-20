# PowerApps Copilot Popup Blocker

A Chrome extension that automatically hides the annoying "Draft with Copilot" popup when editing PowerApps applications on make.powerapps.com.

## Features

- 🚫 **Automatically blocks Copilot popups** - No more interruptions while working
- 🎯 **Smart detection** - Uses multiple strategies to find and hide popups
- ⚡ **Real-time blocking** - Works as popups appear dynamically
- 🔧 **Toggle on/off** - Easy control through extension popup
- 🛡️ **Robust** - Multiple fallback methods ensure popups stay hidden
- 🎨 **Clean UI** - Simple, modern interface

## Installation

### Method 1: Load as Unpacked Extension (Recommended for development)

1. **Download the extension**:
   - Clone this repository or download the files
   - Ensure you have all files: `manifest.json`, `content.js`, `styles.css`, `popup.html`, `popup.js`

2. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Or click the three-dot menu → More tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top right

4. **Load the extension**:
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should appear in your extensions list

5. **Pin the extension** (optional):
   - Click the extensions icon (puzzle piece) in Chrome toolbar
   - Pin "PowerApps Copilot Popup Blocker" for easy access

### Method 2: Create Icons (Optional)

If you want custom icons, create PNG files in the `icons/` directory:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels) 
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

If no icons are provided, Chrome will use default ones.

## Usage

1. **Navigate to PowerApps**:
   - Go to [make.powerapps.com](https://make.powerapps.com)
   - Open any app for editing

2. **Extension activates automatically**:
   - The extension runs automatically on PowerApps
   - Copilot popups will be hidden as they appear

3. **Control the extension**:
   - Click the extension icon in Chrome toolbar
   - Toggle "Block Copilot Popups" on/off
   - View current status

## How It Works

The extension uses multiple strategies to detect and hide Copilot popups:

1. **CSS Targeting**: High-specificity CSS rules to hide known popup selectors
2. **JavaScript Detection**: Smart content analysis to identify Copilot-related elements
3. **Mutation Observer**: Real-time monitoring for dynamically created popups
4. **Text Analysis**: Scanning for "Draft with Copilot" and related phrases
5. **Periodic Checks**: Fallback scanning every 2 seconds

### Targeted Elements

The extension looks for elements with:
- `data-testid` containing "copilot" or "draft"
- CSS classes containing "copilot" or "draft"
- ARIA labels mentioning Copilot
- Text content like "Draft with Copilot"
- Modal/dialog characteristics with Copilot content

## Troubleshooting

### Extension not working?

1. **Check you're on the right domain**:
   - Extension only works on `make.powerapps.com`
   - Check the extension popup for status

2. **Refresh the page**:
   - Sometimes a page refresh helps the extension initialize

3. **Check if enabled**:
   - Click the extension icon
   - Ensure "Block Copilot Popups" is toggled ON

4. **Check console for errors**:
   - Press F12 → Console tab
   - Look for any error messages

### Popups still appearing?

1. **Report the issue**:
   - Note the exact text/appearance of the popup
   - Check browser console for extension logs

2. **Manual blocking**:
   - You can manually hide elements using browser dev tools
   - Right-click popup → Inspect → Delete element

## Development

### File Structure
```
├── manifest.json          # Extension configuration
├── content.js            # Main popup blocking logic
├── styles.css           # CSS rules for hiding popups
├── popup.html           # Extension popup interface
├── popup.js            # Popup interface logic
├── icons/              # Extension icons (optional)
└── README.md          # This file
```

### Customization

To modify the blocking behavior:

1. **Add new selectors** in `content.js` → `selectors` array
2. **Add new keywords** in `content.js` → `copilotKeywords` array  
3. **Modify CSS rules** in `styles.css`
4. **Adjust timing** by changing interval in `setupPeriodicCheck()`

### Testing

1. Load the extension in Chrome
2. Go to make.powerapps.com
3. Open browser console to see blocking logs
4. Test toggle functionality in extension popup

## Permissions

The extension requests minimal permissions:
- `activeTab`: To interact with the current PowerApps tab
- `storage`: To save user preferences
- Host permission for `make.powerapps.com`: To run content scripts

## Compatibility

- **Chrome**: Manifest V3 compatible
- **Domain**: Works specifically on make.powerapps.com
- **PowerApps**: Tested with current PowerApps interface (2024)

## License

This extension is provided as-is for educational and productivity purposes. Use responsibly and in accordance with your organization's policies.

## Contributing

Found a popup that's not being blocked? Please provide:
1. Screenshot of the popup
2. HTML source of the popup element
3. Any console error messages

This helps improve the detection algorithms! 
