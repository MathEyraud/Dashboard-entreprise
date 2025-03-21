# Enterprise Dashboard

A modern and elegant dashboard to quickly access all your enterprise tools and servers. Organized by categories with smooth and intuitive navigation.

## 🚀 Features

- **Section-based dashboard** - Access all your tools and servers organized by categories
- **Section visibility** - Show/hide sections to create a fully personalized dashboard
- **Collapsible sections** - Collapse/expand sections to focus on what matters
- **Quick navigation** - Side dock for instantly switching between sections
- **Application tiles** - Smartphone-inspired interface for immediate and visual access
- **Favorites system** - Mark and access your most-used applications in a dedicated section
- **Light/dark mode** - Adapt the interface to your preferences and time of day
- **Display options** - Customize density and layout with the floating settings panel
- **Responsive design** - Optimized for all screens, from desktop to mobile
- **Zero server dependencies** - Fully client-side application, no complex installation
- **Easy customization** - Add or modify your tools with just a few lines of code
- **Enhanced search system** - Find applications quickly with smart, partial-word matching

## 📋 Available Sections

The dashboard comes with a generic structure that you can customize to fit your needs:

- **Favorites** - Quick access to your most frequently used applications
- **Server Sections** - Organize your various servers by purpose or environment
- **Management Tools** - Quick access to your project management, documentation, and collaboration tools
- **Language Tools** - Spell-checkers, grammar tools, and translation services
- **Installed Tools** - Links to local applications installed on your computer
- **And more** - Easily add any other category relevant to your work environment

## 🎨 Display Customization

Personalize your dashboard appearance with these display options:

### Density Options
- **Compact** - Smaller tiles and less spacing to fit more content on screen
- **Standard** - Balanced size and spacing for everyday use
- **Comfortable** - Larger tiles and more spacing for enhanced readability

### Layout Options
- **Grid** - Classic tile-based layout organized in a responsive grid
- **List** - Detailed list view with application descriptions

### Section Management
- **Visibility Control** - Show/hide specific sections from the settings panel in the dock
- **Collapsible Sections** - Minimize sections you don't need at the moment
- **Global Toggle** - Expand or collapse all sections with a single click
- **Persistent State** - Your collapsed/expanded and visibility preferences are remembered between sessions

Access these settings through:
- The floating palette button in the bottom-right corner for display options
- The gear icon in the side dock for section visibility control

### Managing Section Visibility

- **Access settings**: Click the gear icon in the side dock to open the visibility panel
- **Toggle sections**: Use checkboxes to show/hide individual sections
- **Quick actions**: Use "Show all" to display all sections or "Hide all" to hide everything except favorites
- **Persistence**: Your section visibility preferences are automatically saved between sessions
- **Favorites remain**: The Favorites section remains visible even when using "Hide all" for quick access to your essential tools

### Collapsing Sections

- **Collapse/Expand**: Click the chevron icon next to the procedure link in each section header
- **Global Toggle**: Use the "Collapse All"/"Expand All" button at the top of the dashboard
- **Persistent State**: Your preferred section collapse states are remembered between sessions

### Changing Display Options

- **Access settings**: Click the palette icon in the bottom-right corner
- **Change density**: Select Compact, Standard, or Comfortable from the dropdown
- **Change layout**: Select Grid or List from the dropdown
- **Persistence**: Your display preferences are automatically saved between sessions

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
- `favorites.css` for favorites system styles
- `section-collapse.css` for collapsible sections styles
- `display-options.css` for display customization styles
- `visibility-panel.css` for section visibility panel styles

## 🔍 Enhanced Search System

The Enterprise Dashboard features a powerful search system to help you quickly find the applications you need:

### Smart Search Features

- **Keyword-based search** - Find applications by name, description, or tags
- **Partial-word matching** - Type just the beginning of a word (e.g., "no" finds "Notion")
- **Fuzzy search** - Tolerates minor typos and spelling variations
- **Category filtering** - Narrow down search results to specific categories
- **Keyboard navigation** - Use arrow keys to navigate search results
- **Keyboard shortcuts** - Press `/` from anywhere to focus the search field
- **Recently used** - Quickly access applications you use frequently
- **Search history** - View and reuse your recent searches

### Using the Search

1. **Start searching** - Type in the search box or press `/` to focus it
2. **Navigate results** - Use arrow keys to move between results
3. **Filter by category** - Use the category dropdown to narrow your search
4. **Open an application** - Click a result or press Enter when it's selected
5. **Clear search** - Click the X button or press Escape

