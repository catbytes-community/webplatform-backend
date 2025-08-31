const app = require('./app');
const routes = require('./routes/routes');

// Setting the app up for tests - so it has all the routes
// (we don't need to wait for the database connection in unit-tests)
app.use(routes);

module.exports = app;