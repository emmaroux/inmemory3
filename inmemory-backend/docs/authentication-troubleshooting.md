# Guide de Dépannage Authentification

## Problèmes Courants et Solutions

### 1. Erreur "Failed to fetch"

Cette erreur survient généralement quand le frontend ne peut pas communiquer avec le backend. Causes possibles :

#### Configuration CORS incorrecte
```typescript
// ❌ Configuration CORS trop restrictive ou mal configurée
'strapi::cors'

// ✅ Configuration CORS correcte
export default [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:', 'http:'],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
      cors: {
        origin: ['http://localhost:3000'], // Frontend URL
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        credentials: true,
      },
    },
  },
  'strapi::cors',
  // ...
]
```

### 2. URLs codées en dur

#### Problème
Les URLs codées en dur dans le frontend peuvent causer des problèmes lors du déploiement ou du changement d'environnement.

```typescript
// ❌ Mauvaise pratique
const response = await fetch('http://localhost:1337/api/auth/local', {
```

#### Solution
Utiliser les variables d'environnement :

```typescript
// ✅ Bonne pratique
const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
```

Configuration requise dans `.env.local` :
```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### 3. Rate Limiting

Le rate limiting peut bloquer les requêtes d'authentification si trop de tentatives sont effectuées.

```typescript
// ❌ Configuration trop restrictive
ratelimit: {
  max: 3,
  interval: '5m',
}

// ✅ Configuration plus permissive pour le développement
ratelimit: {
  max: 100,
  interval: '1m',
}
```

## Checklist de Vérification

En cas de problèmes d'authentification, vérifier :

1. [ ] Configuration CORS dans `config/middlewares.ts`
2. [ ] Variables d'environnement dans le frontend
3. [ ] Rate limiting dans la configuration Strapi
4. [ ] Logs du serveur Strapi pour les erreurs détaillées
5. [ ] Console du navigateur pour les erreurs côté client

## Bonnes Pratiques

1. **Variables d'Environnement**
   - Toujours utiliser des variables d'environnement pour les URLs
   - Documenter toutes les variables requises dans un fichier `.env.example`

2. **CORS**
   - Configurer CORS spécifiquement pour chaque environnement
   - En production, restreindre aux domaines nécessaires

3. **Sécurité**
   - Ne pas désactiver complètement le rate limiting en production
   - Configurer des limites appropriées selon l'usage

4. **Débogage**
   - Activer les logs détaillés en développement
   - Implémenter un système de monitoring en production

## Notes pour le Déploiement

1. Ajuster les configurations CORS pour l'environnement de production
2. Revoir les paramètres de rate limiting
3. Vérifier que toutes les variables d'environnement sont correctement définies
4. Tester l'authentification dans un environnement de staging avant la production 