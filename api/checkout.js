const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    const line_items = cartItems.map((item) => {
      // Converte o preço de "R$ 159,90" para 159.90 e depois para centavos (15990)
      const unit_amount = Math.round(
        parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.')) * 100
      );

      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            images: item.imagem ? [item.imagem] : [],
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
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/loja?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
