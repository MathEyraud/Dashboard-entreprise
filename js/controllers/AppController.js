/**
 * @fileoverview Contrôleur principal de l'application
 * Coordonne les différents composants de l'application
 */

/**
 * @class AppController
 * Contrôleur principal de l'application
 */
class AppController {
    /**
     * Crée une instance du contrôleur
     * @constructor
     */
    constructor() {
        // Modèles
        this.categoryModel = new CategoryModel();
        this.dockStateModel = new DockStateModel();
        this.favoritesModel = new FavoritesModel();
        this.visibilityModel = new VisibilityModel();
        this.searchHistoryModel = new SearchHistoryModel();

        // Services
        this.usageTrackingService = new UsageTrackingService();
        this.searchModelService = new SearchModelService(this.categoryModel);

        // Gestionnaire d'affichage
        this.displayManager = new DisplayManager();
        
        // Interface utilisateur
        this.uiManager = new UIManager();
        this.themeManager = new ThemeManager();
        this.dockManager = new DockManager(this.dockStateModel);

        // Gestionnaire de recherche
        this.searchManager = new SearchManager(
            this.categoryModel,
            this.searchModelService,
            this.usageTrackingService,
            this.searchHistoryModel
        );
        
        // Gestionnaire de visibilité
        this.visibilityManager = new VisibilityManager(
            this.visibilityModel,
            this.categoryModel,
            () => this.updateDisplay(true)
        );

        /**
         * Initialisation du gestionnaire de groupes
         * À ajouter dans le constructeur de l'AppController
         */
        // Gestionnaire de groupes de favoris
        this.favoritesGroupManager = new FavoritesGroupManager(
            this.favoritesModel,
            () => this.updateDisplay(true)
        );
        
        // Configure les écouteurs d'événements
        this._setupEventListeners();
    }
    
    /**
     * Configure les écouteurs d'événements
     * @private
     */
    _setupEventListeners() {
        // Écouteur pour le changement de catégorie via l'UI normale
        this.uiManager.setupEventListeners(
            (categoryId) => this.changeCategory(categoryId), // Callback pour le changement de catégorie
            (appId) => this.favoritesModel.isFavorite(appId) // Callback pour vérifier si une app est en favoris
        );
        
        // Écouteur pour les changements de disposition d'affichage
        document.addEventListener('displayLayoutChanged', (event) => {
            if (event.detail && event.detail.layout) {
                // Mettre à jour l'affichage pour refléter la nouvelle disposition
                this.updateDisplay(true);
            }
        });
    }
    
    /**
     * Change la catégorie actuelle
     * @param {string} categoryId - ID de la catégorie à sélectionner
     */
    changeCategory(categoryId) {
        // Change la catégorie dans le modèle
        this.categoryModel.setCurrentCategoryId(categoryId);
        
        // S'assure que la section est dépliée si elle était repliée
        this.uiManager.ensureSectionExpanded(categoryId);
        
        // Met à jour l'affichage complet avec scroll car c'est un changement manuel
        this.updateDisplay(false);
    }
    
