export default {
  routes: [
    {
      method: 'GET',
      path: '/resources/user/:id',
      handler: 'resource.findByUser',
      config: {
        auth: false,
        description: "Récupère toutes les ressources accessibles à un utilisateur via ses équipes",
        middlewares: [],
      },
    },
  ],
}; 