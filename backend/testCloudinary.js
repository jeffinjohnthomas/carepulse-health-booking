require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const variations = [
    'zc_1GcPOlbP1m1EhBaRyJ335o1U', // Original
    'zc_lGcPOIbP1mlEhBaRyJ335o1U', // lowercase Ls, uppercase I
    'zc_1GcPOIbP1m1EhBaRyJ335o1U', // ones, uppercase I
    'zc_lGcPOlbP1m1EhBaRyJ335o1U', // lowercase L
];

async function testVariations() {
    for (let secret of variations) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: secret
        });

        try {
            const result = await cloudinary.uploader.upload('https://cloudinary-devs.github.io/cld-docs-assets/assets/images/butterfly.jpeg', { folder: 'carepulse/records' });
            console.log("Success with secret:", secret);
            return;
        } catch (error) {
            console.log("Failed with:", secret, error.message);
        }
    }
}
testVariations();
