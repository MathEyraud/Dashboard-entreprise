/**
 * @fileoverview Module principal de gestion des favoris
 * Centralise les opérations sur les favoris et coordonne avec les services associés
 */

/**
 * @class FavoriteCore
 * Gère les données et opérations liées aux applications favorites
 */
class FavoriteCore {
    /**
     * Crée une instance du gestionnaire de favoris
     * @constructor
     */
    constructor() {
        /**
         * Service de stockage pour les favoris
         * @type {FavoriteStorageService}
         * @private
         */
        this._storageService = new FavoriteStorageService();
        
        /**
         * Liste des favoris sauvegardés
         * @type {Array}
         * @private
         */
        this._favorites = this._storageService.loadFavorites();
        
        /**
         * Gestionnaire des groupes de favoris
         * @type {FavoriteGroupManager}
         * @private
         */
        this._groupManager = new FavoriteGroupManager(
            this._storageService,
            this._storageService.loadGroups()
        );
        
        // Initialise quelques favoris par défaut si aucun n'existe
        this._initDefaultFavorites();
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
        this._storageService.saveFavorites(this._favorites);
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
        return this._groupManager.getGroups();
    }
    
    /**
     * Vérifie si une application est dans les favoris (dans n'importe quel groupe)
     * @param {string} appId - ID de l'application
     * @returns {boolean} true si l'application est dans les favoris
     */
    isFavorite(appId) {
        return this._favorites.some(fav => fav.id === appId);
    }
    
    /**
     * Vérifie si une application est dans un groupe spécifique de favoris
     * @param {string} appId - ID de l'application
     * @param {string} groupId - ID du groupe
     * @returns {boolean} true si l'application est dans le groupe spécifié
     */
    isInFavoriteGroup(appId, groupId) {
        if (!appId || !groupId) {
            console.warn('isInFavoriteGroup appelé avec des paramètres invalides', { appId, groupId });
            return false;
        }
        
        // Normaliser l'ID de groupe pour les comparaisons
        const normalizedGroupId = groupId || 'general';
        
        // Rechercher dans les favoris
        return this._favorites.some(fav => 
            fav.id === appId && 
            (fav.groupId === normalizedGroupId || (!fav.groupId && normalizedGroupId === 'general'))
        );
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
        // Vérifie si l'application est déjà dans le groupe spécifié
        if (this.isInFavoriteGroup(appId, groupId)) {
            return false;
        }
        
        // Ajoute l'application aux favoris dans le groupe spécifié
        this._favorites.push({ id: appId, categoryId, groupId });
        
        // Sauvegarde les favoris
        return this._storageService.saveFavorites(this._favorites);
    }
    
    /**
     * Supprime une application des favoris de tous les groupes
     * @param {string} appId - ID de l'application
     * @returns {boolean} true si la suppression a réussi
     */
    removeFavorite(appId) {
        const initialLength = this._favorites.length;
        
        // Filtre les favoris pour retirer l'application
        this._favorites = this._favorites.filter(fav => fav.id !== appId);
        
        // Vérifie si des changements ont été effectués
        if (initialLength !== this._favorites.length) {
            // Sauvegarde les favoris
            return this._storageService.saveFavorites(this._favorites);
        }
        
        return false;
    }
    
    /**
     * Supprime une application d'un groupe spécifique de favoris
     * @param {string} appId - ID de l'application
     * @param {string} groupId - ID du groupe
     * @returns {boolean} true si la suppression a réussi
     */
    removeFromGroup(appId, groupId) {
        const initialLength = this._favorites.length;
        
        // Filtre les favoris pour retirer l'application uniquement du groupe spécifié
        this._favorites = this._favorites.filter(fav => 
            !(fav.id === appId && 
              (fav.groupId === groupId || (!fav.groupId && groupId === 'general')))
        );
        
        // Vérifie si des changements ont été effectués
        if (initialLength !== this._favorites.length) {
            // Sauvegarde les favoris
            return this._storageService.saveFavorites(this._favorites);
        }
        
        return false;
    }

