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
        this.categoryNavElement = document.getElementById('categoryNav');
        this.favoritesCallback = null;
        
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
            { element: this.categoryNavElement, name: 'categoryNav' }
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
     * Met à jour la section des favoris
     * @param {Array} favoriteApps - Liste des applications favorites
     * @param {Function} favoriteCallback - Fonction à appeler pour basculer les favoris
     */
    updateFavorites(favoriteApps, favoriteCallback) {
        this.favoritesCallback = favoriteCallback;
        
        // Cherche si une section de favoris existe déjà
        let favoritesSection = document.getElementById('favorites-section');
        
        // Si la section n'existe pas et qu'il y a des favoris, la créer
        if (!favoritesSection && favoriteApps.length > 0) {
            favoritesSection = this._createFavoritesSection(favoriteApps);
            
            // Insérer en haut du container
            if (this.categoriesContainerElement.firstChild) {
                this.categoriesContainerElement.insertBefore(favoritesSection, this.categoriesContainerElement.firstChild);
            } else {
                this.categoriesContainerElement.appendChild(favoritesSection);
            }
        } 
        // Si la section existe, la mettre à jour
        else if (favoritesSection) {
            // Si plus de favoris, supprimer la section
            if (favoriteApps.length === 0) {
                favoritesSection.remove();
            } else {
                // Mise à jour du contenu
                const appGrid = favoritesSection.querySelector('.app-grid');
                appGrid.innerHTML = '';
                
                favoriteApps.forEach(app => {
                    const appTile = this._createAppTile(app, true);
                    appGrid.appendChild(appTile);
                });
            }
        }
    }
    
    /**
     * Crée la section des favoris
     * @param {Array} favoriteApps - Liste des applications favorites
     * @returns {HTMLElement} La section créée
     * @private
     */
    _createFavoritesSection(favoriteApps) {
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
        
        header.appendChild(headerLeft);
        section.appendChild(header);
        
        // Description
        const description = document.createElement('p');
        description.className = 'category-description';
        description.textContent = 'Vos applications favorites pour un accès rapide';
        section.appendChild(description);
        
        // Grille d'applications
        const appGrid = document.createElement('div');
        appGrid.className = 'app-grid';
        
        // Ajoute chaque application favorite à la grille
        favoriteApps.forEach(app => {
            const appTile = this._createAppTile(app, true);
            appGrid.appendChild(appTile);
        });
        
        section.appendChild(appGrid);
        
        return section;
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
     * Crée une tuile d'application
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
        if (app.description) {
            tileLink.setAttribute('data-description', app.description);
        }
        
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
}