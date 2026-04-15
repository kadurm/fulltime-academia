import { MercadoPagoConfig, Payment } from 'mercadopago';
import { kv } from '@vercel/kv';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export default async function handler(req, res) {
  // ... (previous CORS headers)
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payment = new Payment(client);
    
    // O Mercado Pago Core API recebe o body sanitizado para evitar erro de tamanho em metadata
    const response = await payment.create({ 
      body: { 
        transaction_amount: req.body.transaction_amount, 
        description: req.body.description, 
        payment_method_id: req.body.payment_method_id, 
        payer: {
          email: req.body.payer?.email,
          first_name: req.body.payer?.first_name,
          identification: req.body.payer?.identification
        }, 
        token: req.body.token, 
        installments: req.body.installments 
      } 
    });

    // Se for Pix, extrair dados do QR Code
    let pixData = null;
    if (req.body.payment_method_id === 'pix' && response.point_of_interaction) {
      pixData = {
        qr_code: response.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
        ticket_url: response.point_of_interaction.transaction_data.ticket_url
      };
    }

    // --- SALVAR PEDIDO NO KV (Resiliente) ---
    try {
      const isSuccess = response.status === 'approved' || (req.body.payment_method_id === 'pix' && response.status === 'pending');
      
      if (isSuccess) {
        const { customerData, cartItems } = req.body.metadata || {};
        
        const novoPedido = {
          id: response.id.toString(),
          data: new Date().toISOString(),
          cliente: req.body.payer?.email || 'N/A',
          items: cartItems || [],
          total: req.body.transaction_amount,
          metodo: req.body.payment_method_id,
          statusPagamento: response.status === 'approved' ? 'Aprovado' : 'Pendente (Pix)',
          origem: 'Mercado Pago'
        };

        const pedidosAtuais = await kv.get("pedidos") || [];
        await kv.set("pedidos", [novoPedido, ...pedidosAtuais]);
      }
    } catch (dbError) {
      // Logamos o erro mas permitimos que o fluxo do Mercado Pago continue para o cliente
      console.error('ERRO CRÍTICO KV (Omissão segura):', dbError);
    }

    return res.status(200).json({
      id: response.id,
      status: response.status,
      status_detail: response.status_detail,
      pix: pixData
    });
  } catch (error) {
    console.error('Mercado Pago Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Erro ao processar pagamento no Mercado Pago' 
    });
  }
}
