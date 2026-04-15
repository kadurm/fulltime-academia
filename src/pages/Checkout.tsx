import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/ui/glass-card';
import { ShoppingCart, ArrowLeft, ShieldCheck, CreditCard, User, Mail, Fingerprint, MapPin, Hash, Building, Landmark, QrCode, Copy, CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface CartItem {
  id: string;
  name: string;
  price: string;
  imagem: string;
  quantidade: number;
}

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  const [pixData, setPixData] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [pixStatus, setPixStatus] = useState<string>('pending');
  const navigate = useNavigate();
  
  // Ref para o input de número
  const numeroRef = useRef<HTMLInputElement>(null);

  // Estados do Formulário
  const [customerData, setFormData] = useState({
    nome: '', email: '', cpf: '', telefone: '',
    cep: '', rua: '', numero: '', bairro: '', cidade: '', uf: ''
  });

  const [cardData, setCardData] = useState({
    cardNumber: '', cardholderName: '', expiry: '', securityCode: ''
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
    setCartItems(cart);
    if (cart.length === 0) navigate('/loja');
  }, [navigate]);

  // Efeito de Polling para o Pix
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (paymentId && pixStatus === 'pending') {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/check_payment?id=${paymentId}`);
          const data = await response.json();

          if (data.status === 'approved') {
            setPixStatus('approved');
            clearCart();
            setStep(3);
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Erro ao verificar pagamento:', error);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [paymentId, pixStatus]);

  const clearCart = () => {
    localStorage.removeItem('fulltime_cart');
    // Mantemos cartItems em memória para que a mensagem do WhatsApp (Step 3) seja gerada corretamente
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Efeito para busca de CEP
  useEffect(() => {
    const cep = customerData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      handleCepLookup(cep);
      setShowAddressDetails(true);
    }
  }, [customerData.cep]);

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    const { nome, email, cpf, telefone, cep, rua, numero, bairro, cidade, uf } = customerData;
    
    if (!nome || !email || !cpf || !telefone || !cep || !rua || !numero || !bairro || !cidade || !uf) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setStep(2);
  };

  const handleCepLookup = async (cep: string) => {
    try {
      setIsCepLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf
        }));
        
        // Foco automático no número após preenchimento
        setTimeout(() => {
          numeroRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsCepLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.'));
      return acc + (price * item.quantidade);
    }, 0);
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const mp = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);
      let payload: any = {
        transaction_amount: calculateTotal(),
        description: 'Compra Fulltime Academia',
        payer: {
          email: customerData.email,
          first_name: customerData.nome.split(' ')[0],
          identification: { type: 'CPF', number: customerData.cpf.replace(/\D/g, '') }
        },
        metadata: {
          customerData,
          cartItems
        }
      };

      if (paymentMethod === 'credit_card') {
        const [month, year] = cardData.expiry.split('/');
        const tokenResponse = await mp.createCardToken({
          cardNumber: cardData.cardNumber.replace(/\s/g, ''),
          cardholderName: cardData.cardholderName,
          cardExpirationMonth: month,
          cardExpirationYear: '20' + year,
          securityCode: cardData.securityCode,
        });

        if (!tokenResponse.id) throw new Error('Falha ao gerar token do cartão.');

        payload = {
          ...payload,
          token: tokenResponse.id,
          payment_method_id: 'master', // Simplificado para o teste, o ideal é usar mp.getPaymentMethods
          installments: 1,
        };
      } else {
        payload = {
          ...payload,
          payment_method_id: 'pix',
        };
      }

      const response = await fetch('/api/process_payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro desconhecido no servidor de pagamentos');
      }

      const result = await response.json();

      if (result.error) throw new Error(result.error);

      if (paymentMethod === 'pix') {
        setPixData(result.pix);
        setPaymentId(result.id);
        // Não avança o step, apenas exibe o QR Code no Step 2
      } else if (result.status === 'approved') {
        clearCart();
        setStep(3);
      } else {
        alert('Pagamento em processamento ou recusado: ' + result.status_detail);
      }
    } catch (error: any) {
      console.error(error);
      alert('Erro ao processar pagamento. Verifique os dados ou tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWhatsAppMessage = () => {
    const productsList = cartItems.map(item => `- ${item.name} (${item.quantidade}x) - ${item.price}`).join('\n');
    const total = calculateTotal().toFixed(2).replace('.', ',');
    const statusLabel = paymentMethod === 'pix' 
      ? (pixStatus === 'approved' ? 'Pix (Aprovado)' : 'Pix (Aguardando Confirmação)') 
      : 'Cartão de Crédito (Aprovado)';
    
    const message = `*Novo Pedido - Fulltime Academia*\n\n` +
      `*Cliente:* ${customerData.nome || 'Não informado'}\n` +
      `*CPF:* ${customerData.cpf || 'Não informado'}\n` +
      `*E-mail:* ${customerData.email || 'Não informado'}\n\n` +
      `*Endereço de Entrega:*\n` +
      `${customerData.rua || 'Rua não informada'}, ${customerData.numero || 'S/N'}\n` +
      `${customerData.bairro || 'Bairro não informado'}\n` +
      `${customerData.cidade || 'Cidade não informada'} - ${customerData.uf || 'UF'}\n` +
      `CEP: ${customerData.cep || '00000-000'}\n\n` +
      `*Itens do Pedido:*\n${productsList}\n\n` +
      `*Total:* R$ ${total}\n\n` +
      `*Forma de Pagamento:* ${statusLabel}`;

    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '5538999592075';
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all text-sm";
  const labelStyle = "text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block ml-1";

  return (
    <div className="min-h-screen pt-[160px] md:pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Resumo do Pedido */}
          <div className="flex flex-col gap-8">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white">Finalizar Pedido</h1>
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                  <img src={item.imagem || "/logo.png"} alt={item.name} className="h-14 w-14 object-cover rounded-lg border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-white/40">{item.quantidade}x un.</p>
                  </div>
                  <p className="font-bold text-blue-400 text-sm">{item.price}</p>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-white/10 flex justify-between items-center">
              <span className="text-lg text-white/60">Total</span>
              <span className="text-3xl font-bold text-blue-400">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          {/* Stepper Customizado */}
          <GlassCard className="p-6 md:p-10 border-white/10 shadow-2xl relative">
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">1</div>
                  <h2 className="text-xl font-bold">Seus Dados</h2>
                </div>
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Nome Completo</label>
                      <input type="text" name="nome" required placeholder="João Silva" className={inputStyle} value={customerData.nome} onChange={handleCustomerChange} />
                    </div>
                    <div>
                      <label className={labelStyle}>CPF</label>
                      <input type="text" name="cpf" required placeholder="000.000.000-00" className={inputStyle} value={customerData.cpf} onChange={handleCustomerChange} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelStyle}>Telefone / WhatsApp</label>
                      <input type="tel" name="telefone" required placeholder="(00) 00000-0000" className={inputStyle} value={customerData.telefone} onChange={handleCustomerChange} />
                    </div>
                    <div>
                      <label className={labelStyle}>E-mail</label>
                      <input type="email" name="email" required placeholder="joao@email.com" className={inputStyle} value={customerData.email} onChange={handleCustomerChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 relative">
                      <label className={labelStyle}>CEP</label>
                      <input type="text" name="cep" required placeholder="00000-000" className={inputStyle} value={customerData.cep} onChange={handleCustomerChange} />
                      {isCepLoading && <Loader2 size={16} className="absolute right-3 top-[38px] animate-spin text-blue-400" />}
                    </div>
                  </div>

                  {showAddressDetails && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className={labelStyle}>Rua / Logradouro</label>
                          <input type="text" name="rua" required placeholder="Av. Principal" className={inputStyle} value={customerData.rua} onChange={handleCustomerChange} />
                        </div>
                        <div>
                          <label className={labelStyle}>Nº</label>
                          <input 
                            type="text" 
                            name="numero" 
                            ref={numeroRef}
                            required 
                            placeholder="123" 
                            className={inputStyle} 
                            value={customerData.numero} 
                            onChange={handleCustomerChange} 
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelStyle}>Bairro</label>
                          <input type="text" name="bairro" required placeholder="Centro" className={inputStyle} value={customerData.bairro} onChange={handleCustomerChange} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <label className={labelStyle}>Cidade</label>
                            <input type="text" name="cidade" required placeholder="Cidade" className={inputStyle} value={customerData.cidade} onChange={handleCustomerChange} />
                          </div>
                          <div>
                            <label className={labelStyle}>UF</label>
                            <input type="text" name="uf" required placeholder="UF" className={inputStyle} value={customerData.uf} onChange={handleCustomerChange} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={handleNextStep} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg uppercase tracking-wider text-xs">Ir para Pagamento</button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <button onClick={() => setStep(1)} className="text-white/40 hover:text-white"><ArrowLeft size={20}/></button>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">2</div>
                  <h2 className="text-xl font-bold">Pagamento</h2>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                  <button onClick={() => setPaymentMethod('credit_card')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'credit_card' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}>
                    <CreditCard size={16} /> Cartão
                  </button>
                  <button onClick={() => setPaymentMethod('pix')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${paymentMethod === 'pix' ? 'bg-green-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/5'}`}>
                    <Landmark size={16} /> Pix
                  </button>
                </div>

                <form onSubmit={processPayment} className="flex flex-col gap-4">
                  {paymentMethod === 'credit_card' ? (
                    <div className="grid gap-4">
                      <div>
                        <label className={labelStyle}>Número do Cartão</label>
                        <input type="text" name="cardNumber" required placeholder="0000 0000 0000 0000" className={inputStyle} value={cardData.cardNumber} onChange={handleCardChange} />
                      </div>
                      <div>
                        <label className={labelStyle}>Nome impresso no Cartão</label>
                        <input type="text" name="cardholderName" required placeholder="JOAO SILVA" className={inputStyle} value={cardData.cardholderName} onChange={handleCardChange} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelStyle}>Validade (MM/AA)</label>
                          <input type="text" name="expiry" required placeholder="MM/AA" className={inputStyle} value={cardData.expiry} onChange={handleCardChange} />
                        </div>
                        <div>
                          <label className={labelStyle}>CVV</label>
                          <input type="text" name="securityCode" required placeholder="000" className={inputStyle} value={cardData.securityCode} onChange={handleCardChange} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {!pixData ? (
                        <div className="p-6 bg-green-500/10 rounded-2xl border border-green-500/20 text-center flex flex-col gap-3">
                          <QrCode className="mx-auto text-green-500" size={48} />
                          <p className="text-sm font-medium">O QR Code será gerado ao clicar no botão abaixo.</p>
                          <p className="text-xs text-white/40 leading-relaxed">Aguardaremos a confirmação automática do pagamento.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6 text-center p-6 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-500">
                          <div className="bg-white p-3 rounded-xl inline-block mx-auto">
                            <img src={`data:image/jpeg;base64,${pixData.qr_code_base64}`} alt="QR Code Pix" className="w-40 h-40" />
                          </div>
                          <div className="flex flex-col gap-2 text-left">
                            <label className={labelStyle}>Código Pix (Copia e Cola)</label>
                            <div className="relative">
                              <input readOnly value={pixData.qr_code} className={inputStyle + " pr-12 truncate"} />
                              <button type="button" onClick={() => { navigator.clipboard.writeText(pixData.qr_code); alert('Copiado!'); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300">
                                <Copy size={18} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-blue-400 text-xs font-bold animate-pulse">
                            <Loader2 size={14} className="animate-spin" />
                            Aguardando pagamento...
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!pixData && (
                    <button disabled={isLoading} className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg uppercase tracking-wider text-xs flex items-center justify-center gap-2 mt-4 ${paymentMethod === 'pix' ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                      {isLoading ? 'Processando...' : `Finalizar com ${paymentMethod === 'pix' ? 'Pix' : 'Cartão'}`}
                    </button>
                  )}
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-6 text-center animate-in zoom-in-95 duration-500">
                <CheckCircle2 className="mx-auto text-green-500" size={64} />
                <h2 className="text-2xl font-bold">Pedido Confirmado!</h2>
                <p className="text-white/60 text-sm">
                  Seu pagamento via {paymentMethod === 'pix' ? 'Pix' : 'Cartão'} foi aprovado com sucesso!
                </p>

                <div className="flex flex-col gap-3 mt-4">
                  <a 
                    href={generateWhatsAppMessage()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-4 rounded-xl transition-all shadow-lg uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    {paymentMethod === 'pix' ? 'Enviar Comprovante via WhatsApp' : 'Falar com Atendente'}
                  </a>
                  <button onClick={() => navigate('/')} className="text-sm text-white/40 hover:text-white underline underline-offset-4">Ir para Página Inicial</button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
