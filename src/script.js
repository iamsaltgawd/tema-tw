const imageUploader = document.getElementById('imageUploader');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const grayscaleButton = document.getElementById('grayscaleButton');
const sharpenButton = document.getElementById('sharpenButton');
let image = new Image();

imageUploader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            image.src = e.target.result;
            image.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            };
        };
        reader.readAsDataURL(file);
    }
});

grayscaleButton.addEventListener('click', () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const grayscaleData = convertToGrayscale(imageData);
    ctx.putImageData(grayscaleData, 0, 0);
});

sharpenButton.addEventListener('click', () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const sharpenedData = applySharpening(imageData);
    ctx.putImageData(sharpenedData, 0, 0);
});

function convertToGrayscale(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const grayscale = red * 0.3 + green * 0.59 + blue * 0.11;
        data[i] = data[i + 1] = data[i + 2] = grayscale;
    }

    return imageData;
}

function applySharpening(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);

    const kernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
    ];

    const half = Math.floor(Math.sqrt(kernel.length) / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let red = 0, green = 0, blue = 0;

            for (let ky = -half; ky <= half; ky++) {
                for (let kx = -half; kx <= half; kx++) {
                    const px = x + kx;
                    const py = y + ky;

                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const offset = ((py * width) + px) * 4;
                        const weight = kernel[(ky + half) * 3 + (kx + half)];

                        red += data[offset] * weight;
                        green += data[offset + 1] * weight;
                        blue += data[offset + 2] * weight;
                    }
                }
            }

            const index = (y * width + x) * 4;
            output[index] = Math.min(Math.max(red, 0), 255);
            output[index + 1] = Math.min(Math.max(green, 0), 255);
            output[index + 2] = Math.min(Math.max(blue, 0), 255);
            output[index + 3] = data[index + 3];
        }
    }


    for (let i = 0; i < output.length; i++) {
        imageData.data[i] = output[i];
    }

    return imageData;
}
