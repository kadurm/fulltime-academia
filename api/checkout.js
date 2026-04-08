const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { cart } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    const line_items = cart.map((item) => {
      // O preço vem como "R$ 159,90", precisamos converter para centavos
      const unit_amount = Math.round(
        parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.')) * 100
      );

      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
          },
          unit_amount,
        },
        quantity: item.quantidade || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/index.html?success=true`,
      cancel_url: `${req.headers.origin}/suplementos.html?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Erro no Checkout Stripe:', err);
    return res.status(500).json({ error: err.message });
  }
};
