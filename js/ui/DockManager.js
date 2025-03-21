/**
 * @fileoverview Gestionnaire du dock de navigation
 * Gère l'affichage et les interactions avec le dock latéral de navigation
 */

/**
 * @class DockManager
 * Gère le dock de navigation
 */
class DockManager {
    /**
     * Crée une instance du gestionnaire de dock
     * @param {DockStateModel} dockStateModel - Modèle de gestion de l'état du dock
     * @constructor
     */
    constructor(dockStateModel) {
        /**
         * Modèle de gestion de l'état du dock
         * @type {DockStateModel}
         * @private
         */
        this._dockStateModel = dockStateModel;
        
        // Éléments du DOM
        this.dockElement = document.getElementById('quickDock');
        this.dockAppsElement = document.getElementById('dockApps');
        this.dockToggleElement = document.getElementById('dockToggle');
        
        // Vérifie que tous les éléments nécessaires sont présents
        this._checkElements();
        
        // Configure les écouteurs d'événements
        this._setupEventListeners();
        
        // Applique l'état initial du dock
        this._updateDockState();
    }
    
    /**
     * Vérifie que les éléments DOM nécessaires sont présents
     * @private
     */
    _checkElements() {
        const elements = [
            { element: this.dockElement, name: 'quickDock' },
            { element: this.dockAppsElement, name: 'dockApps' },
            { element: this.dockToggleElement, name: 'dockToggle' }
        ];
        
        for (const { element, name } of elements) {
            if (!element) {
                console.error(`Élément '${name}' non trouvé dans le DOM`);
            }
        }
    }
    
    /**
     * Configure les écouteurs d'événements
     * @private
     */
    _setupEventListeners() {
        // Écouteur pour le bouton de bascule du dock
        if (this.dockToggleElement) {
            this.dockToggleElement.addEventListener('click', () => this.toggleDock());
            
            // Ajoute une animation de pulsation pour indiquer l'interactivité
            this.dockToggleElement.classList.add('pulse');
            
            // Retire l'animation après quelques secondes
            setTimeout(() => {
                this.dockToggleElement.classList.remove('pulse');
            }, 5000);
        }
    }
    
    /**
     * Met à jour l'état du dock dans le DOM
     * @private
     */
    _updateDockState() {
        if (!this.dockElement) return;
        
        const isOpen = this._dockStateModel.isOpen();
        
        if (isOpen) {
            this.dockElement.classList.remove('collapsed');
            this.dockToggleElement.innerHTML = '<i class="fas fa-chevron-left"></i>';
        } else {
            this.dockElement.classList.add('collapsed');
            this.dockToggleElement.innerHTML = '<i class="fas fa-chevron-left"></i>';
        }
    }
    
    /**
     * Bascule l'état d'ouverture du dock
     */
    toggleDock() {
        this._dockStateModel.toggleOpen();
        this._updateDockState();
    }
    
    /**
     * Met à jour le dock avec les catégories disponibles
     * @param {Array} categories - Liste des catégories
     * @param {string} currentCategoryId - ID de la catégorie active
     * @param {Function} categoryClickCallback - Fonction à appeler lors du clic sur une catégorie
     * @param {Function} settingsClickCallback - Fonction à appeler lors du clic sur le bouton de paramètres
     */
    updateDockCategories(categories, currentCategoryId, categoryClickCallback, settingsClickCallback) {
        if (!this.dockAppsElement) return;
        
        // Vide le dock
        this.dockAppsElement.innerHTML = '';
        
        // Ajoute le bouton de paramètres
        if (settingsClickCallback) {
            const settingsButton = document.createElement('div');
            settingsButton.className = 'dock-settings-button';
            settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
            settingsButton.setAttribute('title', 'Paramètres de visibilité');
            
            // Ajoute un écouteur d'événement pour le clic
            settingsButton.addEventListener('click', () => settingsClickCallback());
            
            this.dockAppsElement.appendChild(settingsButton);
        }
        
        // Si aucune catégorie, affiche un message
        if (!categories || categories.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'dock-empty';
            emptyMessage.innerHTML = '<i class="fas fa-folder-open"></i><span>Aucune section</span>';
            this.dockAppsElement.appendChild(emptyMessage);
            return;
        }
        
        // Ajoute chaque catégorie au dock
        for (const category of categories) {
            const categoryElement = this._createDockCategory(category, category.id === currentCategoryId);
            
            // Ajoute un écouteur d'événement pour le clic
            if (categoryClickCallback) {
                categoryElement.addEventListener('click', () => categoryClickCallback(category.id));
            }
            
            this.dockAppsElement.appendChild(categoryElement);
        }
    }    

    /**
     * Marque une catégorie comme active dans le dock
     * @param {string} categoryId - ID de la catégorie active
     */
    setActiveCategory(categoryId) {
        if (!this.dockAppsElement) return;
        
        // Retire la classe active de toutes les catégories
        const categories = this.dockAppsElement.querySelectorAll('.dock-category');
        categories.forEach(category => {
            category.classList.remove('active');
        });
        
        // Ajoute la classe active à la catégorie correspondante
        const activeCategory = this.dockAppsElement.querySelector(`[data-category-id="${categoryId}"]`);
        if (activeCategory) {
            activeCategory.classList.add('active');
        }
    }
    
    /**
     * Crée un élément pour une catégorie du dock
     * @param {Object} category - Données de la catégorie
     * @param {boolean} isActive - Indique si la catégorie est active
     * @returns {HTMLElement} Élément créé
     * @private
     */
    _createDockCategory(category, isActive) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'dock-category';
        if (isActive) {
            categoryElement.classList.add('active');
        }
        
        categoryElement.setAttribute('data-category-id', category.id);
        categoryElement.setAttribute('data-name', category.name);
        
        // Amélioration de l'accessibilité : ajout d'un attribut title avec le nom et la description
        let titleText = category.name;
        if (category.description) {
            titleText += ` - ${category.description}`;
        }
        categoryElement.setAttribute('title', titleText);
        
        // Utilise une couleur spécifique à la catégorie ou une couleur par défaut
        const metadata = CATEGORIES_METADATA && CATEGORIES_METADATA.categories ? 
            CATEGORIES_METADATA.categories[category.id] : null;
        
        const color = metadata && metadata.color ? metadata.color : '#3498db';
        categoryElement.style.backgroundColor = color;
        
        // Utilise l'icône spécifiée ou une icône par défaut
        const iconClass = APP_CONFIG.CATEGORY_ICONS[category.id] || 'fas fa-folder';
        categoryElement.innerHTML = `<i class="${iconClass}"></i>`;
        
        return categoryElement;
    }
}