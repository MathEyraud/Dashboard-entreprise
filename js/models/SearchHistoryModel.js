/**
 * @fileoverview Modèle d'historique de recherche
 * Gère l'historique des termes de recherche
 */

/**
 * @class SearchHistoryModel
 * Gère l'historique des termes de recherche
 */
class SearchHistoryModel {
    /**
     * Crée une instance du modèle d'historique de recherche
     * @param {number} maxItems - Nombre maximum d'éléments à conserver
     * @constructor
     */
    constructor(maxItems = 10) {
        /**
         * Nombre maximum d'éléments à conserver
         * @type {number}
         * @private
         */
        this._maxItems = maxItems;
        
        /**
         * Clé de stockage pour l'historique
         * @type {string}
         * @private
         */
        this._storageKey = 'searchHistory';
        
        /**
         * Historique des recherches
         * @type {Array}
         * @private
         */
        this._history = this._loadHistory();
    }
    
    /**
     * Charge l'historique depuis localStorage
     * @returns {Array} Historique des recherches
     * @private
     */
    _loadHistory() {
        try {
            const history = StorageService.getPreference(this._storageKey, []);
            return Array.isArray(history) ? history : [];
        } catch (e) {
            console.error('Erreur lors du chargement de l\'historique de recherche:', e);
            return [];
        }
    }
    
    /**
     * Sauvegarde l'historique dans localStorage
     * @private
     */
    _saveHistory() {
        try {
            StorageService.updatePreference(this._storageKey, this._history);
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde de l\'historique de recherche:', e);
            return false;
        }
    }
    
    /**
     * Ajoute un terme à l'historique
     * @param {string} term - Terme de recherche
     * @returns {boolean} true si l'ajout a réussi
     */
    addSearch(term) {
        if (!term || typeof term !== 'string') return false;
        
        const normalizedTerm = term.trim();
        if (normalizedTerm.length === 0) return false;
        
        // Éviter les doublons
        const existingIndex = this._history.findIndex(item => 
            item.term.toLowerCase() === normalizedTerm.toLowerCase());
        
        if (existingIndex !== -1) {
            // Si le terme existe déjà, le supprimer pour le remettre en tête
            this._history.splice(existingIndex, 1);
        }
        
        // Ajouter le terme en tête de liste avec la date
        this._history.unshift({
            term: normalizedTerm,
            timestamp: new Date().toISOString()
        });
        
        // Limiter la taille de l'historique
        if (this._history.length > this._maxItems) {
            this._history = this._history.slice(0, this._maxItems);
        }
        
        // Sauvegarder l'historique
        return this._saveHistory();
    }
    
    /**
     * Récupère l'historique des recherches
     * @returns {Array} Historique des recherches
     */
    getHistory() {
        return [...this._history];
    }
    
    /**
     * Récupère les recherches récentes
     * @param {number} limit - Nombre maximum d'éléments à retourner
     * @returns {Array} Recherches récentes
     */
    getRecentSearches(limit = 5) {
        return this._history.slice(0, limit);
    }
    
    /**
     * Efface l'historique des recherches
     * @returns {boolean} true si l'effacement a réussi
     */
    clearHistory() {
        this._history = [];
        return this._saveHistory();
    }
    
    /**
     * Supprime un terme de l'historique
     * @param {string} term - Terme à supprimer
     * @returns {boolean} true si la suppression a réussi
     */
    removeSearch(term) {
        if (!term) return false;
        
        const initialLength = this._history.length;
        
        this._history = this._history.filter(item => 
            item.term.toLowerCase() !== term.toLowerCase());
        
        // Si l'historique a changé, le sauvegarder
        if (initialLength !== this._history.length) {
            return this._saveHistory();
        }
        
        return false;
    }
}