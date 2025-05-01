# Guide de Configuration des Routes Strapi

## Erreurs Courantes à Éviter

### 1. Configuration des Routes Personnalisées

❌ **NE PAS FAIRE** :
```typescript
// Mauvais exemple
export default factories.createCoreRouter('api::team.team', {
  config: {
    findTeamResources: {
      auth: {
        scope: ['api::team.team.findTeamResources'],
      },
    },
  },
  only: ['find', 'findOne', 'create', 'update', 'delete', 'findTeamResources'],
});
```

✅ **FAIRE** :
```typescript
// Bon exemple
export default {
  routes: [
    {
      method: 'GET',
      path: '/teams/resources',
      handler: 'team.findTeamResources',
      config: {
        policies: [],
        auth: {
          scope: ['api::team.team.findTeamResources'],
        },
      },
    },
  ],
};
```

### 2. Gestion des Types dans les Contrôleurs

❌ **NE PAS FAIRE** :
```typescript
const { userId } = ctx.query;
const page = parseInt(ctx.query.page) || 1;
```

✅ **FAIRE** :
```typescript
const { userId } = ctx.query as { userId: string };
const page = parseInt(ctx.query.page as string) || 1;
```

### 3. Gestion des Erreurs

❌ **NE PAS FAIRE** :
```typescript
catch (error) {
  ctx.throw(500, error);
}
```

✅ **FAIRE** :
```typescript
catch (error) {
  strapi.log.error('Error in findTeamResources:', error);
  return ctx.throw(500, 'Message d\'erreur clair');
}
```

## Bonnes Pratiques

1. **Structure des Routes**
   - Toujours utiliser la structure standard avec `routes: []`
   - Définir clairement la méthode HTTP (`GET`, `POST`, etc.)
   - Spécifier le chemin complet
   - Nommer correctement le handler

2. **Sécurité**
   - Toujours configurer l'authentification
   - Utiliser les scopes appropriés
   - Implémenter des politiques si nécessaire

3. **Typage**
   - Toujours typer les paramètres de requête
   - Utiliser des assertions de type pour `ctx.query`
   - Valider les entrées utilisateur

4. **Gestion des Erreurs**
   - Logger les erreurs avec `strapi.log.error`
   - Retourner des messages d'erreur clairs
   - Ne pas exposer les détails internes des erreurs

## Exemple Complet

```typescript
// routes/team.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/teams/resources',
      handler: 'team.findTeamResources',
      config: {
        policies: [],
        auth: {
          scope: ['api::team.team.findTeamResources'],
        },
      },
    },
  ],
};

// controllers/team.ts
export default factories.createCoreController('api::team.team', ({ strapi }) => ({
  async findTeamResources(ctx) {
    const { userId } = ctx.query as { userId: string };
    const page = parseInt(ctx.query.page as string) || 1;
    
    try {
      // Logique métier
    } catch (error) {
      strapi.log.error('Error in findTeamResources:', error);
      return ctx.throw(500, 'Message d\'erreur clair');
    }
  },
}));
```

## Checklist de Déploiement

1. [ ] Vérifier la structure des routes
2. [ ] Tester les types dans les contrôleurs
3. [ ] Configurer l'authentification
4. [ ] Implémenter la gestion des erreurs
5. [ ] Tester les routes avec différents scénarios
6. [ ] Vérifier les logs d'erreur
7. [ ] Documenter les nouvelles routes 