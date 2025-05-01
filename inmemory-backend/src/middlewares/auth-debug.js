export default () => {
  return async (ctx, next) => {
    console.log('🔒 Auth Debug Middleware');
    console.log('URL:', ctx.url);
    console.log('Method:', ctx.method);
    console.log('Headers:', ctx.headers);
    
    const token = ctx.request.header.authorization;
    if (token) {
      console.log('Token présent:', token.substring(0, 50) + '...');
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token.replace('Bearer ', ''));
        console.log('Token décodé:', decoded);
      } catch (error) {
        console.error('Erreur décodage token:', error);
      }
    } else {
      console.log('Pas de token dans la requête');
    }

    await next();

    console.log('Status de réponse:', ctx.response.status);
    if (ctx.response.status === 401) {
      console.log('Détails de l\'erreur 401:', ctx.response.body);
    }
  };
}; 