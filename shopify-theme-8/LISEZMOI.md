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
