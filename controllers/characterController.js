module.exports = {
    showCharacter: async (ctx) => {
      try {
        const { username, server, characterClass } = ctx.params;
        await ctx.render('character', {
          username: username,
          server: server,
          characterClass: characterClass,
        });
      } catch (error) {
        console.error('Error rendering character page:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while rendering character page' };
      }
    },
  };
  