### Customizing Search Results

Applications can be enriched with tags to make them more discoverable:

```javascript
{
    id: "notion",
    name: "Notion",
    url: "https://notion.so",
    icon: "book-open",
    color: "#000000",
    description: "Knowledge management tool",
    tags: ["wiki", "documentation", "notes", "collaboration", "kanban"]
}
```

## 🔧 Installation

1. **Download the files** to a folder of your choice
   ```bash
   git clone https://github.com/MathEyraud/Dashboard-entreprise.git
   ```
   or download and extract the ZIP file

2. **Open index.html** in your browser
   - No server required
   - Works locally or via network share

3. **Navigate between sections** using the horizontal tabs or the side dock

### Using the Favorites System

- **Adding favorites**: Hover over any application tile and click the star icon that appears
- **Removing favorites**: Click the star icon on any favorited application or in the Favorites section
- **Viewing favorites**: All favorited applications appear in the Favorites section at the top of the dashboard

## 📂 Project Structure

```
enterprise-dashboard/
├── index.html                      # Main HTML entry point
├── README.md                       # Project documentation
├── styles/                         # CSS styles
│   ├── variables.css               # Variables (colors, spacing, etc.)
│   ├── base.css                    # Base styles
│   ├── components.css              # Interface component styles
│   ├── dock.css                    # Navigation dock styles
│   ├── favorites.css               # Favorites system styles
│   ├── theme-switcher.css          # Theme selector styles
│   ├── section-collapse.css        # Collapsible sections styles
│   ├── display-options.css         # Display customization styles
│   ├── visibility-panel.css        # Section visibility panel styles
│   ├── search.css                  # Enhanced search functionality styles
│   └── responsive.css              # Responsive adaptations
└── js/                             # JavaScript
    ├── config.js                   # Central configuration
    ├── main.js                     # JS entry point
    ├── data/                       # Category data
    │   ├── servers1.js             # First server category
    │   ├── servers2.js             # Second server category
    │   ├── servers3.js             # Third server category
    │   ├── management.js           # Management tools
    │   ├── language.js             # Language tools
    │   ├── installed.js            # Installed tools
    │   └── categories.js           # Category metadata
    ├── services/                   # Services
    │   ├── StorageService.js       # LocalStorage management
    │   ├── SearchModelService.js   # Search indexing and matching
    │   └── UsageTrackingService.js # Application usage tracking
    ├── models/                     # Data models
    │   ├── CategoryModel.js        # Category model
    │   ├── FavoritesModel.js       # Favorites model
    │   ├── DockStateModel.js       # Navigation dock state
    │   ├── VisibilityModel.js      # Section visibility model
    │   └── SearchHistoryModel.js   # Search history management
    ├── ui/                         # User interface
    │   ├── UIManager.js            # Interface manager
    │   ├── ThemeManager.js         # Theme manager
    │   ├── DockManager.js          # Dock manager
    │   ├── SearchManager.js        # Search functionality
    │   ├── DisplayManager.js       # Display options manager
    │   └── VisibilityManager.js    # Section visibility manager
    └── controllers/                # Controllers
        └── AppController.js        # Main controller
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
    tags: ["keyword1", "keyword2", "keyword3"] // Optional search tags
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

## 💾 Data and Persistence

- **User preferences**: Light/dark mode, dock state, favorites, section visibility, collapsed sections, and display options are saved in localStorage
- **Search history**: Recent searches are saved for quick access
- **Usage tracking**: The system remembers which applications you use most frequently
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

## 🧩 Project Architecture

The application follows an MVC (Model-View-Controller) architecture with these main components:

### Models
- **CategoryModel**: Manages category data and organization
- **FavoritesModel**: Tracks favorite applications
- **VisibilityModel**: Controls section visibility
- **SearchHistoryModel**: Keeps track of search history
- **DockStateModel**: Manages the state of the navigation dock

### Services
- **StorageService**: Handles localStorage operations
- **SearchModelService**: Provides search indexing and matching
- **UsageTrackingService**: Tracks application usage patterns

### UI Managers
- **UIManager**: Handles the main interface elements
- **SearchManager**: Controls search functionality
- **ThemeManager**: Manages light/dark theme switching
- **DockManager**: Controls the side navigation dock
- **DisplayManager**: Handles display options and layouts
- **VisibilityManager**: Manages section visibility panel

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Credits

- Font Awesome for icons

---

Developed with ❤️ to simplify access to your enterprise tools