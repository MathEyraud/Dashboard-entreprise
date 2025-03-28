/**
 * @fileoverview Gestionnaire de sélection de groupe
 * Interface utilisateur pour sélectionner un groupe lors de l'ajout aux favoris
 */

/**
 * @class GroupSelectorUI
 * Gère l'interface utilisateur pour la sélection de groupe
 */
class GroupSelectorUI {
    /**
     * Crée une instance du gestionnaire de sélection de groupe
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
         * Élément du sélecteur de groupe
         * @type {HTMLElement|null}
         * @private
         */
        this._selectorElement = null;
    }
    
    /**
     * Affiche le sélecteur de groupe
     * @param {Object} app - Données de l'application
     * @param {string} categoryId - ID de la catégorie
     * @param {Function} favoriteCallback - Fonction de callback pour l'ajout aux favoris
     * @param {Function} groupManagementCallback - Fonction de callback pour la gestion des groupes
     */
    showGroupSelector(app, categoryId, favoriteCallback, groupManagementCallback) {
        // Récupère ou crée l'élément du sélecteur de groupe
        if (!this._selectorElement) {
            this._selectorElement = this._createGroupSelectorElement();
        }
        
        // Vide le contenu du sélecteur
        const groupsListElement = this._selectorElement.querySelector('.groups-list');
        groupsListElement.innerHTML = '';
        
        // Ajoute l'aperçu de l'application
        const appPreviewElement = this._selectorElement.querySelector('.app-preview');
        this._updateAppPreview(appPreviewElement, app, categoryId);
        
        // Récupère la liste des groupes de favoris
        const groups = window.appController.favoritesModel.getGroups();
        
        // Ajoute chaque groupe à la liste
        groups.forEach(group => {
            const groupElement = this._createGroupOption(group, app, categoryId, favoriteCallback);
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
        this._selectorElement.classList.add('active');
        
        // Ajoute un écouteur pour fermer avec Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeGroupSelector();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    /**
     * Ferme le sélecteur de groupe
     */
    closeGroupSelector() {
        if (this._selectorElement) {
            this._selectorElement.classList.remove('active');
        }
    }
    
    /**
     * Crée l'élément DOM du sélecteur de groupe
     * @returns {HTMLElement} Élément du sélecteur créé
     * @private
     */
    _createGroupSelectorElement() {
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
    }
    
    /**
     * Met à jour l'aperçu de l'application dans le sélecteur
     * @param {HTMLElement} previewElement - Élément d'aperçu
     * @param {Object} app - Données de l'application
     * @param {string} categoryId - ID de la catégorie
     * @private
     */
    _updateAppPreview(previewElement, app, categoryId) {
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
    }
    
    /**
     * Crée une option de groupe dans le sélecteur
     * @param {Object} group - Données du groupe
     * @param {Object} app - Données de l'application
     * @param {string} categoryId - ID de la catégorie
     * @param {Function} favoriteCallback - Fonction de callback pour l'ajout aux favoris
     * @returns {HTMLElement} Élément de l'option créée
     * @private
     */
    _createGroupOption(group, app, categoryId, favoriteCallback) {
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
    }
}