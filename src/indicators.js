const fs = require('fs');
const {loadImage, createCanvas} = require('canvas')

module.exports = {putIndicators};

async function putIndicators(imagePath, destination, instances, confidenceThreshold = 0) {
  const image = await loadImage(imagePath);

  const imageHeight = image.height
  const imageWidth = image.width;

  const canvas = createCanvas(imageWidth, imageHeight)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0);

  for (let i = 0; i < instances.length; i++) {
    const {BoundingBox,  Confidence: confidence} = instances[i]
    const {Width: width, Height: height, Left: left, Top: top} = BoundingBox;

    if (confidence > confidenceThreshold) {
      const x = left * imageWidth;
      const y = top * imageHeight;
      const w = width * imageWidth;
      const h = height * imageHeight;

      ctx.strokeStyle = 'rgb(57, 255, 20)'
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
    }
  }

  const out = fs.createWriteStream(destination)
  const stream = canvas.createJPEGStream()
  stream.pipe(out);

  await new Promise(resolve => out.on('finish', () => resolve()));

}