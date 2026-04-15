import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GlassCard } from '../components/ui/glass-card';
import { Trash2, Edit, Plus, X, LogOut, Search, DollarSign, ShoppingBag, TrendingUp, Clock, Eye, MapPin, User, Package, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
  preco: string;
  imagem: string;
}

interface Pedido {
  id: string;
  data: string;
  cliente: string;
  items: any[];
  total: number;
  metodo: string;
  statusPagamento: string;
  origem: string;
  metadata?: {
    customerData?: {
      nome: string;
      email: string;
      cpf: string;
      cep: string;
      rua: string;
      numero: string;
      bairro: string;
      cidade: string;
      uf: string;
      telefone: string;
    };
    cartItems?: any[];
  };
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'produtos' | 'pedidos'>('produtos');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);

  // Filtragem de Pedidos por Período e Logística
  const pedidosFiltradosDashboard = useMemo(() => {
    let safePedidos = Array.isArray(pedidos) ? pedidos : [];
    
    // Filtro Rígido: Apenas pedidos que já foram pagos/processados (ignora abandonos)
    safePedidos = safePedidos.filter(p => (p?.statusPagamento || p?.status) !== 'Aguardando Pagamento');

    if (periodo === 'all') return safePedidos;
    
    const agora = new Date().getTime();
    let limite = 0;

    if (periodo === 'hoje') {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      limite = hoje.getTime();
      return safePedidos.filter(p => new Date(p.data).getTime() >= limite);
    } else if (periodo === '7dias') {
      limite = agora - (7 * 24 * 60 * 60 * 1000);
      return safePedidos.filter(p => new Date(p.data).getTime() >= limite);
    } else if (periodo === '30dias') {
      limite = agora - (30 * 24 * 60 * 60 * 1000);
      return safePedidos.filter(p => new Date(p.data).getTime() >= limite);
    } else if (periodo === 'custom' && customStart && customEnd) {
      const start = new Date(customStart + 'T00:00:00').getTime();
      const end = new Date(customEnd + 'T23:59:59').getTime();
      return safePedidos.filter(p => {
        const d = new Date(p.data).getTime();
        return d >= start && d <= end;
      });
    }

    return safePedidos;
  }, [pedidos, periodo, customStart, customEnd]);

  // Estados dos Modais e Formulários
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Novo');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formNome, setFormNome] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formPreco, setFormPreco] = useState('');
  const [formImagem, setFormImagem] = useState('');

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [novaCat, setNovaCat] = useState('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatValue, setEditingCatValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // KPIs Dashboard
  const kpis = useMemo(() => {
    const safePedidos = pedidosFiltradosDashboard;
    const approved = safePedidos.filter(p => p?.statusPagamento === 'Pendente' || p?.statusPagamento === 'Enviado' || p?.statusPagamento === 'Concluído');
    const revenue = approved.reduce((acc, p) => acc + (Number(p?.total) || 0), 0);
    const pending = safePedidos.filter(p => p?.statusPagamento === 'Pendente').length;
    const ticket = approved.length > 0 ? revenue / approved.length : 0;

    return {
      revenue,
      totalOrders: safePedidos.length,
      averageTicket: ticket,
      pendingOrders: pending
    };
  }, [pedidosFiltradosDashboard]);

  // Dados para Gráfico de Métodos de Pagamento
  const chartData = useMemo(() => {
    const safePedidos = pedidosFiltradosDashboard;
    const pixCount = safePedidos.filter(p => p?.metodo === 'pix').length;
    const cardCount = safePedidos.filter(p => p?.metodo === 'credit_card' || p?.metodo === 'master' || p?.metodo === 'visa').length;
    
    return [
      { name: 'Pix', value: pixCount },
      { name: 'Cartão', value: cardCount }
    ];
  }, [pedidosFiltradosDashboard]);

  const COLORS = ['#22c55e', '#3b82f6'];

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [resP, resC, resO] = await Promise.all([
        fetch('/api/produtos').catch(() => ({ json: () => [] })),
        fetch('/api/categorias').catch(() => ({ json: () => [] })),
        fetch('/api/pedidos').catch(() => ({ json: () => [] }))
      ]);
      
      const dataP = await (resP as Response).json().catch(() => []);
      const dataC = await (resC as Response).json().catch(() => []);
      const dataO = await (resO as Response).json().catch(() => []);
      
      setProdutos(Array.isArray(dataP) ? dataP : []);
      setCategorias(Array.isArray(dataC) ? dataC : []);
      setPedidos(Array.isArray(dataO) ? dataO : []);
      
      if (Array.isArray(dataC) && dataC.length > 0) setFormCategoria(dataC[0]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setProdutos([]);
      setPedidos([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("krm_admin_auth") === "true") {
      setIsAuthenticated(true);
      fetchData();
    } else {
      setIsLoadingData(false);
    }
  }, []);

  const updatePedidoStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/pedidos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === "AdminFulltime" && pass === "AdminFulltime") {
      sessionStorage.setItem("krm_admin_auth", "true");
      setIsAuthenticated(true);
      fetchData();
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("krm_admin_auth");
    setIsAuthenticated(false);
  };

  const formatPrice = (value: string) => {
    let v = value.replace(/\D/g, "");
    v = (Number(v) / 100).toFixed(2) + "";
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    return "R$ " + v;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormPreco(formatPrice(e.target.value));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > h) { if (w > 800) { h *= 800 / w; w = 800; } }
        else { if (h > 800) { w *= 800 / h; h = 800; } }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        setFormImagem(base64);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const abrirModalNovo = () => {
    setModalTitle('Novo');
    setEditingId(null);
    setFormNome('');
    setFormCategoria(categorias[0] || '');
    setFormDescricao('');
    setFormPreco('');
    setFormImagem('');
    setIsModalOpen(true);
  };

  const editarProduto = (p: Produto) => {
    setModalTitle('Editar');
    setEditingId(p.id);
    setFormNome(p.nome);
    setFormCategoria(p.categoria || '');
    setFormDescricao(p.descricao || '');
    setFormPreco(p.preco);
    setFormImagem(p.imagem);
    setIsModalOpen(true);
  };

  const fecharModal = () => setIsModalOpen(false);

  const salvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      id: editingId !== null ? editingId : (produtos.length ? Math.max(...produtos.map(p => p.id)) + 1 : 1),
      nome: formNome,
      categoria: formCategoria,
      descricao: formDescricao,
      preco: formPreco,
      imagem: formImagem
    };

    let novosProdutos = [...produtos];
    if (editingId !== null) {
      const i = novosProdutos.findIndex(x => x.id === editingId);
      novosProdutos[i] = data;
    } else {
      novosProdutos.push(data);
    }

    try {
      await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtos: novosProdutos })
      });
      setProdutos(novosProdutos);
      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };

  const excluirProduto = async (id: number) => {
    if (confirm("Deseja realmente excluir este produto?")) {
      const novosProdutos = produtos.filter(p => p.id !== id);
      try {
        await fetch('/api/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ produtos: novosProdutos })
        });
        setProdutos(novosProdutos);
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
      }
    }
  };

  const salvarCategorias = async (novasCategorias: string[]) => {
    try {
      await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categorias: novasCategorias })
      });
      setCategorias(novasCategorias);
    } catch (error) {
      console.error("Erro ao salvar categorias:", error);
    }
  };

  const handleAddCat = () => {
    if (novaCat.trim()) {
      const novas = [...categorias, novaCat.trim()];
      salvarCategorias(novas);
      setNovaCat('');
    }
  };

  const handleDeleteCat = (index: number) => {
    if (confirm("Excluir categoria?")) {
      const novas = categorias.filter((_, i) => i !== index);
      salvarCategorias(novas);
    }
  };

  const handleEditCat = (index: number) => {
    setEditingCatIndex(index);
    setEditingCatValue(categorias[index]);
  };

  const handleSaveEditCat = () => {
    if (editingCatIndex !== null && editingCatValue.trim()) {
      const novas = [...categorias];
      novas[editingCatIndex] = editingCatValue.trim();
      salvarCategorias(novas);
      setEditingCatIndex(null);
    }
  };

  const produtosFiltrados = produtos
    .filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => (a.categoria || "").localeCompare(b.categoria || ""));

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#040914] flex justify-center items-center p-6">
        <GlassCard className="w-full max-w-[380px] p-10 text-center bg-slate-900/80">
          <img src="/logo.png" alt="Fulltime" className="h-16 mx-auto mb-8" />
          <h2 className="text-2xl font-bold mb-8">Acesso Restrito</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Usuário"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500/50 transition-all"
            />
            <input
              type="password"
              placeholder="Senha"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500/50 transition-all"
            />
            <button
              type="submit"
              className="w-full p-4 bg-[#FFD700] text-black font-bold rounded-xl hover:scale-105 transition-transform mt-4"
            >
              Entrar
            </button>
            {loginError && <p className="text-red-400 mt-2 text-sm">Credenciais inválidas.</p>}
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen pt-[120px] pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto w-full">
        {/* Tabs de Navegação */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`px-8 py-3 rounded-xl font-bold transition-all border border-white/10 ${activeTab === 'produtos' ? 'bg-[#fafafa] text-[#09090b]' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`px-8 py-3 rounded-xl font-bold transition-all border border-white/10 ${activeTab === 'pedidos' ? 'bg-[#fafafa] text-[#09090b]' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            Pedidos
          </button>
        </div>

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-4">
            <Clock className="animate-spin" size={40} />
            <p className="font-medium animate-pulse">Carregando Dashboard...</p>
          </div>
        ) : activeTab === 'produtos' ? (
          <>
            {/* Header Produtos */}
            <div className="flex flex-col items-center mb-12 gap-6 text-center">
              <h1 className="text-4xl md:text-5xl font-semibold">Gestão de Produtos</h1>
              <button
                onClick={abrirModalNovo}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
              >
                <Plus size={20} /> Novo Produto
              </button>
            </div>

            {/* Busca e Categorias */}
            <div className="flex gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <button
                onClick={() => setIsCatModalOpen(true)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all"
              >
                Categorias
              </button>
            </div>

            {/* Tabela de Produtos */}
            <GlassCard className="p-0 overflow-hidden bg-slate-900/40 border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-left">
                      <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Foto</th>
                      <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Produto</th>
                      <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Categoria</th>
                      <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Preço</th>
                      <th className="p-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {produtosFiltrados.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <img src={p.imagem} alt={p.nome} className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white">{p.nome}</div>
                          <div className="text-xs text-gray-400 line-clamp-1">{p.descricao}</div>
                        </td>
                        <td className="p-4 text-sm text-white/60">{p.categoria}</td>
                        <td className="p-4 font-bold text-blue-400">{p.preco}</td>
                        <td className="p-4">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => editarProduto(p)} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => excluirProduto(p.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {produtosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-white/20 italic">Nenhum produto encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </>
        ) : (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Filtros de Pedidos */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
                  {[
                    { id: 'hoje', label: 'Hoje' },
                    { id: '7dias', label: '7 Dias' },
                    { id: '30dias', label: '30 Dias' },
                    { id: 'all', label: 'Tudo' },
                    { id: 'custom', label: 'Personalizado' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPeriodo(opt.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${periodo === opt.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {periodo === 'custom' && (
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto animate-in fade-in slide-in-from-left-4 duration-500">
                    <input 
                      type="date" 
                      value={customStart} 
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50 w-full"
                    />
                    <span className="text-white/20 text-xs font-bold">até</span>
                    <input 
                      type="date" 
                      value={customEnd} 
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50 w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="p-6 flex flex-col gap-2 border-white/10 bg-blue-500/10">
                <div className="flex justify-between items-start">
                  <DollarSign className="text-blue-400" size={24} />
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Receita</span>
                </div>
                <div className="text-2xl font-bold">R$ {kpis.revenue.toFixed(2).replace('.', ',')}</div>
                <div className="text-[10px] text-white/40">Vendas aprovadas</div>
              </GlassCard>

              <GlassCard className="p-6 flex flex-col gap-2 border-white/10">
                <div className="flex justify-between items-start">
                  <ShoppingBag className="text-purple-400" size={24} />
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Pedidos</span>
                </div>
                <div className="text-2xl font-bold">{kpis.totalOrders}</div>
                <div className="text-[10px] text-white/40">Total realizado</div>
              </GlassCard>

              <GlassCard className="p-6 flex flex-col gap-2 border-white/10">
                <div className="flex justify-between items-start">
                  <TrendingUp className="text-green-400" size={24} />
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Ticket</span>
                </div>
                <div className="text-2xl font-bold">R$ {kpis.averageTicket.toFixed(2).replace('.', ',')}</div>
                <div className="text-[10px] text-white/40">Média por venda</div>
              </GlassCard>

              <GlassCard className="p-6 flex flex-col gap-2 border-white/10 bg-yellow-500/10">
                <div className="flex justify-between items-start">
                  <Clock className="text-yellow-400" size={24} />
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Pendentes</span>
                </div>
                <div className="text-2xl font-bold">{kpis.pendingOrders}</div>
                <div className="text-[10px] text-white/40">Pago e Pendente</div>
              </GlassCard>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-6">
              <GlassCard className="lg:col-span-1 p-6 border-white/10 min-h-[300px] flex flex-col items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Métodos de Pagamento</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> PIX
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> CARTÃO
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="lg:col-span-2 p-6 border-white/10 flex flex-col">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Pedidos Recentes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] text-white/20 uppercase tracking-widest border-b border-white/5">
                        <th className="pb-3 font-medium">Data</th>
                        <th className="pb-3 font-medium">Cliente</th>
                        <th className="pb-3 font-medium">Total</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                        <th className="pb-3 text-right font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Array.isArray(pedidosFiltradosDashboard) && pedidosFiltradosDashboard.slice(0, 20).map((pedido) => (
                        <tr key={pedido.id} className="text-sm hover:bg-white/5 transition-colors group">
                          <td className="py-4 text-white/60">
                            {pedido?.data ? new Date(pedido.data).toLocaleDateString('pt-BR') : 'N/A'}
                          </td>
                          <td className="py-4">
                            <div className="font-bold truncate max-w-[140px]">{pedido?.cliente || 'N/A'}</div>
                            <div className="text-[10px] text-white/20 uppercase tracking-tighter">{pedido.id}</div>
                          </td>
                          <td className="py-4 text-blue-400 font-bold">R$ {(pedido?.total || 0).toFixed(2).replace('.', ',')}</td>
                          <td className="py-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              pedido?.statusPagamento === 'Concluído' ? 'bg-green-500/20 text-green-400' : 
                              pedido?.statusPagamento === 'Enviado' ? 'bg-blue-500/20 text-blue-400' :
                              pedido?.statusPagamento === 'Devolvido/Cancelado' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {pedido?.statusPagamento || 'Pendente'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <select 
                                value={pedido?.statusPagamento || 'Pendente'}
                                onChange={(e) => updatePedidoStatus(pedido.id, e.target.value)}
                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-blue-500 cursor-pointer"
                              >
                                <option value="Pendente" className="bg-[#0f172a]">Pendente (Pago)</option>
                                <option value="Enviado" className="bg-[#0f172a]">Enviado</option>
                                <option value="Concluído" className="bg-[#0f172a]">Concluído</option>
                                <option value="Devolvido/Cancelado" className="bg-[#0f172a]">Devolvido/Cancelado</option>
                              </select>
                              <button 
                                onClick={() => setPedidoSelecionado(pedido)}
                                className="p-2 bg-white/5 hover:bg-blue-600/20 text-blue-400 rounded-lg transition-all border border-white/10"
                                title="Ver Ficha do Pedido"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!Array.isArray(pedidosFiltradosDashboard) || pedidosFiltradosDashboard.length === 0) && (
                        <tr>
                          <td colSpan={5} className="py-20 text-center text-white/20 italic">Nenhum pedido encontrado com os filtros atuais.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ficha do Pedido (Logística) */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-[650px] p-0 overflow-hidden bg-slate-900/90 border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Package className="text-blue-400" /> Ficha do Pedido
                </h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">ID: {pedidoSelecionado.id}</p>
              </div>
              <button onClick={() => setPedidoSelecionado(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto max-h-[75vh] flex flex-col gap-8">
              {/* Grid de Informações */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Dados do Cliente */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Dados do Cliente
                  </h3>
                  <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 h-full">
                    <div>
                      <label className="text-[10px] text-white/40 block">NOME COMPLETO</label>
                      <p className="font-bold text-sm">{pedidoSelecionado.metadata?.customerData?.nome || pedidoSelecionado.cliente}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 block">CPF/ID</label>
                      <p className="text-sm">{pedidoSelecionado.metadata?.customerData?.cpf || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 block">E-MAIL</label>
                      <p className="text-sm">{pedidoSelecionado.metadata?.customerData?.email || pedidoSelecionado.cliente}</p>
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} /> Entrega
                  </h3>
                  <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 h-full">
                    <div>
                      <label className="text-[10px] text-white/40 block">LOGRADOURO</label>
                      <p className="text-sm font-bold">
                        {pedidoSelecionado.metadata?.customerData?.rua || 'N/A'}, {pedidoSelecionado.metadata?.customerData?.numero || 'S/N'}
                      </p>
                      <p className="text-[10px] text-white/60">{pedidoSelecionado.metadata?.customerData?.bairro || 'Bairro N/A'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 block">CIDADE/UF</label>
                      <p className="text-sm">{pedidoSelecionado.metadata?.customerData?.cidade || 'N/A'} - {pedidoSelecionado.metadata?.customerData?.uf || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/40 block">CEP</label>
                      <p className="text-sm font-mono tracking-tighter">{pedidoSelecionado.metadata?.customerData?.cep || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingBag size={14} /> Itens Comprados
                </h3>
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 text-[10px] text-white/40 uppercase tracking-widest">
                        <th className="p-4 font-medium">Produto</th>
                        <th className="p-4 text-center font-medium">Qtd</th>
                        <th className="p-4 text-right font-medium">Valor Un.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(pedidoSelecionado.metadata?.cartItems || pedidoSelecionado.items || []).map((item: any, idx: number) => (
                        <tr key={idx} className="text-sm">
                          <td className="p-4 font-bold">{item.name || item.nome || 'Produto Indefinido'}</td>
                          <td className="p-4 text-center">{item.quantidade || 1}x</td>
                          <td className="p-4 text-right text-blue-400">{item.price || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumo Final */}
              <div className="flex justify-between items-center p-6 bg-blue-600/10 rounded-2xl border border-blue-600/20">
                <div>
                  <label className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block">Total do Pedido</label>
                  <p className="text-3xl font-black text-white">R$ {pedidoSelecionado.total.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="text-right">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest block">Pagamento</label>
                  <p className="text-sm font-bold flex items-center gap-2 justify-end">
                    {pedidoSelecionado.metodo === 'pix' ? 'Pix' : 'Cartão'}
                    {['Aprovado', 'Pendente', 'Aguardando Envio', 'Enviado', 'Concluído'].includes(pedidoSelecionado.statusPagamento || pedidoSelecionado.status) ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Clock size={16} className="text-yellow-500" />
                    )}
                  </p>
                </div>
              </div>

              {/* Botão Ação Rápida */}
              <button 
                onClick={() => window.open(`https://wa.me/55${pedidoSelecionado.metadata?.customerData?.telefone?.replace(/\D/g, '')}`, '_blank')}
                className="w-full py-4 bg-[#25D366] hover:bg-[#1da851] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20"
              >
                Falar com Cliente via WhatsApp
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Modal Novo/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-[500px] p-8 max-h-[90vh] overflow-y-auto bg-slate-900/90">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{modalTitle} Produto</h2>
              <button onClick={fecharModal} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={salvarProduto} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Nome</label>
                <input required type="text" value={formNome} onChange={(e) => setFormNome(e.target.value)} className="p-3 rounded-lg bg-black border border-white/10 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Categoria</label>
                <select value={formCategoria} onChange={(e) => setFormCategoria(e.target.value)} className="p-3 rounded-lg bg-black border border-white/10 text-white">
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Descrição</label>
                <textarea rows={3} value={formDescricao} onChange={(e) => setFormDescricao(e.target.value)} className="p-3 rounded-lg bg-black border border-white/10 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Preço</label>
                <input required type="text" value={formPreco} onChange={handlePriceChange} placeholder="R$ 0,00" className="p-3 rounded-lg bg-black border border-white/10 text-white" />
              </div>
              <div 
                className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                {!formImagem ? (
                  <div className="flex flex-col items-center gap-2 opacity-60">
                    <Plus size={32} />
                    <span>Selecione uma foto</span>
                  </div>
                ) : (
                  <img src={formImagem} alt="Preview" className="max-h-[120px] mx-auto rounded-lg" />
                )}
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" onClick={fecharModal} className="flex-1 py-3 bg-white/5 hover:bg-white/10 font-bold rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl transition-all">Salvar</button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Modal Categorias */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-[400px] p-8 bg-slate-900/90 text-center">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Categorias</h2>
              <button onClick={() => setIsCatModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={novaCat} 
                onChange={(e) => setNovaCat(e.target.value)} 
                placeholder="Nova categoria..."
                className="flex-1 p-3 rounded-lg bg-black border border-white/10 text-white outline-none focus:border-blue-500/50"
              />
              <button onClick={handleAddCat} className="p-3 bg-[#FFD700] text-black font-bold rounded-lg">+</button>
            </div>
            <div className="max-h-[250px] overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
              {categorias.map((c, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  {editingCatIndex === i ? (
                    <input 
                      autoFocus
                      value={editingCatValue}
                      onChange={(e) => setEditingCatValue(e.target.value)}
                      onBlur={handleSaveEditCat}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEditCat()}
                      className="flex-1 bg-transparent outline-none text-white font-bold"
                    />
                  ) : (
                    <span className="font-medium">{c}</span>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => handleEditCat(i)} className="opacity-60 hover:opacity-100 transition-opacity"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteCat(i)} className="opacity-60 hover:opacity-100 text-red-400 transition-opacity"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setIsCatModalOpen(false)} className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all">Fechar</button>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Admin;
