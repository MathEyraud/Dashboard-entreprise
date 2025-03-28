/**
 * @fileoverview Gestionnaire d'affichage
 * Façade coordonnant les différents modules d'affichage
 */

/**
 * @class DisplayManager
 * Gère les options d'affichage du dashboard
 */
class DisplayManager {
    /**
     * Crée une instance du gestionnaire d'affichage
     * @constructor
     */
    constructor() {
        // Instancier le core qui coordonne tout
        this._displayCore = new DisplayCore();
    }
    
    /**
     * Définit la densité d'affichage
     * @param {string} density - Nouvelle densité
     */
    setDensity(density) {
        return this._displayCore.setDensity(density);
    }
    
    /**
     * Récupère la densité d'affichage actuelle
     * @returns {string} Densité actuelle
     */
    getDensity() {
        return this._displayCore.getDensity();
    }
    
    /**
     * Définit la disposition d'affichage
     * @param {string} layout - Nouvelle disposition
     */
    setLayout(layout) {
        return this._displayCore.setLayout(layout);
    }
    
    /**
     * Récupère la disposition d'affichage actuelle
     * @returns {string} Disposition actuelle
     */
    getLayout() {
        return this._displayCore.getLayout();
    }
    
    /**
     * Réinitialise les options d'affichage aux valeurs par défaut
     */
    resetToDefaults() {
        return this._displayCore.resetToDefaults();
    }
}