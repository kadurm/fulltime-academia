import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payment = new Payment(client);
    
    // O Mercado Pago Core API recebe o body customizado
    const response = await payment.create({ body: req.body });

    // Se for Pix, extrair dados do QR Code
    let pixData = null;
    if (req.body.payment_method_id === 'pix' && response.point_of_interaction) {
      pixData = {
        qr_code: response.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
        ticket_url: response.point_of_interaction.transaction_data.ticket_url
      };
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
