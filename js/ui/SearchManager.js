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
     * @constructor
     */
    constructor(categoryModel) {
        /**
         * Modèle de données des catégories
         * @type {CategoryModel}
         * @private
         */
        this._categoryModel = categoryModel;
        
        // Éléments du DOM
        this.searchInput = document.getElementById('globalSearch');
        this.searchResults = document.getElementById('searchResults');
        this.clearSearchBtn = document.getElementById('clearSearch');
        
        // Vérifie que tous les éléments nécessaires sont présents
        this._checkElements();
        
        // Dernier terme de recherche
        this._lastSearchTerm = '';
        
        // Délai pour la recherche en temps réel
        this._searchTimeout = null;
        
        // Configure les écouteurs d'événements
        this._setupEventListeners();
    }
    
    /**
     * Vérifie que les éléments DOM nécessaires sont présents
     * @private
     */
    _checkElements() {
        const elements = [
            { element: this.searchInput, name: 'globalSearch' },
            { element: this.searchResults, name: 'searchResults' },
            { element: this.clearSearchBtn, name: 'clearSearch' }
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
                        this.performSearch(searchTerm);
                        this.searchResults.classList.add('active');
                    } else {
                        this.searchResults.innerHTML = '';
                        this.searchResults.classList.remove('active');
                    }
                }, 300); // Délai de 300ms pour réduire la fréquence des recherches
            });
            
            // Écouteur pour le focus sur le champ de recherche
            this.searchInput.addEventListener('focus', () => {
                const searchTerm = this.searchInput.value.trim();
                if (searchTerm.length > 0) {
                    this.searchResults.classList.add('active');
                }
            });
        }
        
        // Écouteur pour le bouton de nettoyage
        if (this.clearSearchBtn) {
            this.clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // Fermer les résultats quand on clique en dehors
        document.addEventListener('click', (event) => {
            if (!this.searchInput.contains(event.target) && 
                !this.searchResults.contains(event.target)) {
                this.searchResults.classList.remove('active');
            }
        });
        
        // Écouteur pour la touche Échap
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.searchResults.classList.remove('active');
                this.searchInput.blur();
            }
        });
    }
    
    /**
     * Effectue une recherche d'applications dans toutes les catégories
     * @param {string} searchTerm - Terme de recherche
     */
    performSearch(searchTerm) {
        if (!this.searchResults) return;
        
        const normalizedTerm = searchTerm.toLowerCase();
        const results = [];
        const categories = this._categoryModel.getAllCategories();
        
        // Parcourir toutes les catégories
        for (const [categoryId, category] of Object.entries(categories)) {
            if (!category.apps || !Array.isArray(category.apps)) continue;
            
            // Parcourir toutes les applications de la catégorie
            for (const app of category.apps) {
                const nameMatch = app.name.toLowerCase().includes(normalizedTerm);
                const descriptionMatch = app.description && app.description.toLowerCase().includes(normalizedTerm);
                
                // Si le terme est trouvé dans le nom ou la description
                if (nameMatch || descriptionMatch) {
                    // Ajouter l'application aux résultats
                    results.push({
                        ...app,
                        categoryId,
                        categoryName: category.name,
                        nameMatch,
                        descriptionMatch
                    });
                }
            }
        }
        
        // Afficher les résultats
        this._displayResults(results, normalizedTerm);
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
        
        // Trier les résultats (d'abord ceux qui correspondent au nom)
        results.sort((a, b) => {
            // Priorité aux correspondances dans le nom
            if (a.nameMatch && !b.nameMatch) return -1;
            if (!a.nameMatch && b.nameMatch) return 1;
            
            // Ensuite trier par catégorie
            return a.categoryName.localeCompare(b.categoryName);
        });
        
        // Créer un élément pour chaque résultat
        for (const result of results) {
            const resultItem = this._createResultItem(result, searchTerm);
            this.searchResults.appendChild(resultItem);
        }
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
        
        resultItem.appendChild(iconElement);
        resultItem.appendChild(contentElement);
        
        // Ajouter un écouteur de clic pour ouvrir l'application
        resultItem.addEventListener('click', () => {
            window.open(app.url, '_blank');
            this.searchResults.classList.remove('active');
        });
        
        return resultItem;
    }
    
    /**
     * Met en évidence le terme de recherche dans un texte
     * @param {string} text - Texte à mettre en évidence
     * @param {string} searchTerm - Terme de recherche
     * @returns {string} Texte avec mise en évidence HTML
     * @private
     */
    _highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${this._escapeRegExp(searchTerm)})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
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
    }
    
    /**
     * Ajoute une application aux résultats de recherche
     * @param {Object} app - Données de l'application
     * @param {string} categoryId - ID de la catégorie
     * @param {string} categoryName - Nom de la catégorie
     */
    addAppToSearchIndex(app, categoryId, categoryName) {
        // Cette méthode est préparée pour une future implémentation
        // d'un index de recherche plus avancé
    }
}