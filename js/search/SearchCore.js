/**
 * @fileoverview Fonctionnalités de base de la recherche
 * Contient la logique principale pour traiter les recherches, gérer les résultats et l'historique
 */

/**
 * @class SearchCore
 * Gère les fonctionnalités de base de recherche d'applications
 */
class SearchCore {
    /**
     * Crée une instance du moteur de recherche
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
        this._searchModelService = searchModelService;
        
        /**
         * Service de suivi d'utilisation
         * @type {UsageTrackingService}
         * @private
         */
        this._usageTrackingService = usageTrackingService;
        
        /**
         * Modèle d'historique de recherche
         * @type {SearchHistoryModel}
         * @private
         */
        this._searchHistoryModel = searchHistoryModel;
        
        /**
         * Dernier terme de recherche
         * @type {string}
         * @private
         */
        this._lastSearchTerm = '';
        
        /**
         * Filtre de catégorie actuel
         * @type {string}
         * @private
         */
        this._currentCategoryFilter = '';
    }
    
    /**
     * Récupère le dernier terme de recherche
     * @returns {string} Dernier terme recherché
     */
    getLastSearchTerm() {
        return this._lastSearchTerm;
    }
    
    /**
     * Définit le filtre de catégorie actuel
     * @param {string} categoryId - ID de la catégorie à filtrer
     */
    setCategoryFilter(categoryId) {
        this._currentCategoryFilter = categoryId || '';
    }
    
    /**
     * Récupère le filtre de catégorie actuel
     * @returns {string} ID de la catégorie de filtrage
     */
    getCategoryFilter() {
        return this._currentCategoryFilter;
    }
    
    /**
     * Effectue une recherche d'applications
     * @param {string} searchTerm - Terme de recherche
     * @returns {Array} Résultats de la recherche
     */
    performSearch(searchTerm) {
        // Stocker le terme pour pouvoir rafraîchir plus tard
        this._lastSearchTerm = searchTerm;
        
        // Ajouter le terme à l'historique
        if (this._searchHistoryModel) {
            this._searchHistoryModel.addSearch(searchTerm);
        }
        
        // Effectuer la recherche avec le service
        return this._searchModelService.search(searchTerm, {
            categoryId: this._currentCategoryFilter || undefined, // Filtrer par catégorie si défini
            fuzzy: true // Activer la recherche approximative
        });
    }
    
    /**
     * Récupère l'historique des recherches récentes
     * @param {number} [limit=5] - Nombre maximum d'entrées d'historique à retourner
     * @returns {Array} Historique des recherches récentes
     */
    getRecentSearches(limit = 5) {
        if (!this._searchHistoryModel) return [];
        return this._searchHistoryModel.getRecentSearches(limit);
    }
    
    /**
     * Enregistre l'utilisation d'une application
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     */
    trackAppUsage(appId, categoryId) {
        if (this._usageTrackingService) {
            this._usageTrackingService.trackAppUsage(appId, categoryId);
        }
    }
    
    /**
     * Regroupe les résultats par catégorie
     * @param {Array} results - Résultats de la recherche
     * @returns {Object} Résultats regroupés par catégorie
     */
    groupResultsByCategory(results) {
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
     * Met en évidence le terme de recherche dans un texte
     * @param {string} text - Texte à mettre en évidence
     * @param {string} searchTerm - Terme de recherche
     * @returns {string} Texte avec mise en évidence HTML
     */
    highlightText(text, searchTerm) {
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
     * Vérifie si une application est dans les favoris
     * @param {string} appId - ID de l'application
     * @returns {boolean} true si l'application est dans les favoris
     */
    isAppFavorite(appId) {
        return window.appController && 
               window.appController.favoritesModel && 
               window.appController.favoritesModel.isFavorite(appId);
    }
    
    /**
     * Vérifie si une application est dans un groupe spécifique de favoris
     * @param {string} appId - ID de l'application
     * @param {string} groupId - ID du groupe
     * @returns {boolean} true si l'application est dans le groupe spécifié
     */
    isAppInFavoriteGroup(appId, groupId) {
        return window.appController && 
               window.appController.favoritesModel && 
               window.appController.favoritesModel.isInFavoriteGroup(appId, groupId);
    }
}

// Exporte la classe pour une utilisation dans d'autres modules
window.SearchCore = SearchCore;