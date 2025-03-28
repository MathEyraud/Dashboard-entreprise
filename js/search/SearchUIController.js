/**
 * @fileoverview Contrôleur d'interface utilisateur de recherche
 * Gère l'interface de recherche et les interactions utilisateur
 */

/**
 * @class SearchUIController
 * Contrôleur pour l'interface utilisateur de recherche
 */
class SearchUIController {
    /**
     * Crée une instance du contrôleur d'interface de recherche
     * @param {SearchCore} searchCore - Moteur de recherche de base
     * @param {SearchResultRenderer} resultRenderer - Gestionnaire d'affichage des résultats
     * @constructor
     */
    constructor(searchCore, resultRenderer) {
        /**
         * Moteur de recherche de base
         * @type {SearchCore}
         * @private
         */
        this._searchCore = searchCore;
        
        /**
         * Gestionnaire d'affichage des résultats
         * @type {SearchResultRenderer}
         * @private
         */
        this._resultRenderer = resultRenderer;
        
        /**
         * Délai pour la recherche en temps réel
         * @type {number|null}
         * @private
         */
        this._searchTimeout = null;

        // Éléments du DOM
        this.searchContainer = document.querySelector('.search-container');
        this.searchInput = document.getElementById('globalSearch');
        this.searchResults = document.getElementById('searchResults');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.categoryFilter = document.getElementById('categoryFilter');
        
        // Vérifier que tous les éléments nécessaires sont présents
        this._checkElements();
        
        // Configure les écouteurs d'événements
        this._setupEventListeners();
        
        // Initialise les filtres
        this._initializeFilters();
    }
    
    /**
     * Vérifie que les éléments DOM nécessaires sont présents
     * @private
     */
    _checkElements() {
        const elements = [
            { element: this.searchContainer, name: 'search-container' },
            { element: this.searchInput, name: 'globalSearch' },
            { element: this.searchResults, name: 'searchResults' },
            { element: this.clearSearchBtn, name: 'clearSearch' },
            { element: this.categoryFilter, name: 'categoryFilter' }
        ];
        
        for (const { element, name } of elements) {
            if (!element) {
                console.error(`Élément '${name}' non trouvé dans le DOM`);
            }
        }
    }
    
