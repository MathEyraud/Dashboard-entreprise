/**
 * @fileoverview Modèle de gestion des favoris
 * Gère l'ajout, la suppression et la persistance des applications favorites
 */

/**
 * @class FavoritesModel
 * Gère les données et opérations liées aux applications favorites
 */
class FavoritesModel {
    /**
     * Crée une instance du modèle des favoris
     * @constructor
     */
    constructor() {
        /**
         * Liste des favoris sauvegardés
         * @type {Array}
         * @private
         */
        this._favorites = [];
        
        /**
         * Clé localStorage pour les favoris
         * @type {string}
         * @private
         */
        this._storageKey = 'dashboardFavorites';
        
        // Charge les favoris depuis le localStorage
        this._loadFavorites();
        
        // Initialise quelques favoris par défaut si aucun n'existe
        this._initDefaultFavorites();
    }
    
    /**
     * Charge les favoris depuis le localStorage
     * @private
     */
    _loadFavorites() {
        try {
            const savedFavorites = StorageService.getPreference('favorites', null);
            if (savedFavorites && Array.isArray(savedFavorites)) {
                this._favorites = savedFavorites;
                console.log(`${this._favorites.length} favoris chargés`);
            } else {
                this._favorites = [];
            }
        } catch (e) {
            console.error('Erreur lors du chargement des favoris:', e);
            this._favorites = [];
        }
    }
    
    /**
     * Sauvegarde les favoris dans le localStorage
     * @private
     */
    _saveFavorites() {
        try {
            StorageService.updatePreference('favorites', this._favorites);
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des favoris:', e);
            return false;
        }
    }
    
    /**
     * Initialise quelques favoris par défaut si aucun n'existe
     * @private
     */
    _initDefaultFavorites() {
        // Ne fait rien si des favoris existent déjà
        if (this._favorites.length > 0) {
            return;
        }
        
        console.log('Initialisation des favoris par défaut');
        
        // Liste des favoris par défaut (basée sur les premières applications de chaque catégorie)
        const defaultFavorites = [
            { id: 'opti-srv1', categoryId: 'opti' },
            { id: 'secuopti-srv1', categoryId: 'secuopti' },
            { id: 'notion', categoryId: 'gestion' },
            { id: 'scribben', categoryId: 'correcteur' },
            { id: 'goal-srv1', categoryId: 'goal' }
        ];
        
        this._favorites = defaultFavorites;
        this._saveFavorites();
    }
    
    /**
     * Récupère la liste des applications favorites
     * @returns {Array} Liste des favoris
     */
    getFavorites() {
        return [...this._favorites];
    }
    
    /**
     * Vérifie si une application est dans les favoris
     * @param {string} appId - ID de l'application
     * @returns {boolean} true si l'application est dans les favoris
     */
    isFavorite(appId) {
        return this._favorites.some(fav => fav.id === appId);
    }
    
    /**
     * Ajoute une application aux favoris
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     * @returns {boolean} true si l'ajout a réussi
     */
    addFavorite(appId, categoryId) {
        // Vérifie si l'application est déjà dans les favoris
        if (this.isFavorite(appId)) {
            return false;
        }
        
        // Ajoute l'application aux favoris
        this._favorites.push({ id: appId, categoryId });
        
        // Sauvegarde les favoris
        return this._saveFavorites();
    }
    
    /**
     * Supprime une application des favoris
     * @param {string} appId - ID de l'application
     * @returns {boolean} true si la suppression a réussi
     */
    removeFavorite(appId) {
        // Vérifie si l'application est dans les favoris
        if (!this.isFavorite(appId)) {
            return false;
        }
        
        // Filtre les favoris pour retirer l'application
        this._favorites = this._favorites.filter(fav => fav.id !== appId);
        
        // Sauvegarde les favoris
        return this._saveFavorites();
    }
    
    /**
     * Réorganise les favoris
     * @param {Array} newOrder - Nouvel ordre des favoris (tableau d'IDs)
     * @returns {boolean} true si la réorganisation a réussi
     */
    reorderFavorites(newOrder) {
        // Crée un nouvel array de favoris dans le nouvel ordre
        const reordered = [];
        
        // Pour chaque ID dans le nouvel ordre, récupère le favori correspondant
        for (const id of newOrder) {
            const favorite = this._favorites.find(fav => fav.id === id);
            if (favorite) {
                reordered.push(favorite);
            }
        }
        
        // S'assure que tous les favoris sont inclus
        for (const favorite of this._favorites) {
            if (!reordered.some(fav => fav.id === favorite.id)) {
                reordered.push(favorite);
            }
        }
        
        // Met à jour les favoris
        this._favorites = reordered;
        
        // Sauvegarde les favoris
        return this._saveFavorites();
    }
    
    /**
     * Récupère les détails des applications favorites
     * @param {CategoryModel} categoryModel - Modèle de catégories pour récupérer les détails
     * @returns {Array} Liste des applications favorites avec leurs détails
     */
    getFavoriteApps(categoryModel) {
        const favoriteApps = [];
        
        // Pour chaque favori, récupère les détails de l'application
        for (const favorite of this._favorites) {
            const { id, categoryId } = favorite;
            
            // Récupère la catégorie
            const categoryApps = categoryModel.getCategoryApps(categoryId);
            
            // Cherche l'application dans la catégorie
            const app = categoryApps.find(app => app.id === id);
            
            // Si l'application existe, l'ajoute à la liste avec des infos supplémentaires
            if (app) {
                favoriteApps.push({
                    ...app,
                    categoryId,
                    categoryName: categoryModel.getCategoryData(categoryId)?.name || ''
                });
            }
        }
        
        return favoriteApps;
    }
}