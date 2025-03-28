/**
 * @fileoverview Core du gestionnaire d'interface utilisateur
 * Centralise et coordonne les différents composants de l'interface
 */

/**
 * @class UICore
 * Orchestration centrale des composants de l'interface utilisateur
 */
class UICore {
    /**
     * Crée une instance du gestionnaire d'interface central
     * @constructor
     */
    constructor() {
        // Éléments du DOM
        this.categoriesContainerElement = document.getElementById('categoriesContainer');
        
        // Sous-modules pour la gestion de l'interface
        this.categoryRenderer = new CategoryRenderer(this);
        this.sectionCollapseManager = new SectionCollapseManager(this);
        this.dragDropManager = new DragDropManager(this);
        this.groupSelectorUI = new GroupSelectorUI(this);
        
        // Callbacks vers le contrôleur principal
        this.categoryChangeCallback = null;
        this.favoritesCallback = null;
        this.reorderCallback = null;
        this.groupManagementCallback = null;
        this.favoritesCheckCallback = null;
        this.addToFavoritesCallback = null;
        
        // Vérifie que tous les éléments nécessaires sont présents
        this._checkElements();
        
        // Initialise les écouteurs d'événements globaux
        this._setupGlobalEventListeners();
    }
    
    /**
     * Vérifie que les éléments DOM nécessaires sont présents
     * @private
     */
    _checkElements() {
        const elements = [
            { element: this.categoriesContainerElement, name: 'categoriesContainer' }
        ];
        
        for (const { element, name } of elements) {
            if (!element) {
                console.error(`Élément '${name}' non trouvé dans le DOM`);
            }
        }
    }
    
    /**
     * Initialise les écouteurs d'événements globaux
     * @private
     */
    _setupGlobalEventListeners() {
        // Écouteur pour les mises à jour de favoris
        document.addEventListener('favoritesUpdated', () => {
            this.updateAllFavoriteButtons();
        });
    }
    
    /**
     * Configure les écouteurs d'événements pour l'interface
     * @param {Function} categoryChangeCallback - Fonction à appeler lors du changement de catégorie
     * @param {Function} favoritesCheckCallback - Fonction pour vérifier si une app est en favoris
     */
    setupEventListeners(categoryChangeCallback, favoritesCheckCallback) {
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
     * Met à jour la section des favoris avec prise en charge des groupes
     * @param {Object} favoritesData - Données des favoris (groupées par groupe)
     * @param {Function} favoriteCallback - Fonction pour basculer les favoris
     * @param {Function} reorderCallback - Fonction pour réorganiser les favoris
     * @param {Function} groupManagementCallback - Fonction pour gérer les groupes
     * @param {Function} favoritesCheckCallback - Fonction pour vérifier si une app est en favoris
     * @param {Function} [addToFavoritesCallback=null] - Fonction pour ajouter aux favoris (optionnel)
     */
    updateFavorites(favoritesData, favoriteCallback, reorderCallback, groupManagementCallback, favoritesCheckCallback, addToFavoritesCallback = null) {
        this.favoritesCallback = favoriteCallback;
        this.reorderCallback = reorderCallback;
        this.groupManagementCallback = groupManagementCallback;
        this.addToFavoritesCallback = addToFavoritesCallback;
        
        // Stocker le callback de vérification
        if (favoritesCheckCallback) this.favoritesCheckCallback = favoritesCheckCallback;

        // Déléguer au CategoryRenderer pour la mise à jour visuelle
        this.categoryRenderer.updateFavoritesSection(favoritesData);

        // Configurer le déploiement au survol pour les sections repliées
        this.dragDropManager.setupHoverExpandForDrag();
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
            this.sectionCollapseManager.loadCollapsedSections();
        }
        
        // Déléguer la mise à jour visuelle au CategoryRenderer
        this.categoryRenderer.updateAllCategories(categories, currentCategoryId, isInitialLoad, preserveScroll);
        
        // Met à jour le bouton global
        this.sectionCollapseManager.updateGlobalToggleButton();
        
        // Fait défiler jusqu'à la catégorie active seulement si nécessaire
        if (!isInitialLoad && !preserveScroll) {
            this._scrollToActiveCategory(currentCategoryId, isInitialLoad);
        }
    }
    
