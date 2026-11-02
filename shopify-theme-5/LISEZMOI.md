# Voltiz : thème Shopify, brouillon 5 « Creative Commerce »

Thème Shopify : **Voltiz brouillon 5** (id 207745974612), dupliqué du brouillon 4, **non publié**.
Les brouillons 1 à 4 n'ont pas été modifiés. Ce dossier contient les fichiers ajoutés ou changés par rapport au brouillon 4.

## Nouvelle identité
- Logo officiel vectorisé tel quel (`assets/voltiz-logo-blanc.svg`, `assets/voltiz-logo-marine.svg`, symboles `#logo` et `#mark` dans `snippets/voltiz-sprite.liquid`).
- Couleurs : bleu marine `#0F2643`, jaune `#FECD06`, blanc. Tous les réglages sont dans `assets/voltiz5.css`, en haut (variables sur `.v3`).
- Police des titres : Russo One (licence SIL OFL, fichier `assets/voltiz-russo.woff2`, tiré du paquet `@fontsource/russo-one`). Texte courant : Manrope (OFL), comme avant.

## Page d'accueil (`templates/index.json`)
1. `vz5-hero` : sachet visible, bouton « Précommander » avec le prix. Pas d'écran d'intro.
2. `vz5-acheter` (ancre `#precommande`) : le produit, quantité, total, encadré de précommande.
3. `vz5-moments` : « Trouve ton moment », trois univers (Movement, Focus, Lifestyle) avec onglets.
4. `vz5-identite` : l'identité Voltiz, courte, sur fond jaune.
5. FAQ (`vz3-faq`, avec une question sur la précommande).
6. `vz5-cta` : appel final, ajoute un sachet au panier.
7. En-tête `vz5-header` et pied de page `vz5-footer` (groupes `header-group.json`, `footer-group.json`).

## Rendu du sachet : PROVISOIRE
Le sachet affiché (hero, produit, appel final) utilise les images `voltiz-sachet-v2-face.webp` et `voltiz-sachet-v2-dos.webp`, qui sont des maquettes provisoires.
Pour le remplacer : Personnaliser > section concernée > « Image du sachet » (face et dos), ou remplacer ces deux fichiers dans Contenu > Fichiers en gardant le même nom.
Le rendu 3D est fait en CSS (`snippets/vz2-pouch.liquid`, déjà présent) : une photo détourée en PNG suffit, aucune modification de code n'est nécessaire.

## Précommande
- Méthode native, sans application : le produit est actif, sans suivi de stock, payé en entier à la caisse Shopify.
- Chaque article ajouté porte la mention `Précommande : Oui` (propriété de ligne), visible dans le panier, à la caisse et dans la commande.
- Conditions affichées : encadré produit, avis sur la page panier (`sections/vz5-avis.liquid`), FAQ.
- À compléter : date ou période d'expédition, politique d'annulation et de retour.
- Pour un paiement différé (prélevé à l'expédition), il faudrait une application de précommande ou des « selling plans » : non installé.

## Offre -10 % (`sections/vz5-popup.liquid`, dans le pied de page)
- Code Shopify réel **BIENVENUE10** : 10 % sur la commande, une fois par client, non cumulable.
- Formulaire client natif de Shopify : l'adresse est enregistrée dans Clients avec le consentement marketing et les tags `newsletter, bienvenue-10`.
- Case de consentement obligatoire, jamais cochée d'avance, lien vers la politique de confidentialité.
- Apparition après 20 s ou à mi-page, jamais au chargement, jamais sur le panier. Ne revient pas pendant 14 jours après fermeture. Réglages dans l'éditeur.
- Après inscription, le code s'affiche avec un bouton pour l'appliquer au panier.

## Photos (section Moments)
Toutes viennent d'Unsplash (licence Unsplash : usage commercial gratuit, sans attribution obligatoire). Le photographe est cité dans le texte alternatif de chaque image dans Shopify.
Fichiers dans Contenu > Fichiers, nommés d'après l'identifiant Unsplash (`https://unsplash.com/photos/<id>`) :
- Movement : photo-1712513246150, photo-1721750475973, photo-1541600383005, photo-1776935735302
- Focus : photo-1657772608811, photo-1778735940467, photo-1764096534662, photo-1639300505533
- Lifestyle : photo-1607686868903, photo-1752650143267, photo-1688263638788, photo-1747138164851
Aucune image de concurrent n'est utilisée.

## Modifiés directement dans Shopify
- `templates/page.boutique.json` : produit corrigé (`voltiz-energy-gum`).
- `templates/cart.json` : voir `templates/cart.LISEZMOI.txt`.

## Animations
Sachet 3D léger (glisser pour tourner, léger mouvement au défilement), états des boutons (survol, clic, chargement, désactivé), apparition des sections. Pas de défilement détourné. Tout est coupé si l'appareil demande moins d'animations (`prefers-reduced-motion`).
