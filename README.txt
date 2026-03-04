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

Style pour les informations importantes : info, warning, alert, success


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



Détail style :

Le bandeau d’information en haut de page est piloté par :

/data/settings.json
→ "info_importante"


⸻

🎯 Structure du bandeau

Dans settings.json :

{
  "info_importante": {
    "active": true,
    "style": "info",
    "titre": "Information importante",
    "message": "La mairie sera exceptionnellement fermée le vendredi 12 juillet.",
    "lien_label": "En savoir plus",
    "lien_url": "actus/fermeture.html"
  }
}


⸻

🎨 Styles disponibles

Actuellement, 4 styles sont prévus :

⸻

🟦 1️⃣ "info" (par défaut – bleu institutionnel)

"style": "info"

	•	Fond bleu clair
	•	Bordure douce
	•	Idéal pour information générale

Utilisation typique :
	•	Fermeture mairie
	•	Modification horaires
	•	Information administrative

⸻

🟨 2️⃣ "warning" (orange / vigilance)

"style": "warning"

	•	Fond jaune/orange
	•	Attire plus l’attention

Utilisation :
	•	Travaux
	•	Perturbation circulation
	•	Eau coupée

⸻

🟥 3️⃣ "alert" (rouge – urgent)

"style": "alert"

	•	Fond rouge clair
	•	Pour urgence réelle

Utilisation :
	•	Alerte météo
	•	Incident sécurité
	•	Crise

⸻

🟩 4️⃣ "success" (vert – information positive)

"style": "success"

	•	Fond vert clair
	•	Message positif

Utilisation :
	•	Réouverture
	•	Événement réussi
	•	Nouvelle installation

⸻

📌 Le lien

Si :

"lien_label": ""

👉 Le bouton ne s’affiche pas.

⸻

📴 Désactiver le bandeau

"active": false

Il disparaît totalement.

⸻

🧠 Bon usage institutionnel

Pour une commune :
	•	80% du temps → "info"
	•	"warning" pour travaux
	•	"alert" uniquement en cas sérieux
	•	Éviter de le laisser actif en permanence

⸻

Si tu veux, on peut aussi :
	•	Ajouter une version “bandeau noir sobre”
	•	Ajouter une version “dégradé mairie”
	•	Ajouter une icône automatique selon le style


