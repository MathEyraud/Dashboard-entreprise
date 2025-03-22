/**
 * @fileoverview Gestionnaire des groupes de favoris
 * Gère l'interface utilisateur pour créer et modifier des groupes de favoris
 */

/**
 * @class FavoritesGroupManager
 * Gère l'interface utilisateur des groupes de favoris
 */
class FavoritesGroupManager {
    /**
     * Crée une instance du gestionnaire de groupes de favoris
     * @param {FavoritesModel} favoritesModel - Modèle de gestion des favoris
     * @param {Function} updateCallback - Fonction à appeler après modification
     * @constructor
     */
    constructor(favoritesModel, updateCallback) {
        /**
         * Modèle de gestion des favoris
         * @type {FavoritesModel}
         * @private
         */
        this._favoritesModel = favoritesModel;
        
        /**
         * Fonction de rappel après modification
         * @type {Function}
         * @private
         */
        this._updateCallback = updateCallback;
        
        /**
         * Modale de gestion des groupes
         * @type {HTMLElement|null}
         * @private
         */
        this._modal = null;
        
        /**
         * ID du groupe en cours d'édition
         * @type {string|null}
         * @private
         */
        this._currentGroupId = null;
        
        // Couleurs prédéfinies pour les groupes
        this.predefinedColors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', 
            '#1abc9c', '#d35400', '#16a085', '#8e44ad', '#2980b9',
            '#27ae60', '#c0392b', '#f1c40f', '#7f8c8d', '#e67e22'
        ];
        
        // Icônes prédéfinies pour les groupes
        this.predefinedIcons = [
            'star', 'folder', 'bookmark', 'heart', 'paper-plane',
            'flag', 'tag', 'bullseye', 'check', 'clipboard',
            'code', 'cog', 'database', 'desktop', 'file',
            'globe', 'home', 'image', 'key', 'link',
            'map', 'paperclip', 'puzzle-piece', 'rocket', 'shield-alt',
            'shopping-cart', 'signal', 'sticky-note', 'trophy', 'user',
            'wrench'
        ];
        
