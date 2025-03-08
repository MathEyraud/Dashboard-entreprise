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
     */
    setupEventListeners(categoryChangeCallback) {
        // L'écouteur sera configuré lors de la création du menu de navigation
        this.categoryChangeCallback = categoryChangeCallback;
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
     * Met à jour l'affichage de toutes les catégories
     * @param {Array} categories - Liste des catégories ordonnées
     * @param {string} currentCategoryId - ID de la catégorie actuellement sélectionnée
     */
    updateCategories(categories, currentCategoryId, isInitialLoad = true) {
        if (!this.categoriesContainerElement) return;
        
        // Vide le conteneur
        this.categoriesContainerElement.innerHTML = '';
        
        // Ajoute une section pour chaque catégorie
        for (const category of categories) {
            const section = this._createCategorySection(category);
            this.categoriesContainerElement.appendChild(section);
        }
        
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
        
        // En-tête de la catégorie avec titre et lien de procédure
        const header = document.createElement('div');
        header.className = 'category-header';
        
        // Titre de la catégorie
        const title = document.createElement('h2');
        title.className = 'category-title';
        
        // Icône de la catégorie
        const icon = APP_CONFIG.CATEGORY_ICONS[category.id] || 'fas fa-folder';
        
        title.innerHTML = `<i class="${icon}"></i> ${category.name}`;
        header.appendChild(title);
        
        // Lien de procédure (si disponible)
        if (category.procedureLink) {
            const procedureLink = document.createElement('a');
            procedureLink.className = 'category-link';
            procedureLink.href = category.procedureLink;
            procedureLink.target = '_blank';
            procedureLink.rel = 'noopener noreferrer';
            procedureLink.innerHTML = `<i class="fas fa-book"></i> Procédure`;
            header.appendChild(procedureLink);
        }
        
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
                const appTile = this._createAppTile(app);
                appGrid.appendChild(appTile);
            }
        }
        
        section.appendChild(appGrid);
        
        return section;
    }
    
    /**
     * Crée une tuile d'application
     * @param {Object} app - Données de l'application
     * @returns {HTMLElement} Élément tuile créé
     * @private
     */
    _createAppTile(app) {
        const tileLink = document.createElement('a');
        tileLink.className = 'app-tile';
        tileLink.href = app.url;
        tileLink.target = '_blank';
        tileLink.rel = 'noopener noreferrer';
        tileLink.setAttribute('data-app-id', app.id);
        
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
        
        tileLink.appendChild(iconElement);
        tileLink.appendChild(nameElement);
        
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
}