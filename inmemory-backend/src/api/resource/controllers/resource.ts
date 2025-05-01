import { factories } from '@strapi/strapi';

interface Team {
  id: number;
  name: string;
  color: string;
  isWelcomeTeam: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  teams?: Team[];
}

export default factories.createCoreController('api::resource.resource', ({ strapi }) => ({
  async findByUser(ctx) {
    const { id } = ctx.params;

    try {
      // 1. Récupérer l'utilisateur avec ses équipes
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id },
        populate: ['teams'],
      }) as User;

      if (!user) {
        return ctx.notFound('Utilisateur non trouvé');
      }

      // 2. Extraire les IDs des équipes
      const teamIds = user.teams?.map(team => team.id) || [];

      if (teamIds.length === 0) {
        return [];
      }

      // 3. Récupérer toutes les ressources liées à ces équipes
      const resources = await strapi.entityService.findMany('api::resource.resource', {
        filters: {
          teams: {
            id: {
              $in: teamIds,
            },
          },
        },
        populate: ['teams', 'author', 'votes', 'comments'],
      });

      // 4. Retourner les ressources
      return resources;

    } catch (error) {
      ctx.throw(500, error);
    }
  },
})); 