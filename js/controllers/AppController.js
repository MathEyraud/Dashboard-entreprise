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
            this.favoritesModel.addFavorite(appId, categoryId);
        }
        
        // Met à jour l'interface
        this.updateDisplay(true);
        
        // Reconstruire l'index de recherche car les favoris ont changé
        this.searchModelService.rebuildIndex();
    }
    
    /**
     * Met à jour l'affichage
     * @param {boolean} isInitialLoad - Indique s'il s'agit du chargement initial
     */
    updateDisplay(isInitialLoad = false) {
        // Récupère les informations nécessaires
        let categories = this.categoryModel.getOrderedCategories();
        const currentCategoryId = this.categoryModel.getCurrentCategoryId();
        
        // Filtre les catégories selon leur visibilité
        const visibleCategories = this.visibilityManager.filterVisibleCategories(categories);
        
        const favoriteApps = this.favoritesModel.getFavoriteApps(this.categoryModel);
        
        // Met à jour l'interface utilisateur principale
        this.uiManager.updateCategoryNav(visibleCategories, currentCategoryId);
        this.uiManager.updateCategories(visibleCategories, currentCategoryId, isInitialLoad);
        this.uiManager.updateFavorites(favoriteApps, (appId, categoryId) => {
            this.toggleFavorite(appId, categoryId);
        });
        
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
}