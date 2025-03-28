/**
 * @fileoverview Gestionnaire de glisser-déposer
 * Gère les interactions de drag and drop pour les applications
 */

/**
 * @class DragDropManager
 * Gère la fonctionnalité de glisser-déposer pour réorganiser les applications
 */
class DragDropManager {
    /**
     * Crée une instance du gestionnaire de glisser-déposer
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
        
        // Configuration des événements globaux de drag-and-drop
        this._setupGlobalDragEvents();
        this._setupBackupDragHandlers();
    }
    
    /**
     * Configure les écouteurs d'événements globaux pour le drag-and-drop
     * @private
     */
    _setupGlobalDragEvents() {
        // Écouteur global pour détecter le début d'une opération de glisser-déposer
        document.addEventListener('dragstart', (e) => {
            console.log('Drag started - global handler');
            
            // Ajouter une classe au body pour indiquer qu'un drag est en cours
            document.body.classList.add('dragging-active');
            
            // Si le drag vient des résultats de recherche, garder la recherche visible
            if (e.target.closest('.search-result-item')) {
                const searchResults = document.querySelector('.search-results');
                if (searchResults && searchResults.classList.contains('active')) {
                    searchResults.classList.add('drag-in-progress');
                }
            }
            
            // Identifier toutes les zones cibles potentielles immédiatement
            document.querySelectorAll('.app-grid[data-group-id]').forEach(grid => {
                if (!grid.classList.contains('potential-drop-target')) {
                    grid.classList.add('potential-drop-target');
                }
                
                // Vérifier si l'indicateur de dépôt existe déjà
                if (!grid.querySelector('.drop-indicator')) {
                    const dropIndicator = document.createElement('div');
                    dropIndicator.className = 'drop-indicator';
                    dropIndicator.textContent = 'Déposer ici';
                    grid.appendChild(dropIndicator);
                }
            });
            
            // S'assurer que tous les groupes peuvent être des cibles même s'ils sont vides
            document.querySelectorAll('.favorites-group').forEach(group => {
                group.classList.add('potential-drop-container');
            });
            
            // Identifier clairement les groupes vides
            document.querySelectorAll('.favorites-group-empty').forEach(group => {
                group.classList.add('drag-target-highlight');
            });
        });
        
        // Écouteur global pour la fin d'un drag
        document.addEventListener('dragend', () => {
            this._handleGlobalDragEnd();
        });
        
        // Écouteur pour le dépôt au niveau du document
        document.addEventListener('drop', (e) => {
            // Si un drop a lieu, s'assurer que les résultats de recherche sont nettoyés
            const searchResults = document.querySelector('.search-results');
            if (searchResults) {
                searchResults.classList.remove('drag-in-progress');
                
                // Si le drop a réussi sur une cible valide (hors de la recherche)
                if (!e.target.closest('.search-results')) {
                    // Fermer les résultats
                    searchResults.classList.remove('active');
                }
            }
        });
    }
    
