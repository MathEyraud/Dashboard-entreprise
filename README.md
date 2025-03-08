# Enterprise Dashboard

A modern and elegant dashboard to quickly access all your enterprise tools and servers. Organized by categories with smooth and intuitive navigation.

## 🚀 Features

- **Section-based dashboard** - Access all your tools and servers organized by categories
- **Quick navigation** - Side dock for instantly switching between sections
- **Application tiles** - Smartphone-inspired interface for immediate and visual access
- **Light/dark mode** - Adapt the interface to your preferences and time of day
- **Responsive design** - Optimized for all screens, from desktop to mobile
- **Zero server dependencies** - Fully client-side application, no complex installation
- **Easy customization** - Add or modify your tools with just a few lines of code

## 📋 Available Sections

The dashboard comes with a generic structure that you can customize to fit your needs:

- **Server Sections** - Organize your various servers by purpose or environment
- **Management Tools** - Quick access to your project management, documentation, and collaboration tools
- **Language Tools** - Spell-checkers, grammar tools, and translation services
- **Installed Tools** - Links to local applications installed on your computer
- **And more** - Easily add any other category relevant to your work environment

## 🔧 Installation

1. **Download the files** to a folder of your choice
   ```bash
   git clone https://github.com/MathEyraud/enterprise-dashboard.git
   ```
   or download and extract the ZIP file

2. **Open index.html** in your browser
   - No server required
   - Works locally or via network share

3. **Navigate between sections** using the horizontal tabs or the side dock

## 📂 Project Structure

```
enterprise-dashboard/
├── index.html              # Main HTML entry point
├── README.md               # Project documentation
├── styles/                 # CSS styles
│   ├── variables.css       # Variables (colors, spacing, etc.)
│   ├── base.css            # Base styles
│   ├── components.css      # Interface component styles
│   ├── dock.css            # Navigation dock styles
│   ├── theme-switcher.css  # Theme selector styles
│   └── responsive.css      # Responsive adaptations
└── js/                     # JavaScript
    ├── config.js           # Central configuration
    ├── main.js             # JS entry point
    ├── data/               # Category data
    │   ├── servers1.js     # First server category
    │   ├── servers2.js     # Second server category
    │   ├── servers3.js     # Third server category
    │   ├── management.js   # Management tools
    │   ├── language.js     # Language tools
    │   ├── installed.js    # Installed tools
    │   └── categories.js   # Category metadata
    ├── services/           # Services
    │   └── StorageService.js # LocalStorage management
    ├── models/             # Data models
    │   ├── CategoryModel.js  # Category model
    │   └── DockStateModel.js # Navigation dock state
    ├── ui/                 # User interface
    │   ├── UIManager.js    # Interface manager
    │   ├── ThemeManager.js # Theme manager
    │   └── DockManager.js  # Dock manager
    └── controllers/        # Controllers
        └── AppController.js # Main controller
```

## 🎨 Customization

### Adding a New Application

1. Open the JS file corresponding to the category (e.g., `js/data/management.js`)
2. Add a new entry to the `apps` array:

```javascript
{
    id: "new-app",             // Unique identifier
    name: "New App",           // Display name
    url: "https://example.com",// Application URL
    icon: "chart-line",        // Font Awesome icon (without "fa-")
    color: "#9b59b6",          // Background color
    description: "Description" // Application description
}
```

### Adding a New Category

1. Create a new file in `js/data/` (e.g., `new-category.js`)
2. Use this template:

```javascript
const NEW_CATEGORY_DATA = {
    id: "new-category",
    name: "New Category",
    description: "Category description",
    
    apps: [
        // List of applications...
    ]
};
```

3. Add the file reference in `index.html`:
```html
<script src="./js/data/new-category.js"></script>
```

4. Update `config.js` to include the new category:
```javascript
// In APP_CONFIG.CATEGORY_ORDER
CATEGORY_ORDER: [..., 'new-category'],

// In APP_CONFIG.CATEGORY_ICONS
CATEGORY_ICONS: {
    // Other categories...
    'new-category': 'fas fa-icon-name'
}
```

5. Update `loadCategories()` in `config.js`:
```javascript
if (typeof NEW_CATEGORY_DATA !== 'undefined') categories.newCategory = NEW_CATEGORY_DATA;
```

### Changing Category Order

Open `js/config.js` and rearrange the entries in the `CATEGORY_ORDER` array:

```javascript
CATEGORY_ORDER: ['servers1', 'servers2', 'new-category', 'servers3', ...],
```

### Customizing Appearance

Modify the CSS files in the `styles/` folder, particularly:
- `variables.css` for colors and spacing
- `components.css` for application tile styles
- `dock.css` for navigation dock styles

## 💾 Data and Persistence

- **User preferences**: Light/dark mode and dock state are saved in localStorage
- **No sensitive data**: The application does not store any authentication data or sensitive information
- **Local data only**: All data remains on your device

## 💻 Compatibility

- **Browsers**: Chrome, Firefox, Safari, Edge (recent versions)
- **Screens**: Desktop, tablet, mobile
- **Offline mode**: Works without internet connection after first load

## 🔒 Security

- Runs entirely client-side with vanilla JavaScript
- Contains no external APIs or third-party services
- Executes no server-side code
- Sends no data externally

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Credits

- Font Awesome for icons

---

Developed with ❤️ to simplify access to your enterprise tools