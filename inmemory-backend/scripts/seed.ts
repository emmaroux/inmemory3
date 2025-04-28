console.log('🚀 seed.ts chargé et prêt');

const seed = async (strapi) => {
  console.log('🛠️ Démarrage du seed...');

  const faker = (await import('@faker-js/faker')).fakerFR; // utilisation dynamique pour être sûr

  const otherTeams = [];

  // 1. Créer l'équipe Welcome
  const welcomeTeam = await strapi.entityService.create('api::team.team', {
    data: {
      name: 'Welcome',
      color: faker.color.human(),
      isWelcomeTeam: true,
    },
  });

  // 2. Créer d'autres équipes
  for (let i = 0; i < 4; i++) {
    const team = await strapi.entityService.create('api::team.team', {
      data: {
        name: faker.company.name(),
        color: faker.color.human(),
        isWelcomeTeam: false,
      },
    });
    otherTeams.push(team);
  }

  const allTeams = [welcomeTeam, ...otherTeams];

  // 3. Créer des utilisateurs
  const users = [];
  for (let i = 0; i < 20; i++) {
    const username = faker.internet.userName();
    const email = faker.internet.email();
    const randomTeams = faker.helpers.arrayElements(otherTeams, faker.number.int({ min: 1, max: 2 }));
    const teamIds = [welcomeTeam.id, ...randomTeams.map((t) => t.id)];

    const user = await strapi.entityService.create('plugin::users-permissions.user', {
      data: {
        username,
        email,
        password: 'password',
        confirmed: true,
        teams: teamIds,
      },
    });

    users.push(user);
  }

  // 4. Créer des ressources
  const resources = [];
  for (let i = 0; i < 50; i++) {
    const title = faker.lorem.sentence();
    const description = faker.lorem.paragraph();
    const link = faker.internet.url();
    let teamsForResource = [];

    if (Math.random() < 0.3) {
      teamsForResource.push(welcomeTeam);
    }

    const randomTeams = faker.helpers.arrayElements(otherTeams, faker.number.int({ min: 1, max: 2 }));

    if (randomTeams.length === 0) {
      const fallbackTeam = faker.helpers.arrayElement(otherTeams);
      teamsForResource.push(fallbackTeam);
    } else {
      teamsForResource = [...teamsForResource, ...randomTeams];
    }

    const teamIds = teamsForResource.map((t) => t.id);

    const resource = await strapi.entityService.create('api::resource.resource', {
      data: {
        title,
        description,
        link,
        imageUrl: faker.image.url(), // Ajout d'une image fictive
        isPublic: Math.random() < 0.3,
        teams: teamIds,
      },
    });

    resources.push(resource);
  }

  // 5. Créer des votes
  for (let i = 0; i < 100; i++) {
    const user = faker.helpers.arrayElement(users);
    const resource = faker.helpers.arrayElement(resources);
    const team = faker.helpers.arrayElement(allTeams);

    await strapi.entityService.create('api::vote.vote', {
      data: {
        value: faker.number.int({ min: 1, max: 5 }),
        date: faker.date.recent({ days: 30 }),
        user: user.id,
        resource: resource.id,
        team: team.id,
      },
    });
  }

  // 6. Créer des commentaires
  for (let i = 0; i < 100; i++) {
    const user = faker.helpers.arrayElement(users);
    const resource = faker.helpers.arrayElement(resources);
    const team = faker.helpers.arrayElement(allTeams);

    await strapi.entityService.create('api::comment.comment', {
      data: {
        content: faker.lorem.sentences(2),
        date: faker.date.recent({ days: 30 }),
        user: user.id,
        resource: resource.id,
        team: team.id,
      },
    });
  }

  console.log('✅ Seed terminé : équipes, utilisateurs, ressources, votes et commentaires créés.');
};

export default seed;
