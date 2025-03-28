/**
 * @fileoverview Service de stockage pour les favoris
 * Gère le chargement et la sauvegarde des favoris et des groupes dans le localStorage
 */

/**
 * @class FavoriteStorageService
 * Service responsable de la persistance des données des favoris et des groupes
 */
class FavoriteStorageService {
    /**
     * Crée une instance du service de stockage des favoris
     * @constructor
     */
    constructor() {
        /**
         * Clé localStorage pour les favoris
         * @type {string}
         * @private
         */
        this._favoritesStorageKey = 'favorites';

        /**
         * Clé localStorage pour les groupes de favoris
         * @type {string}
         * @private
         */
        this._groupsStorageKey = 'favoriteGroups';
    }

    /**
     * Charge les favoris depuis le localStorage
     * @returns {Array} Liste des favoris ou tableau vide si erreur
     */
    loadFavorites() {
        try {
            const savedFavorites = StorageService.getPreference(this._favoritesStorageKey, null);
            if (savedFavorites && Array.isArray(savedFavorites)) {
                console.log(`${savedFavorites.length} favoris chargés`);
                return savedFavorites;
            }
            return [];
        } catch (e) {
            console.error('Erreur lors du chargement des favoris:', e);
            return [];
        }
    }

    /**
     * Charge les groupes de favoris depuis le localStorage
     * @returns {Array} Liste des groupes ou groupe par défaut si erreur
     */
    loadGroups() {
        try {
            const savedGroups = StorageService.getPreference(this._groupsStorageKey, null);
            if (savedGroups && Array.isArray(savedGroups)) {
                console.log(`${savedGroups.length} groupes de favoris chargés`);
                return savedGroups;
            } else {
                // Initialiser avec un groupe par défaut "Général"
                const defaultGroups = [
                    {
                        id: 'general',
                        name: 'Général',
                        color: '#3498db',
                        icon: 'star'
                    }
                ];
                this.saveGroups(defaultGroups);
                return defaultGroups;
            }
        } catch (e) {
            console.error('Erreur lors du chargement des groupes de favoris:', e);
            const defaultGroups = [
                {
                    id: 'general',
                    name: 'Général',
                    color: '#3498db',
                    icon: 'star'
                }
            ];
            this.saveGroups(defaultGroups);
            return defaultGroups;
        }
    }

    /**
     * Sauvegarde les favoris dans le localStorage
     * @param {Array} favorites - Liste des favoris à sauvegarder
     * @returns {boolean} true si la sauvegarde a réussi
     */
    saveFavorites(favorites) {
        try {
            StorageService.updatePreference(this._favoritesStorageKey, favorites);
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des favoris:', e);
            return false;
        }
    }

    /**
     * Sauvegarde les groupes de favoris dans le localStorage
     * @param {Array} groups - Liste des groupes à sauvegarder
     * @returns {boolean} true si la sauvegarde a réussi
     */
    saveGroups(groups) {
        try {
            StorageService.updatePreference(this._groupsStorageKey, groups);
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des groupes de favoris:', e);
            return false;
        }
    }
}