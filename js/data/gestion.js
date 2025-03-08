/**
 * @fileoverview Données de la catégorie Gestion
 * Contient les liens vers les outils de gestion
 */

/**
 * Configuration de la catégorie Gestion
 * @type {Object}
 */
const GESTION_DATA = {
    id: "gestion",
    name: "Gestion",
    description: "Outils de gestion",
    
    apps: [
        {
            id: "notion",
            name: "Notion",
            url: "https://notion.so",
            icon: "book-open",
            color: "#000000",
            description: "Gestion des connaissances"
        },
        {
            id: "incident",
            name: "Incident",
            url: "https://incident.example.com",
            icon: "exclamation-triangle",
            color: "#e74c3c",
            description: "Suivi des incidents"
        },
        {
            id: "annuaire",
            name: "Annuaire",
            url: "https://annuaire.example.com",
            icon: "address-book",
            color: "#3498db",
            description: "Annuaire d'entreprise"
        },
        {
            id: "dico",
            name: "Dico",
            url: "https://dico.example.com",
            icon: "book",
            color: "#9b59b6",
            description: "Dictionnaire technique"
        },
        {
            id: "github",
            name: "GitHub",
            url: "https://github.com",
            icon: "fab fa-github",
            color: "#333333",
            description: "Gestion du code source"
        },
        {
            id: "bilan-hebdo",
            name: "Bilan Hebdo",
            url: "https://bilan.example.com",
            icon: "chart-bar",
            color: "#2ecc71",
            description: "Bilans hebdomadaires"
        },
        {
            id: "figma",
            name: "Figma",
            url: "https://www.figma.com/",
            icon: "fa-brands fa-figma",
            color: "#FF3E00",
            description: "Outil de design collaboratif"
        },
    ]
};