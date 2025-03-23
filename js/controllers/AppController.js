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

        // Gestionnaire de recherche avec les nouveaux services
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
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     * @param {string} [targetGroupId='general'] - ID du groupe cible (optionnel)
     * @param {HTMLElement} [sourceElement=null] - Élément source (bouton étoile) ayant déclenché l'action
     */
    toggleFavorite(appId, categoryId, targetGroupId = 'general', sourceElement = null) {
        // Sauvegarde la position de défilement actuelle
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Détermine si l'application était déjà en favoris dans le groupe spécifique
        const wasInGroup = this.favoritesModel.isInFavoriteGroup(appId, targetGroupId);
        
        // NOUVEAU: Mise à jour visuelle immédiate du bouton sans recharger l'interface
        if (sourceElement && sourceElement.classList.contains('app-favorite-toggle')) {
            // Mettre à jour l'apparence du bouton immédiatement
            if (wasInGroup) {
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
        
        if (wasInGroup) {
            // Si l'application est déjà dans ce groupe, la retirer
            this.favoritesModel.removeFromGroup(appId, targetGroupId);
        } else {
            // Sinon, l'ajouter au groupe cible
            this.favoritesModel.addFavorite(appId, categoryId, targetGroupId);
        }
        
        // Reconstruire l'index de recherche car les favoris ont changé
        this.searchModelService.rebuildIndex();
        
        // NOUVEAU: Retarder légèrement la mise à jour complète de l'interface
        // pour permettre à l'animation visuelle de se terminer
        setTimeout(() => {
            // Mise à jour complète de l'interface avec préservation du défilement
            this.updateDisplay(true, true);
            
            // Restaure la position de défilement après la mise à jour du DOM
            window.scrollTo({
                top: scrollPosition,
                behavior: 'auto'
            });
        }, 100); // Délai de 100ms pour permettre à l'animation de se terminer
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
    }
}