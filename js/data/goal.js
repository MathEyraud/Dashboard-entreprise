/**
 * @fileoverview Données de la catégorie Goal
 * Contient les liens vers les serveurs Goal et leurs procédures
 */

/**
 * Configuration de la catégorie Goal
 * @type {Object}
 */
const GOAL_DATA = {
    id: "goal",
    name: "Goal",
    description: "Serveurs Goal avec procédure et backlog",
    procedureLink: "https://confluence.example.com/goal",
    
    apps: [
        {
            id: "goal-srv1",
            name: "Serveur Goal 1",
            url: "https://goal-srv1.example.com",
            icon: "bullseye",
            color: "#e67e22",
            description: "Serveur principal Goal"
        },
        {
            id: "goal-srv2",
            name: "Serveur Goal 2",
            url: "https://goal-srv2.example.com",
            icon: "bullseye",
            color: "#e67e22",
            description: "Serveur secondaire Goal"
        },
        {
            id: "goal-srv3",
            name: "Serveur Goal 3",
            url: "https://goal-srv3.example.com",
            icon: "bullseye",
            color: "#e67e22",
            description: "Serveur de développement Goal"
        },
        {
            id: "goal-srv4",
            name: "Serveur Goal 4",
            url: "https://goal-srv4.example.com",
            icon: "bullseye",
            color: "#e67e22",
            description: "Serveur de recette Goal"
        },
        {
            id: "goal-backlog",
            name: "Backlog Jira",
            url: "https://jira.example.com/goal",
            icon: "clipboard-list",
            color: "#3498db",
            description: "Backlog des tâches Goal"
        }
    ]
};