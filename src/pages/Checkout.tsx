import React, { useState, useEffect } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { GlassCard } from '../components/ui/glass-card';
import { ShoppingCart, ArrowLeft, ShieldCheck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Inicialização segura do Mercado Pago
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);

interface CartItem {
  id: string;
  name: string;
  price: string;
  imagem: string;
  quantidade: number;
}

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
    setCartItems(cart);

    if (cart.length === 0) {
      navigate('/loja');
    }
  }, [navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.'));
      return acc + (price * item.quantidade);
    }, 0);
  };

  const initialization = {
    amount: calculateTotal(),
    preferenceId: undefined, // Opcional se usar Brick de Pagamento direto
  };

  const customization = {
    paymentMethods: {
      bankTransfer: 'all' as const, // Para Pix
      creditCard: 'all' as const,
      debitCard: 'all' as const,
    },
    visual: {
      style: {
        theme: 'dark' as const,
      }
    }
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    return new Promise((resolve, reject) => {
      fetch('/api/process_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.error) {
            reject(result.error);
          } else {
            // Em caso de Pix, o result conterá point_of_interaction.transaction_data.qr_code_base64
            resolve(result);
            if (result.status === 'approved' || result.status === 'in_process') {
              window.location.href = '/?success=true';
            }
          }
        })
        .catch((error) => {
          console.error('Erro no processamento:', error);
          reject(error);
        });
    });
  };

  const onReady = () => {
    console.log('Brick do Mercado Pago pronto');
  };

  const onError = (error: any) => {
    console.error('Erro no Brick:', error);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para a Loja
        </button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Resumo do Pedido */}
          <div className="flex flex-col gap-8">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-2">Finalizar Compra</h1>
            <p className="text-white/60 -mt-6">Revise seu pedido antes de prosseguir com o pagamento seguro via Mercado Pago.</p>

            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                  <img 
                    src={item.imagem || "/logo.png"} 
                    alt={item.name} 
                    className="h-16 w-16 object-cover rounded-xl border border-white/10"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{item.name}</h3>
                    <p className="text-sm text-white/40">{item.quantidade}x un.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-400">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
              <span className="text-xl text-white/60">Total</span>
              <span className="text-3xl font-bold text-blue-400">
                R$ {calculateTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Mercado Pago Payment Brick */}
          <GlassCard className="p-4 md:p-8 border-white/10 shadow-2xl relative overflow-hidden min-h-[500px]">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8 text-white">
                <ShieldCheck className="text-green-500" />
                <h2 className="text-xl font-bold">Pagamento Seguro</h2>
              </div>

              {cartItems.length > 0 && (
                <Payment
                  initialization={initialization}
                  customization={customization}
                  onSubmit={onSubmit}
                  onReady={onReady}
                  onError={onError}
                />
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
