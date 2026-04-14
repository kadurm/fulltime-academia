import { MercadoPagoConfig, Payment } from 'mercadopago';
import { kv } from '@vercel/kv';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export default async function handler(req, res) {
  // Log de recepção para debug
  console.log('Webhook MP recebido:', JSON.stringify(req.body));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, type, data } = req.body;

  // O Mercado Pago pode enviar 'payment.updated' ou 'payment.created'
  // O ID costuma vir em req.body.data.id para notificações v2
  if (type === 'payment' || action?.startsWith('payment.')) {
    const paymentId = data?.id || req.query?.id || req.body?.id;

    if (paymentId) {
      try {
        const payment = new Payment(client);
        const mpResponse = await payment.get({ id: paymentId });

        console.log(`Status do pagamento ${paymentId}: ${mpResponse.status}`);

        if (mpResponse.status === 'approved') {
          const pedidos = await kv.get("pedidos") || [];
          
          // Localizar o pedido pelo ID do pagamento do Mercado Pago
          const index = pedidos.findIndex(p => p.id === paymentId.toString());

          if (index !== -1) {
            // Só atualiza se ainda não estiver processado para evitar loops/sobrescritas indevidas
            const statusAtual = pedidos[index].statusPagamento;
            if (statusAtual === 'Pendente' || statusAtual === 'Pendente (Pix)') {
              pedidos[index].statusPagamento = 'Aguardando Envio';
              await kv.set("pedidos", pedidos);
              console.log(`SUCESSO: Pedido ${paymentId} movido para 'Aguardando Envio'.`);
            }
          } else {
            console.log(`AVISO: Pedido ${paymentId} não encontrado no banco de dados.`);
          }
        }
      } catch (error) {
        console.error('ERRO ao processar Webhook:', error.message);
      }
    }
  }

  // Retorno 200 imediato (crucial para o Mercado Pago)
  return res.status(200).send('OK');
}
