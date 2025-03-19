/**
 * @fileoverview Gestionnaire de visibilité des catégories
 * Gère l'affichage et les interactions avec le panneau de visibilité
 */

/**
 * @class VisibilityManager
 * Gère le panneau de visibilité des catégories
 */
class VisibilityManager {
    /**
     * Crée une instance du gestionnaire de visibilité
     * @param {VisibilityModel} visibilityModel - Modèle de visibilité
     * @param {CategoryModel} categoryModel - Modèle de catégories
     * @param {Function} updateCallback - Fonction à appeler après modification
     * @constructor
     */
    constructor(visibilityModel, categoryModel, updateCallback) {
        /**
         * Modèle de visibilité des catégories
         * @type {VisibilityModel}
         * @private
         */
        this._visibilityModel = visibilityModel;
        
        /**
         * Modèle de catégories
         * @type {CategoryModel}
         * @private
         */
        this._categoryModel = categoryModel;
        
        /**
         * Fonction de rappel après modification
         * @type {Function}
         * @private
         */
        this._updateCallback = updateCallback;
        
        /**
         * Panneau de visibilité
         * @type {HTMLElement|null}
         * @private
         */
        this._panel = null;
        
        /**
         * État d'ouverture du panneau
         * @type {boolean}
         * @private
         */
        this._isPanelOpen = false;
        
        // Crée le panneau
        this._createPanel();
    }
    
    /**
     * Crée le panneau de visibilité
     * @private
     */
    _createPanel() {
        // Crée le panneau
        const panel = document.createElement('div');
        panel.className = 'visibility-panel';
        panel.classList.add('closed'); // Initialement fermé
        
        // En-tête du panneau
        const header = document.createElement('div');
        header.className = 'visibility-panel-header';
        
        const title = document.createElement('h3');
        title.className = 'visibility-panel-title';
        title.textContent = 'Visibilité des sections';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'visibility-panel-close';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.setAttribute('aria-label', 'Fermer');
        closeButton.addEventListener('click', () => this.closePanel());
        
        header.appendChild(title);
        header.appendChild(closeButton);
        panel.appendChild(header);
        
        // Contenu du panneau
        const content = document.createElement('div');
        content.className = 'visibility-panel-content';
        
        // Description
        const description = document.createElement('p');
        description.className = 'visibility-panel-description';
        description.textContent = 'Sélectionnez les sections que vous souhaitez afficher :';
        content.appendChild(description);
        
        // Liste des catégories
        const categoriesList = document.createElement('div');
        categoriesList.className = 'visibility-categories-list';
        content.appendChild(categoriesList);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'visibility-panel-actions';
        
        // Bouton Afficher tout
        const showAllButton = document.createElement('button');
        showAllButton.className = 'visibility-show-all';
        showAllButton.textContent = 'Afficher tout';
        showAllButton.addEventListener('click', () => {
            this._visibilityModel.showAllCategories();
            this.updateCategoriesList();
            if (this._updateCallback) {
                this._updateCallback();
            }
        });
        
        // Bouton Masquer tout
        const hideAllButton = document.createElement('button');
        hideAllButton.className = 'visibility-hide-all';
        hideAllButton.textContent = 'Masquer tout';
        hideAllButton.addEventListener('click', () => {
            // Récupère toutes les catégories pour les masquer
            const categories = this._categoryModel.getOrderedCategories();
            const categoryIds = categories.map(category => category.id);
            
            this._visibilityModel.hideAllCategories(categoryIds);
            this.updateCategoriesList();
            if (this._updateCallback) {
                this._updateCallback();
            }
        });
        
        actions.appendChild(showAllButton);
        actions.appendChild(hideAllButton);
        content.appendChild(actions);
        
        panel.appendChild(content);
        
        // Ajoute le panneau au DOM
        document.body.appendChild(panel);
        this._panel = panel;
        
        // Met à jour la liste des catégories
        this.updateCategoriesList();
    }
    
    /**
     * Met à jour la liste des catégories dans le panneau
     */
    updateCategoriesList() {
        if (!this._panel) return;
        
        const categoriesList = this._panel.querySelector('.visibility-categories-list');
        if (!categoriesList) return;
        
        // Vide la liste
        categoriesList.innerHTML = '';
        
        // Récupère toutes les catégories
        const categories = this._categoryModel.getOrderedCategories();
        
        // Crée un élément pour chaque catégorie
        for (const category of categories) {
            const isVisible = this._visibilityModel.isCategoryVisible(category.id);
            
            const categoryItem = document.createElement('div');
            categoryItem.className = 'visibility-category-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `visibility-${category.id}`;
            checkbox.className = 'visibility-checkbox';
            checkbox.checked = isVisible;
            
            const label = document.createElement('label');
            label.htmlFor = `visibility-${category.id}`;
            label.className = 'visibility-label';
            
            // Utilise l'icône de la catégorie
            const iconClass = APP_CONFIG.CATEGORY_ICONS[category.id] || 'fas fa-folder';
            const icon = document.createElement('i');
            icon.className = iconClass;
            
            const name = document.createElement('span');
            name.textContent = category.name;
            
            label.appendChild(icon);
            label.appendChild(name);
            
            // Ajoute un écouteur d'événement pour le changement
            checkbox.addEventListener('change', () => {
                this._visibilityModel.setCategoryVisibility(category.id, checkbox.checked);
                if (this._updateCallback) {
                    this._updateCallback();
                }
            });
            
            categoryItem.appendChild(checkbox);
            categoryItem.appendChild(label);
            categoriesList.appendChild(categoryItem);
        }
    }
    
    /**
     * Ouvre le panneau de visibilité
     */
    openPanel() {
        if (!this._panel) return;
        
        this._isPanelOpen = true;
        this._panel.classList.remove('closed');
        this._panel.classList.add('open');
        
        // Met à jour la liste des catégories
        this.updateCategoriesList();
    }
    
    /**
     * Ferme le panneau de visibilité
     */
    closePanel() {
        if (!this._panel) return;
        
        this._isPanelOpen = false;
        this._panel.classList.remove('open');
        this._panel.classList.add('closed');
    }
    
    /**
     * Bascule l'état du panneau
     */
    togglePanel() {
        if (this._isPanelOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }
    
    /**
     * Filtre les catégories selon leur visibilité
     * @param {Array} categories - Liste des catégories
     * @returns {Array} Liste des catégories visibles
     */
    filterVisibleCategories(categories) {
        return categories.filter(category => 
            this._visibilityModel.isCategoryVisible(category.id)
        );
    }
}