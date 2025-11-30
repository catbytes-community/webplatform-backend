const app = require('./app');
const routes = require('./routes/routes');

// Setting the app up for tests - so it has all the routes
// (we don't need to wait for the database connection in unit-tests)

// to simulate authentication in tests, we read userId from headers
app.use((req, res, next) => {
  if (!req.userId && req.headers['userid']) {
    req.userId = Number(req.headers['userid']);
  }
  next();
});
app.use(routes);

module.exports = app;