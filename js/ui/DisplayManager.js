/**
 * @fileoverview Gestionnaire d'affichage
 * Gère les options de densité et de disposition des tuiles d'applications
 */

/**
 * @class DisplayManager
 * Gère les options d'affichage du dashboard
 */
class DisplayManager {
    /**
     * Crée une instance du gestionnaire d'affichage
     * @constructor
     */
    constructor() {
        /**
         * Options de densité disponibles
         * @type {Object}
         * @private
         */
        this._densityOptions = {
            compact: 'Compact',
            standard: 'Standard',
            comfortable: 'Confortable'
        };
        
        /**
         * Options de disposition disponibles
         * @type {Object}
         * @private
         */
        this._layoutOptions = {
            grid: 'Grille',
            list: 'Liste'
        };
        
        /**
         * Densité d'affichage actuelle
         * @type {string}
         * @private
         */
        this._currentDensity = 'standard';
        
        /**
         * Disposition d'affichage actuelle
         * @type {string}
         * @private
         */
        this._currentLayout = 'grid';
        
        /**
         * État d'ouverture de la carte d'options
         * @type {boolean}
         * @private
         */
        this._isCardOpen = false;
        
        /**
         * Élément de la carte d'options
         * @type {HTMLElement|null}
         * @private
         */
        this._optionsCard = null;
        
        /**
         * Élément du bouton d'ouverture de la carte
         * @type {HTMLElement|null}
         * @private
         */
        this._toggleButton = null;
        
        /**
         * Élément de sélection de densité
         * @type {HTMLElement|null}
         * @private
         */
        this._densitySelector = null;
        
        /**
         * Élément de sélection de disposition
         * @type {HTMLElement|null}
         * @private
         */
        this._layoutSelector = null;
        
        // Initialise le gestionnaire d'affichage
        this._initialize();
    }
    
    /**
     * Initialise le gestionnaire d'affichage
     * @private
     */
    _initialize() {
        // Charge les préférences depuis le localStorage
        this._loadDisplayPreferences();
        
        // Crée et ajoute le bouton et la carte d'options à l'interface
        this._createDisplayOptionsUI();
        
        // Applique les options d'affichage actuelles
        this._applyDisplayOptions();
        
        // Charge l'état d'ouverture de la carte
        this._loadCardState();
    }
    
    /**
     * Charge les préférences d'affichage depuis localStorage
     * @private
     */
    _loadDisplayPreferences() {
        try {
            const savedDensity = StorageService.getPreference('displayDensity', null);
            if (savedDensity !== null && this._densityOptions[savedDensity]) {
                this._currentDensity = savedDensity;
                console.log(`Préférence de densité chargée: ${this._currentDensity}`);
            }
            
            const savedLayout = StorageService.getPreference('displayLayout', null);
            if (savedLayout !== null) {
                // Si la disposition sauvegardée est 'detailed', utiliser 'list' à la place
                if (savedLayout === 'detailed') {
                    this._currentLayout = 'list';
                    // Mettre à jour la préférence pour modifier la terminologie
                    StorageService.updatePreference('displayLayout', 'list');
                } else if (this._layoutOptions[savedLayout]) {
                    this._currentLayout = savedLayout;
                }
                console.log(`Préférence de disposition chargée: ${this._currentLayout}`);
            }
        } catch (e) {
            console.error('Erreur lors du chargement des préférences d\'affichage:', e);
        }
    }
    
