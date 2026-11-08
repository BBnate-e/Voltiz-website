# Voltiz : thème Shopify, brouillon 8

Thème Shopify **Voltiz brouillon 8**, dupliqué du brouillon 7, **non publié**. Les brouillons 1 à 7 n'ont pas été modifiés.
Ce dossier ne contient que les fichiers changés par rapport au brouillon 7.

## Page produit dans son propre onglet
- Le bloc d'achat (précommande) n'est plus sur l'accueil : il est seulement sur la page produit `/products/voltiz-energy-gum`
  (`templates/product.json`, inchangé depuis le brouillon 7 : achat, encadré de précommande, FAQ).
- Tous les boutons et liens « Précommander » mènent à cette page : premier écran, bouton de l'en-tête, onglet « Produit » du menu,
  liens Movement et Lifestyle, lien de l'appel final, pied de page, bouton de la fenêtre -10 % après inscription.
- L'appel final de l'accueil ajoute toujours un sachet au panier directement (avec la mention « Précommande : Oui »).
- La ligne d'énergie s'arrête maintenant sur l'appel final (dernière section de l'accueil).

## Fichiers
- `templates/index.json` : section `precommande` retirée, liens vers la page produit.
- `sections/header-group.json` : onglet « Produit » et bouton « Précommander » vers la page produit.
- `sections/footer-group.json` : lien « Précommander » du pied de page et redirection de la fenêtre -10 % vers la page produit.

## Version anglaise (2026-11-08)
- Langue anglaise activée et publiée dans Shopify (Paramètres > Langues), sur voltiz.ch et le domaine myshopify. Adresse : `/en`.
- Sélecteur de langue en haut à droite (`sections/vz5-header.liquid`) : formulaire « localization » natif de Shopify, liste FR / EN.
- Petits textes fixes du thème (boutons, libellés pour lecteurs d'écran, pied de page) : `snippets/vz-tr.liquid`.
- Tous les textes des sections sont maintenant écrits dans les fichiers JSON (au lieu des valeurs par défaut) pour pouvoir être traduits.
- Traductions enregistrées dans Shopify pour ce thème (accueil, page produit, panier, en-tête, pied de page, fenêtre -10 %, pages Composition, Contact, À propos),
  pour le produit (type, description, option Saveur/Citron) et les titres des pages. Source : `traductions/en.json`.
- Modifier une traduction : Paramètres > Langues > Anglais > Traduire (ou l'application gratuite « Translate & Adapt »).
- La mention de ligne « Précommande : Oui » reste en français dans les deux langues, pour que toutes les commandes se lisent pareil.
- Le titre du produit (« Voltiz Energy Gum Citron ») n'est pas traduit : c'est un nom de marque.
