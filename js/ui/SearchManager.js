/**
 * @fileoverview Gestionnaire de recherche
 * Gère la fonctionnalité de recherche globale dans l'application
 */

/**
 * @class SearchManager
 * Gère la recherche d'applications dans toutes les catégories
 */
class SearchManager {
    /**
     * Crée une instance du gestionnaire de recherche
     * @param {CategoryModel} categoryModel - Modèle de données des catégories
     * @param {SearchModelService} searchModelService - Service de modèle de recherche (optionnel)
     * @param {UsageTrackingService} usageTrackingService - Service de suivi d'utilisation (optionnel)
     * @param {SearchHistoryModel} searchHistoryModel - Modèle d'historique de recherche (optionnel)
     * @constructor
     */
    constructor(categoryModel, searchModelService, usageTrackingService, searchHistoryModel) {
        /**
         * Modèle de données des catégories
         * @type {CategoryModel}
         * @private
         */
        this._categoryModel = categoryModel;
        
        /**
         * Service de modèle de recherche
         * @type {SearchModelService}
         * @private
         */
        this._searchModelService = searchModelService || new SearchModelService(categoryModel);
        
        /**
         * Service de suivi d'utilisation
         * @type {UsageTrackingService}
         * @private
         */
        this._usageTrackingService = usageTrackingService || new UsageTrackingService();
        
        /**
         * Modèle d'historique de recherche
         * @type {SearchHistoryModel}
         * @private
         */
        this._searchHistoryModel = searchHistoryModel || new SearchHistoryModel();
        
        // Éléments du DOM
        this.searchContainer = document.querySelector('.search-container');
        this.searchInput = document.getElementById('globalSearch');
        this.searchResults = document.getElementById('searchResults');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.categoryFilter = document.getElementById('categoryFilter');
        
        // Vérifier que tous les éléments nécessaires sont présents
        this._checkElements();
        
        // Dernier terme de recherche
        this._lastSearchTerm = '';
        
        // Délai pour la recherche en temps réel
        this._searchTimeout = null;
        
        // Filtre de catégorie actuel
        this._currentCategoryFilter = '';
        
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
     * Configure les écouteurs d'événements
     * @private
     */
    _setupEventListeners() {
        if (this.searchInput) {
            // Écouteur pour la saisie dans le champ de recherche
            this.searchInput.addEventListener('input', () => {
                // Annuler le délai précédent
                clearTimeout(this._searchTimeout);
                
                // Définir un nouveau délai pour éviter trop de recherches pendant la frappe
                this._searchTimeout = setTimeout(() => {
                    const searchTerm = this.searchInput.value.trim();
                    
                    // Ne rien faire si la recherche est vide ou inchangée
                    if (searchTerm === this._lastSearchTerm) {
                        return;
                    }
                    
                    this._lastSearchTerm = searchTerm;
                    
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
            });
            
            // Écouteur pour le focus sur le champ de recherche
            this.searchInput.addEventListener('focus', () => {
                const searchTerm = this.searchInput.value.trim();
                if (searchTerm.length > 0) {
                    // Montrer les filtres et les résultats
                    this.searchContainer.classList.add('filtering');
                    this.searchResults.classList.add('active');
                } else {
                    // Afficher l'historique des recherches s'il y en a
                    this._displaySearchHistory();
                }
            });
            
            // Ajouter un écouteur pour le raccourci clavier "/" qui place le focus dans le champ de recherche
            document.addEventListener('keydown', (event) => {
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
            });
            
            // Navigation au clavier dans les résultats
            this.searchInput.addEventListener('keydown', (event) => {
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
            });
        }
        
        // Écouteur pour le bouton de nettoyage
        if (this.clearSearchBtn) {
            this.clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // Écouteur pour le filtre de catégorie
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => {
                this._currentCategoryFilter = this.categoryFilter.value;
                
                // Refaire la recherche avec le nouveau filtre
                if (this._lastSearchTerm.length > 0) {
                    this.performSearch(this._lastSearchTerm);
                }
            });
        }
        
        // Fermer les résultats quand on clique en dehors
        document.addEventListener('click', (event) => {
            if (!this.searchInput.contains(event.target) && 
                !this.searchResults.contains(event.target) &&
                !this.categoryFilter?.contains(event.target)) {
                this.searchResults.classList.remove('active');
                this.searchContainer.classList.remove('filtering');
            }
        });
        
        // Écouteur pour la touche Échap
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.searchResults.classList.remove('active');
                this.searchContainer.classList.remove('filtering');
                this.searchInput.blur();
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
        
        // Récupérer les catégories disponibles
        const categories = this._categoryModel.getOrderedCategories();
        
        // Ajouter une option pour chaque catégorie
        for (const category of categories) {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            this.categoryFilter.appendChild(option);
        }
    }
    
    /**
     * Affiche l'historique des recherches
     * @private
     */
    _displaySearchHistory() {
        if (!this.searchResults || !this._searchHistoryModel) return;
        
        // Récupérer l'historique des recherches
        const history = this._searchHistoryModel.getRecentSearches(5);
        
        if (history.length === 0) return; // Pas d'historique à afficher
        
        // Afficher l'historique
        this.searchResults.innerHTML = '';
        
        const historySection = document.createElement('div');
        historySection.className = 'search-history';
        
        const historyTitle = document.createElement('div');
        historyTitle.className = 'search-history-title';
        historyTitle.textContent = 'Recherches récentes';
        historySection.appendChild(historyTitle);
        
        const historyItems = document.createElement('div');
        historyItems.className = 'search-history-items';
        
        for (const item of history) {
            const historyItem = document.createElement('div');
            historyItem.className = 'search-history-item';
            historyItem.innerHTML = `<i class="fas fa-history"></i> ${item.term}`;
            
            // Ajouter un écouteur pour utiliser le terme
            historyItem.addEventListener('click', () => {
                this.searchInput.value = item.term;
                this._lastSearchTerm = item.term;
                this.performSearch(item.term);
            });
            
            historyItems.appendChild(historyItem);
        }
        
        historySection.appendChild(historyItems);
        this.searchResults.appendChild(historySection);
        
        // Afficher les résultats
        this.searchResults.classList.add('active');
    }
    
    /**
     * Effectue une recherche d'applications
     * @param {string} searchTerm - Terme de recherche
     */
    performSearch(searchTerm) {
        if (!this.searchResults) return;
        
        // Ajouter le terme à l'historique
        if (this._searchHistoryModel) {
            this._searchHistoryModel.addSearch(searchTerm);
        }
        
        // Effectuer la recherche avec le service
        const results = this._searchModelService.search(searchTerm, {
            categoryId: this._currentCategoryFilter || undefined, // Filtrer par catégorie si défini
            fuzzy: true // Activer la recherche approximative
        });
        
        // Afficher les résultats
        this._displayResults(results, searchTerm);
    }
    
    /**
     * Affiche les résultats de la recherche
     * @param {Array} results - Résultats de la recherche
     * @param {string} searchTerm - Terme de recherche pour la mise en évidence
     * @private
     */
    _displayResults(results, searchTerm) {
        if (!this.searchResults) return;
        
        // Vider les résultats précédents
        this.searchResults.innerHTML = '';
        
        // Si aucun résultat
        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-no-results';
            noResults.textContent = 'Aucun résultat trouvé';
            this.searchResults.appendChild(noResults);
            return;
        }
        
        // Afficher le nombre de résultats
        const resultCount = document.createElement('div');
        resultCount.className = 'search-result-count';
        resultCount.textContent = `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`;
        this.searchResults.appendChild(resultCount);
        
        // Regrouper les résultats par catégorie
        const resultsByCategory = this._groupResultsByCategory(results);
        
        // Afficher les résultats par catégorie
        for (const [categoryName, categoryResults] of Object.entries(resultsByCategory)) {
            // Ajouter un titre de catégorie si plusieurs catégories
            if (Object.keys(resultsByCategory).length > 1) {
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'search-result-category-header';
                categoryHeader.textContent = categoryName;
                this.searchResults.appendChild(categoryHeader);
            }
            
            // Créer un élément pour chaque résultat de cette catégorie
            for (const result of categoryResults) {
                const resultItem = this._createResultItem(result, searchTerm);
                this.searchResults.appendChild(resultItem);
            }
        }
    }
    
    /**
     * Regroupe les résultats par catégorie
     * @param {Array} results - Résultats de la recherche
     * @returns {Object} Résultats regroupés par catégorie
     * @private
     */
    _groupResultsByCategory(results) {
        const resultsByCategory = {};
        
        for (const result of results) {
            const categoryName = result.categoryName || 'Autres';
            
            if (!resultsByCategory[categoryName]) {
                resultsByCategory[categoryName] = [];
            }
            
            resultsByCategory[categoryName].push(result);
        }
        
        return resultsByCategory;
    }
    
    /**
     * Crée un élément de résultat de recherche
     * @param {Object} app - Données de l'application
     * @param {string} searchTerm - Terme de recherche pour la mise en évidence
     * @returns {HTMLElement} Élément de résultat
     * @private
     */
    _createResultItem(app, searchTerm) {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.setAttribute('data-app-id', app.id);
        resultItem.setAttribute('data-category-id', app.categoryId);
        
        // Icône de l'application
        const iconElement = document.createElement('div');
        iconElement.className = 'search-result-icon';
        iconElement.style.backgroundColor = app.color || '#3498db';
        
        // Utilise l'icône spécifiée ou une icône par défaut
        const iconClass = app.icon.startsWith('fa') ? app.icon : `fas fa-${app.icon}`;
        iconElement.innerHTML = `<i class="${iconClass}"></i>`;
        
        const contentElement = document.createElement('div');
        contentElement.className = 'search-result-content';
        
        // Nom de l'application avec mise en évidence
        const nameElement = document.createElement('div');
        nameElement.className = 'search-result-name';
        nameElement.innerHTML = this._highlightText(app.name, searchTerm);
        
        // Catégorie de l'application
        const categoryElement = document.createElement('div');
        categoryElement.className = 'search-result-category';
        categoryElement.textContent = app.categoryName;
        
        contentElement.appendChild(nameElement);
        contentElement.appendChild(categoryElement);
        
        // Description de l'application (si disponible)
        if (app.description) {
            const descriptionElement = document.createElement('div');
            descriptionElement.className = 'search-result-description';
            descriptionElement.innerHTML = this._highlightText(app.description, searchTerm);
            contentElement.appendChild(descriptionElement);
        }
        
        // Tags de l'application (si disponibles)
        if (app.tags && Array.isArray(app.tags) && app.tags.length > 0) {
            const tagsElement = document.createElement('div');
            tagsElement.className = 'search-result-tags';
            
            // Limiter le nombre de tags affichés pour ne pas surcharger l'interface
            const displayTags = app.tags.slice(0, 3);
            
            displayTags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'search-result-tag';
                tagElement.innerHTML = this._highlightText(tag, searchTerm);
                tagsElement.appendChild(tagElement);
            });
            
            contentElement.appendChild(tagsElement);
        }
        
