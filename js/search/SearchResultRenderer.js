/**
 * @fileoverview Gestionnaire d'affichage des résultats de recherche
 * S'occupe de la création et du rendu des résultats de recherche dans l'interface
 */

/**
 * @class SearchResultRenderer
 * Gère la création et l'affichage des résultats de recherche
 */
class SearchResultRenderer {
    /**
     * Crée une instance du gestionnaire de résultats de recherche
     * @param {SearchCore} searchCore - Moteur de recherche de base
     * @constructor
     */
    constructor(searchCore) {
        /**
         * Moteur de recherche de base
         * @type {SearchCore}
         * @private
         */
        this._searchCore = searchCore;
    }
    
    /**
     * Affiche les résultats de la recherche
     * @param {Array} results - Résultats de la recherche
     * @param {string} searchTerm - Terme de recherche pour la mise en évidence
     * @param {HTMLElement} container - Conteneur pour les résultats
     * @param {Function} itemClickCallback - Fonction à appeler lors du clic sur un résultat
     * @param {Function} favoriteToggleCallback - Fonction à appeler pour basculer un favori
     * @param {Function} groupSelectorCallback - Fonction à appeler pour afficher le sélecteur de groupe
     */
    displayResults(results, searchTerm, container, itemClickCallback, favoriteToggleCallback, groupSelectorCallback) {
        if (!container) return;
        
        // Vider les résultats précédents
        container.innerHTML = '';
        
        // Si aucun résultat
        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-no-results';
            noResults.textContent = 'Aucun résultat trouvé';
            container.appendChild(noResults);
            return;
        }
        
        // Afficher le nombre de résultats
        const resultCount = document.createElement('div');
        resultCount.className = 'search-result-count';
        resultCount.textContent = `${results.length} résultat${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`;
        container.appendChild(resultCount);
        
        // Regrouper les résultats par catégorie
        const resultsByCategory = this._searchCore.groupResultsByCategory(results);
        
