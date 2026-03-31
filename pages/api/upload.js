// pages/api/upload.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data } = req.body; // base64 data URL
    const result = await cloudinary.uploader.upload(data, {
      folder: 'shree-gold',
      resource_type: 'image',
    });
    return res.status(200).json({ success: true, url: result.secure_url });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