        resultItem.appendChild(iconElement);
        resultItem.appendChild(contentElement);
        
        // Ajouter un écouteur de clic pour ouvrir l'application
        resultItem.addEventListener('click', () => {
            window.open(app.url, '_blank');
            this.searchResults.classList.remove('active');
            
            // Enregistrer l'utilisation
            this._trackAppUsage(app.id, app.categoryId);
        });
        
        return resultItem;
    }
    
    /**
     * Enregistre l'utilisation d'une application
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     * @private
     */
    _trackAppUsage(appId, categoryId) {
        if (this._usageTrackingService) {
            this._usageTrackingService.trackAppUsage(appId, categoryId);
        }
    }
    
    /**
     * Met en évidence le terme de recherche dans un texte
     * @param {string} text - Texte à mettre en évidence
     * @param {string} searchTerm - Terme de recherche
     * @returns {string} Texte avec mise en évidence HTML
     * @private
     */
    _highlightText(text, searchTerm) {
        if (!searchTerm || !text) return text;
        
        const normalizedText = text.toLowerCase();
        const normalizedTerm = searchTerm.toLowerCase();
        
        const words = normalizedTerm.split(/\s+/).filter(word => word.length > 0);
        
        let highlightedText = text;
        
        // Mettre en évidence chaque mot
        for (const word of words) {
            const regex = new RegExp(`(${this._escapeRegExp(word)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>');
        }
        
        return highlightedText;
    }
    
    /**
     * Échappe les caractères spéciaux dans une chaîne pour une utilisation en RegExp
     * @param {string} string - Chaîne à échapper
     * @returns {string} Chaîne échappée
     * @private
     */
    _escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * Vide le champ de recherche et les résultats
     */
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this._lastSearchTerm = '';
        }
        
        if (this.searchResults) {
            this.searchResults.innerHTML = '';
            this.searchResults.classList.remove('active');
        }
        
        // Réinitialiser les filtres
        this._currentCategoryFilter = '';
        if (this.categoryFilter) {
            this.categoryFilter.value = '';
        }
        
        // Cacher la section des filtres
        this.searchContainer.classList.remove('filtering');
    }
}