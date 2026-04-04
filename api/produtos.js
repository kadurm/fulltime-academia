import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const produtos = await kv.get("produtos") || [];
      return res.status(200).json(produtos);
    }

    if (req.method === 'POST') {
      const { produtos } = req.body;
      if (!Array.isArray(produtos)) {
        return res.status(400).json({ error: 'Invalid data format' });
      }
      await kv.set("produtos", produtos);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('KV Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
