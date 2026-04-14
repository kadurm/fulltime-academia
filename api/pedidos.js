import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const pedidos = await kv.get("pedidos") || [];
      // Ordenar do mais recente para o mais antigo (data decrescente)
      const pedidosOrdenados = pedidos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      return res.status(200).json(pedidosOrdenados);
    }

    if (req.method === 'POST') {
      const novoPedido = req.body;
      if (!novoPedido || !novoPedido.cliente) {
        return res.status(400).json({ error: 'Dados do pedido inválidos' });
      }

      const pedidosAtuais = await kv.get("pedidos") || [];
      const novosPedidos = [novoPedido, ...pedidosAtuais];
      
      await kv.set("pedidos", novosPedidos);
      return res.status(200).json({ success: true });
    }

    // Método PUT para atualizar status (opcional, mas útil para o admin)
    if (req.method === 'PUT') {
      const { id, status } = req.body;
      const pedidos = await kv.get("pedidos") || [];
      const novosPedidos = pedidos.map(p => p.id === id ? { ...p, statusPagamento: status } : p);
      await kv.set("pedidos", novosPedidos);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('KV Pedidos Error:', error);
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
}
