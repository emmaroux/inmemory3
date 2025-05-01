const seed = async (strapi) => {
  try {
    console.log('🚀 Démarrage du seed...');
    const faker = (await import('@faker-js/faker')).fakerFR;

    // Nettoyage de la base de données
    console.log('🧹 Nettoyage de la base de données...');
    await strapi.db.query('api::comment.comment').deleteMany({});
    await strapi.db.query('api::vote.vote').deleteMany({});
    await strapi.db.query('api::resource.resource').deleteMany({});
    await strapi.db.query('api::team.team').deleteMany({});
    await strapi.db.query('plugin::users-permissions.user').deleteMany({});

    // 1. Création des utilisateurs
    console.log('👥 Création des utilisateurs...');
    const users = [];
    for (let i = 0; i < 5; i++) {
      const user = await strapi.plugins['users-permissions'].services.user.add({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: 'Password123!',
        confirmed: true,
        blocked: false,
        provider: 'local',
      });
      users.push(user);
    }

    // 2. Création des équipes
    console.log('👥 Création des équipes...');
    const welcomeTeam = await strapi.entityService.create('api::team.team', {
      data: {
        name: 'Welcome',
        color: faker.color.human(),
        isWelcomeTeam: true,
        users: users.map(u => u.id),
      },
    });

    const otherTeams = [];
    for (let i = 0; i < 2; i++) {
      const team = await strapi.entityService.create('api::team.team', {
        data: {
          name: faker.company.name(),
          color: faker.color.human(),
          isWelcomeTeam: false,
          users: faker.helpers.arrayElements(users, faker.number.int({ min: 2, max: 4 })).map(u => u.id),
        },
      });
      otherTeams.push(team);
    }

    const allTeams = [welcomeTeam, ...otherTeams];

    // 3. Création des ressources avec leurs équipes
    console.log('📚 Création des ressources...');
    const resourcesWithTeams = [];
    for (let i = 0; i < 15; i++) {
      const author = faker.helpers.arrayElement(users);
      const teamsForResource = [];
      
      // 30% de chance d'être dans Welcome
      if (Math.random() < 0.3) {
        teamsForResource.push(welcomeTeam);
      }
      
      // 1 à 2 autres équipes aléatoires
      const randomTeams = faker.helpers.arrayElements(otherTeams, faker.number.int({ min: 1, max: 2 }));
      teamsForResource.push(...randomTeams);

      const resource = await strapi.entityService.create('api::resource.resource', {
        data: {
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          link: faker.internet.url(),
          imageUrl: faker.image.url(),
          isPublic: Math.random() < 0.3,
          teams: teamsForResource.map(t => t.id),
          author: author.id,
        },
      });

      resourcesWithTeams.push({
        ...resource,
        teamIds: teamsForResource.map(t => t.id)
      });
    }

    // 4. Création des commentaires (3 par ressource)
    console.log('💬 Création des commentaires...');
    for (const resource of resourcesWithTeams) {
      for (let i = 0; i < 3; i++) {
        const author = faker.helpers.arrayElement(users);
        const team = faker.helpers.arrayElement(
          allTeams.filter(t => resource.teamIds.includes(t.id))
        );

        await strapi.entityService.create('api::comment.comment', {
          data: {
            content: faker.lorem.paragraph(),
            date: faker.date.recent({ days: 30 }),
            resource: resource.id,
            team: team.id,
            author: author.id,
          },
        });
      }
    }

    // 5. Création des votes (8 votes répartis sur 5 ressources)
    console.log('👍 Création des votes...');
    const resourcesForVotes = faker.helpers.arrayElements(resourcesWithTeams, 5);
    for (let i = 0; i < 8; i++) {
      const resource = faker.helpers.arrayElement(resourcesForVotes);
      const author = faker.helpers.arrayElement(users);
      const team = faker.helpers.arrayElement(
        allTeams.filter(t => resource.teamIds.includes(t.id))
      );

      await strapi.entityService.create('api::vote.vote', {
        data: {
          value: faker.number.int({ min: 1, max: 5 }),
          date: faker.date.recent({ days: 30 }),
          resource: resource.id,
          team: team.id,
          author: author.id,
        },
      });
    }

    console.log('✅ Seed terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur pendant le seed:', error);
    throw error;
  }
};

export default seed;
