import * as webdriverio from 'webdriverio';

export function defaults() {
  const config = {
    desiredCapabilities: {}
  };

  if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
    config.host = 'ondemand.saucelabs.com';
    config.port = 80;
    config.user = process.env.SAUCE_USERNAME;
    config.key = process.env.SAUCE_ACCESS_KEY;
  }
  if (process.env.TRAVIS) {
    config.desiredCapabilities['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
    config.desiredCapabilities['build'] = process.env.TRAVIS_BUILD_NUMBER;
  }
  if (process.env.BROWSER) {
    config.desiredCapabilities['browserName'] = process.env.BROWSER;
  }

  return config;
}

export default function webdriver(options = {}) {
  const config = {
    ...defaults(),
    ...options
  };

  return webdriverio.remote(config);
};
