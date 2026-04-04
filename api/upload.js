const cloudinary = require('cloudinary').v2;
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method Not Allowed'});
  try {
    const { imageStr } = req.body;
    if (!imageStr) return res.status(400).json({error: 'No image payload'});
    const uploadRes = await cloudinary.uploader.upload(imageStr, { folder: 'fulltime_loja' });
    return res.status(200).json({ secure_url: uploadRes.secure_url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
