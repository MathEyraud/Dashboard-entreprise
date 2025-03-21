/**
 * @fileoverview Service de modèle de recherche
 * Centralise la logique de recherche et d'indexation
 */

/**
 * @class SearchModelService
 * Service pour gérer la recherche et l'indexation des applications
 */
class SearchModelService {
    /**
     * Crée une instance du service de modèle de recherche
     * @param {CategoryModel} categoryModel - Modèle de données des catégories
     * @constructor
     */
    constructor(categoryModel) {
        /**
         * Modèle de données des catégories
         * @type {CategoryModel}
         * @private
         */
        this._categoryModel = categoryModel;
        
        /**
         * Index de recherche
         * @type {Object}
         * @private
         */
        this._searchIndex = null;
        
        // Initialise l'index de recherche
        this._buildSearchIndex();
    }
    
    /**
     * Construit l'index de recherche à partir des données des catégories
     * @private
     */
    _buildSearchIndex() {
        this._searchIndex = {
            apps: [],
            terms: {}
        };
        
        const categories = this._categoryModel.getAllCategories();
        
        // Parcourir toutes les catégories
        for (const [categoryId, category] of Object.entries(categories)) {
            if (!category.apps || !Array.isArray(category.apps)) continue;
            
            // Parcourir toutes les applications de la catégorie
            for (const app of category.apps) {
                // Ajouter l'application à l'index
                const appIndex = this._searchIndex.apps.length;
                
                this._searchIndex.apps.push({
                    ...app,
                    categoryId,
                    categoryName: category.name
                });
                
                // Indexer les termes de recherche (nom, description, tags)
                this._indexAppTerms(app, appIndex, categoryId);
            }
        }
    }
    
    /**
     * Indexe les termes de recherche pour une application
     * @param {Object} app - Données de l'application
     * @param {number} appIndex - Index de l'application dans le tableau apps
     * @param {string} categoryId - ID de la catégorie
     * @private
     */
    _indexAppTerms(app, appIndex, categoryId) {
        // Indexer le nom (poids élevé)
        this._indexTerm(app.name, appIndex, 10);
        
        // Indexer la description (poids moyen)
        if (app.description) {
            this._indexTerm(app.description, appIndex, 5);
        }
        
        // Indexer les tags (poids élevé)
        if (app.tags && Array.isArray(app.tags)) {
            for (const tag of app.tags) {
                this._indexTerm(tag, appIndex, 8);
            }
        }
        
        // Indexer la catégorie (poids faible)
        this._indexTerm(categoryId, appIndex, 3);
    }
    
    /**
     * Indexe un terme pour une application
     * @param {string} term - Terme à indexer
     * @param {number} appIndex - Index de l'application
     * @param {number} weight - Poids du terme (importance)
     * @private
     */
    _indexTerm(term, appIndex, weight) {
        if (!term) return;
        
        // Normaliser le terme
        const normalizedTerm = this._normalizeTerm(term);
        
        // Diviser en mots
        const words = normalizedTerm.split(/\s+/);
        
        // Indexer chaque mot
        for (const word of words) {
            if (word.length < 2) continue; // Ignorer les mots trop courts
            
            // Indexer le mot complet
            this._indexWord(word, appIndex, weight);
            
            // Indexer également tous les fragments du mot (pour la recherche partielle)
            // Par exemple pour "notion" : "no", "not", "noti", "notio", "notion"
            if (word.length > 2) {
                for (let i = 2; i < word.length; i++) {
                    const fragment = word.substring(0, i);
                    // Poids dégressif pour les fragments
                    const fragmentWeight = weight * (i / word.length) * 0.8;
                    this._indexWord(fragment, appIndex, fragmentWeight);
                }
            }
        }
    }

    /**
     * Indexe un mot spécifique
     * @param {string} word - Mot à indexer
     * @param {number} appIndex - Index de l'application
     * @param {number} weight - Poids du mot
     * @private
     */
    _indexWord(word, appIndex, weight) {
        if (!this._searchIndex.terms[word]) {
            this._searchIndex.terms[word] = [];
        }
        
        // Vérifier si l'application est déjà indexée pour ce terme
        const existingEntry = this._searchIndex.terms[word].find(entry => entry.appIndex === appIndex);
        
        if (existingEntry) {
            // Utiliser le poids le plus élevé si l'application est déjà indexée
            existingEntry.weight = Math.max(existingEntry.weight, weight);
        } else {
            // Ajouter une nouvelle entrée
            this._searchIndex.terms[word].push({
                appIndex,
                weight
            });
        }
    }
    
    /**
     * Normalise un terme pour la recherche
     * @param {string} term - Terme à normaliser
     * @returns {string} Terme normalisé
     * @private
     */
    _normalizeTerm(term) {
        if (typeof term !== 'string') {
            term = String(term);
        }
        
        return term.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Enlever les accents
            .replace(/[^\w\s]/g, ' ') // Remplacer les caractères spéciaux par des espaces
            .trim();
    }
    
