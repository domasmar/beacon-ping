process.env.PUBLIC_DIR = __dirname + '/public'

const {ai} = require('./src/ai');
const {loadImage, createCanvas} = require('canvas')

const toRun = [
  'operos-ir-baleto-aikstele-19h00m28s649.png',
  'operos-ir-baleto-aikstele-19h00m36s069.png',
  'operos-ir-baleto-aikstele-19h00m42s741.png',
  'operos-ir-baleto-aikstele-19h00m50s654.png',
  'operos-ir-baleto-aikstele-19h00m57s731.png',
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

async function putIndicators(imagePath, destination, instances) {
  const image = await loadImage(imagePath);

  const imageHeight = image.height
  const imageWidth = image.width;

  const canvas = createCanvas(imageWidth, imageHeight)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0);

  for (let i = 0; i < instances.length; i++) {
    const {BoundingBox} = instances[i]
    const {Width: width, Height: height, Left: left, Top: top} = BoundingBox;

    const x = left * imageWidth;
    const y = top * imageHeight;
    const w = width * imageWidth;
    const h = height * imageHeight;

    const gradient = ctx.createLinearGradient(0, 0, imageHeight, imageWidth);
    gradient.addColorStop(0, "magenta");
    gradient.addColorStop(0.7 ,"blue");
    gradient.addColorStop(1.0, "red");
    ctx.strokeStyle = gradient
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
  }

  const fs = require('fs')
  const out = fs.createWriteStream(destination)
  const stream = canvas.createJPEGStream()
  stream.pipe(out);

  await new Promise(resolve => out.on('finish', () => resolve()));

}