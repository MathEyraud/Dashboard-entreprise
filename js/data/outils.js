/**
 * @fileoverview Données de la catégorie Outils
 * Contient les liens vers les exécutables installés sur l'ordinateur
 */

/**
 * Configuration de la catégorie Outils
 * @type {Object}
 */
const OUTILS_DATA = {
    id: "outils",
    name: "Outils installés",
    description: "Accès rapide aux outils installés sur l'ordinateur",
    
    apps: [
        {
            id: "hpalm",
            name: "HPALM",
            url: "file:///C:/Program%20Files/HP/ALM/Application.exe", // Exemple de chemin, à modifier
            icon: "tasks",
            color: "#16a085",
            description: "Application de gestion de test HP ALM"
        },
        {
            id: "hcl",
            name: "HCL",
            url: "file:///C:/Program%20Files/HCL/Application.exe", // Exemple de chemin, à modifier
            icon: "desktop",
            color: "#8e44ad",
            description: "Suite logicielle HCL"
        },
        {
            id: "vendredi",
            name: "Vendredi",
            url: "file:///C:/Program%20Files/HCL/Application.exe", // Exemple de chemin, à modifier
            icon: "mug-hot",
            color: "#2980b9",
            description: "Application de gestion des croissant du vendredi"
        },
        {
            id: "app-link",
            name: "Raccourcis Apps",
            url: "file:///C:/Users/Public/Desktop/", // Exemple de chemin, à modifier
            icon: "folder-open",
            color: "#f39c12",
            description: "Dossier des raccourcis d'applications"
        }
    ]
};