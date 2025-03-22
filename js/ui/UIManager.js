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
     */
    updateFavorites(favoritesData, favoriteCallback, reorderCallback, groupManagementCallback) {
        this.favoritesCallback = favoriteCallback;
        this.reorderCallback = reorderCallback;
        this.groupManagementCallback = groupManagementCallback;
        
        // Récupère les données structurées
        const { favoriteAppsGrouped, groups } = favoritesData;
        
        // Vérifie s'il y a des favoris à afficher
        const hasFavorites = groups.some(group => 
            favoriteAppsGrouped[group.id]?.apps.length > 0
        );
        
        // Cherche si une section de favoris existe déjà
        let favoritesSection = document.getElementById('favorites-section');
        
        // Si la section n'existe pas et qu'il y a des favoris, la créer
        if (!favoritesSection && hasFavorites) {
            favoritesSection = this._createFavoritesSection(favoriteAppsGrouped, groups);
            
            // Insérer en haut du container
            if (this.categoriesContainerElement.firstChild) {
                this.categoriesContainerElement.insertBefore(
                    favoritesSection, 
                    this.categoriesContainerElement.firstChild
                );
            } else {
                this.categoriesContainerElement.appendChild(favoritesSection);
            }
        } 
        // Si la section existe, la mettre à jour
        else if (favoritesSection) {
            // Si plus de favoris, supprimer la section
            if (!hasFavorites) {
                favoritesSection.remove();
            } else {
                // Mise à jour du contenu
                this._updateFavoritesSectionContent(
                    favoritesSection, 
                    favoriteAppsGrouped, 
                    groups
                );
            }
        }
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
            
            // Crée l'élément de groupe (maintenant tous les groupes sont créés)
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
     * Version améliorée pour gérer les groupes vides
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
        
        // En-tête du groupe
        const groupHeader = document.createElement('div');
        groupHeader.className = 'favorites-group-header';
        
        // Icône et nom du groupe
        const groupTitle = document.createElement('div');
        groupTitle.className = 'favorites-group-title';
        groupTitle.innerHTML = `<i class="fas fa-${group.icon}" style="color: ${group.color}"></i> ${group.name}`;
        
        // Boutons d'action du groupe (sauf pour le groupe général)
        const groupActions = document.createElement('div');
        groupActions.className = 'favorites-group-actions';
        
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
     * Configure le glisser-déposer pour un groupe de favoris
     * Version améliorée avec une meilleure indication visuelle
     * @param {HTMLElement} container - Conteneur des tuiles
     * @param {string} groupId - ID du groupe
     * @private
     */
    _setupDragAndDrop(container, groupId) {
        // Active la possibilité de deposer des éléments dans ce conteneur
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
            // On teste si on va vers un élément qui n'est pas un descendant du conteneur
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
            container.classList.remove('drag-over');
            
            // Retirer la classe du groupe parent également
            const groupElement = container.closest('.favorites-group');
            if (groupElement) {
                groupElement.classList.remove('group-drag-over');
            }
            
            // Récupère les données de l'élément déplacé
            const appId = e.dataTransfer.getData('application/app-id');
            const sourceGroupId = e.dataTransfer.getData('application/group-id');

            // On dépose dans un groupe différent
            if (sourceGroupId !== groupId) {
                // Si l'élément est déplacé vers un autre groupe, informer le modèle
                if (this.groupManagementCallback) {
                    this.groupManagementCallback('moveToGroup', appId, groupId);
                    return;
                }
            }
            
            // Sinon, gérer la réorganisation au sein du même groupe
            const appTiles = Array.from(container.querySelectorAll('.app-tile'));
            const appIds = appTiles.map(tile => tile.getAttribute('data-app-id'));
            
            // Appeler le callback de réorganisation seulement s'il y a des tuiles d'applications
            if (appIds.length > 0 && this.reorderCallback) {
                this.reorderCallback(groupId, appIds);
            }
        });
}

    /**
     * Met à jour l'affichage de toutes les catégories
     * @param {Array} categories - Liste des catégories ordonnées
     * @param {string} currentCategoryId - ID de la catégorie actuellement sélectionnée
     * @param {boolean} isInitialLoad - Indique s'il s'agit du chargement initial
     */
    updateCategories(categories, currentCategoryId, isInitialLoad = true) {
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
        
        // Ajoute le bouton global de réduction/expansion
        const globalToggle = this._createGlobalToggleButton();
        this.categoriesContainerElement.appendChild(globalToggle);
        
        // Si la section de favoris existait, la remettre en premier
        if (favoritesSection) {
            this.categoriesContainerElement.appendChild(favoritesSection);
        }
        
        // Ajoute une section pour chaque catégorie
        for (const category of categories) {
            const section = this._createCategorySection(category);
            this.categoriesContainerElement.appendChild(section);
        }
        
        // Met à jour le bouton global
        this._updateGlobalToggleButton();
        
        // Fait défiler jusqu'à la catégorie active
        this._scrollToActiveCategory(currentCategoryId, isInitialLoad);
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
     * Version améliorée de _createAppTile avec indications drag-and-drop
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
        
        // Si nous sommes dans les favoris, rendre la tuile déplaçable
        if (isFavoriteSection) {
            tileLink.setAttribute('draggable', 'true');
            if (app.groupId) {
                tileLink.setAttribute('data-group-id', app.groupId);
            }
            
            // Configurons les événements de glisser-déposer
            tileLink.addEventListener('dragstart', (e) => {

                e.dataTransfer.setData('application/app-id', app.id);
                e.dataTransfer.setData('application/group-id', app.groupId || 'general');
                tileLink.classList.add('dragging');
                
                // Effet visuel pour tous les conteneurs de favoris
                document.querySelectorAll('.app-grid[data-group-id]').forEach(grid => {
                    grid.classList.add('drag-active');
                });
                
                // Activer visuellement tous les groupes pour montrer qu'ils sont des cibles valides
                document.querySelectorAll('.favorites-group').forEach(group => {
                    group.classList.add('drag-target-highlight');
                });
                
                // Mettre en évidence particulièrement les groupes vides
                document.querySelectorAll('.favorites-group-empty').forEach(group => {
                    group.classList.add('drag-target-empty-highlight');
                });
            });
            
            tileLink.addEventListener('dragend', () => {
                tileLink.classList.remove('dragging');
                
                // Retirer l'effet visuel de tous les conteneurs
                document.querySelectorAll('.app-grid[data-group-id]').forEach(grid => {
                    grid.classList.remove('drag-active');
                    grid.classList.remove('drag-over');
                });
                
                // Retirer la mise en évidence des groupes
                document.querySelectorAll('.favorites-group').forEach(group => {
                    group.classList.remove('drag-target-highlight');
                });
                
                document.querySelectorAll('.favorites-group-empty').forEach(group => {
                    group.classList.remove('drag-target-empty-highlight');
                });
            });
        }

        
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
        
        // Détermine si l'app est déjà en favori
        let isFavorite = isFavoriteSection;
        
        // Si nous ne sommes pas dans la section favoris, vérifions si l'app est en favoris
        if (!isFavoriteSection && this.favoritesCheckCallback) {
            isFavorite = this.favoritesCheckCallback(app.id);
        }
        
        favoriteButton.setAttribute('aria-label', isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris');
        favoriteButton.setAttribute('title', isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris');
        favoriteButton.innerHTML = isFavorite ? 
            '<i class="fas fa-star"></i>' : 
            '<i class="far fa-star"></i>';
            
        // Si elle est en favoris, ajouter une classe pour le style
        if (isFavorite) {
            favoriteButton.classList.add('is-favorite');
        }
        
        // Ajoute un écouteur d'événement pour le bouton de favori
        favoriteButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.favoritesCallback) {
                const appId = app.id;
                const catId = categoryId || app.categoryId;
                this.favoritesCallback(appId, catId);
            }
        });
        
        tileLink.appendChild(iconElement);
        // Pour la vue grille standard, on ajoute directement le nom
        // Pour la vue liste, on ajoute le conteneur de contenu
        if (document.body.classList.contains('layout-list')) {
            tileLink.appendChild(contentElement);
        } else {
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
        // Si c'est la section des favoris, on ne la réduit pas
        if (categoryId === 'favorites') {
            return;
        }
        
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
            const toggleButton = section.querySelector('.section-toggle');
            if (toggleButton) {
                if (collapse) {
                    toggleButton.classList.add('collapsed');
                    toggleButton.setAttribute('aria-label', 'Déployer la section');
                    toggleButton.setAttribute('title', 'Déployer la section');
                } else {
                    toggleButton.classList.remove('collapsed');
                    toggleButton.setAttribute('aria-label', 'Réduire la section');
                    toggleButton.setAttribute('title', 'Réduire la section');
                }
            }
        });
        
        // Sauvegarde l'état
        this._saveCollapsedSections();
        
        // Met à jour le bouton global
        this._updateGlobalToggleButton();
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
        const hasExpandedSections = Array.from(sections).some(section => !section.classList.contains('collapsed'));
        
        if (hasExpandedSections) {
            // S'il y a au moins une section déployée, le bouton sert à tout réduire
            globalToggleButton.innerHTML = '<i class="fas fa-compress-alt"></i> Tout réduire';
            globalToggleButton.setAttribute('data-action', 'collapse');
        } else {
            // Si toutes les sections sont réduites, le bouton sert à tout déployer
            globalToggleButton.innerHTML = '<i class="fas fa-expand-alt"></i> Tout déployer';
            globalToggleButton.setAttribute('data-action', 'expand');
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