    /**
     * Bascule une application dans les favoris ou l'ajoute à un groupe spécifique
     * Mise à jour pour supporter le sélecteur de groupe de favoris
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     * @param {string} [targetGroupId='general'] - ID du groupe cible (optionnel)
     * @param {HTMLElement} [sourceElement=null] - Élément source (bouton étoile) ayant déclenché l'action
     */
    toggleFavorite = function(appId, categoryId, targetGroupId = 'general', sourceElement = null) {
        // Log pour le débogage
        console.log(`toggleFavorite appelé avec: appId=${appId}, categoryId=${categoryId}, targetGroupId=${targetGroupId}`);
        
        // Sauvegarde la position de défilement actuelle
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Cas spécial pour la sélection de groupe lors de l'ajout initial
        if (!this.favoritesModel.isFavorite(appId) && targetGroupId === 'general') {
            // Récupère tous les groupes
            const groups = this.favoritesModel.getGroups() || [];
            
            // S'il y a plus d'un groupe, affiche le sélecteur de groupe
            if (groups.length > 1) {
                // Récupère les données de l'application
                const category = this.categoryModel.getCategoryData(categoryId);
                if (!category || !category.apps) {
                    console.error(`Catégorie non trouvée: ${categoryId}`);
                    return;
                }
                
                const app = category.apps.find(a => a.id === appId);
                if (!app) {
                    console.error(`Application non trouvée: ${appId} dans la catégorie ${categoryId}`);
                    return;
                }
                
                // Affiche le sélecteur de groupe
                this.uiManager.showGroupSelector(
                    app, 
                    categoryId, 
                    (appId, categoryId, groupId) => {
                        console.log(`Callback de sélection appelé avec: appId=${appId}, categoryId=${categoryId}, groupId=${groupId}`);
                        this.toggleFavorite(appId, categoryId, groupId);
                    },
                    (action, id, extraId) => this.handleGroupAction(action, id, extraId)
                );
                
                return; // Arrête l'exécution ici car le sélecteur va gérer l'ajout
            }
        }
        
        // Traitement spécial pour le groupe "general"
        if (targetGroupId === 'general') {
            console.log("Traitement spécial pour le groupe Général dans toggleFavorite");
            
            // Vérification explicite pour le groupe general
            const isInGeneralGroup = this.favoritesModel.isInFavoriteGroup(appId, 'general');
            console.log(`L'app ${appId} est-elle dans le groupe Général? ${isInGeneralGroup}`);
            
            // Mise à jour visuelle du bouton si fourni
            if (sourceElement && sourceElement.classList.contains('app-favorite-toggle')) {
                if (isInGeneralGroup) {
                    // Si on retire des favoris du groupe
                    sourceElement.innerHTML = '<i class="far fa-star"></i>';
                    sourceElement.setAttribute('title', 'Ajouter aux favoris');
                    sourceElement.setAttribute('aria-label', 'Ajouter aux favoris');
                    sourceElement.classList.remove('is-favorite');
                } else {
                    // Si on ajoute aux favoris du groupe
                    sourceElement.innerHTML = '<i class="fas fa-star"></i>';
                    sourceElement.setAttribute('title', 'Retirer des favoris');
                    sourceElement.setAttribute('aria-label', 'Retirer des favoris');
                    sourceElement.classList.add('is-favorite');
                }
            }
            
            // Opération directe sur le modèle de favoris
            if (isInGeneralGroup) {
                console.log(`Suppression de l'app ${appId} du groupe Général`);
                this.favoritesModel.removeFromGroup(appId, 'general');
            } else {
                console.log(`Ajout de l'app ${appId} au groupe Général`);
                this.favoritesModel.addFavorite(appId, categoryId, 'general');
            }

        } 
        // Traitement standard pour les autres groupes
        else {
            const wasInGroup = this.favoritesModel.isInFavoriteGroup(appId, targetGroupId);
            
            // Mise à jour visuelle du bouton
            if (sourceElement && sourceElement.classList.contains('app-favorite-toggle')) {
                if (wasInGroup) {
                    sourceElement.innerHTML = '<i class="far fa-star"></i>';
                    sourceElement.setAttribute('title', 'Ajouter aux favoris');
                    sourceElement.setAttribute('aria-label', 'Ajouter aux favoris');
                    sourceElement.classList.remove('is-favorite');
                } else {
                    sourceElement.innerHTML = '<i class="fas fa-star"></i>';
                    sourceElement.setAttribute('title', 'Retirer des favoris');
                    sourceElement.setAttribute('aria-label', 'Retirer des favoris');
                    sourceElement.classList.add('is-favorite');
                }
            }
            
            if (wasInGroup) {
                this.favoritesModel.removeFromGroup(appId, targetGroupId);
            } else {
                this.favoritesModel.addFavorite(appId, categoryId, targetGroupId);
            }
        }

        // Appliquer une animation sur l'élément source s'il s'agit d'un bouton
        if (sourceElement) {
            // Si c'est une étoile de tuile normale
            if (sourceElement.classList.contains('app-favorite-toggle')) {
                sourceElement.classList.add('just-clicked');
                setTimeout(() => {
                    sourceElement.classList.remove('just-clicked');
                }, 500);
            }
            // Si c'est une étoile de résultat de recherche
            else if (sourceElement.classList.contains('search-result-favorite')) {
                sourceElement.classList.add('just-added');
                setTimeout(() => {
                    sourceElement.classList.remove('just-added');
                }, 500);
            }
        }
        
        // Pour éviter les mises à jour visuelles trop fréquentes (throttling)
        this.synchronizeFavorites();
        
        // Reconstruire l'index de recherche
        this.searchModelService.rebuildIndex();
        
        // Mise à jour différée de l'interface
        setTimeout(() => {
            this.updateDisplay(true, true);
            
            // Restaure la position de défilement
            window.scrollTo({
                top: scrollPosition,
                behavior: 'auto'
            });
        }, 100);
    };

