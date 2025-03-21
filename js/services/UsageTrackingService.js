/**
 * @fileoverview Service de suivi d'utilisation
 * Enregistre et analyse l'utilisation des applications
 */

/**
 * @class UsageTrackingService
 * Service pour le suivi de l'utilisation des applications
 */
class UsageTrackingService {
    /**
     * Crée une instance du service de suivi d'utilisation
     * @constructor
     */
    constructor() {
        /**
         * Clé de stockage pour les données d'utilisation
         * @type {string}
         * @private
         */
        this._storageKey = 'appUsage';
        
        /**
         * Données d'utilisation des applications
         * @type {Object}
         * @private
         */
        this._usageData = this._loadUsageData();
    }
    
    /**
     * Charge les données d'utilisation depuis localStorage
     * @returns {Object} Données d'utilisation
     * @private
     */
    _loadUsageData() {
        try {
            const data = StorageService.getPreference(this._storageKey, {});
            return data;
        } catch (e) {
            console.error('Erreur lors du chargement des données d\'utilisation:', e);
            return {};
        }
    }
    
    /**
     * Sauvegarde les données d'utilisation dans localStorage
     * @private
     */
    _saveUsageData() {
        try {
            StorageService.updatePreference(this._storageKey, this._usageData);
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des données d\'utilisation:', e);
            return false;
        }
    }
    
    /**
     * Enregistre l'utilisation d'une application
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     */
    trackAppUsage(appId, categoryId) {
        if (!appId) return;
        
        // Initialiser les données pour cette application si nécessaire
        if (!this._usageData[appId]) {
            this._usageData[appId] = {
                count: 0,
                lastUsed: null,
                categoryId,
                timePatterns: {}
            };
        }
        
        // Incrémenter le compteur
        this._usageData[appId].count = (this._usageData[appId].count || 0) + 1;
        
        // Enregistrer la date d'utilisation
        this._usageData[appId].lastUsed = new Date().toISOString();
        
        // Enregistrer le moment de la journée
        const hour = new Date().getHours();
        const timeSlot = Math.floor(hour / 4); // 6 plages de 4h
        
        if (!this._usageData[appId].timePatterns) {
            this._usageData[appId].timePatterns = {};
        }
        
        if (!this._usageData[appId].timePatterns[timeSlot]) {
            this._usageData[appId].timePatterns[timeSlot] = 0;
        }
        
        this._usageData[appId].timePatterns[timeSlot]++;
        
        // Sauvegarder les données
        this._saveUsageData();
    }
    
    /**
     * Récupère les données d'utilisation d'une application
     * @param {string} appId - ID de l'application
     * @returns {Object|null} Données d'utilisation ou null si non trouvées
     */
    getAppUsage(appId) {
        return this._usageData[appId] || null;
    }
    
    /**
     * Récupère les applications les plus utilisées
     * @param {number} limit - Nombre maximum d'applications à retourner
     * @returns {Array} Applications les plus utilisées avec leurs données d'utilisation
     */
    getMostUsedApps(limit = 10) {
        const apps = Object.entries(this._usageData)
            .map(([appId, data]) => ({
                appId,
                ...data
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
        
        return apps;
    }
    
    /**
     * Calcule le score d'utilisation d'une application pour le tri des résultats
     * @param {string} appId - ID de l'application
     * @returns {number} Score d'utilisation (0 si non utilisée)
     */
    getUsageScore(appId) {
        const usage = this._usageData[appId];
        if (!usage) return 0;
        
        // Score de base basé sur le nombre d'utilisations
        let score = Math.min(10, usage.count);
        
        // Bonus pour utilisation récente
        if (usage.lastUsed) {
            const lastUsed = new Date(usage.lastUsed);
            const now = new Date();
            
            // Différence en jours
            const diffDays = (now - lastUsed) / (1000 * 60 * 60 * 24);
            
            // Bonus dégressif basé sur la récence (max 5 points pour aujourd'hui, 0 pour > 30 jours)
            if (diffDays < 30) {
                score += 5 * (1 - diffDays / 30);
            }
        }
        
        // Bonus si utilisé souvent à l'heure actuelle
        const hour = new Date().getHours();
        const currentTimeSlot = Math.floor(hour / 4);
        
        if (usage.timePatterns && usage.timePatterns[currentTimeSlot]) {
            // Bonus de 0 à 5 points basé sur l'utilisation à cette heure
            score += Math.min(5, usage.timePatterns[currentTimeSlot]);
        }
        
        return score;
    }
}