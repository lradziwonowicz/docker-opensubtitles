const OS = require('opensubtitles-api');
const globals = require('../globals');

const { config, logger } = globals;

globals.openSubtitles = new OS({
  useragent: 'docker-opensubtitles v1',
  ssl: true,
  username: config.opensubtitles.username,
  password: config.opensubtitles.password,
});
// @TODO retry doesn't work
const wait = ms => new Promise(r => setTimeout(r, ms));

const loginAction = () => new Promise((resolve, reject) => {
  logger.log({
    level: 'info',
    label: 'OpenSubtitle',
    message: 'Try to login',
  });
  globals.openSubtitles
    .login()
    .then((res) => {
      resolve(res);
    })
    .catch((err) => {
      logger.log({
        level: 'error',
        label: 'OpenSubtitle',
        message: 'Failed to login',
        meta: err,
      });
      reject();
    });
});

const login = (loginRetires = 0, times = 3, delay = 1000) => new Promise((resolve, reject) => {
  loginAction()
    .then((res) => {
      logger.log({
        level: 'info',
        label: 'OpenSubtitle',
        message: 'Connected',
      });
      logger.log({
        level: 'debug',
        label: 'OpenSubtitle',
        message: 'Response',
        meta: res,
      });

      let { languages } = config.opensubtitles;
      if (!languages) {
        try {
          let lng = res.userinfo.UserPreferedLanguages;
          lng = lng.split(',');
          if (lng && lng.length !== 0) {
            languages = lng;
          }
        } catch (err) {
          logger.log({
            level: 'error',
            label: 'OpenSubtitle',
            message: `failed to parse ${err}`,
          });
        }

        // check final, make sure something is here
        if (!languages) languages = ['eng'];
      }
      /*
      languages = _.map(languages, (lang) => {
        const o = _.find(iso, code => code.iso6392B === lang);
        if (o) return o.iso6391;
        return lang;
      });
      */
      globals.languages = languages;
      globals.userToken = res.token;

      logger.log({
        level: 'info',
        label: 'OpenSubtitle',
        message: 'Set Language to Open Subtitles',
        meta: languages,
      });
      resolve();
    })
    .catch((err) => {
      const numOfRetires = loginRetires + 1;
      if ((numOfRetires < times, config.opensubtitles.loginRetries)) {
        return wait(delay)
          .then(login.bind(null, loginAction, delay, times))
          .then(resolve)
          .catch(reject);
      }
      return reject(err);
    });
});
module.exports = login;