    /**
     * Recherche des applications correspondant à un terme
     * @param {string} searchTerm - Terme de recherche
     * @param {Object} options - Options de recherche
     * @param {string} options.categoryId - Filtrer par catégorie (optionnel)
     * @param {boolean} options.fuzzy - Activer la correspondance approximative (défaut: true)
     * @returns {Array} Résultats de la recherche
     */
    search(searchTerm, options = {}) {
        const normalizedTerm = this._normalizeTerm(searchTerm);
        const words = normalizedTerm.split(/\s+/).filter(word => word.length >= 2);
        
        if (words.length === 0) {
            return [];
        }
        
        // Options par défaut
        const categoryId = options.categoryId || null;
        const fuzzy = options.fuzzy !== undefined ? options.fuzzy : true;
        
        // Résultats avec scores
        const scores = {};
        
        // Rechercher pour chaque mot
        for (const word of words) {
            this._searchWord(word, scores, fuzzy);
        }
        
        // Convertir les scores en tableau de résultats
        const results = Object.entries(scores).map(([appIndex, score]) => {
            const app = this._searchIndex.apps[parseInt(appIndex)];
            
            // Filtrer par catégorie si spécifié
            if (categoryId && app.categoryId !== categoryId) {
                return null;
            }
            
            return {
                ...app,
                score
            };
        }).filter(Boolean); // Enlever les résultats null
        
        // Trier par score décroissant
        results.sort((a, b) => b.score - a.score);
        
        return results;
    }
    
    /**
     * Recherche un mot dans l'index
     * @param {string} word - Mot à rechercher
     * @param {Object} scores - Objet pour accumuler les scores
     * @param {boolean} fuzzy - Activer la correspondance approximative
     * @private
     */
    _searchWord(word, scores, fuzzy) {
        // Recherche exacte et recherche de préfixes
        this._exactAndPrefixSearch(word, scores);
        
        // Recherche approximative si activée
        if (fuzzy) {
            this._fuzzySearch(word, scores);
        }
    }

    /**
     * Effectue une recherche exacte et une recherche par préfixes
     * @param {string} word - Mot à rechercher
     * @param {Object} scores - Objet pour accumuler les scores
     * @private
     */
    _exactAndPrefixSearch(word, scores) {
        // 1. Recherche exacte (le mot complet)
        if (this._searchIndex.terms[word]) {
            for (const entry of this._searchIndex.terms[word]) {
                const { appIndex, weight } = entry;
                
                if (!scores[appIndex]) {
                    scores[appIndex] = 0;
                }
                
                // Donner un poids complet pour une correspondance exacte
                scores[appIndex] += weight;
            }
        }
        
        // 2. Rechercher tous les termes qui commencent par ce mot (si le mot n'est pas trop court)
        if (word.length >= 2) {
            for (const term in this._searchIndex.terms) {
                // Vérifier si le terme commence par le mot de recherche, mais n'est pas exactement le même
                if (term !== word && term.startsWith(word)) {
                    for (const entry of this._searchIndex.terms[term]) {
                        const { appIndex, weight } = entry;
                        
                        if (!scores[appIndex]) {
                            scores[appIndex] = 0;
                        }
                        
                        // Donner un poids proportionnel à la longueur de la correspondance
                        const matchRatio = word.length / term.length;
                        scores[appIndex] += weight * matchRatio * 0.9; // 90% du poids pour les préfixes
                    }
                }
            }
        }
    }
    
    /**
     * Effectue une recherche approximative
     * @param {string} word - Mot à rechercher
     * @param {Object} scores - Objet pour accumuler les scores
     * @private
     */
    _fuzzySearch(word, scores) {
        // Tolérance proportionnelle à la longueur du mot
        const maxDistance = Math.max(1, Math.floor(word.length / 4));
        
        for (const term in this._searchIndex.terms) {
            // Calculer la distance de Levenshtein
            const distance = this._levenshteinDistance(word, term);
            
            // Si la distance est dans la tolérance, considérer comme une correspondance
            if (distance <= maxDistance) {
                const entries = this._searchIndex.terms[term];
                
                for (const entry of entries) {
                    const { appIndex, weight } = entry;
                    
                    if (!scores[appIndex]) {
                        scores[appIndex] = 0;
                    }
                    
                    // Le score est inversement proportionnel à la distance
                    const fuzzyWeight = weight * (1 - distance / (word.length + 1));
                    scores[appIndex] += fuzzyWeight;
                }
            }
        }
    }
    
    /**
     * Calcule la distance de Levenshtein entre deux chaînes
     * @param {string} a - Première chaîne
     * @param {string} b - Deuxième chaîne
     * @returns {number} Distance
     * @private
     */
    _levenshteinDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        const matrix = [];
        
        // Initialiser la matrice
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let i = 0; i <= a.length; i++) {
            matrix[0][i] = i;
        }
        
        // Remplir la matrice
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // suppression
                    );
                }
            }
        }
        
        return matrix[b.length][a.length];
    }
    
    /**
     * Reconstruit l'index de recherche
     */
    rebuildIndex() {
        this._buildSearchIndex();
    }
}