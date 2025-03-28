/**
 * @fileoverview Gestionnaire des sections réductibles
 * Gère la réduction et l'expansion des sections de catégories
 */

/**
 * @class SectionCollapseManager
 * Gère les fonctionnalités de réduction/expansion des sections
 */
class SectionCollapseManager {
    /**
     * Crée une instance du gestionnaire de sections réductibles
     * @param {UICore} uiCore - Instance du gestionnaire d'interface central
     * @constructor
     */
    constructor(uiCore) {
        /**
         * Référence au gestionnaire d'interface central
         * @type {UICore}
         * @private
         */
        this._uiCore = uiCore;
        
        /**
         * État des sections réduites
         * @type {Object}
         * @private
         */
        this._collapsedSections = {};
    }
    
    /**
     * Charge l'état des sections réduites depuis localStorage
     */
    loadCollapsedSections() {
        try {
            const savedState = StorageService.getPreference('collapsedSections', null);
            if (savedState !== null) {
                this._collapsedSections = savedState;
                console.log('État des sections réduites chargé');
            }
        } catch (e) {
            console.error('Erreur lors du chargement de l\'état des sections réduites:', e);
            this._collapsedSections = {};
        }
    }
    
    /**
     * Sauvegarde l'état des sections réduites dans localStorage
     * @returns {boolean} true si la sauvegarde a réussi
     * @private
     */
    _saveCollapsedSections() {
        try {
            StorageService.updatePreference('collapsedSections', this._collapsedSections);
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde de l\'état des sections réduites:', e);
            return false;
        }
    }
    
    /**
     * Bascule l'état réduit d'une section
     * @param {string} categoryId - ID de la catégorie
     * @param {HTMLElement} sectionElement - Élément DOM de la section
     */
    toggleSectionCollapse(categoryId, sectionElement) {
        // Inverse l'état actuel
        const isCollapsed = !this._collapsedSections[categoryId];
        this._collapsedSections[categoryId] = isCollapsed;
        
        // Met à jour l'apparence
        if (isCollapsed) {
            sectionElement.classList.add('collapsed');
        } else {
            sectionElement.classList.remove('collapsed');
        }
        
        // Met à jour le bouton
        const toggleButton = sectionElement.querySelector('.section-toggle');
        if (toggleButton) {
            if (isCollapsed) {
                toggleButton.classList.add('collapsed');
                toggleButton.setAttribute('aria-label', 'Déployer la section');
                toggleButton.setAttribute('title', 'Déployer la section');
            } else {
                toggleButton.classList.remove('collapsed');
                toggleButton.setAttribute('aria-label', 'Réduire la section');
                toggleButton.setAttribute('title', 'Réduire la section');
            }
        }
        
        // Sauvegarde l'état
        this._saveCollapsedSections();
    }
    
    /**
     * Bascule l'état réduit d'un groupe de favoris
     * @param {string} groupKey - Clé du groupe dans _collapsedSections
     * @param {HTMLElement} groupElement - Élément DOM du groupe
     */
    toggleGroupCollapse(groupKey, groupElement) {
        // Inverse l'état actuel
        const isCollapsed = !this._collapsedSections[groupKey];
        this._collapsedSections[groupKey] = isCollapsed;
        
        // Met à jour l'apparence
        if (isCollapsed) {
            groupElement.classList.add('collapsed');
        } else {
            groupElement.classList.remove('collapsed');
        }
        
        // Met à jour le bouton
        const toggleButton = groupElement.querySelector('.section-toggle');
        if (toggleButton) {
            if (isCollapsed) {
                toggleButton.classList.add('collapsed');
                toggleButton.setAttribute('aria-label', 'Déployer le groupe');
                toggleButton.setAttribute('title', 'Déployer le groupe');
            } else {
                toggleButton.classList.remove('collapsed');
                toggleButton.setAttribute('aria-label', 'Réduire le groupe');
                toggleButton.setAttribute('title', 'Réduire le groupe');
            }
        }
        
        // Sauvegarde l'état
        this._saveCollapsedSections();
    }
    
    /**
     * Bascule l'état de tous les groupes favoris
     * @param {boolean} collapse - true pour replier, false pour déplier
     */
    toggleAllFavoriteGroups(collapse) {
        // Récupère tous les éléments de groupe
        const groupElements = document.querySelectorAll('.favorites-group');
        
        groupElements.forEach(groupElement => {
            const groupId = groupElement.getAttribute('data-group-id');
            if (!groupId) return;
            
            const groupKey = `group_${groupId}_collapsed`;
            
            // Met à jour l'état interne
            this._collapsedSections[groupKey] = collapse;
            
            // Met à jour l'apparence
            if (collapse) {
                groupElement.classList.add('collapsed');
            } else {
                groupElement.classList.remove('collapsed');
            }
            
            // Met à jour le bouton du groupe
            const toggleButton = groupElement.querySelector('.section-toggle');
            if (toggleButton) {
                if (collapse) {
                    toggleButton.classList.add('collapsed');
                    toggleButton.setAttribute('aria-label', 'Déployer le groupe');
                    toggleButton.setAttribute('title', 'Déployer le groupe');
                } else {
                    toggleButton.classList.remove('collapsed');
                    toggleButton.setAttribute('aria-label', 'Réduire le groupe');
                    toggleButton.setAttribute('title', 'Réduire le groupe');
                }
            }
        });
        
        // Sauvegarde l'état
        this._saveCollapsedSections();
        
        // Met à jour le bouton global des favoris
        this._updateFavoritesToggleButton();
    }
    
    /**
     * Met à jour l'état du bouton global des favoris
     * @private
     */
    _updateFavoritesToggleButton() {
        const toggleButton = document.querySelector('.favorites-toggle-button');
        if (!toggleButton) return;
        
        const areGroupsCollapsed = this._getGroupsCollapseState();
        
        if (areGroupsCollapsed) {
            toggleButton.innerHTML = '<i class="fas fa-expand-alt"></i> Déployer groupes';
            toggleButton.setAttribute('title', 'Déployer tous les groupes');
        } else {
            toggleButton.innerHTML = '<i class="fas fa-compress-alt"></i> Réduire groupes';
            toggleButton.setAttribute('title', 'Réduire tous les groupes');
        }
    }
    
    /**
     * Vérifie l'état global de collapse des groupes favoris
     * @returns {boolean} true si la majorité des groupes sont repliés
     * @private
     */
    _getGroupsCollapseState() {
        const groupKeys = Object.keys(this._collapsedSections).filter(key => 
            key.startsWith('group_') && key.endsWith('_collapsed')
        );
        
        if (groupKeys.length === 0) return false;
        
        // Compte combien de groupes sont repliés
        const collapsedCount = groupKeys.filter(key => this._collapsedSections[key]).length;
        
        // Si plus de la moitié sont repliés, considérer l'état global comme replié
        return collapsedCount >= groupKeys.length / 2;
    }
    
    /**
     * Bascule l'état réduit de toutes les sections
     * @param {boolean} collapse - true pour réduire, false pour déployer
     */
    toggleAllSections(collapse) {
        // Récupère toutes les sections de catégorie (sauf favoris)
        const sections = document.querySelectorAll('.category-section:not(#favorites-section)');
        
        // Si pas de sections visibles, on ne fait rien
        if (sections.length === 0) return;
        
        sections.forEach(section => {
            const categoryId = section.id.replace('category-', '');
            
            // Met à jour l'état interne
            this._collapsedSections[categoryId] = collapse;
            
            // Met à jour l'apparence
            if (collapse) {
                section.classList.add('collapsed');
            } else {
                section.classList.remove('collapsed');
            }
        });
        
        // Sauvegarde l'état
        this._saveCollapsedSections();
        
        // Met à jour le bouton global
        this.updateGlobalToggleButton();
    }
    
    /**
     * Met à jour l'état du bouton global de réduction/expansion
     */
    updateGlobalToggleButton() {
        const globalToggleButton = document.getElementById('globalToggleButton');
        if (!globalToggleButton) return;
        
        // Détermine s'il y a au moins une section non réduite
        const sections = document.querySelectorAll('.category-section:not(#favorites-section)');
        
        // Si pas de sections visibles, on ne fait rien
        if (sections.length === 0) return;
        
        const hasExpandedSections = Array.from(sections).some(section => !section.classList.contains('collapsed'));
        
        // Mise à jour du bouton en fonction de l'état actuel
        if (hasExpandedSections) {
            // S'il y a au moins une section déployée, le bouton sert à tout réduire
            globalToggleButton.innerHTML = '<i class="fas fa-compress-alt"></i> Tout réduire';
            globalToggleButton.setAttribute('data-action', 'collapse');
            globalToggleButton.setAttribute('aria-label', 'Tout réduire');
            // Ajout du title descriptif
            globalToggleButton.setAttribute('title', 'Tout réduire - Masquer le contenu de toutes les sections');
        } else {
            // Si toutes les sections sont réduites, le bouton sert à tout déployer
            globalToggleButton.innerHTML = '<i class="fas fa-expand-alt"></i> Tout déployer';
            globalToggleButton.setAttribute('data-action', 'expand');
            globalToggleButton.setAttribute('aria-label', 'Tout déployer');
            // Ajout du title descriptif
            globalToggleButton.setAttribute('title', 'Tout déployer - Afficher le contenu de toutes les sections');
        }
    }
    
    /**
     * Met à jour la visibilité du bouton global de réduction/expansion
     * @param {Array} visibleCategories - Liste des catégories visibles
     */
    updateGlobalToggleVisibility(visibleCategories) {
        const globalToggleContainer = document.querySelector('.global-toggle-container');
        if (!globalToggleContainer) return;
        
        // Vérifie s'il y a des sections non-favoris visibles
        const hasVisibleNonFavoriteCategories = visibleCategories.some(category => 
            category.id !== 'favorites'
        );
        
        // Affiche ou masque le bouton global en fonction
        if (hasVisibleNonFavoriteCategories) {
            globalToggleContainer.style.display = '';
        } else {
            globalToggleContainer.style.display = 'none';
        }
    }
    
    /**
     * Crée le bouton global de réduction/expansion
     * @returns {HTMLElement} Conteneur du bouton
     */
    createGlobalToggleButton() {
        const container = document.createElement('div');
        container.className = 'global-toggle-container';
        
        const button = document.createElement('button');
        button.className = 'global-toggle-button';
        button.id = 'globalToggleButton';
        button.setAttribute('data-action', 'collapse');
        button.setAttribute('aria-label', 'Tout réduire');
        button.setAttribute('title', 'Tout réduire - Masquer le contenu de toutes les sections');
        button.innerHTML = '<i class="fas fa-compress-alt"></i> Tout réduire';
        
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            this.toggleAllSections(action === 'collapse');
        });
        
        container.appendChild(button);
        return container;
    }
    
    /**
     * S'assure qu'une section de catégorie est dépliée
     * @param {string} categoryId - ID de la catégorie
     * @returns {boolean} true si une modification a été effectuée
     */
    ensureSectionExpanded(categoryId) {
        // Vérifie si la section est repliée
        if (this._collapsedSections[categoryId]) {
            // Récupère l'élément de section correspondant
            const sectionElement = document.getElementById(`category-${categoryId}`);
            if (sectionElement) {
                // Déplie la section
                this.toggleSectionCollapse(categoryId, sectionElement);
                return true;
            }
        }
        return false;
    }
}