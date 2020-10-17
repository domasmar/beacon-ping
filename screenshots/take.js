require('chromedriver');

const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

module.exports = {takePlayAndTakeScreenshot}

async function takePlayAndTakeScreenshot() {
  return new Promise(async (resolve, reject) => {
    let driver;
    try {
      driver = await new Builder()
          .forBrowser('chrome')
          .build();
      await driver.sleep(1000);
      await driver.get('https://balticlivecam.com/cameras/lithuania/vilnius/vilnius-sv-jono-gatve/?embed');
      await driver.findElement(By.className('vjs-big-play-button')).click();
      await driver.sleep(2000);
      const image = await takeScreenshot(driver);
      resolve(image);
    } catch (e) {
      console.error(e);
      reject(e);
    } finally {
      if (driver) {
        await driver.quit();
      }
    }
  })
}

function takeScreenshot(driver) {
  return new Promise((resolve, reject) => {
    driver.takeScreenshot()
        .then((image, err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(image);
        })
  })
}

