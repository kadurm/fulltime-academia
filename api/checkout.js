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

    const line_items = cartItems.map((item) => {
      // Limpeza rigorosa do valor: remove prefixo, pontos de milhar e troca vírgula por ponto
      const priceString = item.price.replace('R$', '').trim();
      const unit_amount = Math.round(
        parseFloat(priceString.replace(/\./g, '').replace(',', '.')) * 100
      );

      if (isNaN(unit_amount)) {
        throw new Error(`Preço inválido para o item: ${item.name}`);
      }

      const isImageUrlValid = typeof item.imagem === 'string' && item.imagem.startsWith('http');

      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            ...(isImageUrlValid ? { images: [item.imagem] } : {}),
          },
          unit_amount: unit_amount,
        },
        quantity: item.quantidade,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['BR'],
      },
      billing_address_collection: 'auto',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/loja?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Fatal Stripe Checkout Error:', error);
    // Garantia de retorno JSON em 100% dos casos de erro
    return res.status(500).json({ 
      error: error.message || 'Ocorreu um erro interno inesperado no servidor.' 
    });
  }
}
