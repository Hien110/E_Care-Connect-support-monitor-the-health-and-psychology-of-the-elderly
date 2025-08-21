const userRoutes = require('./user.routes');

function route(app) {
    app.use('/api/users', userRoutes);
}

module.exports = route;