// pages/api/ornaments/[id].js
import dbConnect from '../../../lib/mongoose';
import Ornament from '../../../lib/models/Ornament';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Try finding by itemCode first (for barcode scan), then by _id
      let ornament = await Ornament.findOne({ itemCode: id });
      if (!ornament) ornament = await Ornament.findById(id).catch(() => null);
      if (!ornament) return res.status(404).json({ success: false, error: 'Not found' });
      return res.status(200).json({ success: true, data: ornament });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body;
      const grossWeight = parseFloat(body.grossWeight) || 0;
      const stoneWeight = parseFloat(body.stoneWeight) || 0;
      const colorWeight = parseFloat(body.colorWeight) || 0;
      const lessWeight = parseFloat(body.lessWeight) || 0;
      const netWeight = parseFloat((grossWeight - stoneWeight - colorWeight - lessWeight).toFixed(3));

      const ornament = await Ornament.findByIdAndUpdate(
        id,
        { ...body, grossWeight, stoneWeight, colorWeight, lessWeight, netWeight, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!ornament) return res.status(404).json({ success: false, error: 'Not found' });
      return res.status(200).json({ success: true, data: ornament });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const ornament = await Ornament.findByIdAndDelete(id);
      if (!ornament) return res.status(404).json({ success: false, error: 'Not found' });
      return res.status(200).json({ success: true, data: {} });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
