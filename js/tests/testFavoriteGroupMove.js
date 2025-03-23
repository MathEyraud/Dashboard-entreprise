/**
 * Test du déplacement d'applications entre groupes de favoris
 * Ce script vérifie que le glisser-déposer d'une application d'un groupe de favoris vers un autre
 * résulte en un déplacement plutôt qu'une duplication.
*/

// Pour exécuter le test dans la console du navigateur:
// testFavoriteGroupMove()

  // Fonction de test à exécuter dans la console du navigateur
function testFavoriteGroupMove() {
    console.log('=== TEST DU DÉPLACEMENT ENTRE GROUPES DE FAVORIS ===');
    
    // Vérifier que l'instance globale d'AppController est disponible
    if (!window.appController) {
    console.error('AppController n\'est pas accessible globalement. Test impossible.');
    return { success: false, message: 'AppController non disponible' };
    }
    
    const favoritesModel = window.appController.favoritesModel;
    
    if (!favoritesModel) {
    console.error('FavoritesModel non disponible. Test impossible.');
    return { success: false, message: 'FavoritesModel non disponible' };
    }
    
    // Création de deux groupes de test
    console.log('1. Création de deux groupes de test...');
    const sourceGroupId = favoritesModel.addGroup({
    name: 'Groupe Source',
    color: '#E74C3C',
    icon: 'folder'
    });
    
    const targetGroupId = favoritesModel.addGroup({
    name: 'Groupe Cible',
    color: '#2ECC71',
    icon: 'folder-open'
    });
    
    console.log(`   Groupe source créé avec ID: ${sourceGroupId}`);
    console.log(`   Groupe cible créé avec ID: ${targetGroupId}`);
    
    // Sélectionne une application pour les tests
    const testAppId = 'notion';  // Application Notion
    const testCategoryId = 'gestion';
    
    // Test 1: Ajouter l'application au groupe source
    console.log('\n2. Ajout de l\'application au groupe source...');
    const addResult = favoritesModel.addFavorite(testAppId, testCategoryId, sourceGroupId);
    console.log(`   Ajout dans le groupe source: ${addResult ? 'Réussi' : 'Échoué'}`);
    
    // Test 2: Vérifier que l'application est bien dans le groupe source
    console.log('\n3. Vérification de la présence dans le groupe source...');
    const inSourceGroup = favoritesModel.isInFavoriteGroup(testAppId, sourceGroupId);
    console.log(`   L'application est dans le groupe source: ${inSourceGroup ? 'Oui' : 'Non'}`);
    
    // Test 3: Déplacer l'application vers le groupe cible
    console.log('\n4. Déplacement de l\'application vers le groupe cible...');
    const moveResult = favoritesModel.changeFavoriteGroup(testAppId, targetGroupId, sourceGroupId);
    console.log(`   Déplacement vers le groupe cible: ${moveResult ? 'Réussi' : 'Échoué'}`);
    
    // Test 4: Vérifier que l'application a été déplacée (plus dans source, maintenant dans cible)
    console.log('\n5. Vérification du déplacement...');
    const stillInSourceGroup = favoritesModel.isInFavoriteGroup(testAppId, sourceGroupId);
    const nowInTargetGroup = favoritesModel.isInFavoriteGroup(testAppId, targetGroupId);
    
    console.log(`   L'application est encore dans le groupe source: ${stillInSourceGroup ? 'Oui' : 'Non'}`);
    console.log(`   L'application est maintenant dans le groupe cible: ${nowInTargetGroup ? 'Oui' : 'Non'}`);
    
    // Vérifier le résultat attendu: plus dans source, maintenant dans cible
    const moveSuccessful = !stillInSourceGroup && nowInTargetGroup;
    console.log(`\n   Résultat attendu (déplacement réussi): ${moveSuccessful ? 'OK' : 'ÉCHOUÉ'}`);
    
    // Nettoyage
    console.log('\n6. Nettoyage des tests...');
    favoritesModel.removeFromGroup(testAppId, targetGroupId);
    favoritesModel.removeGroup(sourceGroupId, false);
    favoritesModel.removeGroup(targetGroupId, false);
    
    console.log('\n=== FIN DU TEST DU DÉPLACEMENT ENTRE GROUPES DE FAVORIS ===');
    
    return {
    success: moveSuccessful,
    message: `Test ${moveSuccessful ? 'réussi' : 'échoué'}. L'application ${moveSuccessful ? 'a été correctement déplacée' : 'n\'a pas été correctement déplacée'}.`
    };
}