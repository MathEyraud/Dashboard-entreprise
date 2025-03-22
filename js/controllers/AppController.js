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
            // Callback pour le changement de catégorie
            (categoryId) => {
                this.changeCategory(categoryId);
            },
            // Callback pour vérifier si une app est en favoris
            (appId) => {
                return this.favoritesModel.isFavorite(appId);
            }
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
     * Bascule une application dans les favoris
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     */
    toggleFavorite(appId, categoryId) {
        if (this.favoritesModel.isFavorite(appId)) {
            this.favoritesModel.removeFavorite(appId);
        } else {
            // Ajouter au groupe "general" par défaut
            this.favoritesModel.addFavorite(appId, categoryId, 'general');
        }
        
        // Met à jour l'interface
        this.updateDisplay(true);
        
        // Reconstruire l'index de recherche car les favoris ont changé
        this.searchModelService.rebuildIndex();
    }
    
    /**
     * Mise à jour de la méthode updateDisplay
     * Remplacer la partie des favoris dans la méthode existante
    */
    updateDisplay(isInitialLoad = false) {
        // Récupère les informations nécessaires
        let categories = this.categoryModel.getOrderedCategories();
        const currentCategoryId = this.categoryModel.getCurrentCategoryId();
        
        // Filtre les catégories selon leur visibilité
        const visibleCategories = this.visibilityManager.filterVisibleCategories(categories);
        
        // Récupère les favoris groupés
        const favoritesData = this.favoritesModel.getFavoriteApps(this.categoryModel);
        
        // Met à jour l'interface utilisateur principale
        this.uiManager.updateCategoryNav(visibleCategories, currentCategoryId);
        this.uiManager.updateCategories(visibleCategories, currentCategoryId, isInitialLoad);
        
        // Version améliorée pour les favoris avec groupes et réorganisation
        this.uiManager.updateFavorites(
            favoritesData, 
            (appId, categoryId) => this.toggleFavorite(appId, categoryId),
            (groupId, newOrder) => this.reorderGroupFavorites(groupId, newOrder),
            (action, id, extraId) => this.handleGroupAction(action, id, extraId)
        );
        
        // Met à jour le dock avec les catégories pour la navigation rapide
        this.dockManager.updateDockCategories(
            categories, // Toutes les catégories pour le panneau de configuration
            currentCategoryId, 
            (categoryId) => {
                this.changeCategory(categoryId);
            },
            () => {
                this.visibilityManager.togglePanel();
            }
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
     */
    handleGroupAction(action, id = null, extraId = null) {
        // Délègue au gestionnaire de groupes
        this.favoritesGroupManager.handleGroupAction(action, id, extraId);
    }
}