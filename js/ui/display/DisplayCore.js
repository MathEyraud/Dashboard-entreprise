/**
 * @fileoverview Module principal de gestion des options d'affichage
 * Coordonne les contrôleurs de densité, disposition et interface utilisateur
 */

/**
 * @class DisplayCore
 * Gère les fonctionnalités centrales des options d'affichage
 */
class DisplayCore {
    /**
     * Crée une instance du gestionnaire des options d'affichage
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
        
        // Initialisation des contrôleurs
        this._densityController = new DensityController(this);
        this._layoutController = new LayoutController(this);
        
        // L'UI doit être initialisée après les contrôleurs
        this._displayOptionsUI = new DisplayOptionsUI(this);
        
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
            this._displayOptionsUI.updateCardVisibility(this._isCardOpen);
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
     * Applique les options d'affichage actuelles
     * @private
     */
    _applyDisplayOptions() {
        // Applique la densité via le contrôleur de densité
        this._densityController.applyDensity(this._currentDensity);
        
        // Applique la disposition via le contrôleur de disposition
        this._layoutController.applyLayout(this._currentLayout);
    }
    
    /**
     * Définit l'état d'ouverture de la carte
     * @param {boolean} isOpen - Nouvel état de la carte
     */
    setCardOpen(isOpen) {
        this._isCardOpen = isOpen;
        this._saveCardState();
    }
    
    /**
     * Récupère l'état d'ouverture de la carte
     * @returns {boolean} État d'ouverture de la carte
     */
    isCardOpen() {
        return this._isCardOpen;
    }
    
    /**
     * Définit la densité d'affichage
     * @param {string} density - Nouvelle densité
     */
    setDensity(density) {
        if (this._densityOptions[density]) {
            // Met à jour la densité actuelle
            this._currentDensity = density;
            
            // Applique la nouvelle densité
            this._densityController.applyDensity(density);
            
            // Sauvegarde les préférences
            this._saveDisplayPreferences();
            
            console.log(`Densité d'affichage changée pour : ${this._currentDensity}`);
            
            // Déclenche un événement pour informer de la modification
            this._triggerDisplayChangeEvent('density', this._currentDensity);
            
            // Mettre à jour le sélecteur dans l'UI
            this._displayOptionsUI.updateDensitySelector(density);
            
            return true;
        }
        return false;
    }
    
    /**
     * Récupère la densité d'affichage actuelle
     * @returns {string} Densité actuelle
     */
    getDensity() {
        return this._currentDensity;
    }
    
    /**
     * Récupère les options de densité disponibles
     * @returns {Object} Options de densité
     */
    getDensityOptions() {
        return this._densityOptions;
    }
    
    /**
     * Définit la disposition d'affichage
     * @param {string} layout - Nouvelle disposition
     */
    setLayout(layout) {
        if (this._layoutOptions[layout]) {
            // Met à jour la disposition actuelle
            this._currentLayout = layout;
            
            // Applique la nouvelle disposition
            this._layoutController.applyLayout(layout);
            
            // Sauvegarde les préférences
            this._saveDisplayPreferences();
            
            console.log(`Disposition d'affichage changée pour : ${this._currentLayout}`);
            
            // Déclenche un événement pour informer de la modification
            this._triggerDisplayChangeEvent('layout', this._currentLayout);
            
            // Mettre à jour le sélecteur dans l'UI
            this._displayOptionsUI.updateLayoutSelector(layout);
            
            return true;
        }
        return false;
    }
    
    /**
     * Récupère la disposition d'affichage actuelle
     * @returns {string} Disposition actuelle
     */
    getLayout() {
        return this._currentLayout;
    }
    
    /**
     * Récupère les options de disposition disponibles
     * @returns {Object} Options de disposition
     */
    getLayoutOptions() {
        return this._layoutOptions;
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
     * Réinitialise les options d'affichage aux valeurs par défaut
     */
    resetToDefaults() {
        this.setDensity('standard');
        this.setLayout('grid');
        return true;
    }
}