/**
 * @fileoverview Gestionnaire principal de recherche
 * Coordonne les différents modules de recherche et sert de point d'entrée pour la fonctionnalité de recherche
 */

/**
 * @class SearchManager
 * Gestionnaire principal de la fonctionnalité de recherche
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
        // Initialisation ou récupération des dépendances
        this.searchModelService = searchModelService || new SearchModelService(categoryModel);
        this.usageTrackingService = usageTrackingService || new UsageTrackingService();
        this.searchHistoryModel = searchHistoryModel || new SearchHistoryModel();
        
        // Création des modules de recherche
        this.searchCore = new SearchCore(
            categoryModel,
            this.searchModelService,
            this.usageTrackingService,
            this.searchHistoryModel
        );
        
        this.resultRenderer = new SearchResultRenderer(this.searchCore);
        
        this.uiController = new SearchUIController(this.searchCore, this.resultRenderer);
    }
    
    /**
     * Rafraîchit les résultats de recherche actuels
     * Méthode de commodité pour appeler refreshSearchResults sur l'UIController
     */
    refreshSearchResults() {
        this.uiController.refreshSearchResults();
    }
    
    /**
     * Met à jour les boutons de favoris dans les résultats
     * Méthode de commodité pour accéder à updateFavoriteButtons
     */
    _updateFavoriteButtons() {
        this.resultRenderer.updateFavoriteButtons(
            document.getElementById('searchResults')
        );
    }
    
    /**
     * Obtient le dernier terme de recherche
     * @returns {string} Dernier terme de recherche
     */
    get _lastSearchTerm() {
        return this.searchCore.getLastSearchTerm();
    }
}

// Rétrocompatibilité pour les références existantes
window.SearchManager = SearchManager;