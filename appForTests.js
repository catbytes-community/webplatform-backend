const app = require('./app');
const routes = require('./routes/routes');

app.use(routes);

module.exports = app;