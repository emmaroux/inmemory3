const seed = async (strapi) => {
  console.log('🚀 seed.ts chargé et prêt');
  console.log('🛠️ Démarrage du seed...');

  const faker = (await import('@faker-js/faker')).fakerFR;

  const otherTeams = [];

  const welcomeTeam = await strapi.entityService.create('api::team.team', {
    data: {
      name: 'Welcome',
      color: faker.color.human(),
      isWelcomeTeam: true,
    },
  });

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

  const resources = [];
  for (let i = 0; i < 20; i++) {
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
        imageUrl: faker.image.url(),
        isPublic: Math.random() < 0.3,
        teams: teamIds,
      },
    });

    resources.push(resource);
  }

  for (let i = 0; i < 40; i++) {
    const resource = faker.helpers.arrayElement(resources);
    const team = faker.helpers.arrayElement(allTeams);

    await strapi.entityService.create('api::vote.vote', {
      data: {
        value: faker.number.int({ min: 1, max: 5 }),
        date: faker.date.recent({ days: 30 }),
        resource: resource.id,
        team: team.id,
      },
    });
  }

  for (let i = 0; i < 20; i++) {
    const resource = faker.helpers.arrayElement(resources);
    const team = faker.helpers.arrayElement(allTeams);

    await strapi.entityService.create('api::comment.comment', {
      data: {
        content: faker.lorem.sentences(2),
        date: faker.date.recent({ days: 30 }),
        resource: resource.id,
        team: team.id,
      },
    });
  }

  console.log('✅ Seed terminé : équipes, ressources, votes et commentaires créés.');
};

export default seed;
