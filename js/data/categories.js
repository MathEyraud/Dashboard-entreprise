/**
 * @fileoverview Définition de toutes les catégories du dashboard
 * Ce fichier centralise les métadonnées sur les catégories et leur organisation
 */

/**
 * Métadonnées additionnelles sur les catégories
 * @type {Object}
 */
const CATEGORIES_METADATA = {
    /**
     * Informations concernant les catégories et leur organisation
     */
    categories: {
        // Métadonnées pour la catégorie OPTI
        opti: {
            color: "#E1051E",
            priority: 1,
            tags: ["serveurs", "production", "opti"],
            shortDescription: "Serveurs principaux OPTI"
        },
        // Métadonnées pour la catégorie SécuOPTI
        secuopti: {
            color: "#9b59b6",
            priority: 2,
            tags: ["sécurité", "recette", "opti"],
            shortDescription: "Serveurs de sécurité OPTI"
        },
        // Métadonnées pour la catégorie OPC
        opc: {
            color: "#2980b9",
            priority: 3,
            tags: ["serveurs", "production", "opc"],
            shortDescription: "Serveurs OPC"
        },
        // Métadonnées pour la catégorie Gestion
        gestion: {
            color: "#2ecc71",
            priority: 4,
            tags: ["outils", "gestion", "documentation"],
            shortDescription: "Outils de gestion et documentation"
        },
        // Métadonnées pour la catégorie Correcteur
        correcteur: {
            color: "#e74c3c",
            priority: 5,
            tags: ["outils", "langue", "traduction", "orthographe"],
            shortDescription: "Correcteurs et traducteurs"
        },
        // Métadonnées pour la catégorie Goal
        goal: {
            color: "#e67e22",
            priority: 6,
            tags: ["serveurs", "production", "goal"],
            shortDescription: "Serveurs Goal et backlog"
        },
        // Métadonnées pour la catégorie Outils
        outils: {
            color: "#16a085",
            priority: 7,
            tags: ["outils", "local", "applications"],
            shortDescription: "Applications installées"
        }
    },
    
    /**
     * Relations entre les catégories
     */
    relations: [
        { source: "opti", target: "secuopti", type: "related" },
        { source: "opti", target: "opc", type: "related" },
        { source: "goal", target: "opti", type: "related" }
    ]
};