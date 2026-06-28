const { setupDev } = require('./setup');
const { listFiles } = require('./commands/list');
const { checkHealth } = require('./commands/check-health');
const { runLint } = require('./commands/lint');
const { runTypeCheck } = require('./commands/typecheck');

module.exports = {
  setupDev,
  listFiles,
  checkHealth,
  runLint,
  runTypeCheck,
};