    /**
     * Sauvegarde les préférences d'affichage dans localStorage
     * @private
     */
    _saveDisplayPreferences() {
        try {
            StorageService.updatePreference('displayDensity', this._currentDensity);
            StorageService.updatePreference('displayLayout', this._currentLayout);
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des préférences d\'affichage:', e);
        }
    }
    
    /**
     * Charge l'état d'ouverture de la carte depuis localStorage
     * @private
     */
    _loadCardState() {
        try {
            const savedState = StorageService.getPreference('displayCardOpen', false);
            this._isCardOpen = savedState;
            this._updateCardVisibility();
        } catch (e) {
            console.error('Erreur lors du chargement de l\'état de la carte:', e);
        }
    }
    
    /**
     * Sauvegarde l'état d'ouverture de la carte dans localStorage
     * @private
     */
    _saveCardState() {
        try {
            StorageService.updatePreference('displayCardOpen', this._isCardOpen);
        } catch (e) {
            console.error('Erreur lors de la sauvegarde de l\'état de la carte:', e);
        }
    }
    
    /**
     * Crée et ajoute le bouton et la carte d'options à l'interface
     * @private
     */
    _createDisplayOptionsUI() {
        // Création du bouton de bascule
        this._createToggleButton();
        
        // Création de la carte d'options
        this._createOptionsCard();
    }
    
    /**
     * Crée le bouton pour ouvrir/fermer la carte d'options
     * @private
     */
    _createToggleButton() {
        const button = document.createElement('button');
        button.className = 'display-toggle-button';
        button.setAttribute('aria-label', 'Options d\'affichage');
        button.innerHTML = '<i class="fas fa-palette"></i>';
        
        button.addEventListener('click', () => {
            this._toggleCard();
        });
        
        document.body.appendChild(button);
        this._toggleButton = button;
    }
    
    /**
     * Crée la carte d'options d'affichage
     * @private
     */
    _createOptionsCard() {
        const card = document.createElement('div');
        card.className = 'display-options-card closed';
        
        // En-tête de la carte
        const header = document.createElement('div');
        header.className = 'display-options-card-header';
        
        const title = document.createElement('div');
        title.className = 'display-options-card-title';
        title.textContent = 'Options d\'affichage';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'display-options-card-close';
        closeButton.setAttribute('aria-label', 'Fermer');
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.addEventListener('click', () => {
            this._closeCard();
        });
        
        header.appendChild(title);
        header.appendChild(closeButton);
        card.appendChild(header);
        
        // Contenu de la carte
        const content = document.createElement('div');
        content.className = 'display-options-wrapper';
        
        // Ajoute le sélecteur de densité
        this._densitySelector = this._createSelector(
            'density-selector',
            'Densité d\'affichage',
            this._densityOptions,
            this._currentDensity,
            (value) => this._handleDensityChange(value)
        );
        content.appendChild(this._densitySelector);
        
        // Ajoute le sélecteur de disposition
        this._layoutSelector = this._createSelector(
            'layout-selector',
            'Disposition',
            this._layoutOptions,
            this._currentLayout,
            (value) => this._handleLayoutChange(value)
        );
        content.appendChild(this._layoutSelector);
        
        card.appendChild(content);
        document.body.appendChild(card);
        this._optionsCard = card;
    }
    
    /**
     * Crée un sélecteur d'option d'affichage
     * @param {string} id - ID du sélecteur
     * @param {string} label - Libellé du sélecteur
     * @param {Object} options - Options disponibles (clé-valeur)
     * @param {string} currentValue - Valeur actuelle
     * @param {Function} changeHandler - Fonction à appeler lors du changement
     * @returns {HTMLElement} Élément sélecteur créé
     * @private
     */
    _createSelector(id, label, options, currentValue, changeHandler) {
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'display-selector-container';
        selectorContainer.id = `${id}-container`;
        
        // Libellé
        const labelElement = document.createElement('label');
        labelElement.htmlFor = id;
        labelElement.className = 'display-selector-label';
        labelElement.textContent = label;
        selectorContainer.appendChild(labelElement);
        
        // Sélecteur
        const select = document.createElement('select');
        select.id = id;
        select.className = 'display-selector';
        select.setAttribute('aria-label', label);
        
        // Ajoute les options
        for (const [value, text] of Object.entries(options)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            option.selected = value === currentValue;
            select.appendChild(option);
        }
        
        // Ajoute l'écouteur d'événement pour le changement
        select.addEventListener('change', () => changeHandler(select.value));
        
        selectorContainer.appendChild(select);
        
        return selectorContainer;
    }
    
    /**
     * Ouvre la carte d'options
     * @private
     */
    _openCard() {
        if (!this._optionsCard) return;
        
        this._isCardOpen = true;
        this._optionsCard.classList.remove('closed');
        this._optionsCard.classList.add('open');
        this._saveCardState();
    }
    
    /**
     * Ferme la carte d'options
     * @private
     */
    _closeCard() {
        if (!this._optionsCard) return;
        
        this._isCardOpen = false;
        this._optionsCard.classList.remove('open');
        this._optionsCard.classList.add('closed');
        this._saveCardState();
    }
    
    /**
     * Bascule l'état d'ouverture de la carte
     * @private
     */
    _toggleCard() {
        if (this._isCardOpen) {
            this._closeCard();
        } else {
            this._openCard();
        }
    }
    
    /**
     * Met à jour la visibilité de la carte selon l'état courant
     * @private
     */
    _updateCardVisibility() {
        if (!this._optionsCard) return;
        
        if (this._isCardOpen) {
            this._optionsCard.classList.remove('closed');
            this._optionsCard.classList.add('open');
        } else {
            this._optionsCard.classList.remove('open');
            this._optionsCard.classList.add('closed');
        }
    }
    
    /**
     * Gère le changement de densité d'affichage
     * @param {string} density - Nouvelle densité
     * @private
     */
    _handleDensityChange(density) {
        if (this._densityOptions[density]) {
            // Retire la classe de densité actuelle
            document.body.classList.remove(`density-${this._currentDensity}`);
            
            // Met à jour la densité actuelle
            this._currentDensity = density;
            
            // Applique la nouvelle densité
            document.body.classList.add(`density-${this._currentDensity}`);
            
            // Sauvegarde les préférences
            this._saveDisplayPreferences();
            
            console.log(`Densité d'affichage changée pour : ${this._currentDensity}`);
            
            // Déclenche un événement pour informer de la modification
            this._triggerDisplayChangeEvent('density', this._currentDensity);
        }
    }
    
    /**
     * Gère le changement de disposition d'affichage
     * @param {string} layout - Nouvelle disposition
     * @private
     */
    _handleLayoutChange(layout) {
        if (this._layoutOptions[layout]) {
            // Retire la classe de disposition actuelle
            document.body.classList.remove(`layout-${this._currentLayout}`);
            // Retire aussi la classe 'layout-detailed' si elle existe encore
            document.body.classList.remove('layout-detailed');
            
            // Met à jour la disposition actuelle
            this._currentLayout = layout;
            
            // Applique la nouvelle disposition
            document.body.classList.add(`layout-${this._currentLayout}`);
            
            // Sauvegarde les préférences
            this._saveDisplayPreferences();
            
            console.log(`Disposition d'affichage changée pour : ${this._currentLayout}`);
            
            // Déclenche un événement pour informer de la modification
            this._triggerDisplayChangeEvent('layout', this._currentLayout);
        }
    }
    
    /**
     * Déclenche un événement personnalisé pour les changements d'affichage
     * @param {string} type - Type de changement ('density' ou 'layout')
     * @param {string} value - Nouvelle valeur
     * @private
     */
    _triggerDisplayChangeEvent(type, value) {
        const event = new CustomEvent(`display${type.charAt(0).toUpperCase() + type.slice(1)}Changed`, {
            detail: {
                [type]: value
            },
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Applique les options d'affichage actuelles
     * @private
     */
    _applyDisplayOptions() {
        // Applique la densité
        document.body.classList.add(`density-${this._currentDensity}`);
        
        // Applique la disposition
        document.body.classList.add(`layout-${this._currentLayout}`);
        
        // Pour la compatibilité avec l'ancien système, si la disposition est 'list'
        // et que le body a déjà la classe 'layout-detailed', la supprimer
        if (this._currentLayout === 'list' && document.body.classList.contains('layout-detailed')) {
            document.body.classList.remove('layout-detailed');
        }
    }
    
    /**
     * Définit la densité d'affichage
     * @param {string} density - Nouvelle densité
     */
    setDensity(density) {
        if (this._densityOptions[density]) {
            this._handleDensityChange(density);
            
            // Met à jour le sélecteur
            if (this._densitySelector) {
                const select = this._densitySelector.querySelector('select');
                if (select) {
                    select.value = density;
                }
            }
        }
    }
    
    /**
     * Récupère la densité d'affichage actuelle
     * @returns {string} Densité actuelle
     */
    getDensity() {
        return this._currentDensity;
    }
    
    /**
     * Définit la disposition d'affichage
     * @param {string} layout - Nouvelle disposition
     */
    setLayout(layout) {
        if (this._layoutOptions[layout]) {
            this._handleLayoutChange(layout);
            
            // Met à jour le sélecteur
            if (this._layoutSelector) {
                const select = this._layoutSelector.querySelector('select');
                if (select) {
                    select.value = layout;
                }
            }
        }
    }
    
    /**
     * Récupère la disposition d'affichage actuelle
     * @returns {string} Disposition actuelle
     */
    getLayout() {
        return this._currentLayout;
    }
    
    /**
     * Réinitialise les options d'affichage aux valeurs par défaut
     */
    resetToDefaults() {
        this.setDensity('standard');
        this.setLayout('grid');
    }
}