        // Crée la modale
        this._createModal();
    }
    
    /**
     * Crée la modale de gestion des groupes
     * @private
     */
    _createModal() {
        // Vérifie si la modale existe déjà
        if (document.getElementById('groupManagementModal')) {
            return;
        }
        
        // Crée la modale
        const modal = document.createElement('div');
        modal.id = 'groupManagementModal';
        modal.className = 'group-management-modal';
        
        // Crée le formulaire
        const form = document.createElement('div');
        form.className = 'group-management-form';
        
        // En-tête du formulaire
        const header = document.createElement('div');
        header.className = 'group-management-header';
        
        const title = document.createElement('h3');
        title.className = 'group-management-title';
        title.textContent = 'Nouveau groupe';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'group-management-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.closeModal());
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        form.appendChild(header);
        
        // Champ de nom
        const nameField = document.createElement('div');
        nameField.className = 'group-form-field';
        
        const nameLabel = document.createElement('label');
        nameLabel.className = 'group-form-label';
        nameLabel.htmlFor = 'groupName';
        nameLabel.textContent = 'Nom du groupe';
        
        const nameInput = document.createElement('input');
        nameInput.className = 'group-form-input';
        nameInput.id = 'groupName';
        nameInput.type = 'text';
        nameInput.placeholder = 'Ex: Travail, Personnel, Projets...';
        
        nameField.appendChild(nameLabel);
        nameField.appendChild(nameInput);
        form.appendChild(nameField);
        
        // Sélection de couleur
        const colorField = document.createElement('div');
        colorField.className = 'group-form-field';
        
        const colorLabel = document.createElement('label');
        colorLabel.className = 'group-form-label';
        colorLabel.htmlFor = 'groupColor';
        colorLabel.textContent = 'Couleur du groupe';
        
        const colorSelect = document.createElement('div');
        colorSelect.className = 'group-color-select';
        colorSelect.id = 'groupColor';
        
        // Ajoute les options de couleur
        this.predefinedColors.forEach((color, index) => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.style.backgroundColor = color;
            colorOption.setAttribute('data-color', color);
            
            // Si c'est la première couleur, la sélectionner par défaut
            if (index === 0) {
                colorOption.classList.add('selected');
            }
            
            // Au clic, sélectionner la couleur
            colorOption.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(option => {
                    option.classList.remove('selected');
                });
                colorOption.classList.add('selected');
            });
            
            colorSelect.appendChild(colorOption);
        });
        
        colorField.appendChild(colorLabel);
        colorField.appendChild(colorSelect);
        form.appendChild(colorField);
        
        // Sélection d'icône
        const iconField = document.createElement('div');
        iconField.className = 'group-form-field';
        
        const iconLabel = document.createElement('label');
        iconLabel.className = 'group-form-label';
        iconLabel.htmlFor = 'groupIcon';
        iconLabel.textContent = 'Icône du groupe';
        
        const iconSelect = document.createElement('div');
        iconSelect.className = 'group-icon-select';
        iconSelect.id = 'groupIcon';
        
        // Ajoute les options d'icône
        this.predefinedIcons.forEach((icon, index) => {
            const iconOption = document.createElement('div');
            iconOption.className = 'icon-option';
            iconOption.innerHTML = `<i class="fas fa-${icon}"></i>`;
            iconOption.setAttribute('data-icon', icon);
            
            // Si c'est la première icône, la sélectionner par défaut
            if (index === 0) {
                iconOption.classList.add('selected');
            }
            
            // Au clic, sélectionner l'icône
            iconOption.addEventListener('click', () => {
                document.querySelectorAll('.icon-option').forEach(option => {
                    option.classList.remove('selected');
                });
                iconOption.classList.add('selected');
            });
            
            iconSelect.appendChild(iconOption);
        });
        
        iconField.appendChild(iconLabel);
        iconField.appendChild(iconSelect);
        form.appendChild(iconField);
        
        // Actions du formulaire
        const actions = document.createElement('div');
        actions.className = 'group-management-actions';
        
        // Bouton "Supprimer" (masqué par défaut)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'group-delete-btn';
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.style.display = 'none';
        deleteBtn.addEventListener('click', () => {
            if (this._currentGroupId) {
                // Confirmation avant suppression
                if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
                    this._favoritesModel.removeGroup(this._currentGroupId, true);
                    this.closeModal();
                    if (this._updateCallback) {
                        this._updateCallback();
                    }
                }
            }
        });
        
        // Bouton "Annuler"
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'group-cancel-btn';
        cancelBtn.textContent = 'Annuler';
        cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Bouton "Enregistrer"
        const saveBtn = document.createElement('button');
        saveBtn.className = 'group-save-btn';
        saveBtn.textContent = 'Enregistrer';
        saveBtn.addEventListener('click', () => {
            this._saveGroup();
        });
        
        actions.appendChild(deleteBtn);
        actions.appendChild(cancelBtn);
        actions.appendChild(saveBtn);
        form.appendChild(actions);
        
        modal.appendChild(form);
        document.body.appendChild(modal);
        
        this._modal = modal;
        
        // Fermer la modale quand on clique en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }
    
    /**
     * Ouvre la modale pour ajouter un groupe
     */
    openAddModal() {
        if (!this._modal) {
            this._createModal();
        }
        
        // Réinitialise le formulaire
        const form = this._modal.querySelector('.group-management-form');
        form.reset && form.reset();
        
        // Met à jour le titre
        this._modal.querySelector('.group-management-title').textContent = 'Nouveau groupe';
        
        // Cache le bouton de suppression
        this._modal.querySelector('.group-delete-btn').style.display = 'none';
        
        // Réinitialise l'ID du groupe
        this._currentGroupId = null;
        
        // Sélectionne la première couleur et icône par défaut
        document.querySelectorAll('.color-option').forEach((option, index) => {
            option.classList.toggle('selected', index === 0);
        });
        
        document.querySelectorAll('.icon-option').forEach((option, index) => {
            option.classList.toggle('selected', index === 0);
        });
        
        // Réinitialise les champs
        this._modal.querySelector('#groupName').value = '';
        
        // Affiche la modale
        this._modal.classList.add('active');
        
        // Focus sur le champ de nom
        setTimeout(() => {
            this._modal.querySelector('#groupName').focus();
        }, 100);
    }
    
    /**
     * Ouvre la modale pour éditer un groupe
     * @param {string} groupId - ID du groupe à éditer
     */
    openEditModal(groupId) {
        if (!this._modal) {
            this._createModal();
        }
        
        // Récupère les données du groupe
        const groups = this._favoritesModel.getGroups();
        const group = groups.find(g => g.id === groupId);
        
        if (!group) {
            console.error(`Groupe non trouvé: ${groupId}`);
            return;
        }
        
        // Met à jour le titre
        this._modal.querySelector('.group-management-title').textContent = 'Modifier le groupe';
        
        // Affiche le bouton de suppression
        this._modal.querySelector('.group-delete-btn').style.display = 'block';
        
        // Stocke l'ID du groupe
        this._currentGroupId = groupId;
        
        // Remplit les champs
        this._modal.querySelector('#groupName').value = group.name;
        
        // Sélectionne la couleur
        document.querySelectorAll('.color-option').forEach(option => {
            const color = option.getAttribute('data-color');
            option.classList.toggle('selected', color === group.color);
        });
        
        // Sélectionne l'icône
        document.querySelectorAll('.icon-option').forEach(option => {
            const icon = option.getAttribute('data-icon');
            option.classList.toggle('selected', icon === group.icon);
        });
        
        // Affiche la modale
        this._modal.classList.add('active');
        
        // Focus sur le champ de nom
        setTimeout(() => {
            this._modal.querySelector('#groupName').focus();
        }, 100);
    }
    
    /**
     * Ferme la modale
     */
    closeModal() {
        if (this._modal) {
            this._modal.classList.remove('active');
        }
    }
    
    /**
     * Sauvegarde le groupe
     * @private
     */
    _saveGroup() {
        // Récupère les valeurs
        const name = this._modal.querySelector('#groupName').value.trim();
        
        // Valide les champs
        if (!name) {
            alert('Veuillez saisir un nom pour le groupe');
            return;
        }
        
        // Récupère la couleur sélectionnée
        const selectedColor = this._modal.querySelector('.color-option.selected');
        const color = selectedColor ? selectedColor.getAttribute('data-color') : this.predefinedColors[0];
        
        // Récupère l'icône sélectionnée
        const selectedIcon = this._modal.querySelector('.icon-option.selected');
        const icon = selectedIcon ? selectedIcon.getAttribute('data-icon') : this.predefinedIcons[0];
        
        // Création ou mise à jour du groupe
        if (this._currentGroupId) {
            // Mise à jour d'un groupe existant
            this._favoritesModel.updateGroup(this._currentGroupId, { name, color, icon });
        } else {
            // Création d'un nouveau groupe
            this._favoritesModel.addGroup({ name, color, icon });
        }
        
        // Ferme la modale
        this.closeModal();
        
        // Appelle le callback de mise à jour
        if (this._updateCallback) {
            this._updateCallback();
        }
    }
    
    /**
     * Gère les actions de groupe
     * @param {string} action - Type d'action (add, edit, delete, moveToGroup)
     * @param {string} [id=null] - ID du groupe ou de l'app selon l'action
     * @param {string} [extraId=null] - ID supplémentaire (groupId pour moveToGroup)
     */
    handleGroupAction(action, id = null, extraId = null) {

        switch (action) {
            case 'add':
                this.openAddModal();
                break;
            
            case 'edit':
                this.openEditModal(id);
                break;
            
            case 'delete':
                if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
                    this._favoritesModel.removeGroup(id, true);
                    if (this._updateCallback) {
                        this._updateCallback();
                    }
                }
                break;
            
            case 'moveToGroup':
                if (id && extraId) {
                    this._favoritesModel.changeFavoriteGroup(id, extraId);
                    if (this._updateCallback) {
                        this._updateCallback();
                    }
                }
                break;
            
            default:
                console.error(`Action non reconnue: ${action}`);
        }
    }
}