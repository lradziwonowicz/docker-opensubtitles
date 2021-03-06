const _ = require('lodash');
const globals = require('../globals');

const { logger } = globals;

module.exports = _data => new Promise((resolve) => {
  const data = Object.assign({}, _data);
  logger.log({
    level: 'info',
    label: 'CleanBlockedFiles',
    message: 'Remove blocked files',
  });
  Object.keys(data.api).forEach((key) => {
    const list = data.api[key];
    if (list.length > 0) {
      for (let i = list.length - 1; i >= 0; i -= 1) {
        const id = list[i];
        if (data.blocked.includes(id)) {
          logger.log({
            level: 'debug',
            label: 'CleanBlockedFiles',
            message: `Subs id is blocked ${id}`,
          });
          list.splice(i, 1);
        }
      }
    }
  });
  return resolve(data);
});
