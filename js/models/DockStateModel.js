/**
 * @fileoverview Modèle de gestion de l'état du dock
 * Gère la persistance de l'état du dock (ouvert/fermé)
 */

/**
 * @class DockStateModel
 * Gère l'état du dock de navigation
 */
class DockStateModel {
    /**
     * Crée une instance du modèle d'état du dock
     * @constructor
     */
    constructor() {
        /**
         * État d'ouverture du dock
         * @type {boolean}
         * @private
         */
        this._isOpen = true;
        
        /**
         * Clé localStorage pour l'état du dock
         * @type {string}
         * @private
         */
        this._storageKey = 'dockOpen';
        
        // Charge l'état du dock depuis le localStorage
        this._loadDockState();
    }
    
    /**
     * Charge l'état du dock depuis le localStorage
     * @private
     */
    _loadDockState() {
        try {
            const savedState = StorageService.getPreference(this._storageKey, null);
            if (savedState !== null) {
                this._isOpen = savedState;
                console.log(`État du dock chargé: ${this._isOpen ? 'ouvert' : 'fermé'}`);
            }
        } catch (e) {
            console.error('Erreur lors du chargement de l\'état du dock:', e);
        }
    }
    
    /**
     * Sauvegarde l'état du dock dans le localStorage
     * @private
     */
    _saveDockState() {
        try {
            StorageService.updatePreference(this._storageKey, this._isOpen);
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde de l\'état du dock:', e);
            return false;
        }
    }
    
    /**
     * Récupère l'état d'ouverture du dock
     * @returns {boolean} true si le dock est ouvert
     */
    isOpen() {
        return this._isOpen;
    }
    
    /**
     * Définit l'état d'ouverture du dock
     * @param {boolean} isOpen - Nouvel état
     * @returns {boolean} true si la mise à jour a réussi
     */
    setOpen(isOpen) {
        this._isOpen = isOpen;
        return this._saveDockState();
    }
    
    /**
     * Bascule l'état d'ouverture du dock
     * @returns {boolean} true si la mise à jour a réussi
     */
    toggleOpen() {
        this._isOpen = !this._isOpen;
        return this._saveDockState();
    }
}