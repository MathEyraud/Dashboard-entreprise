/**
 * @fileoverview Gestionnaire d'interface utilisateur
 * Gère l'affichage et les interactions avec l'interface
 */

/**
 * @class UIManager
 * Gère l'interface utilisateur
 */
class UIManager {
    /**
     * Crée une instance du gestionnaire d'interface
     * @constructor
     */
    constructor() {
        // Éléments du DOM
        this.categoriesContainerElement = document.getElementById('categoriesContainer');
        this.favoritesCallback = null;
        this.reorderCallback = null;
        this.groupManagementCallback = null;
        
        // État des sections réduites
        this._collapsedSections = {};

        // Configuration des événements globaux de drag-and-drop
        this._setupGlobalDragEvents();
        this._setupBackupDragHandlers();
        
        // Vérifie que tous les éléments nécessaires sont présents
        this._checkElements();
    }
    
    /**
     * Vérifie que les éléments DOM nécessaires sont présents
     * @private
     */
    _checkElements() {
        const elements = [
            { element: this.categoriesContainerElement, name: 'categoriesContainer' },
        ];
        
        for (const { element, name } of elements) {
            if (!element) {
                console.error(`Élément '${name}' non trouvé dans le DOM`);
            }
        }
    }
    
    /**
     * Configure les écouteurs d'événements
     * @param {Function} categoryChangeCallback - Fonction à appeler lors du changement de catégorie
     * @param {Function} favoritesCheckCallback - Fonction pour vérifier si une app est en favoris
     */
    setupEventListeners(categoryChangeCallback, favoritesCheckCallback) {
        // L'écouteur sera configuré lors de la création du menu de navigation
        this.categoryChangeCallback = categoryChangeCallback;
        this.favoritesCheckCallback = favoritesCheckCallback;
    }
    
    /**
     * Génère le menu de navigation des catégories
     * @param {Array} categories - Liste des catégories ordonnées
     * @param {string} currentCategoryId - ID de la catégorie actuellement sélectionnée
     */
    updateCategoryNav(categories, currentCategoryId) {
        if (!this.categoryNavElement) return;
        
        // Vide le menu
        this.categoryNavElement.innerHTML = '';
        
        // Ajoute un élément de navigation pour chaque catégorie
        for (const category of categories) {
            const navItem = document.createElement('div');
            navItem.className = 'category-nav-item';
            if (category.id === currentCategoryId) {
                navItem.classList.add('active');
            }
            navItem.textContent = category.name;
            
            // Ajoute un écouteur d'événement
            navItem.addEventListener('click', () => {
                if (this.categoryChangeCallback) {
                    this.categoryChangeCallback(category.id);
                }
            });
            
            this.categoryNavElement.appendChild(navItem);
        }
    }
    
    /**
     * Met à jour la section des favoris avec prise en charge des groupes
     * @param {Object} favoritesData - Données des favoris (groupées par groupe)
     * @param {Function} favoriteCallback - Fonction à appeler pour basculer les favoris
     * @param {Function} reorderCallback - Fonction à appeler pour réorganiser les favoris
     * @param {Function} groupManagementCallback - Fonction à appeler pour gérer les groupes
     * @param {Function} favoritesCheckCallback - Fonction pour vérifier si une app est en favoris
     * @param {Function} [addToFavoritesCallback=null] - Fonction pour ajouter directement aux favoris (optionnel)
     */
    updateFavorites(favoritesData, favoriteCallback, reorderCallback, groupManagementCallback, favoritesCheckCallback, addToFavoritesCallback = null) {
        this.favoritesCallback = favoriteCallback;
        this.reorderCallback = reorderCallback;
        this.groupManagementCallback = groupManagementCallback;
        this.addToFavoritesCallback = addToFavoritesCallback;
        
        // Stocker le callback de vérification
        if (favoritesCheckCallback) this.favoritesCheckCallback = favoritesCheckCallback;

        // Reste de la méthode inchangé...
        const { favoriteAppsGrouped, groups } = favoritesData;
        
        // Toujours afficher la section Favoris si des groupes existent
        const shouldDisplayFavoritesSection = groups && groups.length > 0;
        
        let favoritesSection = document.getElementById('favorites-section');
        
        if (!favoritesSection && shouldDisplayFavoritesSection) {
            favoritesSection = this._createFavoritesSection(favoriteAppsGrouped, groups);
            
            if (this.categoriesContainerElement.firstChild) {
                this.categoriesContainerElement.insertBefore(
                    favoritesSection, 
                    this.categoriesContainerElement.firstChild
                );
            } else {
                this.categoriesContainerElement.appendChild(favoritesSection);
            }
        } 
        else if (favoritesSection) {
            if (!shouldDisplayFavoritesSection) {
                favoritesSection.remove();
            } else {
                this._updateFavoritesSectionContent(
                    favoritesSection, 
                    favoriteAppsGrouped, 
                    groups
                );
            }
        }

        // Configurer le déploiement au survol pour les sections repliées
        this._setupHoverExpandForDrag();
    }

