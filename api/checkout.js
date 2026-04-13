import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  // Configuração global de CORS
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
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Carrinho de compras está vazio ou é inválido.' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não foi configurada nas variáveis de ambiente da Vercel.');
    }

    // Calcula o valor total em centavos
    const amount = cartItems.reduce((acc, item) => {
      const priceString = item.price.replace('R$', '').trim();
      const unitAmount = Math.round(
        parseFloat(priceString.replace(/\./g, '').replace(',', '.')) * 100
      );
      return acc + (unitAmount * item.quantidade);
    }, 0);

    if (isNaN(amount) || amount <= 0) {
      throw new Error('Valor total do carrinho inválido.');
    }

    // Cria o PaymentIntent no Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      automatic_payment_methods: {
        enabled: true,
      },
      // Coleta automática de endereço de entrega pode ser habilitada via Elementos no Frontend
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Fatal Payment Intent Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Ocorreu um erro ao criar a intenção de pagamento.' 
    });
  }
}
