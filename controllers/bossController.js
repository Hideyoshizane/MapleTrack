module.exports = {
  getList: async (ctx) => {
    try {
      const username = ctx.params.username;
      console.log('placeholder testing');
      ctx.body = username;
    } catch (error) {
      console.error('Error in getList:', error);
    }
  }
};