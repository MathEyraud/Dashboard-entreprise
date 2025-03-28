/**
 * @fileoverview Modèle de gestion des favoris (version compatible)
 * Utilise les nouveaux modules pour gérer les favoris tout en gardant la même interface
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
        // Initialiser le core qui va gérer toute la logique
        this._favoriteCore = new FavoriteCore();
    }
    
    /**
     * Récupère la liste des applications favorites
     * @returns {Array} Liste des favoris
     */
    getFavorites() {
        return this._favoriteCore.getFavorites();
    }
    
    /**
     * Récupère les favoris d'un groupe spécifique
     * @param {string} groupId - ID du groupe
     * @returns {Array} Liste des favoris du groupe
     */
    getFavoritesByGroup(groupId) {
        return this._favoriteCore.getFavoritesByGroup(groupId);
    }
    
    /**
     * Récupère tous les groupes de favoris
     * @returns {Array} Liste des groupes
     */
    getGroups() {
        return this._favoriteCore.getGroups();
    }
    
    /**
     * Vérifie si une application est dans les favoris
     * @param {string} appId - ID de l'application
     * @returns {boolean} true si l'application est dans les favoris
     */
    isFavorite(appId) {
        return this._favoriteCore.isFavorite(appId);
    }
    
    /**
     * Vérifie si une application est dans un groupe spécifique de favoris
     * @param {string} appId - ID de l'application
     * @param {string} groupId - ID du groupe
     * @returns {boolean} true si l'application est dans le groupe spécifié
     */
    isInFavoriteGroup(appId, groupId) {
        return this._favoriteCore.isInFavoriteGroup(appId, groupId);
    }
    
    /**
     * Récupère le groupe d'un favori
     * @param {string} appId - ID de l'application
     * @returns {string|null} ID du groupe ou null si non trouvé
     */
    getFavoriteGroup(appId) {
        return this._favoriteCore.getFavoriteGroup(appId);
    }
    
    /**
     * Ajoute une application aux favoris
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     * @param {string} groupId - ID du groupe (défaut: 'general')
     * @returns {boolean} true si l'ajout a réussi
     */
    addFavorite(appId, categoryId, groupId = 'general') {
        return this._favoriteCore.addFavorite(appId, categoryId, groupId);
    }
    
    /**
     * Supprime une application des favoris
     * @param {string} appId - ID de l'application
     * @returns {boolean} true si la suppression a réussi
     */
    removeFavorite(appId) {
        return this._favoriteCore.removeFavorite(appId);
    }
    
    /**
     * Supprime une application d'un groupe spécifique de favoris
     * @param {string} appId - ID de l'application
     * @param {string} groupId - ID du groupe
     * @returns {boolean} true si la suppression a réussi
     */
    removeFromGroup(appId, groupId) {
        return this._favoriteCore.removeFromGroup(appId, groupId);
    }
    
    /**
     * Change le groupe d'un favori
     * @param {string} appId - ID de l'application
     * @param {string} newGroupId - Nouvel ID de groupe
     * @param {string} sourceGroupId - ID du groupe source (optionnel)
     * @returns {boolean} true si le changement a réussi
     */
    changeFavoriteGroup(appId, newGroupId, sourceGroupId = null) {
        return this._favoriteCore.changeFavoriteGroup(appId, newGroupId, sourceGroupId);
    }
    
    /**
     * Réorganise les favoris
     * @param {Array} newOrder - Nouvel ordre des favoris (tableau d'IDs)
     * @returns {boolean} true si la réorganisation a réussi
     */
    reorderFavorites(newOrder) {
        return this._favoriteCore.reorderFavorites(newOrder);
    }
    
    /**
     * Réorganise les favoris au sein d'un groupe
     * @param {string} groupId - ID du groupe
     * @param {Array} newOrder - Nouvel ordre des favoris du groupe (tableau d'IDs)
     * @returns {boolean} true si la réorganisation a réussi
     */
    reorderGroupFavorites(groupId, newOrder) {
        return this._favoriteCore.reorderGroupFavorites(groupId, newOrder);
    }
    
    /**
     * Ajoute un nouveau groupe de favoris
     * @param {Object} group - Données du groupe
     * @returns {string} ID du groupe créé ou null si échec
     */
    addGroup(group) {
        return this._favoriteCore.addGroup(group);
    }
    
    /**
     * Modifie un groupe de favoris
     * @param {string} groupId - ID du groupe
     * @param {Object} updatedData - Données à mettre à jour
     * @returns {boolean} true si la modification a réussi
     */
    updateGroup(groupId, updatedData) {
        return this._favoriteCore.updateGroup(groupId, updatedData);
    }
    
    /**
     * Supprime un groupe de favoris
     * @param {string} groupId - ID du groupe
     * @param {boolean} moveFavoritesToGeneral - Si true, déplace les favoris du groupe vers le groupe général
     * @returns {boolean} true si la suppression a réussi
     */
    removeGroup(groupId, moveFavoritesToGeneral = true) {
        return this._favoriteCore.removeGroup(groupId, moveFavoritesToGeneral);
    }
    
    /**
     * Récupère les détails des applications favorites
     * @param {CategoryModel} categoryModel - Modèle de catégories pour récupérer les détails
     * @returns {Object} Objet avec favoris groupés et liste des groupes
     */
    getFavoriteApps(categoryModel) {
        return this._favoriteCore.getFavoriteApps(categoryModel);
    }
}