    /**
     * Initialise les écouteurs de secours pour le drag and drop
     * @private
     */
    _setupBackupDragHandlers() {
        // Écouteur de secours au niveau de la fenêtre
        window.addEventListener('blur', () => {
            // Si la fenêtre perd le focus pendant un drag, on nettoie
            if (document.body.classList.contains('dragging-active')) {
                console.log('Window lost focus during drag - cleanup triggered');
                this._handleGlobalDragEnd();
            }
        });
        
        // Écouteur sur Escape pour annuler l'opération de drag
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('dragging-active')) {
                console.log('Escape pressed during drag - cleanup triggered');
                this._handleGlobalDragEnd();
            }
        });
    }
    
    /**
     * Gère la fin d'une opération de drag and drop au niveau global
     * @private
     */
    _handleGlobalDragEnd() {
        console.log('Drag ended - cleaning up');
        
        // Nettoyer la classe spéciale sur les résultats de recherche
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.classList.remove('drag-in-progress');
        }
        
        // Retirer la classe du body
        document.body.classList.remove('dragging-active');
        
        // Nettoyer toutes les classes liées au drag-and-drop
        document.querySelectorAll('.drag-over, .drag-active, .dragging, .drag-target-highlight, .group-drag-over').forEach(element => {
            element.classList.remove('drag-over', 'drag-active', 'dragging', 'drag-target-highlight', 'group-drag-over');
        });
        
        // Réinitialiser complètement les bordures et les styles
        document.querySelectorAll('.potential-drop-target').forEach(target => {
            // Garder la classe pour de futures opérations mais réinitialiser les styles visuels
            target.style.borderColor = '';
            target.style.boxShadow = '';
            target.style.transform = '';
        });
        
        // Réinitialiser également les groupes
        document.querySelectorAll('.favorites-group').forEach(group => {
            group.classList.remove('group-drag-over');
        });
        
        // Réinitialiser tous les éléments dépliés temporairement pendant le drag
        document.querySelectorAll('[data-was-collapsed="true"]').forEach(element => {
            element.classList.add('collapsed');
            element.removeAttribute('data-was-collapsed');
            
            const toggleButton = element.querySelector('.section-toggle');
            if (toggleButton) {
                toggleButton.classList.add('collapsed');
                toggleButton.setAttribute('aria-label', 'Déployer la section');
                toggleButton.setAttribute('title', 'Déployer la section');
            }
        });
    }
    
    /**
     * Configure le déploiement au survol pour le drag and drop
     */
    setupHoverExpandForDrag() {
        // Configurer les écouteurs pour la section des favoris
        const favoritesSection = document.getElementById('favorites-section');
        if (favoritesSection) {
            favoritesSection.addEventListener('dragenter', (e) => {
                this._handleDragHover(e, favoritesSection, 'favorites');
            });
            
            favoritesSection.addEventListener('dragleave', (e) => {
                this._handleDragLeave(e, favoritesSection, 'favorites');
            });
        }

        // Configurer les écouteurs pour les groupes de favoris
        document.querySelectorAll('.favorites-group').forEach(group => {
            const groupId = group.getAttribute('data-group-id');
            if (!groupId) return;
            
            group.addEventListener('dragenter', (e) => {
                this._handleDragHover(e, group, groupId, true);
            });
            
            group.addEventListener('dragleave', (e) => {
                this._handleDragLeave(e, group, groupId, true);
            });
        });

        // Configurer les écouteurs pour les sections classiques
        document.querySelectorAll('.category-section:not(.favorites-section)').forEach(section => {
            const sectionId = section.id;
            if (!sectionId) return;
            
            const categoryId = sectionId.replace('category-', '');
            
            section.addEventListener('dragenter', (e) => {
                this._handleDragHover(e, section, categoryId);
            });
            
            section.addEventListener('dragleave', (e) => {
                this._handleDragLeave(e, section, categoryId);
            });
        });

        // S'assurer que tous les groupes de favoris sont des cibles potentielles
        document.querySelectorAll('.app-grid[data-group-id]').forEach(grid => {
            if (!grid.classList.contains('potential-drop-target')) {
                grid.classList.add('potential-drop-target');
            }
        });
    }
    
    /**
     * Gère le survol d'une section repliée pendant le drag
     * @param {Event} event - Événement dragenter
     * @param {HTMLElement} element - Élément survolé
     * @param {string} sectionId - ID de la section
     * @param {boolean} [isGroup=false] - Indique si c'est un groupe
     * @private
     */
    _handleDragHover(event, element, sectionId, isGroup = false) {
        // Ne rien faire si on n'est pas en train de glisser
        if (!document.body.classList.contains('dragging-active')) return;
        
        // Si la section est déjà dépliée, ne rien faire
        if (!element.classList.contains('collapsed')) return;
        
        // Récupération de l'élément en train d'être glissé
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement) return;
        
        console.log(`Survol détecté sur section repliée: ${sectionId}`);
        
        // Déplier temporairement la section
        element.classList.remove('collapsed');
        
        // Stocker l'état initial pour pouvoir le restaurer si nécessaire
        element.setAttribute('data-was-collapsed', 'true');
        
        // Pour les groupes, gérer le bouton de réduction/expansion
        if (isGroup) {
            const toggleButton = element.querySelector('.section-toggle');
            if (toggleButton) {
                toggleButton.classList.remove('collapsed');
                toggleButton.setAttribute('aria-label', isGroup ? 'Réduire le groupe' : 'Réduire la section');
                toggleButton.setAttribute('title', isGroup ? 'Réduire le groupe' : 'Réduire la section');
            }
        }
        
        console.log(`Section dépliée temporairement: ${sectionId}`);
    }
    
    /**
     * Gère la sortie d'une section après survol pendant le drag
     * @param {Event} event - Événement dragleave
     * @param {HTMLElement} element - Élément quitté
     * @param {string} sectionId - ID de la section
     * @param {boolean} [isGroup=false] - Indique si c'est un groupe
     * @private
     */
    _handleDragLeave(event, element, sectionId, isGroup = false) {
        // Ne rien faire si on n'est pas en train de glisser
        if (!document.body.classList.contains('dragging-active')) return;
        
        // Vérifier si l'élément était initialement replié
        if (element.getAttribute('data-was-collapsed') === 'true') {
            // Vérifier si on quitte réellement l'élément ou juste un enfant
            const related = event.relatedTarget;
            if (related && element.contains(related)) {
                return; // On reste dans l'élément, ne rien faire
            }
            
            console.log(`Sortie détectée de la section: ${sectionId}`);
            
            // Replier la section
            element.classList.add('collapsed');
            element.removeAttribute('data-was-collapsed');
            
            // Pour les groupes, gérer le bouton de réduction/expansion
            if (isGroup) {
                const toggleButton = element.querySelector('.section-toggle');
                if (toggleButton) {
                    toggleButton.classList.add('collapsed');
                    toggleButton.setAttribute('aria-label', isGroup ? 'Déployer le groupe' : 'Déployer la section');
                    toggleButton.setAttribute('title', isGroup ? 'Déployer le groupe' : 'Déployer la section');
                }
            }
            
            console.log(`Section repliée: ${sectionId}`);
        }
    }
    
    /**
     * Configure le glisser-déposer pour une tuile d'application
     * @param {HTMLElement} tileLink - Élément tuile d'application
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     * @param {boolean} isFavoriteSection - Indique si l'app est dans la section favoris
     * @param {string} currentGroupId - ID du groupe actuel
     */
    setupTileDragEvents(tileLink, appId, categoryId, isFavoriteSection, currentGroupId) {
        tileLink.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('application/app-id', appId);
            e.dataTransfer.setData('application/category-id', categoryId || '');
            
            // Si dans la section favoris, ajoutons l'information du groupe
            if (isFavoriteSection) {
                e.dataTransfer.setData('application/is-favorite', 'true');
                e.dataTransfer.setData('application/group-id', currentGroupId);
            } else {
                e.dataTransfer.setData('application/is-favorite', 'false');
            }
            
            // Ajouter la classe dragging à la tuile en cours de déplacement
            tileLink.classList.add('dragging');
        });
        
        tileLink.addEventListener('dragend', () => {
            // Retirer la classe dragging
            tileLink.classList.remove('dragging');
            
            // Retirer l'effet visuel de tous les conteneurs
            document.querySelectorAll('.app-grid[data-group-id]').forEach(grid => {
                grid.classList.remove('drag-active');
                grid.classList.remove('drag-over');
            });
            
            // Retirer la mise en évidence des groupes
            document.querySelectorAll('.favorites-group').forEach(group => {
                group.classList.remove('drag-target-highlight');
                group.classList.remove('group-drag-over');
            });
            
            document.querySelectorAll('.favorites-group-empty').forEach(group => {
                group.classList.remove('drag-target-empty-highlight');
            });
        });
    }
    
    /**
     * Configure le glisser-déposer pour un groupe de favoris
     * @param {HTMLElement} container - Conteneur des tuiles
     * @param {string} groupId - ID du groupe
     */
    setupDragAndDrop(container, groupId) {
        // Stocker l'ID du groupe cible dans une variable locale
        const targetGroupId = groupId;

        // Ajouter la classe de base qui indique une zone cible potentielle
        container.classList.add('potential-drop-target');

        // Ajouter un indicateur de dépôt
        const dropIndicator = document.createElement('div');
        dropIndicator.className = 'drop-indicator';
        dropIndicator.textContent = 'Déposer ici';
        container.appendChild(dropIndicator);

        // Active la possibilité de déposer des éléments dans ce conteneur
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            // Ajoute un effet visuel pour indiquer la zone de dépôt
            container.classList.add('drag-over');
            
            // Ajoute aussi une classe au groupe parent pour une meilleure visibilité
            const groupElement = container.closest('.favorites-group');
            if (groupElement) {
                groupElement.classList.add('group-drag-over');
            }
        });
        
        // Gère la sortie de la zone de dépôt
        container.addEventListener('dragleave', (e) => {
            // Vérifier si on quitte réellement le conteneur ou juste un élément à l'intérieur
            if (!container.contains(e.relatedTarget)) {
                container.classList.remove('drag-over');
                
                // Retirer la classe du groupe parent également
                const groupElement = container.closest('.favorites-group');
                if (groupElement) {
                    groupElement.classList.remove('group-drag-over');
                }
            }
        });
        
        // Gère le dépôt d'un élément
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Empêcher la propagation
            console.log('Item dropped in container');
            container.classList.remove('drag-over');
            
            // Retirer la classe du groupe parent également
            const groupElement = container.closest('.favorites-group');
            if (groupElement) {
                groupElement.classList.remove('group-drag-over');
            }

            // Forcer un nettoyage global
            setTimeout(() => {
                this._handleGlobalDragEnd();
            }, 50);
            
            // Récupère les données de l'élément déplacé
            const appId = e.dataTransfer.getData('application/app-id');
            const categoryId = e.dataTransfer.getData('application/category-id');
            const isFavorite = e.dataTransfer.getData('application/is-favorite') === 'true';
            const sourceGroupId = e.dataTransfer.getData('application/group-id');

            // Vérifier si l'application est déjà dans le groupe cible
            // Si c'est le cas et qu'on fait un drag & drop depuis une section non-favoris, ne rien faire
            if (!isFavorite && this._uiCore.favoritesCheckCallback) {
                try {
                    const appAlreadyInGroup = window.appController && 
                                            window.appController.favoritesModel && 
                                            window.appController.favoritesModel.isInFavoriteGroup(appId, targetGroupId);
                    
                    if (appAlreadyInGroup) {
                        console.log(`L'application ${appId} est déjà dans le groupe ${targetGroupId}, aucune action nécessaire.`);
                        return; // On sort de la fonction sans rien faire
                    }
                } catch (error) {
                    console.warn("Impossible de vérifier si l'application est déjà dans le groupe", error);
                    // En cas d'erreur, on continue avec le comportement standard
                }
            }

            // Si l'app n'est pas encore un favori (vient d'une section normale)
            if (!isFavorite) {
                // Utiliser directement favoritesCallback
                if (this._uiCore.favoritesCallback) {
                    // Passer explicitement le groupId comme troisième paramètre
                    this._uiCore.favoritesCallback(appId, categoryId, targetGroupId);
                }
            }
            // Si l'app est déjà un favori (déplacement entre groupes)
            else if (sourceGroupId !== targetGroupId) {
                // Passer le groupe source comme paramètre additionnel pour le déplacement
                if (this._uiCore.groupManagementCallback) {
                    this._uiCore.groupManagementCallback('moveToGroup', appId, targetGroupId, sourceGroupId);
                }
            }
            // Si c'est une réorganisation au sein du même groupe
            else {
                // Récupérer l'ordre actuel des applications
                const appTiles = Array.from(container.querySelectorAll('.app-tile'));
                const appIds = appTiles.map(tile => tile.getAttribute('data-app-id'));
                
                // Mettre à jour l'ordre
                if (appIds.length > 0 && this._uiCore.reorderCallback) {
                    this._uiCore.reorderCallback(targetGroupId, appIds);
                }
            }

            // Ajouter après le traitement du drop dans l'écouteur
            this._applyDropAnimation(container);
        });
    }
    
    /**
     * Applique une animation de rebond lorsqu'un élément est déposé
     * @param {HTMLElement} targetElement - Élément dans lequel l'élément a été déposé
     * @private
     */
    _applyDropAnimation(targetElement) {
        if (!targetElement) return;
        
        // Appliquer la classe d'animation
        targetElement.classList.add('drop-animation');
        
        // Retirer la classe après la fin de l'animation
        setTimeout(() => {
            targetElement.classList.remove('drop-animation');
        }, 300); // La durée de l'animation est de 300ms
    }
    
    /**
     * S'assure qu'un élément a un indicateur de dépôt
     * @param {HTMLElement} element - L'élément auquel ajouter un indicateur
     * @private
     */
    _ensureDropIndicator(element) {
        // Vérifier si l'élément a déjà un indicateur
        if (!element.querySelector('.drop-indicator')) {
            const dropIndicator = document.createElement('div');
            dropIndicator.className = 'drop-indicator temp-drop-indicator';
            dropIndicator.textContent = 'Déposer ici';
            element.appendChild(dropIndicator);
        }
    }
    
    /**
     * Retire la mise en évidence de toutes les zones de dépôt
     * @private
     */
    _removeAllDropTargetsHighlight() {
        // Retirer toutes les classes liées au drag-and-drop
        const classesToRemove = [
            'potential-drop-container', 
            'potential-drop-target',
            'drag-over', 
            'drag-active', 
            'dragging',
            'drag-target-highlight',
            'drag-target-empty-highlight',
            'group-drag-over'
        ];
        
        classesToRemove.forEach(className => {
            document.querySelectorAll(`.${className}`).forEach(element => {
                element.classList.remove(className);
            });
        });
        
        // Réinitialiser les styles directs qui ont pu être appliqués
        document.querySelectorAll('.favorites-empty-message').forEach(message => {
            message.style.borderStyle = '';
            message.style.borderWidth = '';
        });
        
        // Supprimer les indicateurs de dépôt temporaires
        document.querySelectorAll('.temp-drop-indicator').forEach(indicator => {
            indicator.remove();
        });
    }
}