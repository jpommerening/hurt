import wd from 'wd';
import phantomjs from 'phantomjs-prebuilt';

export function defaults() {
  const config = {
  };

  if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
    config.host = 'ondemand.saucelabs.com';
    config.port = 80;
    config.user = process.env.SAUCE_USERNAME;
    config.pwd = process.env.SAUCE_ACCESS_KEY;

    if (process.env.TRAVIS) {
      config.host = 'localhost';
      config.port = 4445;
    }
  }

  return config;
}

export function capabilities() {
  const caps = {};

  if (process.env.BROWSER) {
    caps['browserName'] = process.env.BROWSER;

    if (process.env.BROWSER_VERSION) {
      caps['version'] = process.env.BROWSER_VERSION;
    }
  }
  if (process.env.PLATFORM) {
    caps['platform'] = process.env.PLATFORM;
  }
  if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
    caps['seleniumVersion'] = '3.0.1';

    if (process.env.TRAVIS && caps['browserName']) {
      caps['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
      caps['build'] = process.env.TRAVIS_BUILD_NUMBER;
    }
  }

  return caps;
}

function start(remote, caps) {
  if (!(caps['browserName'] || caps['tunnel-identifier'])) {
    return phantomjs.run(`--webdriver=${remote.configUrl.port || 4444}`).then(program => {
      remote.on('command', (type, command) => {
        if (type === 'RESPONSE' && /quit\(.*\)/.test(command)) {
          program.kill();
        }
      });

      return remote;
    });
  }

  return remote;
}

export function remote(config = {}) {
  const remote = wd.promiseChainRemote({
    ...defaults(),
    ...config
  });
  const init = remote.init;

  remote.init = caps => {
    return remote
      .resolve(start(remote, caps))
      .then(() => {
        return init.call(remote, caps);
      });
  };

  return remote;
}

export default remote;
