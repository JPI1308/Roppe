# Site mairie (ultra maintenable par JSON + dossier docs)

## Structure
- /data/settings.json : coordonnées mairie + bandeau info importante + liens footer
- /data/news.json : actualités (liste)
- /data/meetings.json : conseil municipal / réunions + liens vers PDFs
- /docs/... : documents téléchargeables (PDF, etc.)

## Ajouter un compte rendu (CR)
1) Déposer le PDF dans : /docs/conseil/
   Exemple : /docs/conseil/2026-02-12-cr.pdf
2) Ouvrir /data/meetings.json et ajouter une entrée (ou ajouter un document dans une entrée existante).
3) Enregistrer et remettre en ligne (FTP).

## Tester en local (recommandé)
Dans le dossier du site :
python -m http.server 8000
Puis ouvrir : http://localhost:8000

## Bandeau “Info importante”
Modifier /data/settings.json > info_importante
- active: true/false
- style: info | warning | danger
- titre, message, lien_label, lien_url
Astuce : une fois fermé, le bandeau reste masqué sur le navigateur (localStorage).
Pour le ré-afficher : vider le stockage du site dans le navigateur.
