# Voltiz : thème Shopify, brouillon 7 « clarté et conversion »

Thème Shopify **Voltiz brouillon 7** (id 208323674452), dupliqué du brouillon 6, **non publié**.
Les brouillons 1 à 6 n'ont pas été modifiés. Ce dossier ne contient que les fichiers changés par rapport au brouillon 6.

## Principe
Même design et mêmes fonctions que le brouillon 6 (premier écran en profondeur, ligne d'énergie, précommande, panier, offre -10 %).
Le travail porte sur la compréhension pour quelqu'un qui découvre Voltiz, et sur le parcours jusqu'au bouton.

## Accueil (`templates/index.json`)
1. Premier écran : phrase qui dit ce qu'est le produit (pièce à mâcher, maté, goût citron, 50 mg de caféine ≈ un expresso),
   repères utiles, bouton Précommander avec le prix, lien secondaire « C'est quoi, Voltiz ? ».
2. « C'est quoi, Voltiz ? » : le produit expliqué en quatre étapes, juste après le premier écran.
3. Moments : Movement, Focus, Lifestyle, avec des repères lisibles (Sport et plein air, Études et travail, Le quotidien, les voyages).
4. Achat : section de précommande du brouillon 5 (inchangée dans son fonctionnement), nom unique « Voltiz Maté Citron ».
5. L'esprit Voltiz : « Partout, à tout moment ».
6. FAQ en 10 questions (contenu d'un sachet, ingrédients, goût, effet, dose, précautions, précommande, livraison, paiement).
7. Appel final (section du brouillon 5, ajoute un sachet au panier).
La section « univers » du brouillon 6, qui répétait les mêmes informations, est retirée.

## Autres fichiers
- `sections/vz6-hero.liquid` : réglages « Lien secondaire » et « Cible du lien secondaire ».
- `assets/voltiz6.css` : partie 4 (texte du premier écran plus lisible, étapes moins pâles, grand mot dégagé du sachet sur mobile).
- `templates/product.json` : même nom, même description et même FAQ que l'accueil.
- `sections/header-group.json` : menu « C'est quoi ? », « Moments », « Précommande », « FAQ », « Contact ».
- `sections/footer-group.json` : la fenêtre -10 % apparaît après 40 s (au lieu de 20 s) ou à mi-page, pour ne plus couvrir le premier écran.

## À compléter (marqué « [À COMPLÉTER] » sur le site)
Nombre de pièces par sachet, liste des ingrédients, date d'expédition des précommandes, mentions légales.
Rien n'est inventé : pas d'avis clients, de certification ni de promesse de livraison.
