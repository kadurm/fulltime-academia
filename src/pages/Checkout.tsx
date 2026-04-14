import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  LinkAuthenticationElement,
  AddressElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { GlassCard } from '../components/ui/glass-card';
import { ShoppingCart, ArrowLeft, CreditCard, ShieldCheck, User, Fingerprint, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Inicialização segura do Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CartItem {
  id: string;
  name: string;
  price: string;
  imagem: string;
  quantidade: number;
}

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para dados brasileiros adicionais (CPF é mandatório para alguns métodos no BR)
  const [cpf, setCpf] = useState('');

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
      setMessage(error.message || "Ocorreu um erro na validação dos dados.");
    } else {
      setMessage("Ocorreu um erro inesperado no processamento.");
    }

    setIsLoading(false);
  };

  const labelStyle = "text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block ml-1";
  const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl px-11 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all";

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {/* Coleta de E-mail Segura */}
        <div>
          <label className={labelStyle}>E-mail de Contato</label>
          <LinkAuthenticationElement id="link-authentication-element" />
        </div>

        {/* Campo CPF (Importante para o mercado brasileiro) */}
        <div>
          <label className={labelStyle}>CPF</label>
          <div className="relative">
            <Fingerprint size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input 
              type="text" 
              required
              placeholder="000.000.000-00" 
              className={inputStyle}
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </div>
        </div>

        {/* Coleta de Endereço Automática */}
        <div>
          <label className={labelStyle}>Endereço de Entrega</label>
          <AddressElement options={{ mode: 'shipping', allowedCountries: ['BR'] }} />
        </div>

        <div className="h-px bg-white/10 my-2" />

        {/* Elemento de Pagamento (Cartão, Pix, etc) */}
        <div>
          <label className={labelStyle}>Método de Pagamento</label>
          <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
        </div>
      </div>
      
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full bg-[#3b82f6] hover:bg-blue-600 disabled:bg-blue-900 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-wider text-sm flex items-center justify-center gap-2 mt-4"
      >
        <span id="button-text">
          {isLoading ? "Processando..." : "Finalizar e Pagar"}
        </span>
      </button>
      
      {message && <div id="payment-message" className="text-red-400 text-center text-sm font-medium p-3 bg-red-400/10 rounded-lg border border-red-400/20">{message}</div>}
      
      <div className="flex items-center justify-center gap-4 text-white/40 text-[10px] uppercase tracking-widest mt-2">
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
    // Log para depuração de chave pública
    console.log("Stripe Public Key carregada:", !!import.meta.env.VITE_STRIPE_PUBLIC_KEY);

    const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
    setCartItems(cart);

    if (cart.length === 0) {
      navigate('/loja');
      return;
    }

    // Criar PaymentIntent e obter clientSecret
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
          console.error("Erro no retorno da API:", data.error);
        }
      })
      .catch((err) => console.error("Erro na requisição de checkout:", err))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.'));
      return acc + (price * item.quantidade);
    }, 0);
  };

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#111827',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'Inter Tight, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
    rules: {
      '.Input': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
      '.Label': {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: '700',
        marginBottom: '8px',
      }
    }
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
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-2">Checkout</h1>
            <p className="text-white/60 -mt-6">Complete os dados abaixo para processar sua compra com segurança.</p>

            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                  <img 
                    src={item.imagem || "/logo.png"} 
                    alt={item.name} 
                    className="h-16 w-16 object-cover rounded-xl border border-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo.png";
                    }}
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
              <span className="text-xl text-white/60">Total a pagar</span>
              <span className="text-3xl font-bold text-blue-400">
                R$ {calculateTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Lado Direito: Formulário Stripe */}
          <GlassCard className="p-8 md:p-10 border-white/20 shadow-2xl relative overflow-hidden min-h-[400px]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShoppingCart size={120} />
            </div>
            
            <div className="relative z-10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-white/60 animate-pulse text-sm">Autenticando sessão segura...</p>
                </div>
              ) : clientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                  <CheckoutForm />
                </Elements>
              ) : (
                <div className="text-center py-10 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <p className="text-red-400 font-medium">Erro na inicialização do pagamento.</p>
                  <p className="text-white/40 text-xs mt-2">Verifique sua conexão ou chaves de API.</p>
                  <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-all">Tentar novamente</button>
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