    /**
     * Configure les écouteurs d'événements pour l'interface de recherche
     * @private
     */
    _setupEventListeners() {
        if (this.searchInput) {
            // Écouteur pour la saisie dans le champ de recherche
            this.searchInput.addEventListener('input', () => this._handleInputEvent());
            
            // Écouteur pour le focus sur le champ de recherche
            this.searchInput.addEventListener('focus', () => this._handleFocusEvent());
            
            // Navigation au clavier dans les résultats
            this.searchInput.addEventListener('keydown', (event) => this._handleKeyboardNavigation(event));
        }
        
        // Écouteur pour le bouton de nettoyage
        if (this.clearSearchBtn) {
            this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
        }
        
        // Écouteur pour le filtre de catégorie
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => this._handleCategoryFilterChange());
        }
        
        // Raccourci clavier "/"
        document.addEventListener('keydown', (event) => this._handleGlobalKeydown(event));
        
        // Fermer les résultats quand on clique en dehors
        document.addEventListener('click', (event) => this._handleOutsideClick(event));
        
        // Écouter les mises à jour de favoris pour rafraîchir les résultats
        document.addEventListener('favoritesUpdated', () => {
            this._resultRenderer.updateFavoriteButtons(this.searchResults);
            
            // Si on a des résultats actifs, les rafraîchir
            if (this.searchResults && this.searchResults.classList.contains('active') && this._searchCore.getLastSearchTerm()) {
                this.refreshSearchResults();
            }
        });
    }
    
    /**
     * Définit l'élément de résultat actif
     * @param {NodeList} resultItems - Liste des éléments de résultat
     * @param {number} activeIndex - Index de l'élément actif
     * @private
     */
    _setActiveResultItem(resultItems, activeIndex) {
        // Retirer la classe active de tous les éléments
        resultItems.forEach(item => item.classList.remove('active'));
        
        // Ajouter la classe active à l'élément sélectionné
        const activeItem = resultItems[activeIndex];
        activeItem.classList.add('active');
        
        // Assurer que l'élément est visible dans la liste
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    
    /**
     * Affiche l'historique des recherches
     * @private
     */
    _displaySearchHistory() {
        if (!this.searchResults) return;
        
        // Récupérer l'historique des recherches
        const history = this._searchCore.getRecentSearches(5);
        
        if (history.length === 0) return; // Pas d'historique à afficher
        
        // Utiliser le renderer pour afficher l'historique
        this._resultRenderer.displaySearchHistory(
            history, 
            this.searchResults, 
            (term) => {
                // Callback pour un clic sur un élément d'historique
                this.searchInput.value = term;
                this.performSearch(term);
            }
        );
        
        // Afficher les résultats
        this.searchResults.classList.add('active');
    }
    
    /**
     * Initialise les filtres de recherche
     * @private
     */
    _initializeFilters() {
        if (!this.categoryFilter) return;
        
        // Vider le sélecteur
        this.categoryFilter.innerHTML = '';
        
        // Ajouter l'option "Toutes les catégories"
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'Toutes les catégories';
        this.categoryFilter.appendChild(allOption);
        
        try {
            // Récupérer les catégories disponibles depuis le modèle global
            const categoryModel = window.appController ? window.appController.categoryModel : null;
            if (categoryModel) {
                const categories = categoryModel.getOrderedCategories();
                
                // Ajouter une option pour chaque catégorie
                for (const category of categories) {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    this.categoryFilter.appendChild(option);
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des filtres de catégorie:', error);
        }
    }
    
    /**
     * Effectue une recherche et affiche les résultats
     * @param {string} searchTerm - Terme de recherche
     */
    performSearch(searchTerm) {
        if (!this.searchResults) return;

        // Effectue la recherche avec le moteur
        const results = this._searchCore.performSearch(searchTerm);
        
        // Utilise le renderer pour afficher les résultats
        this._resultRenderer.displayResults(
            results, 
            searchTerm, 
            this.searchResults,
            // Callback pour le clic sur un résultat
            (app) => {
                window.open(app.url, '_blank');
                this.searchResults.classList.remove('active');
                
                // Enregistrer l'utilisation
                this._searchCore.trackAppUsage(app.id, app.categoryId);
            },
            // Callback pour basculer un favori
            (appId, categoryId, groupId, buttonElement) => {
                if (window.appController) {
                    window.appController.toggleFavorite(appId, categoryId, groupId, buttonElement);
                }
            },
            // Callback pour afficher le sélecteur de groupe
            (app, categoryId) => {
                // Fermer les résultats de recherche
                this.searchResults.classList.remove('active');
                
                // Afficher le sélecteur de groupe via AppController
                if (window.appController && window.appController.uiManager) {
                    window.appController.uiManager.showGroupSelector(
                        app,
                        categoryId,
                        (appId, categoryId, groupId) => {
                            window.appController.toggleFavorite(appId, categoryId, groupId);
                        },
                        (action, id, extraId) => window.appController.handleGroupAction(action, id, extraId)
                    );
                }
            }
        );
    }
    
    /**
     * Rafraîchit les résultats de recherche actuels
     */
    refreshSearchResults() {
        const searchTerm = this._searchCore.getLastSearchTerm();
        if (!searchTerm || searchTerm.trim().length === 0) return;
        
        // Refaire la recherche avec le terme actuel
        this.performSearch(searchTerm);
    }
    
    /**
     * Vide le champ de recherche et les résultats
     */
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        if (this.searchResults) {
            this.searchResults.innerHTML = '';
            this.searchResults.classList.remove('active');
        }
        
        // Réinitialiser les filtres
        this._searchCore.setCategoryFilter('');
        if (this.categoryFilter) {
            this.categoryFilter.value = '';
        }
        
        // Cacher la section des filtres
        this.searchContainer.classList.remove('filtering');
    }
    
    /**
     * Gère l'événement d'entrée dans le champ de recherche
     * @private
     */
    _handleInputEvent() {
        // Annuler le délai précédent
        clearTimeout(this._searchTimeout);
        
        // Définir un nouveau délai pour éviter trop de recherches pendant la frappe
        this._searchTimeout = setTimeout(() => {
            const searchTerm = this.searchInput.value.trim();
            
            // Ne rien faire si la recherche est inchangée
            if (searchTerm === this._searchCore.getLastSearchTerm()) {
                return;
            }
            
            if (searchTerm.length > 0) {
                // Montrer les filtres
                this.searchContainer.classList.add('filtering');
                
                // Effectuer la recherche
                this.performSearch(searchTerm);
                this.searchResults.classList.add('active');
            } else {
                // Cacher les filtres
                this.searchContainer.classList.remove('filtering');
                
                // Vider les résultats
                this.searchResults.innerHTML = '';
                this.searchResults.classList.remove('active');
            }
        }, 300); // Délai de 300ms pour réduire la fréquence des recherches
    }
    
    /**
     * Gère l'événement de focus sur le champ de recherche
     * @private
     */
    _handleFocusEvent() {
        const searchTerm = this.searchInput.value.trim();
        if (searchTerm.length > 0) {
            // Montrer les filtres et les résultats
            this.searchContainer.classList.add('filtering');
            this.searchResults.classList.add('active');
        } else {
            // Afficher l'historique des recherches s'il y en a
            this._displaySearchHistory();
        }
    }
    
    /**
     * Gère la navigation au clavier dans les résultats
     * @param {KeyboardEvent} event - Événement clavier
     * @private
     */
    _handleKeyboardNavigation(event) {
        if (this.searchResults.classList.contains('active')) {
            const resultItems = this.searchResults.querySelectorAll('.search-result-item');
            if (resultItems.length === 0) return;
            
            // Trouver l'élément actuellement sélectionné
            const activeItem = this.searchResults.querySelector('.search-result-item.active');
            let activeIndex = -1;
            
            if (activeItem) {
                activeIndex = Array.from(resultItems).indexOf(activeItem);
            }
            
            // Naviguer avec les flèches
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                activeIndex = (activeIndex + 1) % resultItems.length;
                this._setActiveResultItem(resultItems, activeIndex);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                activeIndex = (activeIndex - 1 + resultItems.length) % resultItems.length;
                this._setActiveResultItem(resultItems, activeIndex);
            } else if (event.key === 'Enter' && activeItem) {
                event.preventDefault();
                // Simuler un clic sur l'élément actif
                activeItem.click();
            }
        }
    }
    
    /**
     * Gère le changement de filtre de catégorie
     * @private
     */
    _handleCategoryFilterChange() {
        // Met à jour le filtre dans le moteur de recherche
        this._searchCore.setCategoryFilter(this.categoryFilter.value);
        
        // Refaire la recherche avec le nouveau filtre
        const searchTerm = this._searchCore.getLastSearchTerm();
        if (searchTerm && searchTerm.length > 0) {
            this.performSearch(searchTerm);
        }
    }
    
    /**
     * Gère les touches de raccourci global
     * @param {KeyboardEvent} event - Événement clavier
     * @private
     */
    _handleGlobalKeydown(event) {
        // Ne pas intercepter si un élément de formulaire a le focus
        if (document.activeElement.tagName === 'INPUT' || 
            document.activeElement.tagName === 'TEXTAREA' || 
            document.activeElement.tagName === 'SELECT') {
            return;
        }
        
        if (event.key === '/' || (event.key === 'f' && (event.ctrlKey || event.metaKey))) {
            event.preventDefault();
            this.searchInput.focus();
        }
    }
    
    /**
     * Gère les clics en dehors de la zone de recherche
     * @param {MouseEvent} event - Événement de clic
     * @private
     */
    _handleOutsideClick(event) {
        if (!this.searchInput.contains(event.target) && 
            !this.searchResults.contains(event.target) &&
            !this.categoryFilter?.contains(event.target)) {
            this.searchResults.classList.remove('active');
            this.searchContainer.classList.remove('filtering');
        }
    }
}