/**
 * @fileoverview Configuration centrale de l'application
 * Contient les paramètres globaux et chargement des catégories
 */

/**
 * Configuration globale de l'application
 * @namespace APP_CONFIG
 */
const APP_CONFIG = {
    /**
     * Nom de l'application
     * @type {string}
     */
    APP_NAME: 'Dashboard Entreprise',
    
    /**
     * Ordre d'affichage des catégories
     * @type {Array<string>}
     */
    CATEGORY_ORDER: ['gestion', 'outils', 'correcteur', 'opti', 'secuopti', 'opc', 'goal'],
    
    /**
     * Catégorie par défaut à afficher au chargement
     * @type {string}
     */
    DEFAULT_CATEGORY: 'gestion',
    
    /**
     * Icônes par défaut pour les catégories
     * @type {Object}
     */
    CATEGORY_ICONS: {
        'opti': 'fas fa-server',
        'secuopti': 'fas fa-shield-alt',
        'opc': 'fa-solid fa-server',
        'gestion': 'fas fa-tasks',
        'correcteur': 'fas fa-language',
        'goal': 'fas fa-bullseye',
        'outils': 'fas fa-tools'
    }
};

/**
 * Charge toutes les catégories disponibles
 * @returns {Object} Objet contenant toutes les catégories
 */
function loadCategories() {
    const categories = {};
    
    try {
        // Vérifier et ajouter chaque catégorie si elle existe dans le scope global
        if (typeof OPTI_DATA !== 'undefined') categories.opti = OPTI_DATA;
        if (typeof SECUOPTI_DATA !== 'undefined') categories.secuopti = SECUOPTI_DATA;
        if (typeof OPC_DATA !== 'undefined') categories.opc = OPC_DATA;
        if (typeof GESTION_DATA !== 'undefined') categories.gestion = GESTION_DATA;
        if (typeof CORRECTEUR_DATA !== 'undefined') categories.correcteur = CORRECTEUR_DATA;
        if (typeof GOAL_DATA !== 'undefined') categories.goal = GOAL_DATA;
        if (typeof OUTILS_DATA !== 'undefined') categories.outils = OUTILS_DATA;
        
        // Vérifier si des catégories ont été chargées
        if (Object.keys(categories).length === 0) {
            console.error("Aucune catégorie n'a pu être chargée. Vérifiez que les fichiers de données sont correctement inclus dans index.html");
        }
    } catch (e) {
        console.error("Erreur lors du chargement des catégories:", e);
    }
    
    return categories;
}

/**
 * Données des catégories et de leurs applications
 * @type {Object}
 */
const CATEGORIES_DATA = loadCategories();