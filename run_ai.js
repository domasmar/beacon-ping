process.env.PUBLIC_DIR = __dirname + '/public';

const {ai} = require('./src/ai');
const { putIndicators } = require('./src/indicators');

const toRun = [
  'vilniaus/vilniaus1.jpg',
  'vilniaus/vilniaus2.jpg',
  'vilniaus/vilniaus3.jpg',
  'vilniaus/vilniaus4.jpg',
  'vilniaus/vilniaus5.jpg',
  'vilniaus/vilniaus6.jpg',
  'vilniaus/vilniaus7.jpg',
];

(async () => {
  for (let i = 0; i < toRun.length; i++) {
    const image = __dirname + '/source/' + toRun[i];
    const imageResult = __dirname + '/public/generated/' + toRun[i].replace('.png', '.jpg');

    const result = await ai(image, false);
    const labelWithCar = result.Labels.find(l => l.Name === 'Car');
    const instances = (labelWithCar && labelWithCar.Instances) || [];

    console.log(image, imageResult);

    await putIndicators(image, imageResult, instances);

    console.log(image, imageResult);
  }
})();

