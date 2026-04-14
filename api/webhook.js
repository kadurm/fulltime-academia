import { MercadoPagoConfig, Payment } from 'mercadopago';
import { kv } from '@vercel/kv';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export default async function handler(req, res) {
  // O Mercado Pago exige resposta rápida (200 OK) para evitar reenvios.
  // Vamos processar a lógica e retornar o mais rápido possível.
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, type, data } = req.body;

  // Verificamos se a notificação é de um pagamento
  if (type === 'payment' || action?.startsWith('payment.')) {
    const paymentId = data?.id || req.query?.id || req.body?.id;

    if (paymentId) {
      try {
        // 1. Consultar o status real no Mercado Pago
        const payment = new Payment(client);
        const mpResponse = await payment.get({ id: paymentId });

        // 2. Se estiver aprovado, atualizamos no nosso banco (KV)
        if (mpResponse.status === 'approved') {
          const pedidos = await kv.get("pedidos") || [];
          
          // Procuramos o pedido pelo ID do pagamento do Mercado Pago
          // No checkout, salvamos o id como string: response.id.toString()
          const index = pedidos.findIndex(p => p.id === paymentId.toString());

          if (index !== -1 && pedidos[index].statusPagamento !== 'Aguardando Envio') {
            pedidos[index].statusPagamento = 'Aguardando Envio';
            await kv.set("pedidos", pedidos);
            console.log(`Pedido ${paymentId} atualizado para Aguardando Envio via Webhook.`);
          }
        }
      } catch (error) {
        console.error('Webhook Error:', error.message);
        // Não retornamos erro 500 para o MP não travar a fila, apenas logamos.
      }
    }
  }

  // Sempre retornar 200 OK para o Mercado Pago
  return res.status(200).send('OK');
}
