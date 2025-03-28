/**
 * @fileoverview Interface utilisateur des options d'affichage
 * Gère l'affichage et les interactions du panneau d'options
 */

/**
 * @class DisplayOptionsUI
 * Gère l'interface utilisateur des options d'affichage
 */
class DisplayOptionsUI {
    /**
     * Crée une instance de l'interface des options d'affichage
     * @param {DisplayCore} displayCore - Référence au core d'affichage
     * @constructor
     */
    constructor(displayCore) {
        /**
         * Référence au core d'affichage
         * @type {DisplayCore}
         * @private
         */
        this._displayCore = displayCore;
        
        /**
         * Élément de la carte d'options
         * @type {HTMLElement|null}
         * @private
         */
        this._optionsCard = null;
        
        /**
         * Élément du bouton d'ouverture de la carte
         * @type {HTMLElement|null}
         * @private
         */
        this._toggleButton = null;
        
        /**
         * Élément de sélection de densité
         * @type {HTMLElement|null}
         * @private
         */
        this._densitySelector = null;
        
        /**
         * Élément de sélection de disposition
         * @type {HTMLElement|null}
         * @private
         */
        this._layoutSelector = null;
        
        // Crée et ajoute le bouton et la carte d'options à l'interface
        this._createDisplayOptionsUI();
    }
    
    /**
     * Crée et ajoute le bouton et la carte d'options à l'interface
     * @private
     */
    _createDisplayOptionsUI() {
        // Création du bouton de bascule
        this._createToggleButton();
        
        // Création de la carte d'options
        this._createOptionsCard();
    }
    
    /**
     * Crée le bouton pour ouvrir/fermer la carte d'options
     * @private
     */
    _createToggleButton() {
        const button = document.createElement('button');
        button.className = 'display-toggle-button';
        button.setAttribute('aria-label', 'Options d\'affichage');
        button.innerHTML = '<i class="fas fa-palette"></i>';
        
        button.addEventListener('click', () => {
            this._toggleCard();
        });
        
        document.body.appendChild(button);
        this._toggleButton = button;
    }
    
    /**
     * Crée la carte d'options d'affichage
     * @private
     */
    _createOptionsCard() {
        const card = document.createElement('div');
        card.className = 'display-options-card closed';
        
        // En-tête de la carte
        const header = document.createElement('div');
        header.className = 'display-options-card-header';
        
        const title = document.createElement('div');
        title.className = 'display-options-card-title';
        title.textContent = 'Options d\'affichage';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'display-options-card-close';
        closeButton.setAttribute('aria-label', 'Fermer');
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.addEventListener('click', () => {
            this._closeCard();
        });
        
        header.appendChild(title);
        header.appendChild(closeButton);
        card.appendChild(header);
        
        // Contenu de la carte
        const content = document.createElement('div');
        content.className = 'display-options-wrapper';
        
        // Ajoute le sélecteur de densité
        this._densitySelector = this._createSelector(
            'density-selector',
            'Densité d\'affichage',
            this._displayCore.getDensityOptions(),
            this._displayCore.getDensity(),
            (value) => this._displayCore.setDensity(value)
        );
        content.appendChild(this._densitySelector);
        
        // Ajoute le sélecteur de disposition
        this._layoutSelector = this._createSelector(
            'layout-selector',
            'Disposition',
            this._displayCore.getLayoutOptions(),
            this._displayCore.getLayout(),
            (value) => this._displayCore.setLayout(value)
        );
        content.appendChild(this._layoutSelector);
        
        // Ajoute le sélecteur de thème
        const themeContainer = document.createElement('div');
        themeContainer.className = 'display-selector-container';
        themeContainer.id = 'themeToggleContainer';
        
        const themeLabel = document.createElement('label');
        themeLabel.className = 'display-selector-label';
        themeLabel.textContent = 'Thème';
        themeContainer.appendChild(themeLabel);
        
        // Le contenu du themeContainer sera rempli par ThemeManager
        content.appendChild(themeContainer);
        
        card.appendChild(content);
        document.body.appendChild(card);
        this._optionsCard = card;
    }
    
    /**
     * Crée un sélecteur d'option d'affichage
     * @param {string} id - ID du sélecteur
     * @param {string} label - Libellé du sélecteur
     * @param {Object} options - Options disponibles (clé-valeur)
     * @param {string} currentValue - Valeur actuelle
     * @param {Function} changeHandler - Fonction à appeler lors du changement
     * @returns {HTMLElement} Élément sélecteur créé
     * @private
     */
    _createSelector(id, label, options, currentValue, changeHandler) {
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'display-selector-container';
        selectorContainer.id = `${id}-container`;
        
        // Libellé
        const labelElement = document.createElement('label');
        labelElement.htmlFor = id;
        labelElement.className = 'display-selector-label';
        labelElement.textContent = label;
        selectorContainer.appendChild(labelElement);
        
        // Sélecteur
        const select = document.createElement('select');
        select.id = id;
        select.className = 'display-selector';
        select.setAttribute('aria-label', label);
        
        // Ajoute les options
        for (const [value, text] of Object.entries(options)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            option.selected = value === currentValue;
            select.appendChild(option);
        }
        
        // Ajoute l'écouteur d'événement pour le changement
        select.addEventListener('change', () => changeHandler(select.value));
        
        selectorContainer.appendChild(select);
        
        return selectorContainer;
    }
    
    /**
     * Met à jour le sélecteur de densité
     * @param {string} density - Nouvelle densité
     */
    updateDensitySelector(density) {
        if (this._densitySelector) {
            const select = this._densitySelector.querySelector('select');
            if (select && select.value !== density) {
                select.value = density;
            }
        }
    }
    
    /**
     * Met à jour le sélecteur de disposition
     * @param {string} layout - Nouvelle disposition
     */
    updateLayoutSelector(layout) {
        if (this._layoutSelector) {
            const select = this._layoutSelector.querySelector('select');
            if (select && select.value !== layout) {
                select.value = layout;
            }
        }
    }
    
    /**
     * Ouvre la carte d'options
     * @private
     */
    _openCard() {
        if (!this._optionsCard) return;
        
        this._displayCore.setCardOpen(true);
        this._optionsCard.classList.remove('closed');
        this._optionsCard.classList.add('open');
    }
    
    /**
     * Ferme la carte d'options
     * @private
     */
    _closeCard() {
        if (!this._optionsCard) return;
        
        this._displayCore.setCardOpen(false);
        this._optionsCard.classList.remove('open');
        this._optionsCard.classList.add('closed');
    }
    
    /**
     * Bascule l'état d'ouverture de la carte
     * @private
     */
    _toggleCard() {
        if (this._displayCore.isCardOpen()) {
            this._closeCard();
        } else {
            this._openCard();
        }
    }
    
    /**
     * Met à jour la visibilité de la carte selon l'état courant
     * @param {boolean} isOpen - État d'ouverture
     */
    updateCardVisibility(isOpen) {
        if (!this._optionsCard) return;
        
        if (isOpen) {
            this._optionsCard.classList.remove('closed');
            this._optionsCard.classList.add('open');
        } else {
            this._optionsCard.classList.remove('open');
            this._optionsCard.classList.add('closed');
        }
    }
}