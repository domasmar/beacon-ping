process.env.PUBLIC_DIR = __dirname + '/public';

const {ai} = require('./src/ai');
const { putIndicators } = require('./src/indicators');

const toRun = [
  'smugleviciaus/smugleviciausg_5.jpg',
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

