import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/glass-card';
import { ShoppingCart, Search } from 'lucide-react';

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: string;
  imagem: string;
  categoria: string;
}

const Loja: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resP, resC] = await Promise.all([
          fetch('/api/produtos'),
          fetch('/api/categorias')
        ]);
        const dataP = await resP.json();
        const dataC = await resC.json();
        setProdutos(dataP);
        setCategorias(dataC);
      } catch (error) {
        console.error("Erro ao carregar dados da loja:", error);
      }
    };
    fetchData();
  }, []);

  const produtosFiltrados = produtos.filter(p => {
    const matchesCat = filtro === 'todos' || p.categoria === filtro;
    const matchesSearch = p.nome.toLowerCase().includes(busca.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (p: Produto) => {
    const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.id === p.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantidade += 1;
    } else {
      cart.push({ ...p, price: p.preco, name: p.nome, quantidade: 1 });
    }

    localStorage.setItem('fulltime_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    // Opcional: Feedback visual poderia ser adicionado aqui
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <section className="pt-40 pb-10 text-center container mx-auto px-6 max-w-7xl">
        <h2 className="text-center text-4xl md:text-6xl font-medium text-balance mb-4 text-white">Potencialize Seus Resultados</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Suplementação premium para elevar o seu treino ao próximo nível.</p>
      </section>

      {/* Busca e Filtros */}
      <div className="container mx-auto px-6 max-w-7xl mb-12 flex flex-col gap-8">
        <div className="relative max-w-2xl mx-auto w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Qual suplemento você procura?" 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-full bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500/50 transition-all backdrop-blur-sm"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={() => setFiltro('todos')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            Todos
          </button>
          {categorias.map(cat => (
            <button 
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-6 py-2 rounded-full font-bold transition-all ${filtro === cat ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-4 container mx-auto px-4 md:px-6 pb-20">
        {produtosFiltrados.map(p => (
          <GlassCard key={p.id} className="p-0 flex flex-col h-full max-h-[380px] overflow-hidden border-white/5 hover:border-blue-500/30 transition-all">
            <div className="h-32 md:h-40 lg:h-44 w-full overflow-hidden bg-white/5">
              <img src={p.imagem} alt={p.nome} className="h-full w-full object-contain rounded-t-2xl transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="p-3 md:p-4 flex flex-col flex-1 gap-1 md:gap-2">
              <h3 className="!text-[15px] md:!text-[18px] !font-bold text-white text-center w-full truncate">{p.nome}</h3>
              <p className="!text-[10px] md:!text-[12px] text-white/70 text-center w-full line-clamp-2 mt-1 !leading-tight">{p.descricao}</p>
              <span className="!text-[10px] md:!text-[14px] !font-bold text-blue-400 !text-center !w-full mt-1 md:mt-3">{p.preco}</span>
              <button 
                onClick={() => addToCart(p)}
                className="mt-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 md:py-3 text-[10px] md:text-sm rounded-lg md:rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <ShoppingCart size={14} className="md:w-[18px] md:h-[18px]" />
                Carrinho
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Loja;
