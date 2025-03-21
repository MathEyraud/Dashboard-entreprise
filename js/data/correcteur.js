/**
 * @fileoverview Données de la catégorie Outils linguistiques
 * Contient les liens vers les outils de correction orthographique et traduction
 */

/**
 * Configuration de la catégorie Outils linguistiques
 * @type {Object}
 */
const CORRECTEUR_DATA = {
    id: "correcteur",
    name: "Outils linguistiques",
    description: "Correcteurs d'orthographe et traducteurs en ligne",
    
    apps: [
        // Correcteurs d'orthographe
        {
            id: "scribben",
            name: "Scribben",
            url: "https://www.scribens.fr/",
            icon: "spell-check",
            color: "#2ecc71",
            description: "Correcteur orthographique en ligne",
            tags: ["orthographe", "grammaire", "correction", "français", "texte", "rédaction"]
        },
        {
            id: "bon-patron",
            name: "Bon Patron",
            url: "https://bonpatron.com/",
            icon: "check-double",
            color: "#e74c3c",
            description: "Correcteur grammatical et orthographique",
            tags: ["grammaire", "orthographe", "correction", "français", "texte", "relecture"]
        },
        {
            id: "reverso-correcteur",
            name: "Reverso Correcteur",
            url: "https://www.reverso.net/orthographe/correcteur-francais/",
            icon: "spell-check",
            color: "#3498db",
            description: "Correcteur orthographique Reverso",
            tags: ["orthographe", "grammaire", "correction", "français", "texte", "reverso"]
        },
        
        // Traducteurs
        {
            id: "deepl",
            name: "DeepL",
            url: "https://www.deepl.com/translator",
            icon: "language",
            color: "#6c5ce7",
            description: "Traducteur IA de haute qualité",
            tags: ["traduction", "ia", "langue", "international", "intelligence artificielle", "multilangue"]
        },
        {
            id: "google-traduction",
            name: "Google Traduction",
            url: "https://translate.google.com/",
            icon: "language",
            color: "#4285F4",
            description: "Service de traduction Google",
            tags: ["traduction", "google", "langue", "international", "multilangue", "dictionnaire"]
        },
        {
            id: "reverso-traduction",
            name: "Reverso Traduction",
            url: "https://www.reverso.net/text-translation",
            icon: "exchange-alt",
            color: "#0984e3",
            description: "Traducteur contextuel Reverso",
            tags: ["traduction", "contexte", "langue", "international", "reverso", "exemples"]
        }
    ]
};