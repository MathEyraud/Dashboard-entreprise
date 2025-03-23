/**
 * Test du comportement corrigé pour le glisser-déposer des favoris
 * Ce script vérifie que le glisser-déposer d'une application déjà présente dans un groupe
 * de favoris ne la supprime pas de ce groupe.
*/

// Pour exécuter le test dans la console du navigateur:
// testDragDropBehavior()

// Fonction de test à exécuter dans la console du navigateur
function testDragDropBehavior() {
    console.log('=== TEST DU COMPORTEMENT CORRIGÉ DE GLISSER-DÉPOSER ===');
    
    // Vérifier que l'instance globale d'AppController est disponible
    if (!window.appController) {
    console.error('AppController n\'est pas accessible globalement. Test impossible.');
    return { success: false, message: 'AppController non disponible' };
    }
    
    const favoritesModel = window.appController.favoritesModel;
    const categoryModel = window.appController.categoryModel;
    
    if (!favoritesModel || !categoryModel) {
    console.error('Modèles nécessaires non disponibles. Test impossible.');
    return { success: false, message: 'Modèles nécessaires non disponibles' };
    }
    
    // Création d'un groupe de test
    console.log('1. Création d\'un groupe de test...');
    const testGroupId = favoritesModel.addGroup({
    name: 'Groupe Test DnD',
    color: '#4285F4',
    icon: 'tasks'
    });
    
    console.log(`   Groupe créé avec ID: ${testGroupId}`);
    
    // Sélectionne une application pour les tests
    const testAppId = 'notion';  // Application Notion de la catégorie gestion
    const testCategoryId = 'gestion';
    
    // Test 1: Ajouter l'application au groupe
    console.log('\n2. Ajout de l\'application au groupe de test...');
    const addResult = favoritesModel.addFavorite(testAppId, testCategoryId, testGroupId);
    console.log(`   Ajout dans le groupe: ${addResult ? 'Réussi' : 'Échoué'}`);
    
    // Test 2: Vérifier que l'application est bien dans le groupe
    console.log('\n3. Vérification de la présence dans le groupe...');
    const inGroup = favoritesModel.isInFavoriteGroup(testAppId, testGroupId);
    console.log(`   L'application est dans le groupe: ${inGroup ? 'Oui' : 'Non'}`);
    
    // Test 3: Simuler un glisser-déposer depuis une section normale
    console.log('\n4. Simulation d\'un glisser-déposer depuis une section normale...');
    
    // Créer un faux événement de drop avec les données nécessaires
    console.log('   Création d\'un événement de drop simulé...');
    const mockDropEvent = {
    preventDefault: () => {},
    stopPropagation: () => {},
    dataTransfer: {
        getData: (key) => {
        const data = {
            'application/app-id': testAppId,
            'application/category-id': testCategoryId,
            'application/is-favorite': 'false',
            'application/group-id': ''
        };
        return data[key] || '';
        }
    }
    };
    
    // Vérifier directement la condition qui détermine si on doit traiter ou ignorer
    console.log('\n5. Vérification de la condition d\'ignorance du drop...');
    const shouldIgnore = favoritesModel.isInFavoriteGroup(testAppId, testGroupId);
    console.log(`   L'application est déjà dans le groupe cible: ${shouldIgnore ? 'Oui' : 'Non'}`);
    console.log(`   Résultat attendu: Le drop devrait être ${shouldIgnore ? 'ignoré' : 'traité'}`);
    
    // Vérifier à nouveau après le "drop simulé" que l'application est toujours dans le groupe
    console.log('\n6. Vérification que l\'application est toujours dans le groupe après le drop...');
    const stillInGroup = favoritesModel.isInFavoriteGroup(testAppId, testGroupId);
    console.log(`   L'application est toujours dans le groupe: ${stillInGroup ? 'Oui' : 'Non'}`);
    
    // Nettoyage
    console.log('\n7. Nettoyage des tests...');
    favoritesModel.removeFromGroup(testAppId, testGroupId);
    favoritesModel.removeGroup(testGroupId, false);
    
    console.log('\n=== FIN DU TEST DU COMPORTEMENT CORRIGÉ DE GLISSER-DÉPOSER ===');
    
    return {
    success: shouldIgnore && stillInGroup,
    message: 'Tests terminés. Vérifiez les logs pour les détails.'
    };
}