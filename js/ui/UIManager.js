/**
 * @fileoverview Gestionnaire d'interface utilisateur (Façade)
 * Orchestrateur pour les différents gestionnaires d'interface utilisateur modularisés
 */

/**
 * @class UIManager
 * Façade pour interfacer avec le système d'interface utilisateur modularisé
 */
class UIManager {
    /**
     * Crée une instance du gestionnaire d'interface utilisateur
     * @constructor
     */
    constructor() {
        // Initialise le coeur de l'interface utilisateur
        this.uiCore = new UICore();
        
        // Alias des méthodes pour maintenir la compatibilité
        this.setupEventListeners = this.uiCore.setupEventListeners.bind(this.uiCore);
        this.updateCategoryNav = this.uiCore.updateCategoryNav.bind(this.uiCore);
        this.updateActiveCategoryTab = this.uiCore.updateActiveCategoryTab.bind(this.uiCore);
        this.updateFavorites = this.uiCore.updateFavorites.bind(this.uiCore);
        this.updateCategories = this.uiCore.updateCategories.bind(this.uiCore);
        this.updateGlobalToggleVisibility = this.uiCore.updateGlobalToggleVisibility.bind(this.uiCore);
        this.updateAllFavoriteButtons = this.uiCore.updateAllFavoriteButtons.bind(this.uiCore);
        this.updateFavoriteButtonsForApp = this.uiCore.updateFavoriteButtonsForApp.bind(this.uiCore);
        this.ensureSectionExpanded = this.uiCore.ensureSectionExpanded.bind(this.uiCore);
        
        // Alias pour les méthodes de GroupSelectorUI
        this.showGroupSelector = this.uiCore.groupSelectorUI.showGroupSelector.bind(this.uiCore.groupSelectorUI);
        this.closeGroupSelector = this.uiCore.groupSelectorUI.closeGroupSelector.bind(this.uiCore.groupSelectorUI);
    }
}