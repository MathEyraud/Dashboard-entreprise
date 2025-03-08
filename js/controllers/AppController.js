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
        
        // Interface utilisateur
        this.uiManager = new UIManager();
        this.themeManager = new ThemeManager();
        this.dockManager = new DockManager(this.dockStateModel);
        
        // Configure les écouteurs d'événements
        this._setupEventListeners();
    }
    
    /**
     * Configure les écouteurs d'événements
     * @private
     */
    _setupEventListeners() {
        // Écouteur pour le changement de catégorie via l'UI normale
        this.uiManager.setupEventListeners((categoryId) => {
            this.changeCategory(categoryId);
        });
    }
    
    /**
     * Change la catégorie actuelle
     * @param {string} categoryId - ID de la catégorie à sélectionner
     */
    changeCategory(categoryId) {
        // Change la catégorie dans le modèle
        this.categoryModel.setCurrentCategoryId(categoryId);
        
        // Met à jour l'affichage complet avec scroll car c'est un changement manuel
        this.updateDisplay(false);
    }
    
    /**
     * Met à jour l'affichage
     * @param {boolean} isInitialLoad - Indique s'il s'agit du chargement initial
     */
    updateDisplay(isInitialLoad = false) {
        // Récupère les informations nécessaires
        const categories = this.categoryModel.getOrderedCategories();
        const currentCategoryId = this.categoryModel.getCurrentCategoryId();
        
        // Met à jour l'interface utilisateur principale
        this.uiManager.updateCategoryNav(categories, currentCategoryId);
        this.uiManager.updateCategories(categories, currentCategoryId, isInitialLoad);
        
        // Met à jour le dock avec les catégories pour la navigation rapide
        this.dockManager.updateDockCategories(categories, currentCategoryId, (categoryId) => {
            this.changeCategory(categoryId);
        });
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