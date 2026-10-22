# Thème Shopify Voltiz

Fichiers ajoutés ou modifiés dans une copie du thème gratuit **Horizon** (boutique Voltiz, thème « Voltiz (brouillon) »).
Nouvelle DA « Energy candy » (planche de tendance d'octobre 2026) : jaune #FFE600, blanc, gris #A7A7A7, noir #0B0B0B, police Montserrat, slogan « Partout. À tout moment. ». Accueil épuré, goût citron seul.

- `sections/voltiz-*.liquid` : hero, moments (icônes), produit (ajout au panier, ingrédients repliés), FAQ, en-tête, pied de page. Tous les textes se modifient dans l'éditeur de thème. Le hero et le produit acceptent une photo ; sans photo, un visuel jaune à l'éclair s'affiche.
- `snippets/voltiz-head.liquid` : styles, police Montserrat (licence OFL) et script, rendu dans `layout/theme.liquid`.
- `snippets/voltiz-sprite.liquid` : logo et icônes (Phosphor Icons, licence MIT).
- `assets/voltiz.css` : la feuille de style, limitée aux sections Voltiz (`.vz`) pour ne pas toucher Horizon.
- `templates/index.json`, `sections/header-group.json`, `sections/footer-group.json` : l'accueil, l'en-tête et le pied de page.
- `config/settings_data.json` : couleurs et arrondis d'Horizon aux couleurs Voltiz.

Les textes entre crochets `[À COMPLÉTER …]` restent surlignés sur la page tant qu'ils ne sont pas remplis.
