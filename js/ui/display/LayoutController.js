/**
 * @fileoverview Contrôleur de disposition d'affichage
 * Gère l'application des différentes dispositions d'affichage
 */

/**
 * @class LayoutController
 * Contrôle les options de disposition d'affichage
 */
class LayoutController {
    /**
     * Crée une instance du contrôleur de disposition
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
     * Applique une disposition d'affichage
     * @param {string} layout - Disposition à appliquer
     */
    applyLayout(layout) {
        // Retirer toutes les classes de disposition existantes
        document.body.classList.remove('layout-grid', 'layout-list', 'layout-detailed');
        
        // Appliquer la nouvelle classe de disposition
        document.body.classList.add(`layout-${layout}`);
        
        // Adaptations spécifiques à chaque disposition
        switch (layout) {
            case 'list':
                this._applyListLayout();
                break;
            case 'grid':
            default:
                this._applyGridLayout();
                break;
        }
    }
    
    /**
     * Applique la disposition en grille
     * @private
     */
    _applyGridLayout() {
        // Réinitialise les adaptations spécifiques à la disposition en liste
        this._resetListLayoutAdaptations();
        
        // Applique les styles spécifiques à la disposition en grille
        // C'est la disposition par défaut, donc généralement pas besoin d'adaptations spéciales
    }
    
    /**
     * Applique la disposition en liste
     * @private
     */
    _applyListLayout() {
        // Applique les adaptations pour la disposition en liste
        
        // Ajoute la description aux tuiles qui n'en ont pas encore
        this._addDescriptionsToListTiles();
        
        // Réorganise les éléments dans les tuiles pour la disposition en liste
        this._reorganizeTilesForListLayout();
    }
    
    /**
     * Réinitialise les adaptations spécifiques à la disposition en liste
     * @private
     */
    _resetListLayoutAdaptations() {
        // Supprime les conteneurs de contenu ajoutés spécifiquement pour la vue liste
        document.querySelectorAll('.app-tile .app-content').forEach(content => {
            const tile = content.closest('.app-tile');
            const name = content.querySelector('.app-name');
            
            if (tile && name) {
                // Déplacer le nom directement dans la tuile
                tile.appendChild(name);
                content.remove();
            }
        });
        
        // Supprime les éléments de description ajoutés spécifiquement pour la vue liste
        document.querySelectorAll('.app-description').forEach(desc => {
            desc.remove();
        });
    }
    
    /**
     * Ajoute les descriptions aux tuiles pour la disposition en liste
     * @private
     */
    _addDescriptionsToListTiles() {
        document.querySelectorAll('.app-tile').forEach(tile => {
            // Vérifie si la tuile a déjà un conteneur de contenu
            if (!tile.querySelector('.app-content')) {
                const name = tile.querySelector('.app-name');
                if (name) {
                    // Crée un conteneur de contenu
                    const content = document.createElement('div');
                    content.className = 'app-content';
                    
                    // Déplace le nom dans le conteneur
                    tile.removeChild(name);
                    content.appendChild(name);
                    
                    // Ajoute la description si disponible dans les attributs de la tuile
                    const description = tile.getAttribute('data-description');
                    if (description) {
                        const descElement = document.createElement('div');
                        descElement.className = 'app-description';
                        descElement.textContent = description;
                        content.appendChild(descElement);
                    }
                    
                    // Insère le conteneur après l'icône
                    const icon = tile.querySelector('.app-icon');
                    if (icon) {
                        tile.insertBefore(content, icon.nextSibling);
                    } else {
                        tile.appendChild(content);
                    }
                }
            }
        });
    }
    
    /**
     * Réorganise les tuiles pour la disposition en liste
     * @private
     */
    _reorganizeTilesForListLayout() {
        // Rien à faire ici car la réorganisation est gérée par CSS
        // Cette méthode est un point d'extension pour des ajustements futurs
    }
}