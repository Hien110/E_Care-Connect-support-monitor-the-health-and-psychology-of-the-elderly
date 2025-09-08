const userRoutes = require('./user.routes');
const relationshipRoutes = require('./relationship.routes');

function route(app) {
    app.use('/api/users', userRoutes);
    app.use('/api/relationships', relationshipRoutes);
}

module.exports = route;