/**
 * @fileoverview Gestionnaire des groupes de favoris
 * Gère la création, modification et suppression des groupes de favoris
 */

/**
 * @class FavoriteGroupManager
 * Gère les opérations liées aux groupes de favoris
 */
class FavoriteGroupManager {
    /**
     * Crée une instance du gestionnaire de groupes de favoris
     * @param {FavoriteStorageService} storageService - Service de stockage des favoris
     * @param {Array} initialGroups - Liste initiale des groupes
     * @constructor
     */
    constructor(storageService, initialGroups = []) {
        /**
         * Service de stockage des favoris
         * @type {FavoriteStorageService}
         * @private
         */
        this._storageService = storageService;

        /**
         * Groupes de favoris personnalisés
         * @type {Array}
         * @private
         */
        this._groups = initialGroups;
    }

    /**
     * Récupère tous les groupes de favoris
     * @returns {Array} Liste des groupes
     */
    getGroups() {
        return [...this._groups];
    }

    /**
     * Trouve un groupe par son ID
     * @param {string} groupId - ID du groupe à trouver
     * @returns {Object|null} Groupe trouvé ou null si non trouvé
     */
    getGroupById(groupId) {
        return this._groups.find(group => group.id === groupId) || null;
    }

    /**
     * Ajoute un nouveau groupe de favoris
     * @param {Object} group - Données du groupe
     * @param {string} group.name - Nom du groupe
     * @param {string} group.color - Couleur du groupe
     * @param {string} group.icon - Icône du groupe
     * @returns {string} ID du groupe créé ou null si échec
     */
    addGroup(group) {
        // Génère un ID unique pour le groupe
        const groupId = 'group_' + Date.now();
        
        // Crée le nouveau groupe
        const newGroup = {
            id: groupId,
            name: group.name,
            color: group.color || '#3498db',
            icon: group.icon || 'folder'
        };
        
        // Ajoute le groupe à la liste
        this._groups.push(newGroup);
        
        // Sauvegarde les groupes
        if (this._storageService.saveGroups(this._groups)) {
            return groupId;
        }
        
        return null;
    }

    /**
     * Modifie un groupe de favoris
     * @param {string} groupId - ID du groupe
     * @param {Object} updatedData - Données à mettre à jour
     * @returns {boolean} true si la modification a réussi
     */
    updateGroup(groupId, updatedData) {
        // Trouve le groupe à modifier
        const group = this._groups.find(g => g.id === groupId);
        if (!group) {
            return false;
        }
        
        // Met à jour les données du groupe
        if (updatedData.name) group.name = updatedData.name;
        if (updatedData.color) group.color = updatedData.color;
        if (updatedData.icon) group.icon = updatedData.icon;
        
        // Sauvegarde les groupes
        return this._storageService.saveGroups(this._groups);
    }

    /**
     * Supprime un groupe de favoris
     * @param {string} groupId - ID du groupe
     * @param {Array} favorites - Liste actuelle des favoris
     * @param {boolean} moveFavoritesToGeneral - Si true, déplace les favoris du groupe vers le groupe général
     * @returns {Object} Objet contenant {success: boolean, updatedFavorites: Array}
     */
    removeGroup(groupId, favorites, moveFavoritesToGeneral = true) {
        // On ne peut pas supprimer le groupe général
        if (groupId === 'general') {
            return { success: false, updatedFavorites: favorites };
        }
        
        // Vérifie si le groupe existe
        if (!this._groups.some(g => g.id === groupId)) {
            return { success: false, updatedFavorites: favorites };
        }
        
        // Copie les favoris pour les manipuler
        let updatedFavorites = [...favorites];
        
        // Gère les favoris du groupe
        if (moveFavoritesToGeneral) {
            // Déplace les favoris du groupe vers le groupe général
            updatedFavorites = updatedFavorites.map(fav => {
                if (fav.groupId === groupId) {
                    return { ...fav, groupId: 'general' };
                }
                return fav;
            });
        } else {
            // Supprime les favoris du groupe
            updatedFavorites = updatedFavorites.filter(fav => fav.groupId !== groupId);
        }
        
        // Filtre les groupes pour retirer le groupe
        this._groups = this._groups.filter(g => g.id !== groupId);
        
        // Sauvegarde les groupes
        const success = this._storageService.saveGroups(this._groups);
        
        return { 
            success,
            updatedFavorites
        };
    }

    /**
     * Réinitialise les groupes à leur état par défaut
     * @returns {boolean} true si la réinitialisation a réussi
     */
    resetToDefaultGroups() {
        this._groups = [
            {
                id: 'general',
                name: 'Général',
                color: '#3498db',
                icon: 'star'
            }
        ];
        
        return this._storageService.saveGroups(this._groups);
    }
}