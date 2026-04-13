import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: string;
  imagem: string;
  quantidade: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  const handleExploreProducts = () => {
    onClose();
    navigate('/loja');
  };

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
    setCartItems(cart);
  };

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
    
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, [isOpen]);

  const updateQty = (index: number, delta: number) => {
    const newCart = [...cartItems];
    newCart[index].quantidade += delta;
    
    if (newCart[index].quantidade <= 0) {
      newCart.splice(index, 1);
    }
    
    saveAndSync(newCart);
  };

  const removeItem = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    saveAndSync(newCart);
  };

  const saveAndSync = (newCart: CartItem[]) => {
    localStorage.setItem('fulltime_cart', JSON.stringify(newCart));
    setCartItems(newCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item.price.replace('R$', '').replace('.', '').replace(',', '.'));
      return acc + (price * item.quantidade);
    }, 0);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Erro ao criar sessão de checkout:', data.error);
        alert('Ocorreu um erro ao processar o checkout. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Painel Lateral */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[400px] z-[60] bg-[#003399]/80 backdrop-blur-2xl border-l border-white/20 p-6 flex flex-col text-white shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-medium text-white">Seu Carrinho</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="opacity-50 flex flex-col items-center">
                <ShoppingCart size={64} className="mb-4" />
                <p className="text-lg">Seu carrinho está vazio.</p>
              </div>
              <button 
                onClick={handleExploreProducts}
                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-600/20"
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <img src={item.imagem} alt={item.name} className="h-20 w-20 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="flex justify-between items-start">
                      <h3 className="!text-[15px] md:!text-[18px] !font-bold text-white line-clamp-2">{item.name}</h3>
                      <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="!text-[10px] md:!text-[14px] !font-bold text-blue-400">{item.price}</p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="flex items-center bg-black/20 rounded-lg border border-white/10 p-1">
                        <button onClick={() => updateQty(index, -1)} className="p-1 hover:bg-white/10 rounded">
                          <Minus size={14} />
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-bold mx-2">{item.quantidade}</span>
                        <button onClick={() => updateQty(index, 1)} className="p-1 hover:bg-white/10 rounded">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-300">Subtotal</span>
              <span className="text-2xl font-bold text-blue-400">
                R$ {calculateTotal().toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? 'Processando...' : 'Finalizar Compra'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Componente ShoppingCart auxiliar para o estado vazio
const ShoppingCart = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);
