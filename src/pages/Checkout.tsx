import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { GlassCard } from '../components/ui/glass-card';
import { ShoppingCart, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CartItem {
  id: string;
  name: string;
  price: string;
  imagem: string;
  quantidade: number;
}

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?success=true`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "Ocorreu um erro com o seu cartão.");
    } else {
      setMessage("Ocorreu um erro inesperado.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg uppercase tracking-wider text-sm flex items-center justify-center gap-2 mt-4"
      >
        <span id="button-text">
          {isLoading ? "Processando..." : "Pagar Agora"}
        </span>
      </button>
      {message && <div id="payment-message" className="text-red-400 text-center text-sm font-medium p-3 bg-red-400/10 rounded-lg border border-red-400/20">{message}</div>}
      
      <div className="flex items-center justify-center gap-4 text-white/40 text-[10px] uppercase tracking-widest mt-4">
        <div className="flex items-center gap-1">
          <ShieldCheck size={12} />
          Pagamento Seguro
        </div>
        <div className="flex items-center gap-1">
          <CreditCard size={12} />
          SSL Encrypted
        </div>
      </div>
    </form>
  );
};

const Checkout = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
    setCartItems(cart);

    if (cart.length === 0) {
      navigate('/loja');
      return;
    }

    // Criar PaymentIntent
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems: cart }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error("Erro ao obter clientSecret:", data.error);
        }
      })
      .catch((err) => console.error("Erro na API de checkout:", err))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.'));
      return acc + (price * item.quantidade);
    }, 0);
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
          {/* Lado Esquerdo: Resumo do Pedido */}
          <div className="flex flex-col gap-8">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-2">Finalizar Pedido</h1>
            <p className="text-white/60 -mt-6">Revise seus itens antes de prosseguir com o pagamento seguro.</p>

            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                  <img src={item.imagem} alt={item.name} className="h-16 w-16 object-cover rounded-xl border border-white/10" />
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
              <span className="text-xl text-white/60">Total a pagar</span>
              <span className="text-3xl font-bold text-blue-400">
                R$ {calculateTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Lado Direito: Formulário de Pagamento */}
          <GlassCard className="p-8 md:p-10 border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShoppingCart size={120} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <CreditCard className="text-blue-400" />
                Dados do Cartão
              </h2>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-white/60 animate-pulse text-sm">Preparando ambiente seguro...</p>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#3b82f6',
                      colorBackground: 'transparent',
                      colorText: '#ffffff',
                      colorDanger: '#ef4444',
                      fontFamily: 'Inter Tight, system-ui, sans-serif',
                      spacingUnit: '4px',
                      borderRadius: '12px',
                    },
                    rules: {
                      '.Input': {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      },
                      '.Label': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '14px',
                        marginBottom: '8px',
                      }
                    }
                  }
                }}>
                  <CheckoutForm clientSecret={clientSecret} />
                </Elements>
              ) : (
                <div className="text-center py-10 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <p className="text-red-400 font-medium">Erro ao carregar o checkout.</p>
                  <button onClick={() => window.location.reload()} className="mt-4 text-sm text-blue-400 underline underline-offset-4">Tentar novamente</button>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
