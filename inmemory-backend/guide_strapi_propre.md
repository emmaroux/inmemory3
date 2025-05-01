
# 🧭 Guide de démarrage pour un projet Strapi propre

Ce guide a pour objectif de faciliter la mise en place et le redéploiement d’un projet Strapi dans un environnement propre et reproductible (ex. Cursor, cloud IDE).

---

## 1. 🚀 Initialisation du projet

```bash
npx create-strapi-app@latest my-project --quickstart
```

- Supprimez les exemples (`/api`, `content-types`, etc.) si non utilisés.
- Utilisez `--no-run` pour personnaliser avant le premier lancement.

---

## 2. ⚙️ Configuration de l’environnement

Créez un fichier `.env` basé sur `.env.example` :

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=xxx,yyy,zzz
API_TOKEN_SALT=xxx
ADMIN_JWT_SECRET=xxx
JWT_SECRET=xxx
DATABASE_URL=postgres://user:pass@host:port/dbname
```

---

## 3. 🗂 Architecture recommandée

Structure de base :

```
/src
  /api
  /components
  /extensions
  /middlewares
  /policies
/config
  database.ts
  server.ts
/types
```

Documentez cette structure dans `architecture.md`.

---

## 4. 🧱 Création des APIs, services et routes

Utilisez la CLI Strapi :

```bash
yarn strapi generate api nom
```

Organisez clairement :

- `controllers/`
- `services/`
- `routes/`
- `content-types/`

---

## 5. 📦 Déploiement reproductible

- Fichiers essentiels :
  - `package.json` (versions exactes)
  - `tsconfig.json`
  - `types/generated/`
  - `migrations/` (si versionning de la base)
- Ajoutez une procédure de `seed` dans `seed.md`

---

## 6. 🔐 Sécurité et qualité

- Intégrez des tests (`jest`, `supertest`)
- Vérifiez les rôles et permissions
- Ne versionnez pas :
  - `.env`
  - `node_modules/`
  - `.cache/`
  - `build/`

---

## 7. ✅ Checklist pour redéploiement (Cursor & cloud IDE)

- [ ] `.env` bien configuré
- [ ] DB accessible
- [ ] Clés JWT/API définies
- [ ] Build propre (`yarn build`)
- [ ] Aucune dépendance manquante (`yarn install`)

---

## 8. 📄 À documenter

- `README.md` : contexte et usage
- `architecture.md` : structure du projet
- `seed.md` : données initiales
- `recovery.md` : restauration système/données

---

Ce guide est conçu pour être intégré tel quel dans un projet Strapi.
