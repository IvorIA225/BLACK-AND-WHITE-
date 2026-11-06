# Le Black and White · Bouaké (depuis 1986)

Site vitrine interactif et 3D du restaurant **Le Black and White**, situé avenue Jacques Aka au quartier Nimbo à Bouaké (Côte d'Ivoire).

## Structure du dépôt

* `scrollcraft/builds/black-and-white/` : fichiers complets du site statique autonome (`index.html`, `styles.css`, `app.js`, `scene3d.js`, `fonts.css`, `scrollcraft.js`, `scrollcraft.css`, `device-diag.html`, `assets/`, `vendor/`).
* `scrollcraft/FINGERPRINTS.md` : registre d'architecture visuelle ScrollCraft.
* `vercel.json`, `netlify.toml`, `.github/workflows/deploy-pages.yml` : configurations prêtes à l'emploi pour publier directement le dossier `scrollcraft/builds/black-and-white/` en ligne sans réglage manuel.

## Lancer le site en local

Serveur statique simple depuis le dossier du site :

```bash
npx serve scrollcraft/builds/black-and-white -l 4510
```

Puis ouvrez `http://localhost:4510` dans votre navigateur.

## Mise en ligne

* **Vercel** : importez le dépôt GitHub tel quel, `vercel.json` publie automatiquement `scrollcraft/builds/black-and-white`.
* **GitHub Pages** : dans *Settings > Pages*, choisissez *Source: GitHub Actions* (le workflow `Deploy to GitHub Pages` publie directement le site à la racine).
* **Netlify** : importez le dépôt, `netlify.toml` cible directement le bon dossier de publication.

