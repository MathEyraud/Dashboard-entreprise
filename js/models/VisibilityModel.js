/**
 * @fileoverview Modèle de gestion de la visibilité des catégories
 * Gère la persistance de l'état de visibilité des catégories
 */

/**
 * @class VisibilityModel
 * Gère l'état de visibilité des catégories
 */
class VisibilityModel {
    /**
     * Crée une instance du modèle de visibilité
     * @constructor
     */
    constructor() {
        /**
         * Liste des catégories masquées (par ID)
         * @type {Array}
         * @private
         */
        this._hiddenCategories = [];
        
        /**
         * Clé localStorage pour les catégories masquées
         * @type {string}
         * @private
         */
        this._storageKey = 'hiddenCategories';
        
        // Charge l'état initial
        this._loadVisibilityState();
    }
    
    /**
     * Charge l'état de visibilité depuis le localStorage
     * @private
     */
    _loadVisibilityState() {
        try {
            const savedState = StorageService.getPreference(this._storageKey, null);
            if (savedState !== null && Array.isArray(savedState)) {
                this._hiddenCategories = savedState;
                console.log(`État de visibilité chargé: ${this._hiddenCategories.length} catégories masquées`);
            } else {
                this._hiddenCategories = [];
            }
        } catch (e) {
            console.error('Erreur lors du chargement de l\'état de visibilité:', e);
            this._hiddenCategories = [];
        }
    }
    
    /**
     * Sauvegarde l'état de visibilité dans le localStorage
     * @private
     * @returns {boolean} true si la sauvegarde a réussi
     */
    _saveVisibilityState() {
        try {
            StorageService.updatePreference(this._storageKey, this._hiddenCategories);
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde de l\'état de visibilité:', e);
            return false;
        }
    }
    
    /**
     * Récupère la liste des catégories masquées
     * @returns {Array} IDs des catégories masquées
     */
    getHiddenCategories() {
        return [...this._hiddenCategories];
    }
    
    /**
     * Vérifie si une catégorie est visible
     * @param {string} categoryId - ID de la catégorie
     * @returns {boolean} true si la catégorie est visible
     */
    isCategoryVisible(categoryId) {
        return !this._hiddenCategories.includes(categoryId);
    }
    
    /**
     * Définit la visibilité d'une catégorie
     * @param {string} categoryId - ID de la catégorie
     * @param {boolean} isVisible - true pour afficher, false pour masquer
     * @returns {boolean} true si la mise à jour a réussi
     */
    setCategoryVisibility(categoryId, isVisible) {
        const isHidden = this._hiddenCategories.includes(categoryId);
        
        if (isVisible && isHidden) {
            // Rendre visible une catégorie masquée
            this._hiddenCategories = this._hiddenCategories.filter(id => id !== categoryId);
            return this._saveVisibilityState();
        } else if (!isVisible && !isHidden) {
            // Masquer une catégorie visible
            this._hiddenCategories.push(categoryId);
            return this._saveVisibilityState();
        }
        
        // Aucun changement nécessaire
        return true;
    }
    
    /**
     * Inverse la visibilité d'une catégorie
     * @param {string} categoryId - ID de la catégorie
     * @returns {boolean} true si la mise à jour a réussi
     */
    toggleCategoryVisibility(categoryId) {
        const isVisible = this.isCategoryVisible(categoryId);
        return this.setCategoryVisibility(categoryId, !isVisible);
    }
    
    /**
     * Réinitialise toutes les catégories à visibles
     * @returns {boolean} true si la réinitialisation a réussi
     */
    showAllCategories() {
        this._hiddenCategories = [];
        return this._saveVisibilityState();
    }
    
    /**
     * Masque toutes les catégories sauf les favoris
     * @param {Array} allCategoryIds - Liste de tous les IDs de catégories
     * @returns {boolean} true si la mise à jour a réussi
     */
    hideAllCategories(allCategoryIds) {
        // Exclure les favoris (qui doivent toujours rester visibles)
        this._hiddenCategories = allCategoryIds.filter(id => id !== 'favorites');
        return this._saveVisibilityState();
    }
}