    /**
     * Met à jour la visibilité du bouton global de réduction/expansion
     * @param {Array} visibleCategories - Liste des catégories visibles
     */
    updateGlobalToggleVisibility(visibleCategories) {
        this.sectionCollapseManager.updateGlobalToggleVisibility(visibleCategories);
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
     * Met à jour l'état des boutons de favoris pour toutes les tuiles d'applications
     * Cette méthode doit être appelée après toute modification des favoris
     */
    updateAllFavoriteButtons() {
        // Mettre à jour les boutons dans les sections normales
        document.querySelectorAll('.app-tile:not([data-group-id])').forEach(tile => {
            const appId = tile.getAttribute('data-app-id');
            if (!appId) return;
            
            const favoriteButton = tile.querySelector('.app-favorite-toggle');
            if (!favoriteButton) return;
            
            // Vérifier si l'application est en favoris
            const isFavorite = window.appController && 
                            window.appController.favoritesModel && 
                            window.appController.favoritesModel.isFavorite(appId);
            
            // Mettre à jour l'apparence du bouton
            if (isFavorite) {
                favoriteButton.innerHTML = '<i class="fas fa-star"></i>';
                favoriteButton.setAttribute('title', 'Retirer des favoris');
                favoriteButton.setAttribute('aria-label', 'Retirer des favoris');
                favoriteButton.classList.add('is-favorite');
            } else {
                favoriteButton.innerHTML = '<i class="far fa-star"></i>';
                favoriteButton.setAttribute('title', 'Ajouter aux favoris');
                favoriteButton.setAttribute('aria-label', 'Ajouter aux favoris');
                favoriteButton.classList.remove('is-favorite');
            }
        });
        
        // Si nous avons un SearchManager actif, mettre également à jour les résultats de recherche
        if (window.appController && window.appController.searchManager) {
            window.appController.searchManager._updateFavoriteButtons();
        }
    }
    
    /**
     * Met à jour l'état des boutons de favoris pour une application spécifique
     * @param {string} appId - ID de l'application à mettre à jour
     */
    updateFavoriteButtonsForApp(appId) {
        if (!appId) return;
        
        // Récupérer l'état actuel de l'application
        const isFavorite = window.appController && 
                        window.appController.favoritesModel && 
                        window.appController.favoritesModel.isFavorite(appId);
        
        // Mettre à jour tous les boutons pour cette application
        document.querySelectorAll(`.app-tile[data-app-id="${appId}"] .app-favorite-toggle`).forEach(button => {
            if (isFavorite) {
                button.innerHTML = '<i class="fas fa-star"></i>';
                button.setAttribute('title', 'Retirer des favoris');
                button.setAttribute('aria-label', 'Retirer des favoris');
                button.classList.add('is-favorite');
            } else {
                button.innerHTML = '<i class="far fa-star"></i>';
                button.setAttribute('title', 'Ajouter aux favoris');
                button.setAttribute('aria-label', 'Ajouter aux favoris');
                button.classList.remove('is-favorite');
            }
        });
        
        // Mettre à jour les résultats de recherche correspondants
        document.querySelectorAll(`.search-result-item[data-app-id="${appId}"] .search-result-favorite`).forEach(button => {
            if (isFavorite) {
                button.innerHTML = '<i class="fas fa-star"></i>';
                button.setAttribute('title', 'Retirer des favoris');
                button.setAttribute('aria-label', 'Retirer des favoris');
                button.classList.add('is-favorite');
            } else {
                button.innerHTML = '<i class="far fa-star"></i>';
                button.setAttribute('title', 'Ajouter aux favoris');
                button.setAttribute('aria-label', 'Ajouter aux favoris');
                button.classList.remove('is-favorite');
            }
        });
    }
    
    /**
     * S'assure qu'une section de catégorie est dépliée
     * @param {string} categoryId - ID de la catégorie
     * @returns {boolean} true si une modification a été effectuée
     */
    ensureSectionExpanded(categoryId) {
        return this.sectionCollapseManager.ensureSectionExpanded(categoryId);
    }
}