    /**
     * Change le groupe d'un favori (déplacement au lieu de duplication)
     * @param {string} appId - ID de l'application
     * @param {string} newGroupId - Nouvel ID de groupe
     * @param {string} sourceGroupId - ID du groupe source (optionnel)
     * @returns {boolean} true si le changement a réussi
     */
    changeFavoriteGroup(appId, newGroupId, sourceGroupId = null) {
        // Vérifie si l'application est déjà dans le nouveau groupe
        if (this.isInFavoriteGroup(appId, newGroupId)) {
            return false;
        }
        
        // Trouve l'instance de l'application dans le groupe source pour obtenir son categoryId
        let sourceInstance = null;
        
        if (sourceGroupId) {
            // Chercher dans le groupe source spécifié
            sourceInstance = this._favorites.find(fav => 
                fav.id === appId && 
                (fav.groupId === sourceGroupId || (!fav.groupId && sourceGroupId === 'general'))
            );
        } else {
            // Chercher n'importe quelle instance
            sourceInstance = this._favorites.find(fav => fav.id === appId);
        }
        
        if (!sourceInstance) {
            return false; // L'application n'existe pas dans les favoris
        }
        
        // Récupère la catégorie de l'application
        const categoryId = sourceInstance.categoryId;
        
        // Supprime l'application du groupe source
        if (sourceGroupId) {
            this._favorites = this._favorites.filter(fav => 
                !(fav.id === appId && 
                (fav.groupId === sourceGroupId || (!fav.groupId && sourceGroupId === 'general')))
            );
        }
        
        // Ajoute l'application au nouveau groupe
        this._favorites.push({
            id: appId,
            categoryId: categoryId,
            groupId: newGroupId
        });
        
        // Sauvegarde les favoris
        return this._storageService.saveFavorites(this._favorites);
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
        return this._storageService.saveFavorites(this._favorites);
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
                fav.id === id && (fav.groupId === groupId || (!fav.groupId && groupId === 'general'))
            );
            if (favorite) {
                reorderedGroupFavorites.push(favorite);
            }
        }
        
        // S'assure que tous les favoris du groupe sont inclus
        const groupFavorites = this._favorites.filter(fav => 
            (fav.groupId === groupId || (!fav.groupId && groupId === 'general'))
        );
        
        for (const favorite of groupFavorites) {
            if (!reorderedGroupFavorites.some(fav => fav.id === favorite.id)) {
                reorderedGroupFavorites.push(favorite);
            }
        }
        
        // Combine les favoris réorganisés du groupe avec les autres favoris
        this._favorites = [...reorderedGroupFavorites, ...otherFavorites];
        
        // Sauvegarde les favoris
        return this._storageService.saveFavorites(this._favorites);
    }
    
    /**
     * Ajoute un nouveau groupe de favoris
     * @param {Object} group - Données du groupe
     * @returns {string} ID du groupe créé ou null si échec
     */
    addGroup(group) {
        return this._groupManager.addGroup(group);
    }
    
    /**
     * Modifie un groupe de favoris
     * @param {string} groupId - ID du groupe
     * @param {Object} updatedData - Données à mettre à jour
     * @returns {boolean} true si la modification a réussi
     */
    updateGroup(groupId, updatedData) {
        return this._groupManager.updateGroup(groupId, updatedData);
    }
    
    /**
     * Supprime un groupe de favoris
     * @param {string} groupId - ID du groupe
     * @param {boolean} moveFavoritesToGeneral - Si true, déplace les favoris du groupe vers le groupe général
     * @returns {boolean} true si la suppression a réussi
     */
    removeGroup(groupId, moveFavoritesToGeneral = true) {
        const result = this._groupManager.removeGroup(groupId, this._favorites, moveFavoritesToGeneral);
        
        if (result.success) {
            this._favorites = result.updatedFavorites;
            return this._storageService.saveFavorites(this._favorites);
        }
        
        return false;
    }
    
    /**
     * Récupère les détails des applications favorites
     * @param {CategoryModel} categoryModel - Modèle de catégories pour récupérer les détails
     * @returns {Object} Objet avec favoris groupés et liste des groupes
     */
    getFavoriteApps(categoryModel) {
        const favoriteAppsGrouped = {};
        
        // Initialise un objet pour chaque groupe
        this.getGroups().forEach(group => {
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
        
        // Trier les applications par nom dans chaque groupe
        Object.keys(favoriteAppsGrouped).forEach(groupId => {
            favoriteAppsGrouped[groupId].apps.sort((a, b) => {
                // Tri alphabétique insensible à la casse
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            });
        });
        
        return {
            favoriteAppsGrouped,
            groups: this.getGroups()
        };
    }
}