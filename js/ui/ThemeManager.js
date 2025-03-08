/**
 * @fileoverview Gestionnaire du thème de l'application
 * Gère le basculement entre les thèmes clair et sombre
 */

/**
 * @class ThemeManager
 * Gère le thème de l'application (clair/sombre)
 */
class ThemeManager {
    /**
     * Crée une instance du gestionnaire de thème
     * @constructor
     */
    constructor() {
        /**
         * Clé utilisée pour stocker la préférence de thème dans localStorage
         * @type {string}
         * @private
         */
        this._storageKey = 'darkMode';
        
        /**
         * État actuel du mode sombre
         * @type {boolean}
         * @private
         */
        this._isDarkMode = false;
        
        /**
         * Élément DOM du bouton de bascule du thème
         * @type {HTMLElement|null}
         * @private
         */
        this._themeToggle = null;
        
        // Initialise le gestionnaire de thème
        this._initialize();
    }
    
    /**
     * Initialise le gestionnaire de thème
     * @private
     */
    _initialize() {
        // Charge la préférence de thème depuis le localStorage
        this._loadThemePreference();
        
        // Crée et ajoute l'interrupteur de thème à l'interface
        this._createThemeToggle();
        
        // Applique le thème initial
        this._applyTheme();
        
        // Vérifie si le système d'exploitation utilise un thème sombre
        this._checkSystemPreference();
    }
    
    /**
     * Charge la préférence de thème depuis localStorage
     * @private
     */
    _loadThemePreference() {
        try {
            const savedPreference = StorageService.getPreference('darkMode', null);
            if (savedPreference !== null) {
                this._isDarkMode = savedPreference;
                console.log(`Préférence de thème chargée: ${this._isDarkMode ? 'sombre' : 'clair'}`);
            }
        } catch (e) {
            console.error('Erreur lors du chargement de la préférence de thème:', e);
        }
    }
    
    /**
     * Sauvegarde la préférence de thème dans localStorage
     * @private
     */
    _saveThemePreference() {
        try {
            StorageService.updatePreference('darkMode', this._isDarkMode);
        } catch (e) {
            console.error('Erreur lors de la sauvegarde de la préférence de thème:', e);
        }
    }
    
    /**
     * Crée et ajoute l'interrupteur de thème à l'interface
     * @private
     */
    _createThemeToggle() {
        // Récupère le conteneur du footer
        const themeContainer = document.getElementById('themeToggleContainer');
        if (!themeContainer) {
            console.error("Élément 'themeToggleContainer' non trouvé dans le DOM");
            return;
        }
        
        // Crée l'élément wrapper pour l'interrupteur
        const wrapper = document.createElement('div');
        wrapper.className = 'theme-switch-wrapper';
        
        // Crée le label de texte
        const textLabel = document.createElement('span');
        textLabel.className = 'theme-switch-label';
        
        // Crée l'interrupteur
        const switchLabel = document.createElement('label');
        switchLabel.className = 'theme-switch';
        
        // Crée l'input checkbox
        const switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.id = 'themeSwitch';
        switchInput.checked = this._isDarkMode;
        
        // Crée l'élément slider
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        // Ajoute une icône pour le mode
        const iconSpan = document.createElement('span');
        iconSpan.className = 'theme-icon';
        iconSpan.innerHTML = this._isDarkMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        
        // Assemblage de l'interrupteur
        switchLabel.appendChild(switchInput);
        switchLabel.appendChild(slider);
        
        // Nouvel ordre des éléments
        wrapper.appendChild(textLabel);    // Texte en premier (à gauche)
        wrapper.appendChild(switchLabel);  // Toggle au milieu
        wrapper.appendChild(iconSpan);     // Icône en dernier (à droite)
        
        themeContainer.appendChild(wrapper);
        
        // Stocke une référence à l'interrupteur et au label
        this._themeToggle = switchInput;
        this._themeIcon = iconSpan;
        
        // Ajoute l'écouteur d'événement pour le changement de thème
        this._themeToggle.addEventListener('change', () => this._handleThemeToggle());
    }
    
    /**
     * Gère le basculement du thème
     * @private
     */
    _handleThemeToggle() {
        if (!this._themeToggle) return;
        
        // Met à jour l'état du mode sombre
        this._isDarkMode = this._themeToggle.checked;
        
        // Met à jour le label et l'icône
        if (this._themeIcon) {
            this._themeIcon.innerHTML = this._isDarkMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        }
        
        // Applique le thème
        this._applyTheme();
        
        // Sauvegarde la préférence
        this._saveThemePreference();
        
        console.log(`Thème basculé vers: ${this._isDarkMode ? 'sombre' : 'clair'}`);
    }
    
    /**
     * Applique le thème en fonction de l'état actuel
     * @private
     */
    _applyTheme() {
        if (this._isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    /**
     * Vérifie la préférence de thème du système d'exploitation
     * @private
     */
    _checkSystemPreference() {
        // Vérifie si le navigateur supporte la détection du thème système
        if (window.matchMedia) {
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Si aucune préférence n'a été sauvegardée, utilise la préférence système
            const savedPreference = StorageService.getPreference('darkMode', null);
            if (savedPreference === null && prefersDarkScheme.matches) {
                this._isDarkMode = true;
                if (this._themeToggle) this._themeToggle.checked = true;
                if (this._themeIcon) this._themeIcon.innerHTML = '<i class="fas fa-moon"></i>';
                this._applyTheme();
                this._saveThemePreference();
            }
            
            // Ajoute un écouteur pour détecter les changements de préférence système
            prefersDarkScheme.addEventListener('change', (e) => {
                // Ne change le thème automatiquement que si aucune préférence n'a été définie manuellement
                if (StorageService.getPreference('darkMode', null) === null) {
                    this._isDarkMode = e.matches;
                    if (this._themeToggle) this._themeToggle.checked = this._isDarkMode;
                    if (this._themeIcon) this._themeIcon.innerHTML = this._isDarkMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
                    this._applyTheme();
                }
            });
        }
    }
    
    /**
     * Active manuellement le mode sombre
     */
    enableDarkMode() {
        if (!this._isDarkMode) {
            this._isDarkMode = true;
            if (this._themeToggle) this._themeToggle.checked = true;
            if (this._themeIcon) this._themeIcon.innerHTML = '<i class="fas fa-moon"></i>';
            this._applyTheme();
            this._saveThemePreference();
        }
    }
    
    /**
     * Désactive manuellement le mode sombre
     */
    disableDarkMode() {
        if (this._isDarkMode) {
            this._isDarkMode = false;
            if (this._themeToggle) this._themeToggle.checked = false;
            if (this._themeIcon) this._themeIcon.innerHTML = '<i class="fas fa-sun"></i>';
            this._applyTheme();
            this._saveThemePreference();
        }
    }
    
    /**
     * Bascule manuellement le mode sombre
     */
    toggleDarkMode() {
        this._isDarkMode = !this._isDarkMode;
        if (this._themeToggle) this._themeToggle.checked = this._isDarkMode;
        if (this._themeIcon) this._themeIcon.innerHTML = this._isDarkMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        this._applyTheme();
        this._saveThemePreference();
    }
    
    /**
     * Vérifie si le mode sombre est actuellement activé
     * @returns {boolean} true si le mode sombre est activé
     */
    isDarkModeEnabled() {
        return this._isDarkMode;
    }
}