        // Afficher les résultats par catégorie
        for (const [categoryName, categoryResults] of Object.entries(resultsByCategory)) {
            // Ajouter un titre de catégorie si plusieurs catégories
            if (Object.keys(resultsByCategory).length > 1) {
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'search-result-category-header';
                categoryHeader.textContent = categoryName;
                container.appendChild(categoryHeader);
            }
            
            // Créer un élément pour chaque résultat de cette catégorie
            for (const result of categoryResults) {
                const resultItem = this._createResultItem(
                    result, 
                    searchTerm, 
                    itemClickCallback, 
                    favoriteToggleCallback,
                    groupSelectorCallback
                );
                container.appendChild(resultItem);
            }
        }
    }
    
    /**
     * Affiche l'historique des recherches
     * @param {Array} history - Historique des recherches
     * @param {HTMLElement} container - Conteneur pour l'historique
     * @param {Function} historyItemCallback - Fonction à appeler lors du clic sur un élément d'historique
     */
    displaySearchHistory(history, container, historyItemCallback) {
        if (!container || history.length === 0) return;
        
        // Vider le conteneur
        container.innerHTML = '';
        
        // Créer la section d'historique
        const historySection = document.createElement('div');
        historySection.className = 'search-history';
        
        // Titre de la section
        const historyTitle = document.createElement('div');
        historyTitle.className = 'search-history-title';
        historyTitle.textContent = 'Recherches récentes';
        historySection.appendChild(historyTitle);
        
        // Liste des éléments d'historique
        const historyItems = document.createElement('div');
        historyItems.className = 'search-history-items';
        
        // Ajouter chaque élément d'historique
        for (const item of history) {
            const historyItem = document.createElement('div');
            historyItem.className = 'search-history-item';
            historyItem.innerHTML = `<i class="fas fa-history"></i> ${item.term}`;
            
            // Ajouter un écouteur pour utiliser le terme
            historyItem.addEventListener('click', () => {
                if (historyItemCallback) {
                    historyItemCallback(item.term);
                }
            });
            
            historyItems.appendChild(historyItem);
        }
        
        historySection.appendChild(historyItems);
        container.appendChild(historySection);
    }
    
    /**
     * Crée un élément de résultat de recherche
     * @param {Object} app - Données de l'application
     * @param {string} searchTerm - Terme de recherche pour la mise en évidence
     * @param {Function} itemClickCallback - Fonction à appeler lors du clic sur un résultat
     * @param {Function} favoriteToggleCallback - Fonction à appeler pour basculer un favori
     * @param {Function} groupSelectorCallback - Fonction à appeler pour afficher le sélecteur de groupe
     * @returns {HTMLElement} Élément de résultat
     * @private
     */
    _createResultItem(app, searchTerm, itemClickCallback, favoriteToggleCallback, groupSelectorCallback) {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.setAttribute('data-app-id', app.id);
        resultItem.setAttribute('data-category-id', app.categoryId);
        
        // Rendre l'élément glissable
        resultItem.setAttribute('draggable', 'true');
        
        // Configurer les événements de glisser-déposer
        this._setupDragEvents(resultItem, app);
        
        // Icône de l'application
        const iconElement = document.createElement('div');
        iconElement.className = 'search-result-icon';
        iconElement.style.backgroundColor = app.color || '#3498db';
        
        // Utilise l'icône spécifiée ou une icône par défaut
        const iconClass = app.icon.startsWith('fa') ? app.icon : `fas fa-${app.icon}`;
        iconElement.innerHTML = `<i class="${iconClass}"></i>`;
        
        // Contenu du résultat (nom, catégorie, description)
        const contentElement = document.createElement('div');
        contentElement.className = 'search-result-content';
        
        // Nom de l'application avec mise en évidence
        const nameElement = document.createElement('div');
        nameElement.className = 'search-result-name';
        nameElement.innerHTML = this._searchCore.highlightText(app.name, searchTerm);
        
        // Catégorie de l'application
        const categoryElement = document.createElement('div');
        categoryElement.className = 'search-result-category';
        categoryElement.textContent = app.categoryName;
        
        contentElement.appendChild(nameElement);
        contentElement.appendChild(categoryElement);
        
        // Description de l'application (si disponible)
        if (app.description) {
            const descriptionElement = document.createElement('div');
            descriptionElement.className = 'search-result-description';
            descriptionElement.innerHTML = this._searchCore.highlightText(app.description, searchTerm);
            contentElement.appendChild(descriptionElement);
        }
        
        // Tags de l'application (si disponibles)
        if (app.tags && Array.isArray(app.tags) && app.tags.length > 0) {
            const tagsElement = this._createTagsElement(app.tags, searchTerm);
            contentElement.appendChild(tagsElement);
        }
        
        // Bouton de favoris
        const favoriteButton = this._createFavoriteButton(app, favoriteToggleCallback, groupSelectorCallback);
        
        // Ajouter les éléments au résultat
        resultItem.appendChild(iconElement);
        resultItem.appendChild(contentElement);
        resultItem.appendChild(favoriteButton);
        
        // Ajouter un écouteur de clic pour ouvrir l'application
        resultItem.addEventListener('click', () => {
            if (itemClickCallback) {
                itemClickCallback(app);
            }
        });
        
        return resultItem;
    }
    
    /**
     * Crée l'élément des tags pour un résultat de recherche
     * @param {Array} tags - Liste des tags
     * @param {string} searchTerm - Terme de recherche pour la mise en évidence
     * @returns {HTMLElement} Élément des tags
     * @private
     */
    _createTagsElement(tags, searchTerm) {
        const tagsElement = document.createElement('div');
        tagsElement.className = 'search-result-tags';
        
        // Limiter le nombre de tags affichés pour ne pas surcharger l'interface
        const displayTags = tags.slice(0, 3);
        
        displayTags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'search-result-tag';
            tagElement.innerHTML = this._searchCore.highlightText(tag, searchTerm);
            tagsElement.appendChild(tagElement);
        });
        
        return tagsElement;
    }
    
    /**
     * Crée le bouton de favoris pour un résultat de recherche
     * @param {Object} app - Données de l'application
     * @param {Function} favoriteToggleCallback - Fonction à appeler pour basculer un favori
     * @param {Function} groupSelectorCallback - Fonction à appeler pour afficher le sélecteur de groupe
     * @returns {HTMLElement} Bouton de favoris
     * @private
     */
    _createFavoriteButton(app, favoriteToggleCallback, groupSelectorCallback) {
        const favoriteButton = document.createElement('button');
        favoriteButton.className = 'search-result-favorite';
        
        // Vérifier si l'app est déjà en favoris
        const isFavorite = this._searchCore.isAppFavorite(app.id);
        
        // Définir l'apparence et les attributs en fonction de l'état
        favoriteButton.innerHTML = isFavorite ? 
            '<i class="fas fa-star"></i>' : 
            '<i class="far fa-star"></i>';
        favoriteButton.setAttribute('title', isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris');
        favoriteButton.setAttribute('aria-label', isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris');
        
        if (isFavorite) {
            favoriteButton.classList.add('is-favorite');
        }
        
        // Ajouter l'écouteur d'événement pour le bouton de favoris
        favoriteButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Si l'app n'est pas encore en favoris, on affiche le sélecteur de groupe
            if (!isFavorite && groupSelectorCallback) {
                groupSelectorCallback(app, app.categoryId);
                return;
            }
            
            // Si l'app est déjà en favoris ou si pas de sélecteur de groupe,
            // on utilise le comportement par défaut
            if (favoriteToggleCallback) {
                favoriteToggleCallback(app.id, app.categoryId, 'general', favoriteButton);
                
                // Animation de l'étoile
                if (!isFavorite) {
                    favoriteButton.classList.add('just-added');
                    setTimeout(() => {
                        favoriteButton.classList.remove('just-added');
                    }, 500);
                }
            }
        });
        
        return favoriteButton;
    }
    
    /**
     * Configure les événements de glisser-déposer pour un résultat
     * @param {HTMLElement} resultItem - Élément de résultat
     * @param {Object} app - Données de l'application
     * @private
     */
    _setupDragEvents(resultItem, app) {
        resultItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('application/app-id', app.id);
            e.dataTransfer.setData('application/category-id', app.categoryId);
            e.dataTransfer.setData('application/is-favorite', 'false');
            
            // Ajouter la classe dragging pour les effets visuels
            resultItem.classList.add('dragging');
            
            // Ajouter un délai avant de montrer qu'un drag est en cours
            setTimeout(() => {
                // Uniquement si l'élément est toujours en train d'être glissé
                if (resultItem.classList.contains('dragging')) {
                    // Ajouter des classes pour indiquer visuellement les cibles potentielles
                    document.querySelectorAll('.favorites-group').forEach(group => {
                        group.classList.add('drag-target-highlight');
                    });
                    
                    // Et montrer un message d'aide
                    const helpMsg = document.createElement('div');
                    helpMsg.className = 'drag-help-message';
                    helpMsg.textContent = 'Glissez vers un groupe de favoris';
                    helpMsg.style.position = 'fixed';
                    helpMsg.style.top = '10px';
                    helpMsg.style.left = '50%';
                    helpMsg.style.transform = 'translateX(-50%)';
                    helpMsg.style.backgroundColor = 'rgba(0,0,0,0.7)';
                    helpMsg.style.color = 'white';
                    helpMsg.style.padding = '8px 16px';
                    helpMsg.style.borderRadius = '4px';
                    helpMsg.style.zIndex = '9999';
                    helpMsg.style.opacity = '0';
                    helpMsg.style.transition = 'opacity 0.3s ease';
                    
                    document.body.appendChild(helpMsg);
                    
                    // Afficher progressivement le message
                    setTimeout(() => {
                        helpMsg.style.opacity = '1';
                    }, 10);
                    
                    // Stocker une référence au message pour le supprimer plus tard
                    resultItem.helpMessage = helpMsg;
                }
            }, 200);
        });
        
        resultItem.addEventListener('dragend', () => {
            // Retirer la classe dragging
            resultItem.classList.remove('dragging');
            
            // Supprimer le message d'aide si présent
            if (resultItem.helpMessage) {
                resultItem.helpMessage.remove();
                delete resultItem.helpMessage;
            }
            
            // Nettoyer toutes les classes liées au drag-and-drop
            document.querySelectorAll('.drag-over, .drag-active, .group-drag-over').forEach(element => {
                element.classList.remove('drag-over', 'drag-active', 'group-drag-over');
            });
        });
    }
    
    /**
     * Met à jour l'état des boutons de favoris dans les résultats de recherche
     * @param {HTMLElement} container - Conteneur des résultats
     */
    updateFavoriteButtons(container) {
        if (!container) return;
        
        const resultItems = container.querySelectorAll('.search-result-item');
        
        resultItems.forEach(item => {
            const appId = item.getAttribute('data-app-id');
            if (!appId) return;
            
            const favoriteButton = item.querySelector('.search-result-favorite');
            if (!favoriteButton) return;
            
            // Vérifier l'état actuel
            const isFavorite = this._searchCore.isAppFavorite(appId);
            
            // Mettre à jour l'apparence
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
    }
}

// Exporte la classe pour une utilisation dans d'autres modules
window.SearchResultRenderer = SearchResultRenderer;