import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/ui/glass-card';
import { Trash2, Edit, Plus, X, LogOut, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  // ... (rest of states)
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

  useEffect(() => {
    if (sessionStorage.getItem("krm_admin_auth") === "true") {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [resP, resC, resO] = await Promise.all([
        fetch('/api/produtos'),
        fetch('/api/categorias'),
        fetch('/api/pedidos')
      ]);
      const dataP = await resP.json();
      const dataC = await resC.json();
      const dataO = await resO.json();
      setProdutos(dataP);
      setCategorias(dataC);
      setPedidos(dataO);
      if (dataC.length > 0) setFormCategoria(dataC[0]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const updatePedidoStatus = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/pedidos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchData();
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

        {activeTab === 'produtos' ? (
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
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </>
        ) : (
          <>
            {/* Header Pedidos */}
            <div className="flex flex-col items-center mb-12 gap-6 text-center">
              <h1 className="text-4xl md:text-5xl font-semibold">Gestão de Pedidos</h1>
              <p className="text-white/40 max-w-md">Gerencie aqui os pedidos recebidos via Mercado Pago e Pix.</p>
            </div>

            {/* Tabela de Pedidos */}
            <GlassCard className="p-0 overflow-hidden bg-slate-900/40 border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-left">
                      <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                      <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                      <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pedidos.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-sm text-white/60">
                          {new Date(pedido.data).toLocaleDateString('pt-BR')} <br/>
                          <span className="text-[10px] opacity-40">{new Date(pedido.data).toLocaleTimeString('pt-BR')}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white truncate max-w-[150px]">{pedido.cliente}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest">{pedido.metodo}</div>
                        </td>
                        <td className="p-4 font-bold text-blue-400">R$ {pedido.total.toFixed(2).replace('.', ',')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            pedido.statusPagamento === 'Aprovado' ? 'bg-green-500/20 text-green-400' : 
                            pedido.statusPagamento === 'Recusado' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {pedido.statusPagamento}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <select 
                              value={pedido.statusPagamento}
                              onChange={(e) => updatePedidoStatus(pedido.id, e.target.value)}
                              className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-blue-500"
                            >
                              <option value="Aprovado">Aprovado</option>
                              <option value="Pendente (Pix)">Pendente</option>
                              <option value="Recusado">Recusado</option>
                              <option value="Entregue">Entregue</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pedidos.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-white/20 italic">Nenhum pedido encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </>
        )}
      </div>

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
