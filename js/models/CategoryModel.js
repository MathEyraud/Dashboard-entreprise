/**
 * @fileoverview Modèle de gestion des catégories
 * Centralise les données et opérations liées aux catégories
 */

/**
 * @class CategoryModel
 * Gère les données et opérations liées aux catégories
 */
class CategoryModel {
    /**
     * Crée une instance du modèle de catégories
     * @constructor
     */
    constructor() {
        /**
         * Données des catégories
         * @type {Object}
         * @private
         */
        this._data = CATEGORIES_DATA;
        
        // Vérifier que les données ont été chargées correctement
        if (!this._data || Object.keys(this._data).length === 0) {
            console.error("Aucune donnée de catégorie n'a pu être chargée.");
            // Initialiser avec un objet vide pour éviter les erreurs
            this._data = {};
        } else {
            console.log("Données des catégories chargées:", Object.keys(this._data));
        }
        
        /**
         * Catégorie actuellement sélectionnée
         * @type {string}
         * @private
         */
        this._currentCategoryId = StorageService.getPreference('lastCategory', APP_CONFIG.DEFAULT_CATEGORY);
        
        // Vérifier que la catégorie sélectionnée existe
        if (!this._data[this._currentCategoryId]) {
            console.warn(`La catégorie sélectionnée '${this._currentCategoryId}' n'existe pas. Utilisation de la catégorie par défaut.`);
            // Utiliser la catégorie par défaut
            this._currentCategoryId = APP_CONFIG.DEFAULT_CATEGORY;
            
            // Si la catégorie par défaut n'existe pas non plus, utiliser la première catégorie disponible
            if (!this._data[this._currentCategoryId]) {
                const availableCategories = Object.keys(this._data);
                if (availableCategories.length > 0) {
                    this._currentCategoryId = availableCategories[0];
                } else {
                    console.error("Aucune catégorie disponible.");
                }
            }
        }
    }
    
    /**
     * Récupère l'ID de la catégorie actuellement sélectionnée
     * @returns {string} ID de la catégorie actuelle
     */
    getCurrentCategoryId() {
        return this._currentCategoryId;
    }
    
    /**
     * Définit la catégorie actuellement sélectionnée
     * @param {string} categoryId - ID de la catégorie à sélectionner
     * @returns {boolean} true si le changement a réussi
     */
    setCurrentCategoryId(categoryId) {
        if (!this._data[categoryId]) {
            console.error(`Catégorie non trouvée : ${categoryId}`);
            return false;
        }
        
        this._currentCategoryId = categoryId;
        StorageService.updatePreference('lastCategory', categoryId);
        return true;
    }
    
    /**
     * Récupère les données de la catégorie actuelle
     * @returns {Object} Données de la catégorie actuelle
     */
    getCurrentCategoryData() {
        return this._data[this._currentCategoryId] || null;
    }
    
    /**
     * Récupère les données d'une catégorie spécifique
     * @param {string} categoryId - ID de la catégorie
     * @returns {Object|null} Données de la catégorie ou null si non trouvée
     */
    getCategoryData(categoryId) {
        return this._data[categoryId] || null;
    }
    
    /**
     * Récupère toutes les catégories disponibles
     * @returns {Object} Toutes les catégories
     */
    getAllCategories() {
        return this._data;
    }
    
    /**
     * Récupère les catégories ordonnées selon la configuration
     * @returns {Array} Liste des catégories ordonnées
     */
    getOrderedCategories() {
        const result = [];
        
        // Ajoute les catégories dans l'ordre spécifié
        for (const categoryId of APP_CONFIG.CATEGORY_ORDER) {
            if (this._data[categoryId]) {
                result.push(this._data[categoryId]);
            }
        }
        
        // Ajoute les catégories restantes (si de nouvelles catégories sont ajoutées)
        for (const [categoryId, category] of Object.entries(this._data)) {
            if (!APP_CONFIG.CATEGORY_ORDER.includes(categoryId)) {
                result.push(category);
            }
        }
        
        return result;
    }
    
    /**
     * Récupère les applications de la catégorie actuelle
     * @returns {Array} Liste des applications
     */
    getCurrentCategoryApps() {
        const categoryData = this._data[this._currentCategoryId];
        
        if (!categoryData) {
            console.error(`Catégorie non trouvée: ${this._currentCategoryId}`);
            return [];
        }
        
        if (!categoryData.apps) {
            console.error(`Propriété 'apps' manquante pour la catégorie: ${this._currentCategoryId}`);
            return [];
        }
        
        return categoryData.apps || [];
    }
    
    /**
     * Récupère les applications d'une catégorie spécifique
     * @param {string} categoryId - ID de la catégorie
     * @returns {Array} Liste des applications
     */
    getCategoryApps(categoryId) {
        return this._data[categoryId]?.apps || [];
    }
    
    /**
     * Récupère le lien vers la procédure de la catégorie actuelle
     * @returns {string|null} Lien vers la procédure ou null si non défini
     */
    getCurrentCategoryProcedureLink() {
        const categoryData = this._data[this._currentCategoryId];
        return categoryData?.procedureLink || null;
    }
}