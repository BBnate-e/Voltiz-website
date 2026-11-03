# Voltiz : thème Shopify, brouillon 6 « évolution du brouillon 4 »

Thème Shopify **Voltiz brouillon 6** (id 207860793684), dupliqué du brouillon 5, **non publié**.
Copie de sécurité du brouillon 5 : **Voltiz brouillon 5 (copie de sécurité)** (id 207860760916). Les brouillons 1 à 5 n'ont pas été modifiés.
Ce dossier ne contient que les fichiers ajoutés ou changés par rapport au brouillon 5.

## Principe
- Mise en page et parcours du **brouillon 4** : manifeste, Movement, Focus, Lifestyle, le produit qui tourne au défilement, l'univers, l'achat, la FAQ.
- Identité et fonctions du **brouillon 5**, inchangées : logo officiel, marine #0F2643, jaune #FECD06, Russo One, en-tête et pied de page,
  section d'achat avec précommande (`vz5-acheter`, mention « Précommande : Oui »), avis du panier, offre -10 % (code BIENVENUE10).
- L'animation d'ouverture du brouillon 4 n'est pas reprise : le nouveau premier écran est visible tout de suite.

## Fichiers
- `sections/vz6-hero.liquid` : premier écran en plans de profondeur (fond et photo en bichromie, halo, faisceau jaune, grand titre derrière le sachet, sol, sachet 3D, informations commerciales).
- `assets/voltiz6.css`, `assets/voltiz6.js` : premier écran, ligne d'énergie, habillage de la fenêtre -10 % (son fonctionnement n'est pas touché).
- `snippets/voltiz-head.liquid` : charge voltiz6.css et voltiz6.js après les fichiers des brouillons 3 et 5.
- `templates/index.json` : ordre de l'accueil du brouillon 4 ; achat = section de précommande du brouillon 5 ; FAQ du brouillon 5.
- `sections/header-group.json` : liens du menu vers les sections du brouillon 4.

## Ligne d'énergie
- Tracé jaune créé par `voltiz6.js` sur l'accueil, quand la case « Ligne d'énergie au défilement » du premier écran est cochée.
- Le tracé est calculé à partir de la page : il descend dans les marges, en courbes avec des coudes d'éclair, et ne traverse la page
  que dans les espaces vides entre deux sections. Il est plus discret le long des sections et plus lumineux dans les espaces vides.
- Il se dessine en descendant et s'efface en remontant, exactement au rythme du défilement, puis s'arrête sur la section d'achat.
- Recalculé à chaque changement de taille de la page (mobile, rotation, images chargées).
- Si l'appareil demande moins d'animations : la ligne est affichée entière, sans mouvement.

## Sachet : rendu PROVISOIRE
Images `voltiz-sachet-v2-face.webp` et `voltiz-sachet-v2-dos.webp` (maquettes avec filigrane). Pour les remplacer :
Personnaliser > « Voltiz 6 : accueil » > Face avant / Dos, ou remplacer ces fichiers dans Contenu > Fichiers. Aucun code à changer.

## Photo d'ambiance du premier écran
« Skieur en plein saut au-dessus des montagnes », photo Josef Pelikán, Unsplash (licence Unsplash, usage commercial gratuit),
fichier `photo-1697555678219-150263ca9037.jpg`. Modifiable ou supprimable dans l'éditeur (champ « Photo d'ambiance »).
Dans la section univers, la photo de salle de sport du brouillon 4 (logo de marque visible) est remplacée, comme au brouillon 5, par `photo-1541600383005`.