    /**
     * Ajoute directement une application aux favoris dans un groupe spécifique
     * Méthode dédiée pour le glisser-déposer depuis les sections normales
     * @param {string} appId - ID de l'application
     * @param {string} categoryId - ID de la catégorie
     * @param {string} groupId - ID du groupe cible
     */
    addToFavorites(appId, categoryId, groupId) {
        // Sauvegarde la position de défilement actuelle
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Si l'application est déjà en favoris, d'abord la retirer 
        // (pour éviter les doublons si on la déplace dans un autre groupe)
        if (this.favoritesModel.isFavorite(appId)) {
            this.favoritesModel.removeFavorite(appId);
        }
        
        // Ajouter directement l'application au groupe spécifié
        this.favoritesModel.addFavorite(appId, categoryId, groupId);
        
        // Met à jour l'interface en préservant le défilement
        this.updateDisplay(true, true);
        
        // Reconstruire l'index de recherche
        this.searchModelService.rebuildIndex();
        
        // Restaure la position de défilement
        setTimeout(() => {
            window.scrollTo({
                top: scrollPosition,
                behavior: 'auto'
            });
        }, 0);
    }

    /**
     * Crée la section des favoris avec support des groupes
     * @param {Object} favoriteAppsGrouped - Applications favorites groupées
     * @param {Array} groups - Liste des groupes de favoris
     * @returns {HTMLElement} La section créée
     * @private
     */
    _createFavoritesSection(favoriteAppsGrouped, groups) {
        const section = document.createElement('section');
        section.className = 'category-section favorites-section';
        section.id = 'favorites-section';
        
        // En-tête de la section
        const header = document.createElement('div');
        header.className = 'category-header';
        
        // Partie gauche de l'en-tête (titre)
        const headerLeft = document.createElement('div');
        headerLeft.className = 'category-header-left';
        
        // Titre
        const title = document.createElement('h2');
        title.className = 'category-title';
        title.innerHTML = '<i class="fas fa-star"></i> Favoris';
        headerLeft.appendChild(title);
        
        // Partie droite de l'en-tête (actions)
        const headerRight = document.createElement('div');
        headerRight.className = 'category-header-right';
        
        // Bouton de réduction/expansion de tous les groupes favoris
        const toggleButton = document.createElement('button');
        toggleButton.className = 'favorites-toggle-button';
        toggleButton.innerHTML = this._getGroupsCollapseState() ? 
            '<i class="fas fa-expand-alt"></i> Déployer groupes' : 
            '<i class="fas fa-compress-alt"></i> Réduire groupes';
        toggleButton.setAttribute('title', this._getGroupsCollapseState() ? 'Déployer tous les groupes' : 'Réduire tous les groupes');
        
        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            const collapseAll = !this._getGroupsCollapseState();
            this.toggleAllFavoriteGroups(collapseAll);
        });
        
        headerRight.appendChild(toggleButton);
        
        // Bouton d'ajout de groupe
        const addGroupBtn = document.createElement('button');
        addGroupBtn.className = 'favorites-add-group-btn';
        addGroupBtn.innerHTML = '<i class="fas fa-folder-plus"></i> Nouveau groupe';
        addGroupBtn.setAttribute('title', 'Ajouter un nouveau groupe de favoris');
        addGroupBtn.addEventListener('click', () => {
            if (this.groupManagementCallback) {
                this.groupManagementCallback('add');
            }
        });
        headerRight.appendChild(addGroupBtn);
        
        header.appendChild(headerLeft);
        header.appendChild(headerRight);
        section.appendChild(header);
        
        // Description
        const description = document.createElement('p');
        description.className = 'category-description';
        description.textContent = 'Vos applications favorites pour un accès rapide. Glissez-déposez pour réorganiser.';
        section.appendChild(description);
        
        // Conteneur des groupes
        const groupsContainer = document.createElement('div');
        groupsContainer.className = 'favorites-groups-container';
        section.appendChild(groupsContainer);
        
        // Ajoute chaque groupe de favoris
        this._populateFavoritesGroups(groupsContainer, favoriteAppsGrouped, groups);
        
        return section;
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
     * Met à jour le contenu de la section des favoris
     * @param {HTMLElement} favoritesSection - Section des favoris
     * @param {Object} favoriteAppsGrouped - Applications favorites groupées
     * @param {Array} groups - Liste des groupes de favoris
     * @private
     */
    _updateFavoritesSectionContent(favoritesSection, favoriteAppsGrouped, groups) {
        // Trouve ou crée le conteneur des groupes
        let groupsContainer = favoritesSection.querySelector('.favorites-groups-container');
        if (!groupsContainer) {
            groupsContainer = document.createElement('div');
            groupsContainer.className = 'favorites-groups-container';
            favoritesSection.appendChild(groupsContainer);
        }
        
        // Vide le conteneur
        groupsContainer.innerHTML = '';
        
        // Remplit avec les groupes mis à jour
        this._populateFavoritesGroups(groupsContainer, favoriteAppsGrouped, groups);
    }
    
    /**
     * Remplit le conteneur des groupes de favoris
     * Version améliorée pour afficher les groupes vides
     * @param {HTMLElement} groupsContainer - Conteneur des groupes
     * @param {Object} favoriteAppsGrouped - Applications favorites groupées
     * @param {Array} groups - Liste des groupes de favoris
     * @private
     */
    _populateFavoritesGroups(groupsContainer, favoriteAppsGrouped, groups) {
        // Parcourt chaque groupe
        groups.forEach(group => {
            const groupData = favoriteAppsGrouped[group.id];
            const hasApps = groupData && groupData.apps.length > 0;
            
            // Crée l'élément de groupe
            const groupElement = this._createFavoriteGroup(
                group, 
                hasApps ? groupData.apps : [],
                !hasApps // Passe un indicateur pour les groupes vides
            );
            
            groupsContainer.appendChild(groupElement);
        });
    }
    
    /**
     * Crée un élément de groupe de favoris
     * Version améliorée pour gérer les groupes vides et les réductions/expansions
     * @param {Object} group - Données du groupe
     * @param {Array} apps - Applications du groupe
     * @param {boolean} [isEmpty=false] - Indique si le groupe est vide
     * @returns {HTMLElement} Élément du groupe
     * @private
     */
    _createFavoriteGroup(group, apps, isEmpty = false) {
        const groupElement = document.createElement('div');
        groupElement.className = 'favorites-group';
        if (isEmpty) {
            groupElement.classList.add('favorites-group-empty');
        }
        groupElement.setAttribute('data-group-id', group.id);
        
        // Vérifie si le groupe doit être réduit
        const groupCollapseKey = `group_${group.id}_collapsed`;
        const isGroupCollapsed = this._collapsedSections[groupCollapseKey];
        if (isGroupCollapsed) {
            groupElement.classList.add('collapsed');
        }
        
        // En-tête du groupe
        const groupHeader = document.createElement('div');
        groupHeader.className = 'favorites-group-header';
        
        // Icône et nom du groupe
        const groupTitle = document.createElement('div');
        groupTitle.className = 'favorites-group-title';
        groupTitle.innerHTML = `<i class="fas fa-${group.icon}" style="color: ${group.color}"></i> ${group.name}`;
        
        // Boutons d'action du groupe
        const groupActions = document.createElement('div');
        groupActions.className = 'favorites-group-actions';
        
        // Bouton de réduction/expansion pour tous les groupes
        const toggleButton = document.createElement('button');
        toggleButton.className = 'section-toggle';
        toggleButton.setAttribute('aria-label', isGroupCollapsed ? 'Déployer le groupe' : 'Réduire le groupe');
        toggleButton.setAttribute('title', isGroupCollapsed ? 'Déployer le groupe' : 'Réduire le groupe');
        toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
        
        if (isGroupCollapsed) {
            toggleButton.classList.add('collapsed');
        }
        
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Éviter la propagation au groupe
            this.toggleGroupCollapse(groupCollapseKey, groupElement);
        });
        
        groupActions.appendChild(toggleButton);
        
        // Ajouter les autres boutons d'action (sauf pour le groupe général)
        if (group.id !== 'general') {
            // Bouton d'édition du groupe
            const editBtn = document.createElement('button');
            editBtn.className = 'favorites-group-edit';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.setAttribute('title', 'Modifier ce groupe');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.groupManagementCallback) {
                    this.groupManagementCallback('edit', group.id);
                }
            });
            groupActions.appendChild(editBtn);
            
            // Bouton de suppression du groupe
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'favorites-group-delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.setAttribute('title', 'Supprimer ce groupe');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.groupManagementCallback) {
                    this.groupManagementCallback('delete', group.id);
                }
            });
            groupActions.appendChild(deleteBtn);
        }
        
        groupHeader.appendChild(groupTitle);
        groupHeader.appendChild(groupActions);
        groupElement.appendChild(groupHeader);
        
        // Grille d'applications du groupe
        const appGrid = document.createElement('div');
        appGrid.className = 'app-grid';
        appGrid.setAttribute('data-group-id', group.id);
        
        // Si le groupe est vide, afficher un message d'aide
        if (isEmpty) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'favorites-empty-message';
            emptyMessage.innerHTML = `
                <i class="fas fa-arrow-down"></i>
                <p>Glissez vos applications favorites ici</p>
            `;
            appGrid.appendChild(emptyMessage);
        } else {
            // Ajoute chaque application au groupe
            apps.forEach(app => {
                const appTile = this._createAppTile(app, true, app.categoryId);
                appGrid.appendChild(appTile);
            });
        }
        
        groupElement.appendChild(appGrid);
        
        // Configure le glisser-déposer pour cette grille de groupe
        this._setupDragAndDrop(appGrid, group.id);
        
        return groupElement;
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
     * Configure le glisser-déposer pour un groupe de favoris avec un retour visuel amélioré
     * @param {HTMLElement} container - Conteneur des tuiles
     * @param {string} groupId - ID du groupe
     * @private
     */
    _setupDragAndDrop(container, groupId) {
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
            if (!isFavorite && this.favoritesCheckCallback) {
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
                if (this.favoritesCallback) {
                    // Passer explicitement le groupId comme troisième paramètre
                    this.favoritesCallback(appId, categoryId, targetGroupId);
                }
            }
            // Si l'app est déjà un favori (déplacement entre groupes)
            else if (sourceGroupId !== targetGroupId) {
                // Passer le groupe source comme paramètre additionnel pour le déplacement
                if (this.groupManagementCallback) {
                    this.groupManagementCallback('moveToGroup', appId, targetGroupId, sourceGroupId);
                }
            }
            // Si c'est une réorganisation au sein du même groupe
            else {
                // Récupérer l'ordre actuel des applications
                const appTiles = Array.from(container.querySelectorAll('.app-tile'));
                const appIds = appTiles.map(tile => tile.getAttribute('data-app-id'));
                
                // Mettre à jour l'ordre
                if (appIds.length > 0 && this.reorderCallback) {
                    this.reorderCallback(targetGroupId, appIds);
                }
            }

            // Ajouter après le traitement du drop dans l'écouteur
            this._applyDropAnimation(container);
        });
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
     * Met à jour l'affichage de toutes les catégories
     * @param {Array} categories - Liste des catégories ordonnées
     * @param {string} currentCategoryId - ID de la catégorie actuellement sélectionnée
     * @param {boolean} isInitialLoad - Indique s'il s'agit du chargement initial
     * @param {boolean} preserveScroll - Indique s'il faut préserver la position de défilement
     */
    updateCategories(categories, currentCategoryId, isInitialLoad = true, preserveScroll = false) {
        if (!this.categoriesContainerElement) return;
        
        // Charge l'état des sections réduites si c'est le chargement initial
        if (isInitialLoad) {
            this._loadCollapsedSections();
        }
        
        // Sauvegarde la section de favoris si elle existe
        const favoritesSection = document.getElementById('favorites-section');
        if (favoritesSection) {
            favoritesSection.remove();
        }
        
        // Vide le conteneur
        this.categoriesContainerElement.innerHTML = '';
        
        // Si la section de favoris existait, la remettre en premier
        if (favoritesSection) {
            this.categoriesContainerElement.appendChild(favoritesSection);
        }
        
        // Crée le bouton global de réduction/expansion
        const globalToggle = this._createGlobalToggleButton();
        
        // Ajoute le bouton global APRÈS la section des favoris
        this.categoriesContainerElement.appendChild(globalToggle);
        
        // Ajoute une section pour chaque catégorie
        for (const category of categories) {
            const section = this._createCategorySection(category);
            this.categoriesContainerElement.appendChild(section);
        }
        
        // Met à jour le bouton global
        this._updateGlobalToggleButton();
        
        // Fait défiler jusqu'à la catégorie active seulement si nécessaire
        if (!isInitialLoad && !preserveScroll) {
            this._scrollToActiveCategory(currentCategoryId, isInitialLoad);
        }
    }
    
    /**
     * Crée une section de catégorie
     * @param {Object} category - Données de la catégorie
     * @returns {HTMLElement} Élément section créé
     * @private
     */
    _createCategorySection(category) {
        const section = document.createElement('section');
        section.className = 'category-section';
        section.id = `category-${category.id}`;
        
        // Vérifie si la section doit être réduite au départ
        if (this._collapsedSections[category.id]) {
            section.classList.add('collapsed');
        }
        
        // En-tête de la catégorie avec titre et lien de procédure
        const header = document.createElement('div');
        header.className = 'category-header';
        
        // Partie gauche de l'en-tête (titre)
        const headerLeft = document.createElement('div');
        headerLeft.className = 'category-header-left';
        
        // Titre de la catégorie
        const title = document.createElement('h2');
        title.className = 'category-title';
        
        // Icône de la catégorie
        const icon = APP_CONFIG.CATEGORY_ICONS[category.id] || 'fas fa-folder';
        
        title.innerHTML = `<i class="${icon}"></i> ${category.name}`;
        headerLeft.appendChild(title);
        
        // Partie droite de l'en-tête (procédure et bouton toggle)
        const headerRight = document.createElement('div');
        headerRight.className = 'category-header-right';

        // Lien de procédure (si disponible)
        if (category.procedureLink) {
            const procedureLink = document.createElement('a');
            procedureLink.className = 'category-link';
            procedureLink.href = category.procedureLink;
            procedureLink.target = '_blank';
            procedureLink.rel = 'noopener noreferrer';
            procedureLink.innerHTML = `<i class="fas fa-book"></i> Procédure`;
            headerRight.appendChild(procedureLink);
        }
        
        // Bouton de réduction/expansion (pas pour les favoris)
        if (category.id !== 'favorites') {
            const toggleButton = document.createElement('button');
            toggleButton.className = 'section-toggle';
            toggleButton.setAttribute('aria-label', this._collapsedSections[category.id] ? 'Déployer la section' : 'Réduire la section');
            toggleButton.setAttribute('title', this._collapsedSections[category.id] ? 'Déployer la section' : 'Réduire la section');
            toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
            
            if (this._collapsedSections[category.id]) {
                toggleButton.classList.add('collapsed');
            }
            
            toggleButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSectionCollapse(category.id, section);
                this._updateGlobalToggleButton();
            });
            
            headerRight.appendChild(toggleButton);
        }
        
        header.appendChild(headerLeft);
        header.appendChild(headerRight);
        section.appendChild(header);
        
        // Description de la catégorie (si disponible)
        if (category.description) {
            const description = document.createElement('p');
            description.className = 'category-description';
            description.textContent = category.description;
            section.appendChild(description);
        }
        
        // Grille d'applications
        const appGrid = document.createElement('div');
        appGrid.className = 'app-grid';
        
        // Ajoute chaque application à la grille
        if (category.apps && Array.isArray(category.apps)) {
            for (const app of category.apps) {
                const appTile = this._createAppTile(app, false, category.id);
                appGrid.appendChild(appTile);
            }
        }
        
        section.appendChild(appGrid);
        
        return section;
    }
    
    /**
     * Crée une tuile d'application avec support du glisser-déposer
     * @param {Object} app - Données de l'application
     * @param {boolean} isFavoriteSection - Indique si l'app est dans la section favoris
     * @param {string} categoryId - ID de la catégorie (optionnel si dans favoris)
     * @returns {HTMLElement} Élément tuile créé
     * @private
     */
    _createAppTile(app, isFavoriteSection = false, categoryId = null) {
        // Utilise l'ID de catégorie stocké dans l'app pour les favoris
        if (isFavoriteSection && !categoryId && app.categoryId) {
            categoryId = app.categoryId;
        }
        
        const tileLink = document.createElement('a');
        tileLink.className = 'app-tile';
        tileLink.href = app.url;
        tileLink.target = '_blank';
        tileLink.rel = 'noopener noreferrer';
        tileLink.setAttribute('data-app-id', app.id);
        if (categoryId) {
            tileLink.setAttribute('data-category-id', categoryId);
        }
        
        // Rendre TOUTES les tuiles d'applications glissables
        tileLink.setAttribute('draggable', 'true');
        
        // Si nous sommes dans les favoris, ajouter l'attribut de groupe
        const currentGroupId = isFavoriteSection && app.groupId ? app.groupId : 'general';
        if (isFavoriteSection) {
            tileLink.setAttribute('data-group-id', currentGroupId);
        }
        
        tileLink.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('application/app-id', app.id);
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
        
        // Amélioration de l'accessibilité : ajout d'un attribut title avec le nom et la description
        let titleText = app.name;
        if (app.description) {
            titleText += ` - ${app.description}`;
            tileLink.setAttribute('data-description', app.description);
        }
        
        // Ajouter le nom de la catégorie dans l'infobulle pour les favoris
        if (isFavoriteSection && app.categoryName) {
            titleText += ` (${app.categoryName})`;
        }
        
        tileLink.setAttribute('title', titleText);
        
        // Icône de l'application
        const iconElement = document.createElement('div');
        iconElement.className = 'app-icon';
        iconElement.style.backgroundColor = app.color || '#3498db';
        
        // Utilise l'icône spécifiée ou une icône par défaut
        const iconClass = app.icon.startsWith('fa') ? app.icon : `fas fa-${app.icon}`;
        iconElement.innerHTML = `<i class="${iconClass}"></i>`;
        
        // Nom de l'application
        const nameElement = document.createElement('div');
        nameElement.className = 'app-name';
        nameElement.textContent = app.name;
        
        // Conteneur de contenu pour la vue détaillée
        const contentElement = document.createElement('div');
        contentElement.className = 'app-content';
        contentElement.appendChild(nameElement);
        
        // Description pour la vue détaillée
        if (app.description) {
            const descriptionElement = document.createElement('div');
            descriptionElement.className = 'app-description';
            descriptionElement.textContent = app.description;
            contentElement.appendChild(descriptionElement);
        }
        
        // Bouton de favori
        const favoriteButton = document.createElement('button');
        favoriteButton.className = 'app-favorite-toggle';
        favoriteButton.type = 'button';
        
        // Détermine si l'app est déjà en favori dans ce groupe spécifique
        let isFavoriteInGroup = isFavoriteSection;
        
        // Si nous ne sommes pas dans la section favoris, vérifier si l'app est en favoris
        if (!isFavoriteSection && this.favoritesCheckCallback) {
            // Vérifier si l'application est dans les favoris, section générale
            const isAnyFavorite = this.favoritesCheckCallback(app.id);
            
            // Dans une tuile normale, l'étoile indique si l'app est dans les favoris généraux
            isFavoriteInGroup = isAnyFavorite;
        }
        
        favoriteButton.setAttribute('aria-label', isFavoriteInGroup ? 'Retirer des favoris' : 'Ajouter aux favoris');
        favoriteButton.setAttribute('title', isFavoriteInGroup ? 'Retirer des favoris' : 'Ajouter aux favoris');
        favoriteButton.innerHTML = isFavoriteInGroup ? 
            '<i class="fas fa-star"></i>' : 
            '<i class="far fa-star"></i>';
            
        // Si elle est en favoris, ajouter une classe pour le style
        if (isFavoriteInGroup) {
            favoriteButton.classList.add('is-favorite');
        }
        
        // Ajoute un écouteur d'événement pour le bouton de favori
        favoriteButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.favoritesCallback) {
                const appId = app.id;
                const catId = categoryId || app.categoryId;
                // Passer le groupe courant ou "general" pour les tuiles normales
                const groupId = isFavoriteSection ? currentGroupId : 'general';
                // Passer le bouton lui-même comme quatrième paramètre
                this.favoritesCallback(appId, catId, groupId, favoriteButton);
            }
        });
        
        tileLink.appendChild(iconElement);
        
        // Pour la vue liste, on ajoute le conteneur de contenu
        if (document.body.classList.contains('layout-list')) {
            // Ajoutez le conteneur de contenu avec la description si disponible
            const contentElement = document.createElement('div');
            contentElement.className = 'app-content';
            
            // Ajoutez le nom de l'application au conteneur de contenu
            contentElement.appendChild(nameElement);
            
            // Ajoutez la description si disponible
            if (app.description) {
                const descriptionElement = document.createElement('div');
                descriptionElement.className = 'app-description';
                descriptionElement.textContent = app.description;
                contentElement.appendChild(descriptionElement);
            }
            
            // Ajoutez le conteneur de contenu à la tuile
            tileLink.appendChild(contentElement);
        } else {
            // Pour la vue grille standard, ajoutez directement le nom
            tileLink.appendChild(nameElement);
        }
        
        tileLink.appendChild(favoriteButton);
        
        return tileLink;
    }   
    
    /**
     * Fait défiler jusqu'à la catégorie active avec un décalage pour la visibilité du titre
     * @param {string} categoryId - ID de la catégorie active
     * @param {boolean} isInitialLoad - Indique s'il s'agit du chargement initial
     * @private
     */
    _scrollToActiveCategory(categoryId, isInitialLoad = false) {
        // Ne fait pas défiler si c'est le chargement initial
        if (isInitialLoad) return;

        setTimeout(() => {
            const categoryElement = document.getElementById(`category-${categoryId}`);
            if (categoryElement) {
                // Calcul de la position avec décalage
                const headerHeight = document.querySelector('header').offsetHeight;
                const extraOffset = 20; // Espace supplémentaire en pixels
                const elementPosition = categoryElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - extraOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }

    /**
     * Configure les écouteurs d'événements au niveau du document pour le drag-and-drop
     * @private
     */
    _setupGlobalDragEvents() {
        // Écouteur global pour détecter le début d'une opération de glisser-déposer
        document.addEventListener('dragstart', () => {
            console.log('Drag started - global handler');
            // Ajouter une classe au body pour indiquer qu'un drag est en cours
            document.body.classList.add('dragging-active');
            
            // Identifier toutes les zones cibles potentielles immédiatement
            document.querySelectorAll('.app-grid[data-group-id]').forEach(grid => {
                if (!grid.classList.contains('potential-drop-target')) {
                    grid.classList.add('potential-drop-target');
                }
            });
            
            // Identifier clairement les groupes vides
            document.querySelectorAll('.favorites-group-empty').forEach(group => {
                group.classList.add('drag-target-highlight');
            });
        });
        
        // Écouteur global pour la fin d'un drag
        document.addEventListener('dragend', this._handleGlobalDragEnd.bind(this));
        
        // Écouteur de sécurité sur document pour s'assurer que le drag est réinitialisé
        document.addEventListener('mouseup', () => {
            if (document.body.classList.contains('dragging-active')) {
                console.log('Mouse up detected while dragging - cleanup triggered');
                this._handleGlobalDragEnd();
            }
        });
        
        // Écouteur supplémentaire sur document
        document.addEventListener('click', () => {
            // Vérifier si une opération de drag semble être en cours alors qu'elle ne devrait pas
            if (document.body.classList.contains('dragging-active') && 
                !document.querySelector('.dragging')) {
                console.log('Click detected while interface shows dragging - cleanup triggered');
                this._handleGlobalDragEnd();
            }
        });
    }

    /**
    * Méthode à ajouter à la classe UIManager dans js/ui/UIManager.js
    * Cette méthode configure les écouteurs pour déplier les sections au survol pendant le glissement
    */
    _setupHoverExpandForDrag() {
        // Fonction pour gérer le survol d'une section repliée
        const handleDragHover = (event, element, sectionId, isGroup = false) => {

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
        };
        
        // Fonction pour gérer la sortie d'une section après survol
        const handleDragLeave = (event, element, sectionId, isGroup = false) => {
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
        };

        // Configurer les écouteurs pour la section des favoris
        const favoritesSection = document.getElementById('favorites-section');
        if (favoritesSection) {
            favoritesSection.addEventListener('dragenter', (e) => {
                handleDragHover(e, favoritesSection, 'favorites');
            });
            
            favoritesSection.addEventListener('dragleave', (e) => {
                handleDragLeave(e, favoritesSection, 'favorites');
            });
        }

        // Configurer les écouteurs pour les groupes de favoris
        document.querySelectorAll('.favorites-group').forEach(group => {
            const groupId = group.getAttribute('data-group-id');
            if (!groupId) return;
            
            group.addEventListener('dragenter', (e) => {
                handleDragHover(e, group, groupId, true);
            });
            
            group.addEventListener('dragleave', (e) => {
                handleDragLeave(e, group, groupId, true);
            });
        });

        // Dans la méthode _handleGlobalDragEnd, ajouter ce code:
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

        // Configurer les écouteurs pour les sections classiques
        document.querySelectorAll('.category-section:not(.favorites-section)').forEach(section => {
            const sectionId = section.id;
            if (!sectionId) return;
            
            const categoryId = sectionId.replace('category-', '');
            
            section.addEventListener('dragenter', (e) => {
                handleDragHover(e, section, categoryId);
            });
            
            section.addEventListener('dragleave', (e) => {
                handleDragLeave(e, section, categoryId);
            });
        });
    }

    /**
     * Gère la fin d'une opération de drag and drop au niveau global
     * Cette méthode séparée permet d'être appelée de différents endroits
     * @private
     */
    _handleGlobalDragEnd() {
        console.log('Drag ended - cleaning up');
        
        // Retirer la classe du body
        document.body.classList.remove('dragging-active');
        
        // Nettoyer toutes les classes liées au drag-and-drop
        document.querySelectorAll('.drag-over, .drag-active, .dragging, .drag-target-highlight').forEach(element => {
            element.classList.remove('drag-over', 'drag-active', 'dragging', 'drag-target-highlight');
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
    }

    /**
     * Initialise les écouteurs de secours pour le drag and drop
     * Doit être appelé dans le constructeur après _setupGlobalDragEvents
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

    /**
     * Applique une animation de rebond lorsqu'un élément est déposé
     * @param {HTMLElement} targetElement - Élément dans lequel l'élément a été déposé
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
     * Met à jour les onglets de navigation
     * @param {string} categoryId - ID de la catégorie active
     */
    updateActiveCategoryTab(categoryId) {
        if (!this.categoryNavElement) return;
        
        // Retire la classe active de tous les onglets
        const tabs = this.categoryNavElement.querySelectorAll('.category-nav-item');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Ajoute la classe active à l'onglet correspondant à la catégorie
        const activeTab = Array.from(tabs).find(tab => 
            tab.textContent === CATEGORIES_DATA[categoryId]?.name);
        
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
    
    /**
     * Charge l'état des sections réduites depuis localStorage
     * @private
     */
    _loadCollapsedSections() {
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
            
            // Met à jour le bouton
            const globalToggleButton = document.getElementById('globalToggleButton');
            if (globalToggleButton) {
                if (collapse) {
                    // Si on vient de tout réduire, le prochain clic devra tout déployer
                    globalToggleButton.innerHTML = '<i class="fas fa-expand-alt"></i> Tout déployer';
                    globalToggleButton.setAttribute('data-action', 'expand');
                    globalToggleButton.setAttribute('aria-label', 'Tout déployer');
                    // Ajout du title descriptif
                    globalToggleButton.setAttribute('title', 'Tout déployer - Afficher le contenu de toutes les sections');
                } else {
                    // Si on vient de tout déployer, le prochain clic devra tout réduire
                    globalToggleButton.innerHTML = '<i class="fas fa-compress-alt"></i> Tout réduire';
                    globalToggleButton.setAttribute('data-action', 'collapse');
                    globalToggleButton.setAttribute('aria-label', 'Tout réduire');
                    // Ajout du title descriptif
                    globalToggleButton.setAttribute('title', 'Tout réduire - Masquer le contenu de toutes les sections');
                }
            }
        });
        
        // Sauvegarde l'état
        this._saveCollapsedSections();
        
        // Met à jour le bouton global en utilisant directement l'état collapse
        // plutôt que de vérifier le DOM qui peut prendre du temps à se mettre à jour
        const globalToggleButton = document.getElementById('globalToggleButton');
        if (globalToggleButton) {
            if (collapse) {
                // Si on vient de tout réduire, le prochain clic devra tout déployer
                globalToggleButton.innerHTML = '<i class="fas fa-expand-alt"></i> Tout déployer';
                globalToggleButton.setAttribute('data-action', 'expand');
            } else {
                // Si on vient de tout déployer, le prochain clic devra tout réduire
                globalToggleButton.innerHTML = '<i class="fas fa-compress-alt"></i> Tout réduire';
                globalToggleButton.setAttribute('data-action', 'collapse');
            }
        }
    }
    
    /**
     * Met à jour l'état du bouton global de réduction/expansion
     * @private
     */
    _updateGlobalToggleButton() {
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
     * Crée le bouton global de réduction/expansion
     * @returns {HTMLElement} Conteneur du bouton
     * @private
     */
    _createGlobalToggleButton() {
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

    /**
     * @fileoverview Gestionnaire de sélection de groupe de favoris
     * Gère l'interface pour sélectionner un groupe lors de l'ajout aux favoris
     */

    /**
     * Ajoute une méthode à UIManager pour montrer le sélecteur de groupe
     */
    showGroupSelector = function(app, categoryId, favoriteCallback, groupManagementCallback) {
        // Récupère ou crée l'élément du sélecteur de groupe
        let selectorElement = document.getElementById('favorite-group-selector');
        
        if (!selectorElement) {
            selectorElement = this._createGroupSelectorElement();
        }
        
        // Vide le contenu du sélecteur
        const groupsListElement = selectorElement.querySelector('.groups-list');
        groupsListElement.innerHTML = '';
        
        // Ajoute l'aperçu de l'application
        const appPreviewElement = selectorElement.querySelector('.app-preview');
        this._updateAppPreview(appPreviewElement, app, categoryId);
        
        // Récupère la liste des groupes de favoris
        const groups = window.appController.favoritesModel.getGroups();
        
        // Ajoute chaque groupe à la liste
        groups.forEach(group => {
            const groupElement = this._createGroupOption(group, app, categoryId, favoriteCallback, selectorElement);
            groupsListElement.appendChild(groupElement);
        });
        
        // Ajoute l'option pour créer un nouveau groupe
        const createGroupElement = document.createElement('div');
        createGroupElement.className = 'create-group-option';
        createGroupElement.innerHTML = '<i class="fas fa-plus-circle"></i> Créer un nouveau groupe';
        createGroupElement.addEventListener('click', () => {
            // Ferme le sélecteur
            this.closeGroupSelector();
            
            // Ouvre la modale de création de groupe
            if (groupManagementCallback) {
                setTimeout(() => {
                    groupManagementCallback('add');
                }, 300); // Délai pour permettre au sélecteur de se fermer
            }
        });
        groupsListElement.appendChild(createGroupElement);
        
        // Affiche le sélecteur
        selectorElement.classList.add('active');
        
        // Ajoute un écouteur pour fermer avec Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeGroupSelector();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    };

    /**
     * Crée l'élément DOM du sélecteur de groupe
     * @returns {HTMLElement} Élément du sélecteur créé
     * @private
     */
    _createGroupSelectorElement = function() {
        const selectorElement = document.createElement('div');
        selectorElement.className = 'favorite-group-selector';
        selectorElement.id = 'favorite-group-selector';
        
        const content = document.createElement('div');
        content.className = 'group-selector-content';
        
        // En-tête du sélecteur
        const header = document.createElement('div');
        header.className = 'group-selector-header';
        
        const title = document.createElement('div');
        title.className = 'group-selector-title';
        title.textContent = 'Ajouter aux favoris';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'group-selector-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Fermer');
        closeButton.addEventListener('click', () => this.closeGroupSelector());
        
        header.appendChild(title);
        header.appendChild(closeButton);
        content.appendChild(header);
        
        // Aperçu de l'application
        const appPreview = document.createElement('div');
        appPreview.className = 'app-preview';
        content.appendChild(appPreview);
        
        // Liste des groupes
        const groupsList = document.createElement('div');
        groupsList.className = 'groups-list';
        content.appendChild(groupsList);
        
        selectorElement.appendChild(content);
        document.body.appendChild(selectorElement);
        
        // Fermer si on clique en dehors du contenu
        selectorElement.addEventListener('click', (e) => {
            if (e.target === selectorElement) {
                this.closeGroupSelector();
            }
        });
        
        return selectorElement;
    };

    /**
     * Met à jour l'aperçu de l'application dans le sélecteur
     * @param {HTMLElement} previewElement - Élément d'aperçu
     * @param {Object} app - Données de l'application
     * @param {string} categoryId - ID de la catégorie
     * @private
     */
    _updateAppPreview = function(previewElement, app, categoryId) {
        // Récupère le nom de la catégorie
        const categoryName = window.appController.categoryModel.getCategoryData(categoryId)?.name || '';
        
        previewElement.innerHTML = '';
        
        // Icône de l'application
        const iconElement = document.createElement('div');
        iconElement.className = 'app-preview-icon';
        iconElement.style.backgroundColor = app.color || '#3498db';
        
        // Utilise l'icône spécifiée ou une icône par défaut
        const iconClass = app.icon.startsWith('fa') ? app.icon : `fas fa-${app.icon}`;
        iconElement.innerHTML = `<i class="${iconClass}"></i>`;
        
        // Infos de l'application
        const infoElement = document.createElement('div');
        infoElement.className = 'app-preview-info';
        
        const nameElement = document.createElement('div');
        nameElement.className = 'app-preview-name';
        nameElement.textContent = app.name;
        
        const categoryElement = document.createElement('div');
        categoryElement.className = 'app-preview-category';
        categoryElement.textContent = categoryName;
        
        infoElement.appendChild(nameElement);
        infoElement.appendChild(categoryElement);
        
        previewElement.appendChild(iconElement);
        previewElement.appendChild(infoElement);
    };

    /**
     * Crée une option de groupe dans le sélecteur
     * @param {Object} group - Données du groupe
     * @param {Object} app - Données de l'application
     * @param {string} categoryId - ID de la catégorie
     * @param {Function} favoriteCallback - Fonction de callback pour l'ajout aux favoris
     * @param {HTMLElement} selectorElement - Élément du sélecteur
     * @returns {HTMLElement} Élément de l'option créée
     * @private
     */
    _createGroupOption = function(group, app, categoryId, favoriteCallback, selectorElement) {
        const groupElement = document.createElement('div');
        groupElement.className = 'group-item';
        groupElement.setAttribute('data-group-id', group.id);
        
        // Icône du groupe
        const iconElement = document.createElement('div');
        iconElement.className = 'group-icon';
        iconElement.style.backgroundColor = group.color || '#3498db';
        iconElement.innerHTML = `<i class="fas fa-${group.icon || 'folder'}"></i>`;
        
        // Infos du groupe
        const infoElement = document.createElement('div');
        infoElement.className = 'group-info';
        
        const nameElement = document.createElement('div');
        nameElement.className = 'group-name';
        nameElement.textContent = group.name;
        
        // Compte des favoris dans le groupe
        let groupApps = [];
        try {
            if (window.appController && window.appController.favoritesModel) {
                groupApps = window.appController.favoritesModel.getFavoritesByGroup(group.id);
            }
        } catch (e) {
            console.error(`Erreur lors de la récupération des apps pour le groupe ${group.id}:`, e);
            groupApps = [];
        }
        
        const countElement = document.createElement('div');
        countElement.className = 'group-count';
        countElement.textContent = `${groupApps.length} application${groupApps.length !== 1 ? 's' : ''}`;
        
        infoElement.appendChild(nameElement);
        infoElement.appendChild(countElement);
        
        groupElement.appendChild(iconElement);
        groupElement.appendChild(infoElement);
        
        // Ajoute un écouteur pour la sélection du groupe avec une approche directe
        groupElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Ferme le sélecteur
            this.closeGroupSelector();
            
            console.log(`Groupe sélectionné: ${group.id} (${group.name}) pour l'app ${app.id}`);
            
            // Approche directe pour l'ajout de favori - on utilise window.appController directement
            // pour éviter tout problème de scope ou de chaînage de callback
            if (window.appController) {
                // Pour le groupe "general", on utilise une approche spéciale
                if (group.id === 'general') {
                    console.log("Traitement spécial pour le groupe Général");
                    
                    // Vérification si l'app est déjà dans le groupe
                    const isAlreadyInGroup = window.appController.favoritesModel.isInFavoriteGroup(app.id, 'general');
                    
                    if (isAlreadyInGroup) {
                        console.log(`L'app ${app.id} est déjà dans le groupe Général - suppression`);
                        window.appController.favoritesModel.removeFromGroup(app.id, 'general');
                    } else {
                        console.log(`Ajout direct de l'app ${app.id} au groupe Général`);
                        window.appController.favoritesModel.addFavorite(app.id, categoryId, 'general');
                    }
                    
                    // Mettre à jour l'affichage
                    window.appController.updateDisplay(true, true);
                    
                    // Reconstruire l'index de recherche
                    window.appController.searchModelService.rebuildIndex();
                }
                // Pour les autres groupes, on utilise le callback standard
                else if (favoriteCallback) {
                    favoriteCallback(app.id, categoryId, group.id);
                }
            }
        });
        
        return groupElement;
    };

    /**
     * Ferme le sélecteur de groupe
     */
    closeGroupSelector = function() {
        const selectorElement = document.getElementById('favorite-group-selector');
        if (selectorElement) {
            selectorElement.classList.remove('active');
        }
    };
}