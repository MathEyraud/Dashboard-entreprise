/**
 * @fileoverview Modèle de gestion des favoris
 * Gère l'ajout, la suppression, la réorganisation et la persistance des applications favorites
 * Version améliorée avec support pour le glisser-déposer et les groupes de favoris
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
         * Groupes de favoris personnalisés
         * @type {Array}
         * @private
         */
        this._groups = [];
        
        /**
         * Clé localStorage pour les favoris
         * @type {string}
         * @private
         */
        this._storageKey = 'dashboardFavorites';
        
        /**
         * Clé localStorage pour les groupes de favoris
         * @type {string}
         * @private
         */
        this._groupsStorageKey = 'dashboardFavoriteGroups';
        
        // Charge les favoris depuis le localStorage
        this._loadFavorites();
        
        // Charge les groupes depuis le localStorage
        this._loadGroups();
        
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
     * Charge les groupes de favoris depuis le localStorage
     * @private
     */
    _loadGroups() {
        try {
            const savedGroups = StorageService.getPreference('favoriteGroups', null);
            if (savedGroups && Array.isArray(savedGroups)) {
                this._groups = savedGroups;
                console.log(`${this._groups.length} groupes de favoris chargés`);
            } else {
                // Initialiser avec un groupe par défaut "Général"
                this._groups = [
                    {
                        id: 'general',
                        name: 'Général',
                        color: '#3498db',
                        icon: 'star'
                    }
                ];
                this._saveGroups();
            }
        } catch (e) {
            console.error('Erreur lors du chargement des groupes de favoris:', e);
            this._groups = [
                {
                    id: 'general',
                    name: 'Général',
                    color: '#3498db',
                    icon: 'star'
                }
            ];
            this._saveGroups();
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
     * Sauvegarde les groupes de favoris dans le localStorage
     * @private
     */
    _saveGroups() {
        try {
            StorageService.updatePreference('favoriteGroups', this._groups);
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des groupes de favoris:', e);
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
            { id: 'opti-srv1', categoryId: 'opti', groupId: 'general' },
            { id: 'secuopti-srv1', categoryId: 'secuopti', groupId: 'general' },
            { id: 'notion', categoryId: 'gestion', groupId: 'general' },
            { id: 'scribben', categoryId: 'correcteur', groupId: 'general' },
            { id: 'goal-srv1', categoryId: 'goal', groupId: 'general' }
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
     * Récupère les favoris d'un groupe spécifique
     * @param {string} groupId - ID du groupe
     * @returns {Array} Liste des favoris du groupe
     */
    getFavoritesByGroup(groupId) {
        return this._favorites.filter(fav => 
            fav.groupId === groupId || 
            // Si aucun groupId n'est spécifié, considérer comme "general"
            (!fav.groupId && groupId === 'general')
        );
    }
    
    /**
     * Récupère tous les groupes de favoris
     * @returns {Array} Liste des groupes
     */
    getGroups() {
        return [...this._groups];
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
     * Récupère le groupe d'un favori
     * @param {string} appId - ID de l'application
     * @returns {string|null} ID du groupe ou null si non trouvé
     */
    getFavoriteGroup(appId) {
        const favorite = this._favorites.find(fav => fav.id === appId);
        if (favorite) {
            return favorite.groupId || 'general';
        }
        return null;
    }
    
    /**
     * Ajoute une application aux favoris
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     * @param {string} groupId - ID du groupe (défaut: 'general')
     * @returns {boolean} true si l'ajout a réussi
     */
    addFavorite(appId, categoryId, groupId = 'general') {
        // Vérifie si l'application est déjà dans les favoris
        if (this.isFavorite(appId)) {
            return false;
        }
        
        // Ajoute l'application aux favoris
        this._favorites.push({ id: appId, categoryId, groupId });
        
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
     * Change le groupe d'un favori
     * @param {string} appId - ID de l'application
     * @param {string} newGroupId - Nouvel ID de groupe
     * @returns {boolean} true si le changement a réussi
     */
    changeFavoriteGroup(appId, newGroupId) {

        // Vérifie si l'application est dans les favoris
        if (!this.isFavorite(appId)) {
            return false;
        }
        
        // Trouve et met à jour le favori
        const favorite = this._favorites.find(fav => fav.id === appId);
        if (favorite) {
            favorite.groupId = newGroupId;
            
            // Sauvegarde les favoris
            return this._saveFavorites();
        }
        
        return false;
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
     * Réorganise les favoris au sein d'un groupe
     * @param {string} groupId - ID du groupe
     * @param {Array} newOrder - Nouvel ordre des favoris du groupe (tableau d'IDs)
     * @returns {boolean} true si la réorganisation a réussi
     */
    reorderGroupFavorites(groupId, newOrder) {
        // Récupère les favoris qui ne sont pas dans ce groupe
        const otherFavorites = this._favorites.filter(fav => 
            (fav.groupId || 'general') !== groupId
        );
        
        // Créer un nouvel array pour les favoris réorganisés du groupe
        const reorderedGroupFavorites = [];
        
        // Pour chaque ID dans le nouvel ordre, récupère le favori correspondant
        for (const id of newOrder) {
            const favorite = this._favorites.find(fav => 
                fav.id === id && (fav.groupId || 'general') === groupId
            );
            if (favorite) {
                reorderedGroupFavorites.push(favorite);
            }
        }
        
        // S'assure que tous les favoris du groupe sont inclus
        const groupFavorites = this._favorites.filter(fav => 
            (fav.groupId || 'general') === groupId
        );
        
        for (const favorite of groupFavorites) {
            if (!reorderedGroupFavorites.some(fav => fav.id === favorite.id)) {
                reorderedGroupFavorites.push(favorite);
            }
        }
        
        // Combine les favoris réorganisés du groupe avec les autres favoris
        this._favorites = [...reorderedGroupFavorites, ...otherFavorites];
        
        // Sauvegarde les favoris
        return this._saveFavorites();
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
        if (this._saveGroups()) {
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
        return this._saveGroups();
    }
    
    /**
     * Supprime un groupe de favoris
     * @param {string} groupId - ID du groupe
     * @param {boolean} moveFavoritesToGeneral - Si true, déplace les favoris du groupe vers le groupe général
     * @returns {boolean} true si la suppression a réussi
     */
    removeGroup(groupId, moveFavoritesToGeneral = true) {
        // On ne peut pas supprimer le groupe général
        if (groupId === 'general') {
            return false;
        }
        
        // Vérifie si le groupe existe
        if (!this._groups.some(g => g.id === groupId)) {
            return false;
        }
        
        // Gère les favoris du groupe
        if (moveFavoritesToGeneral) {
            // Déplace les favoris du groupe vers le groupe général
            this._favorites.forEach(fav => {
                if (fav.groupId === groupId) {
                    fav.groupId = 'general';
                }
            });
            
            // Sauvegarde les favoris
            this._saveFavorites();
        } else {
            // Supprime les favoris du groupe
            this._favorites = this._favorites.filter(fav => fav.groupId !== groupId);
            
            // Sauvegarde les favoris
            this._saveFavorites();
        }
        
        // Filtre les groupes pour retirer le groupe
        this._groups = this._groups.filter(g => g.id !== groupId);
        
        // Sauvegarde les groupes
        return this._saveGroups();
    }
    
    /**
     * Récupère les détails des applications favorites
     * @param {CategoryModel} categoryModel - Modèle de catégories pour récupérer les détails
     * @returns {Object} Objet avec favoris groupés et liste des groupes
     */
    getFavoriteApps(categoryModel) {
        const favoriteAppsGrouped = {};
        
        // Initialise un objet pour chaque groupe
        this._groups.forEach(group => {
            favoriteAppsGrouped[group.id] = {
                groupInfo: group,
                apps: []
            };
        });
        
        // Parcourir tous les favoris
        for (const favorite of this._favorites) {
            const { id, categoryId, groupId = 'general' } = favorite;
            
            // Récupère la catégorie
            const categoryApps = categoryModel.getCategoryApps(categoryId);
            
            // Cherche l'application dans la catégorie
            const app = categoryApps.find(app => app.id === id);
            
            // Si l'application existe, l'ajoute à la liste du groupe approprié
            if (app) {
                const appWithExtras = {
                    ...app,
                    categoryId,
                    categoryName: categoryModel.getCategoryData(categoryId)?.name || '',
                    groupId // Ajoute l'ID du groupe pour référence
                };
                
                // Ajoute l'app au groupe correspondant
                if (favoriteAppsGrouped[groupId]) {
                    favoriteAppsGrouped[groupId].apps.push(appWithExtras);
                } else {
                    // Si le groupe n'existe plus, met dans Général
                    favoriteAppsGrouped['general'].apps.push({
                        ...appWithExtras,
                        groupId: 'general'
                    });
                }
            }
        }
        
        return {
            favoriteAppsGrouped,
            groups: this._groups
        };
    }
}