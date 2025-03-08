/**
 * @fileoverview Service de gestion du stockage localStorage
 * Fournit une API unifiée pour la persistance des préférences
 */

/**
 * @namespace StorageService
 * Service pour gérer le stockage local des données
 */
const StorageService = {
    /**
     * Vérifie si le localStorage est disponible
     * @returns {boolean} true si localStorage est disponible
     */
    isAvailable() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('LocalStorage n\'est pas disponible:', e);
            return false;
        }
    },
    
    /**
     * Récupère les préférences de l'utilisateur
     * @returns {Object} Préférences utilisateur
     */
    getUserPreferences() {
        if (!this.isAvailable()) {
            return {
                darkMode: false,
                lastVisit: new Date().toISOString()
            };
        }
        
        try {
            const data = localStorage.getItem('dashboardPrefs');
            if (!data) {
                // Valeurs par défaut si aucune préférence n'existe
                const defaultPrefs = {
                    darkMode: false,
                    lastVisit: new Date().toISOString()
                };
                this.saveUserPreferences(defaultPrefs);
                return defaultPrefs;
            }
            
            return JSON.parse(data);
        } catch (e) {
            console.error('Erreur lors de la récupération des préférences:', e);
            return {
                darkMode: false,
                lastVisit: new Date().toISOString()
            };
        }
    },
    
    /**
     * Sauvegarde les préférences utilisateur
     * @param {Object} prefs - Préférences à sauvegarder
     * @returns {boolean} true si la sauvegarde a réussi
     */
    saveUserPreferences(prefs) {
        if (!this.isAvailable()) {
            return false;
        }
        
        try {
            localStorage.setItem('dashboardPrefs', JSON.stringify(prefs));
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des préférences:', e);
            return false;
        }
    },
    
    /**
     * Met à jour un paramètre spécifique des préférences
     * @param {string} key - Clé du paramètre
     * @param {any} value - Valeur à sauvegarder
     * @returns {boolean} true si la mise à jour a réussi
     */
    updatePreference(key, value) {
        const prefs = this.getUserPreferences();
        prefs[key] = value;
        return this.saveUserPreferences(prefs);
    },
    
    /**
     * Récupère un paramètre spécifique des préférences
     * @param {string} key - Clé du paramètre
     * @param {any} defaultValue - Valeur par défaut si le paramètre n'existe pas
     * @returns {any} Valeur du paramètre
     */
    getPreference(key, defaultValue) {
        const prefs = this.getUserPreferences();
        return prefs[key] !== undefined ? prefs[key] : defaultValue;
    }
};