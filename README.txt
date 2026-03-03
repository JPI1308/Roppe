# Site mairie (JSON + dossier docs) — v3

## Pages
- index.html (accueil)
- conseil.html (réunions / CR / ODJ)
- arretes.html (arrêtés municipaux)
- urbanisme.html (urbanisme / PLU + liens)
- bulletins.html (bulletins municipaux)
- mentions-legales.html, accessibilite.html, plan-du-site.html

## Données (ultra maintenable)
- /data/settings.json : coordonnées mairie + bandeau info importante + liens footer
- /data/news.json : actualités
- /data/meetings.json : conseil municipal / réunions
- /data/arretes.json : arrêtés municipaux
- /data/urbanisme.json : urbanisme / PLU
- /data/bulletins.json : bulletins

## Documents
Déposer vos PDF dans :
- /docs/conseil/
- /docs/arretes/
- /docs/urbanisme/
- /docs/bulletins/

Puis référencer le fichier dans le JSON correspondant.

## Tester en local
python -m http.server 8000
Puis : http://localhost:8000


## Navigation (header)
Le menu du header est généré depuis /data/settings.json (clé navigation).
Modifier l'ordre, les libellés ou les liens dans settings.json.

## Agenda
- Accueil : affiche les 6 prochains événements (data/agenda.json)
- agenda.html : liste complète, recherche + filtre par année, sections À venir / Passés


## Équipe municipale
- Page : /equipe.html
- Données : /data/equipe-municipale.json
- Photos (optionnel) : /assets/img/equipe/
