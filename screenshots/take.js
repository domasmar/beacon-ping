require('chromedriver');

const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

module.exports = { takePlayAndTakeScreenshot }

// takePlayAndTakeScreenshot().then((image) => {
//   require('fs').writeFile('out.png', image, 'base64', function (err) {
//     console.log(err);
//   });
// })

async function takePlayAndTakeScreenshot() {
  return new Promise(async (resolve, reject) => {
    console.log('test1')
    let driver = await new Builder()
        .forBrowser('chrome')
        .build();
    try {
      await driver.sleep(1000);
      console.log('test2')
      await driver.get('https://balticlivecam.com/cameras/lithuania/vilnius/vilnius-sv-jono-gatve/?embed');
      console.log('test3')
      await driver.findElement(By.className('vjs-big-play-button')).click();
      console.log('test4')
      await driver.sleep(2000);
      console.log('test5')
      const image = await takeScreenshot(driver);
      console.log('test6')
      resolve(image);
    } catch (e) {
      console.error(e);
      reject(e);
    } finally {
      await driver.quit();
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

