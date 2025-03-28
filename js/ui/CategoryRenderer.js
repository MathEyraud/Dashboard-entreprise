/**
 * @fileoverview Gestionnaire de rendu des catégories
 * Responsable de la création et mise à jour des sections de catégories
 */

/**
 * @class CategoryRenderer
 * Gère le rendu des sections de catégories et des tuiles d'applications
 */
class CategoryRenderer {
    /**
     * Crée une instance du gestionnaire de rendu
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
    }
    
    /**
     * Met à jour l'affichage de toutes les catégories
     * @param {Array} categories - Liste des catégories
     * @param {string} currentCategoryId - ID de la catégorie active
     * @param {boolean} isInitialLoad - Indique s'il s'agit du chargement initial
     * @param {boolean} preserveScroll - Indique s'il faut préserver la position de défilement
     */
    updateAllCategories(categories, currentCategoryId, isInitialLoad = true, preserveScroll = false) {
        // Sauvegarde la section de favoris si elle existe
        const favoritesSection = document.getElementById('favorites-section');
        if (favoritesSection) {
            favoritesSection.remove();
        }
        
        // Vide le conteneur
        this._uiCore.categoriesContainerElement.innerHTML = '';
        
        // Si la section de favoris existait, la remettre en premier
        if (favoritesSection) {
            this._uiCore.categoriesContainerElement.appendChild(favoritesSection);
        }
        
        // Crée le bouton global de réduction/expansion
        const globalToggle = this._uiCore.sectionCollapseManager.createGlobalToggleButton();
        
        // Ajoute le bouton global APRÈS la section des favoris
        this._uiCore.categoriesContainerElement.appendChild(globalToggle);
        
        // Ajoute une section pour chaque catégorie
        for (const category of categories) {
            const section = this._createCategorySection(category);
            this._uiCore.categoriesContainerElement.appendChild(section);
        }
    }
    
    /**
     * Met à jour la section des favoris
     * @param {Object} favoritesData - Données des favoris groupées
     */
    updateFavoritesSection(favoritesData) {
        const { favoriteAppsGrouped, groups } = favoritesData;
        
        // Toujours afficher la section Favoris si des groupes existent
        const shouldDisplayFavoritesSection = groups && groups.length > 0;
        
        let favoritesSection = document.getElementById('favorites-section');
        
        if (!favoritesSection && shouldDisplayFavoritesSection) {
            favoritesSection = this._createFavoritesSection(favoriteAppsGrouped, groups);
            
            if (this._uiCore.categoriesContainerElement.firstChild) {
                this._uiCore.categoriesContainerElement.insertBefore(
                    favoritesSection, 
                    this._uiCore.categoriesContainerElement.firstChild
                );
            } else {
                this._uiCore.categoriesContainerElement.appendChild(favoritesSection);
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
        if (this._uiCore.sectionCollapseManager._collapsedSections[category.id]) {
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
            toggleButton.setAttribute('aria-label', this._uiCore.sectionCollapseManager._collapsedSections[category.id] ? 'Déployer la section' : 'Réduire la section');
            toggleButton.setAttribute('title', this._uiCore.sectionCollapseManager._collapsedSections[category.id] ? 'Déployer la section' : 'Réduire la section');
            toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
            
            if (this._uiCore.sectionCollapseManager._collapsedSections[category.id]) {
                toggleButton.classList.add('collapsed');
            }
            
            toggleButton.addEventListener('click', (e) => {
                e.preventDefault();
                this._uiCore.sectionCollapseManager.toggleSectionCollapse(category.id, section);
                this._uiCore.sectionCollapseManager.updateGlobalToggleButton();
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
            this._uiCore.sectionCollapseManager.toggleAllFavoriteGroups(collapseAll);
        });
        
        headerRight.appendChild(toggleButton);
        
        // Bouton d'ajout de groupe
        const addGroupBtn = document.createElement('button');
        addGroupBtn.className = 'favorites-add-group-btn';
        addGroupBtn.innerHTML = '<i class="fas fa-folder-plus"></i> Nouveau groupe';
        addGroupBtn.setAttribute('title', 'Ajouter un nouveau groupe de favoris');
        addGroupBtn.addEventListener('click', () => {
            if (this._uiCore.groupManagementCallback) {
                this._uiCore.groupManagementCallback('add');
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
        const isGroupCollapsed = this._uiCore.sectionCollapseManager._collapsedSections[groupCollapseKey];
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
            this._uiCore.sectionCollapseManager.toggleGroupCollapse(groupCollapseKey, groupElement);
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
                if (this._uiCore.groupManagementCallback) {
                    this._uiCore.groupManagementCallback('edit', group.id);
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
                if (this._uiCore.groupManagementCallback) {
                    this._uiCore.groupManagementCallback('delete', group.id);
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
        this._uiCore.dragDropManager.setupDragAndDrop(appGrid, group.id);
        
        return groupElement;
    }
    
    /**
     * Crée une tuile d'application avec support du glisser-déposer
     * @param {Object} app - Données de l'application
     * @param {boolean} isFavoriteSection - Indique si l'app est dans la section favoris
     * @param {string} categoryId - ID de la catégorie
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
        
        // Configuration des événements de drag
        this._uiCore.dragDropManager.setupTileDragEvents(tileLink, app.id, categoryId, isFavoriteSection, currentGroupId);
        
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
        if (!isFavoriteSection && this._uiCore.favoritesCheckCallback) {
            // Vérifier si l'application est dans les favoris, section générale
            const isAnyFavorite = this._uiCore.favoritesCheckCallback(app.id);
            
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
            
            if (this._uiCore.favoritesCallback) {
                const appId = app.id;
                const catId = categoryId || app.categoryId;
                // Passer le groupe courant ou "general" pour les tuiles normales
                const groupId = isFavoriteSection ? currentGroupId : 'general';
                // Passer le bouton lui-même comme quatrième paramètre
                this._uiCore.favoritesCallback(appId, catId, groupId, favoriteButton);
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
     * Vérifie l'état global de collapse des groupes favoris
     * @returns {boolean} true si la majorité des groupes sont repliés
     * @private
     */
    _getGroupsCollapseState() {
        const groupKeys = Object.keys(this._uiCore.sectionCollapseManager._collapsedSections).filter(key => 
            key.startsWith('group_') && key.endsWith('_collapsed')
        );
        
        if (groupKeys.length === 0) return false;
        
        // Compte combien de groupes sont repliés
        const collapsedCount = groupKeys.filter(key => this._uiCore.sectionCollapseManager._collapsedSections[key]).length;
        
        // Si plus de la moitié sont repliés, considérer l'état global comme replié
        return collapsedCount >= groupKeys.length / 2;
    }
}