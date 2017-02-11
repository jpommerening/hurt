import wd from 'wd';

export function defaults() {
  const config = {
  };

  if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
    config.host = 'ondemand.saucelabs.com';
    config.port = 80;
    config.user = process.env.SAUCE_USERNAME;
    config.pwd = process.env.SAUCE_ACCESS_KEY;
  }
  if (process.env.TRAVIS) {
    config.host = 'localhost';
    config.port = 4445;
  }

  return config;
}

export function capabilities() {
  const caps = {};

  if (proces.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
    caps['seleniumVersion'] = '3.0.1';
  }
  if (process.env.TRAVIS) {
    caps['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
    caps['build'] = process.env.TRAVIS_BUILD_NUMBER;
  }
  if (process.env.BROWSER) {
    caps['browserName'] = process.env.BROWSER;

    if (process.env.BROWSER_VERSION) {
      caps['version'] = process.env.BROWSER_VERSION;
    }
  }
  if (process.env.PLATFORM) {
    caps['platform'] = process.env.PLATFORM;
  }

  return caps;
}

export function remote(config = {}) {
  return wd.promiseChainRemote({
    ...defaults(),
    ...config
  });
}

export default remote;