    /**
     * Synchronise l'état des favoris dans toute l'interface
     * Cette méthode doit être appelée après toute modification importante des favoris
     */
    synchronizeFavorites() {
        // 1. Mettre à jour les boutons de favoris dans toutes les sections
        if (this.uiManager) {
            this.uiManager.updateAllFavoriteButtons();
        }
        
        // 2. Reconstruire l'index de recherche pour intégrer les changements
        if (this.searchModelService) {
            this.searchModelService.rebuildIndex();
        }
        
        // 3. Mettre à jour les résultats de recherche si actifs
        if (this.searchManager && this.searchManager._lastSearchTerm) {
            this.searchManager.refreshSearchResults(this.searchManager._lastSearchTerm);
        }
        
        // 4. Mettre à jour l'affichage des favoris dans la section correspondante
        this.updateDisplay(false, true);
        
        // 5. Déclencher un événement pour informer d'autres composants potentiels
        const event = new CustomEvent('favoritesFullyUpdated', {
            detail: { timestamp: Date.now() }
        });
        document.dispatchEvent(event);
        
        console.log('État des favoris entièrement synchronisé');
    }
    
    /**
     * Met à jour l'affichage global de l'application
     * @param {boolean} isInitialLoad - Indique s'il s'agit du chargement initial
     * @param {boolean} preserveScroll - Indique s'il faut préserver la position de défilement
     */
    updateDisplay(isInitialLoad = false, preserveScroll = false) {
        // Récupère les informations nécessaires
        let categories = this.categoryModel.getOrderedCategories();
        const currentCategoryId = this.categoryModel.getCurrentCategoryId();
        
        // Filtre les catégories selon leur visibilité
        const visibleCategories = this.visibilityManager.filterVisibleCategories(categories);
        
        // Récupère les favoris groupés
        const favoritesData = this.favoritesModel.getFavoriteApps(this.categoryModel);
        
        // Met à jour l'interface utilisateur principale
        this.uiManager.updateCategoryNav(visibleCategories, currentCategoryId);
        
        // Passe le paramètre preserveScroll à updateCategories
        this.uiManager.updateCategories(visibleCategories, currentCategoryId, isInitialLoad, preserveScroll);
        
        // Met à jour la visibilité du bouton global de réduction/expansion
        this.uiManager.updateGlobalToggleVisibility(visibleCategories);
        
        // Gestion des favoris avec groupes et réorganisation
        this.uiManager.updateFavorites(
            favoritesData, 
            (appId, categoryId, targetGroupId, sourceElement) => this.toggleFavorite(appId, categoryId, targetGroupId, sourceElement),
            (groupId, newOrder) => this.reorderGroupFavorites(groupId, newOrder),
            (action, id, extraId, sourceGroupId) => this.handleGroupAction(action, id, extraId, sourceGroupId),
            (appId) => this.favoritesModel.isFavorite(appId),
            (appId, categoryId, groupId) => this.addToFavorites(appId, categoryId, groupId)
        );
        
        // Met à jour le dock avec les catégories pour la navigation rapide
        this.dockManager.updateDockCategories(
            categories, // Toutes les catégories pour le panneau de configuration
            currentCategoryId, 
            (categoryId) => this.changeCategory(categoryId),
            () => this.visibilityManager.togglePanel()
        );
    }
    
    /**
     * Initialise l'application
     */
    init() {
        // Met à jour l'affichage en spécifiant qu'il s'agit du chargement initial
        this.updateDisplay(true);

        // Met à jour les étoiles de favoris
        this.uiManager.updateAllFavoriteButtons();
        
        // Met à jour le timestamp de dernière visite
        StorageService.updatePreference('lastVisit', new Date().toISOString());
        
        console.log('Application Dashboard initialisée avec succès');
    }

    /**
     * Réorganise les favoris d'un groupe
     * @param {string} groupId - ID du groupe
     * @param {Array} newOrder - Nouvel ordre des favoris du groupe
     */
    reorderGroupFavorites(groupId, newOrder) {
        // Appelle la méthode de réorganisation du modèle
        this.favoritesModel.reorderGroupFavorites(groupId, newOrder);
        
        // Met à jour l'interface
        this.updateDisplay(true);

        this.synchronizeFavorites();
    }

    /**
     * Gère les actions de groupe
     * @param {string} action - Type d'action (add, edit, delete, moveToGroup)
     * @param {string} [id=null] - ID du groupe ou de l'app selon l'action
     * @param {string} [extraId=null] - ID supplémentaire (groupId pour moveToGroup)
     * @param {string} [sourceGroupId=null] - ID du groupe source pour moveToGroup
    */
    handleGroupAction(action, id = null, extraId = null, sourceGroupId = null) {
        // Délègue au gestionnaire de groupes en passant le paramètre sourceGroupId
        this.favoritesGroupManager.handleGroupAction(action, id, extraId, sourceGroupId);

        this.synchronizeFavorites();
    }
}