import seed from '../scripts/seed'; // Chemin relatif depuis /src

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {
    // Tu peux laisser vide pour le moment
  },

  async bootstrap({ strapi }: { strapi: any }) {
    // Seed automatique désactivé
    // if (process.env.SHOULD_SEED) {
    //   console.log('🌱 Seed automatique lancé...');
    //   await seed(strapi);
    //   console.log('✅ Seed terminé.');
    // }
  },
};
