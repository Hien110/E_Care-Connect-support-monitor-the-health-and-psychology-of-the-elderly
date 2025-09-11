const userRoutes = require('./user.routes');
const relationshipRoutes = require('./relationship.routes');
const supporterRoutes = require('./supporter.routes');

function route(app) {
    app.use('/api/users', userRoutes);
    app.use('/api/relationships', relationshipRoutes);
    app.use('/api/supporters', supporterRoutes);
}

module.exports = route;