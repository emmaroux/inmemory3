# 🌱 Documentation Seeding - Projet Inmemory

---

## 1. Objectif du Seed

- Créer un échantillon réaliste de données pour le développement et les tests :
  - Des équipes (`Team`)
  - Des utilisateurs (`User`)
  - Des ressources (`Resource`)
  - Des votes (`Vote`)
  - Des commentaires (`Comment`)

---

## 2. Fonctionnement du Script

- Le script se trouve dans :  
  `/scripts/seed.js`

- Il est lancé automatiquement à chaque démarrage de Strapi si la variable SHOULD_SEED=true est présente dans le fichier .env.
- Le chargement du seed est intégré via la méthode bootstrap() dans src/index.ts

- Il utilise `@faker-js/faker` pour générer des données aléatoires mais crédibles.

---

## 3. Données créées

| Type | Volume approximatif | Détails |
|:--|:--|:--|
| Team | 5 équipes (1 Welcome + 4 aléatoires) | |
| User | 20 utilisateurs | Chaque utilisateur appartient à "Welcome" + 1-2 équipes |
| Resource | 50 ressources | 30% des ressources sont publiques |
| Vote | 100 votes | |
| Comment | 100 commentaires | |

---

## 4. Précautions

- **Attention** : Le seed **écrase** les données existantes si les IDs sont régénérés.
- **Pas recommandé** d'exécuter en production.
- **Bien vérifier** que les content-types sont créés avant de lancer le seed.

---

## 5. Exemple de lancement manuel

```bash
node scripts/seed.js
