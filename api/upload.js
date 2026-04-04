const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = async (request, response) => {
  // Configurar CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageStr } = request.body;

    if (!imageStr) {
      return response.status(400).json({ error: 'Image string is required' });
    }

    // Upload para Cloudinary
    const result = await cloudinary.uploader.upload(imageStr, {
      folder: 'fulltime_loja'
    });

    return response.status(200).json({
      secure_url: result.secure_url
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return response.status(500).json({
      error: error.message || 'Failed to upload image'
    });
  }
};
