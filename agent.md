# Fulltime Academia - Diretrizes do Projeto e Contexto para IA

## Protocolo de Sincronização Multi-Terminal
1. Ao concluir qualquer alteração estrutural, adicione um resumo na seção "## Últimas Atualizações" no topo deste documento.
2. Antes de iniciar qualquer nova tarefa, releia obrigatoriamente este arquivo `agent.md` para assimilar o contexto atualizado por agentes em outros terminais.

## Últimas Atualizações
- 2026-04-30: Correção crítica do ambiente de build: Restauração dos arquivos de configuração do TypeScript (`tsconfig.json`, `tsconfig.node.json`, `src/vite-env.d.ts`) que estavam ausentes. Correção das versões do Tailwind 4 para a estável (`^4.0.0`) e adição da dependência `react-is` para compatibilidade do `recharts` com React 19. Build local validado com sucesso.
- 2026-04-28: Sincronização técnica e visual: Padronização de Safe Zones (pt-[160px]) para mobile em todas as páginas para acomodar o Navbar empilhado. Correção de conflitos de CSS no `index.html` (alvos H1/H2). Integração funcional com `mobile-fix.css` através da adição do wrapper `#nav` no `App.tsx`. Consolidação de `useEffect`s de estado de carrinho. Downgrade de dependências para Vite 6 e React 19 estável para garantir compatibilidade com CI/CD.
- 2026-04-26: Otimização técnica de SEO: Implementação de `react-helmet-async` para metadados dinâmicos, correção estrutural do `index.html`, ajuste de hierarquia `H1` e criação de `robots.txt`/`sitemap.xml`.
- 2026-04-15: Implementação de lógica funcional no modal de pedidos para processamento e limpeza de itens pendentes da tabela de logística.
- 2026-04-15: Adição de modal detalhado com informações completas de entrega (endereço, contato) e otimização da fila de logística no Admin.
- 2026-04-15: Sanitização de payloads enviados ao Mercado Pago para contornar limitações de tamanho de metadados.
- 2026-04-15: Restauração da fidelidade visual 3D e profundidade do carrossel de aparelhos na Home.
- 2026-04-15: Correção de regressão visual nos estilos globais e restauração da compatibilidade de layout.
- 2026-04-13: Implementação de preenchimento automático de endereço via API ViaCEP no Checkout, com feedback visual de carregamento e foco automático no campo número.
- 2026-04-13: Implementação do Checkout Customizado (Core API) do Mercado Pago com UI 100% nativa (Stepper, Glassmorphism).
- 2026-04-13: Integração do MercadoPago.js V2 para tokenização segura de cartões no frontend.
- 2026-04-11: Melhoria de UX no `CartSidebar.tsx`: Adição de botão CTA "Explorar Produtos" no estado de carrinho vazio, com navegação automática para `/loja`.
- 2026-04-11: Nivelamento tipográfico global: Sincronização de Heros (md:text-5xl), padronização de títulos de seção (tracking-tight) e ajuste de line-height (leading-relaxed/normal) entre `Home.tsx` e `Loja.tsx`.
- 2026-04-11: Implementação da restauração de scroll global (`ScrollToTop`) e comportamento de scroll suave ao topo no botão "Início" e logo da Navbar em `App.tsx`.
- 2026-04-11: Padronização do respiro superior (safe zone) dos Heros em `Home.tsx` e `Loja.tsx`.
- 2026-04-08: Reestruturação da aplicação com React e Vite (`src/App.tsx`, `src/pages`, `src/components`).
- 2026-04-08: Integração de Roteamento SPA (`react-router-dom`) com as rotas `/` (Home) e `/loja` (Loja de Suplementos).
- 2026-04-08: Implementação do `AnimatedBackground` global via Canvas com ondas senoidais fluidas e refração de partículas (z-index otimizado para `z-0`).
- 2026-04-08: Construção do Carrinho de Compras Global em Painel Lateral (`CartSidebar`) com gestão de estado sincronizada ao `localStorage` e eventos customizados.
- 2026-04-08: Refinamento visual extensivo: Navbar e Footer padronizados com Ultra Glassmorphism 3D, proporções de cards otimizadas para mobile e fundos translúcidos para revelar a animação de fundo.
- 2026-04-08: Implementação do design "Ultra Glassmorphism" (3D realístico) nos cards de diferenciais (`index.html`) e produtos da loja (`suplementos.html`), com bordas direcionais, blur de 24px e animação de brilho (shine).
- 2026-04-08: Padronização total da tipografia de seções (`h2` e `p`) entre Home e Loja, seguindo o padrão visual do Hero.
- 2026-04-08: Refino dos endereços das Unidades em `index.html` (por extenso, bairro JK corrigido e centralização total).
- 2026-04-08: Modernização dos botões de compra na loja com ícone nativo Lucide (cart-plus) e design edge-to-edge nas imagens dos produtos (mobile e desktop).
- 2026-04-08: Sincronização estrutural da Navbar entre Home e Loja, incluindo suporte funcional ao carrinho em todas as páginas e navegação suave via script JS e CSS.
- 2026-04-08: Simplificação do Hero da Home: remoção de textos excessivos, centralização do foco nos títulos e elevação do carrossel 3D para ocupação de espaço.

## Arquitetura e Stack Tecnológico
- **Frontend:** React (TypeScript), Vite, Tailwind CSS e Lucide Icons.
- **Roteamento:** React Router DOM (SPA).
- **Backend:** Vercel Serverless Functions (Node.js) alocadas na pasta `/api`.
- **Banco de Dados:** Vercel KV (Upstash Redis) para persistência dos produtos.
- **Mídia:** Cloudinary para armazenamento de imagens via upload do painel de controle.
- **Pagamentos:** Mercado Pago Core API (via `/api/process_payment.js` e `/api/webhook.js`).
- **Hospedagem:** Vercel (com `rewrites` configurados para suporte SPA).

## Regras Estritas de Desenvolvimento
1. **Componentização React:** Priorizar a separação de responsabilidades criando componentes reutilizáveis em `src/components/ui/`.
2. **Estilização Dinâmica:** Utilizar o utilitário `cn` (tailwind-merge e clsx) configurado em `src/lib/utils.ts` para composição de classes.
3. **Design Fluido (Glassmorphism):** Manter as seções principais com fundos transparentes ou semi-translúcidos (`bg-slate-900/30`) para garantir que o fundo animado do Canvas permaneça visível.
4. **Segurança:** Nunca expor chaves sensíveis (Mercado Pago, Cloudinary, KV) no frontend.
5. **Responsividade Mobile-First:** Ajustar paddings, gaps e tipografia primariamente para telas menores, expandindo progressivamente com prefixos `md:` e `lg:`.

## Estado Atual do Projeto
- **Concluído:** Migração bem-sucedida do layout estático Vanilla JS para uma Single Page Application React (Vite).
- **Concluído:** Reestruturação da UI com componentes modernos (GlassCards, Navbar/Footer flutuantes 3D e Carrinho Sidebar sincronizado).
- **Concluído:** Migração do Stripe para **Mercado Pago Core API** com checkout 100% customizado.
- **Objetivo Imediato:** Validar o processamento de webhooks do Mercado Pago para atualização automática do status dos pedidos no banco de dados.
