# Thème Shopify Voltiz

Fichiers ajoutés ou modifiés dans une copie du thème gratuit **Horizon** (boutique Voltiz, thème « Voltiz (brouillon) »).
Nouvelle DA « Energy candy » (planche de tendance d'octobre 2026) : jaune #FFE600, blanc, gris #A7A7A7, noir #0B0B0B, police Montserrat, slogan « Partout. À tout moment. ». Accueil épuré, goût citron seul.

- `sections/voltiz-*.liquid` : une page d'accueil en sept parties, d'après le document d'exemples d'octobre 2026 : accueil (photos plein écran qui défilent, avec bouton pause), bandeau, nos bonbons (atouts et dosage), composition (avec l'avertissement caféine), boutique (ajout au panier, prix masqué), infos sur les ingrédients, à propos et contact. Tous les textes se modifient dans l'éditeur de thème. Les sections moments et FAQ restent disponibles mais ne sont plus sur l'accueil.
- `snippets/voltiz-head.liquid` : styles, police Montserrat (licence OFL) et script, rendu dans `layout/theme.liquid`.
- `snippets/voltiz-sprite.liquid` : logo et icônes (Phosphor Icons, licence MIT).
- `assets/voltiz.css` : la feuille de style, limitée aux sections Voltiz (`.vz`) pour ne pas toucher Horizon.
- `templates/index.json`, `sections/header-group.json`, `sections/footer-group.json` : l'accueil, l'en-tête et le pied de page.
- `config/settings_data.json` : couleurs et arrondis d'Horizon aux couleurs Voltiz.

Les textes entre crochets `[À COMPLÉTER …]` restent surlignés sur la page tant qu'ils ne sont pas remplis.

## Photos de l'accueil

Photos Unsplash sous licence Unsplash (usage commercial gratuit, sans attribution obligatoire), envoyées dans Contenu > Fichiers de la boutique. Personne n'y est reconnaissable. À remplacer par les photos Voltiz quand elles existent.

- Aventure (14:05) : Karsten Winegeart, https://unsplash.com/photos/person-hiking-ridge-in-schwende-rute-0XEvK65FyeM
- Énergie : City of Gold Coast, https://unsplash.com/photos/sunrise-over-a-distant-city-skyline-and-hills-VEHp4nawrUo
- Sport : Maxim Tolchinskiy, https://unsplash.com/photos/silhouettes-of-people-running-along-a-waterfront-at-sunset-83SQPcKAf1w
- Études : Cristine Enero, https://unsplash.com/photos/a-laptop-computer-sitting-on-top-of-a-wooden-desk-kWVbLBxvlVw
- Conduite : Fabian Bächli, https://unsplash.com/photos/driving-on-road-towards-sunset-through-hills-lWTbjLZqV8Y
- Travail : Marc Wieland, https://unsplash.com/photos/laptop-on-table-at-rooftop-with-city-view-at-sunset-6LVyxpfSQic
- Seealpsee (envoyée dans les fichiers, pas utilisée) : Chris Holgersson, https://unsplash.com/photos/landscape-photo-of-mountains-M34n3mIUKS8
