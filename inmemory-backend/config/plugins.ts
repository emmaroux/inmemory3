export default ({ env }) => ({
    'users-permissions': {
      enabled: true,
      config: {
        jwt: {
          expiresIn: '30d',
          issuer: 'inmemory-api',
          audience: 'inmemory-web',
          algorithm: 'HS256',
        },
        jwtSecret: env('JWT_SECRET'),
        ratelimit: {
          max: 100,
          interval: '1m',
        },
      },
    },
  });
  