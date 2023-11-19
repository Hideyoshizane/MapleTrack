module.exports = function flashMiddleware() {
    return async (ctx, next) => {
        ctx.state.flash = ctx.session.flash || {};
        ctx.flash = (type, message) => {
            ctx.session.flash = { type, message };
        };
        delete ctx.session.flash;
        await next();
    };
};