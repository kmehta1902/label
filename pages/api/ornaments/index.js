// pages/api/ornaments/index.js
import dbConnect from '../../../lib/mongoose';
import Ornament from '../../../lib/models/Ornament';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const ornaments = await Ornament.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: ornaments });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const grossWeight = parseFloat(body.grossWeight) || 0;
      const stoneWeight = parseFloat(body.stoneWeight) || 0;
      const colorWeight = parseFloat(body.colorWeight) || 0;
      const lessWeight = parseFloat(body.lessWeight) || 0;
      const netWeight = parseFloat((grossWeight - stoneWeight - colorWeight - lessWeight).toFixed(3));

      const itemCode = body.itemCode || `SG-${uuidv4().split('-')[0].toUpperCase()}`;

      const ornament = await Ornament.create({
        ...body,
        itemCode,
        grossWeight,
        stoneWeight,
        colorWeight,
        lessWeight,
        netWeight,
      });

      return res.status(201).json({ success: true, data: ornament });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
