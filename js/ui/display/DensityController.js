/**
 * @fileoverview Contrôleur de densité d'affichage
 * Gère l'application des différentes densités d'affichage
 */

/**
 * @class DensityController
 * Contrôle les options de densité d'affichage
 */
class DensityController {
    /**
     * Crée une instance du contrôleur de densité
     * @param {DisplayCore} displayCore - Référence au core d'affichage
     * @constructor
     */
    constructor(displayCore) {
        /**
         * Référence au core d'affichage
         * @type {DisplayCore}
         * @private
         */
        this._displayCore = displayCore;
    }
    
    /**
     * Applique une densité d'affichage
     * @param {string} density - Densité à appliquer
     */
    applyDensity(density) {
        // Retirer toutes les classes de densité existantes
        document.body.classList.remove('density-compact', 'density-standard', 'density-comfortable');
        
        // Appliquer la nouvelle classe de densité
        document.body.classList.add(`density-${density}`);
        
        // Définition des variables CSS selon la densité
        switch (density) {
            case 'compact':
                this._applyCompactDensity();
                break;
            case 'comfortable':
                this._applyComfortableDensity();
                break;
            case 'standard':
            default:
                this._applyStandardDensity();
                break;
        }
    }
    
    /**
     * Applique la densité compacte
     * @private
     */
    _applyCompactDensity() {
        // Définit les variables CSS pour la densité compacte
        document.documentElement.style.setProperty('--app-tile-size', '90px');
        document.documentElement.style.setProperty('--app-tile-height', '110px');
        document.documentElement.style.setProperty('--app-icon-size', '32px');
        document.documentElement.style.setProperty('--app-icon-font-size', '16px');
        document.documentElement.style.setProperty('--app-icon-margin-top', '5px');
        document.documentElement.style.setProperty('--app-tile-gap', '10px');
        document.documentElement.style.setProperty('--category-spacing', '1.5rem');
    }
    
    /**
     * Applique la densité standard
     * @private
     */
    _applyStandardDensity() {
        // Restaure les variables CSS par défaut pour la densité standard
        document.documentElement.style.setProperty('--app-tile-size', '110px');
        document.documentElement.style.setProperty('--app-tile-height', '140px');
        document.documentElement.style.setProperty('--app-icon-size', '48px');
        document.documentElement.style.setProperty('--app-icon-font-size', '24px');
        document.documentElement.style.setProperty('--app-icon-margin-top', '10px');
        document.documentElement.style.setProperty('--app-tile-gap', '1rem');
        document.documentElement.style.setProperty('--category-spacing', '2rem');
    }
    
    /**
     * Applique la densité confortable
     * @private
     */
    _applyComfortableDensity() {
        // Définit les variables CSS pour la densité confortable
        document.documentElement.style.setProperty('--app-tile-size', '130px');
        document.documentElement.style.setProperty('--app-tile-height', '170px');
        document.documentElement.style.setProperty('--app-icon-size', '56px');
        document.documentElement.style.setProperty('--app-icon-font-size', '28px');
        document.documentElement.style.setProperty('--app-icon-margin-top', '15px');
        document.documentElement.style.setProperty('--app-tile-gap', '20px');
        document.documentElement.style.setProperty('--category-spacing', '3rem');
    }
}