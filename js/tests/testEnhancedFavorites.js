/**
 * Test du système de favoris amélioré
 * Ce script de test vérifie la nouvelle fonctionnalité permettant d'ajouter
 * une même application dans plusieurs groupes de favoris.
*/

// Pour exécuter le test dans la console du navigateur:
// testEnhancedFavorites()

// Fonction de test à exécuter dans la console du navigateur
function testEnhancedFavorites() {
    console.log('=== DÉBUT DU TEST DU SYSTÈME DE FAVORIS AMÉLIORÉ ===');
    
    // Récupère les instances nécessaires
    const favoritesModel = new FavoritesModel();
    const categoryModel = new CategoryModel();
    
    // Crée des groupes de test
    console.log('1. Création de groupes de test...');
    const groupId1 = favoritesModel.addGroup({
    name: 'Groupe Test 1',
    color: '#ff5733',
    icon: 'folder'
    });
    
    const groupId2 = favoritesModel.addGroup({
    name: 'Groupe Test 2',
    color: '#33ff57',
    icon: 'folder-open'
    });
    
    console.log(`   Groupe 1 créé avec ID: ${groupId1}`);
    console.log(`   Groupe 2 créé avec ID: ${groupId2}`);
    
    // Sélectionne une application pour les tests
    const testAppId = 'notion';  // Application Notion de la catégorie gestion
    const testCategoryId = 'gestion';
    
    // Test 1: Ajouter l'application au groupe 1
    console.log('\n2. Test d\'ajout dans le groupe 1...');
    const addResult1 = favoritesModel.addFavorite(testAppId, testCategoryId, groupId1);
    console.log(`   Ajout dans le groupe 1: ${addResult1 ? 'Réussi' : 'Échoué'}`);
    
    // Test 2: Vérifier que l'application est bien dans le groupe 1
    console.log('\n3. Vérification de présence dans le groupe 1...');
    const inGroup1 = favoritesModel.isInFavoriteGroup(testAppId, groupId1);
    console.log(`   L'application est dans le groupe 1: ${inGroup1 ? 'Oui' : 'Non'}`);
    
    // Test 3: Ajouter l'application au groupe 2
    console.log('\n4. Test d\'ajout dans le groupe 2...');
    const addResult2 = favoritesModel.addFavorite(testAppId, testCategoryId, groupId2);
    console.log(`   Ajout dans le groupe 2: ${addResult2 ? 'Réussi' : 'Échoué'}`);
    
    // Test 4: Vérifier que l'application est bien dans les deux groupes
    console.log('\n5. Vérification de présence dans les deux groupes...');
    const inGroup2 = favoritesModel.isInFavoriteGroup(testAppId, groupId2);
    console.log(`   L'application est dans le groupe 1: ${inGroup1 ? 'Oui' : 'Non'}`);
    console.log(`   L'application est dans le groupe 2: ${inGroup2 ? 'Oui' : 'Non'}`);
    
    // Test 5: Retirer l'application du groupe 1
    console.log('\n6. Test de retrait du groupe 1...');
    const removeResult = favoritesModel.removeFromGroup(testAppId, groupId1);
    console.log(`   Retrait du groupe 1: ${removeResult ? 'Réussi' : 'Échoué'}`);
    
    // Test 6: Vérifier que l'application est seulement dans le groupe 2
    console.log('\n7. Vérification finale...');
    const finalInGroup1 = favoritesModel.isInFavoriteGroup(testAppId, groupId1);
    const finalInGroup2 = favoritesModel.isInFavoriteGroup(testAppId, groupId2);
    console.log(`   L'application est dans le groupe 1: ${finalInGroup1 ? 'Oui' : 'Non'}`);
    console.log(`   L'application est dans le groupe 2: ${finalInGroup2 ? 'Oui' : 'Non'}`);
    
    // Récupérer et afficher les favoris groupés
    console.log('\n8. Récupération des favoris groupés...');
    const favoritesData = favoritesModel.getFavoriteApps(categoryModel);
    console.log('   Structure des favoris groupés:');
    console.log(favoritesData);
    
    // Nettoyage (retirer les groupes de test et l'application)
    console.log('\n9. Nettoyage des tests...');
    favoritesModel.removeFromGroup(testAppId, groupId2);
    favoritesModel.removeGroup(groupId1, false);
    favoritesModel.removeGroup(groupId2, false);
    
    console.log('\n=== FIN DU TEST DU SYSTÈME DE FAVORIS AMÉLIORÉ ===');
    
    return {
    success: inGroup1 && inGroup2 && !finalInGroup1 && finalInGroup2,
    message: 'Tests terminés. Vérifiez les logs pour les détails.',
    favoritesData
    };
}