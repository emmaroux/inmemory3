export default {
  routes: [
    {
      method: 'GET',
      path: '/votes',
      handler: 'vote.find',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/votes/:id',
      handler: 'vote.findOne',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/votes',
      handler: 'vote.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/votes/:id',
      handler: 'vote.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/votes/:id',
      handler: 'vote.delete',
      config: {
        policies: [],
      },
    },
  ],
}; 