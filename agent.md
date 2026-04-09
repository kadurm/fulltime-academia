# Fulltime Academia - Diretrizes do Projeto e Contexto para IA

## Protocolo de Sincronização Multi-Terminal
1. Ao concluir qualquer alteração estrutural, adicione um resumo na seção "## Últimas Atualizações" no topo deste documento.
2. Antes de iniciar qualquer nova tarefa, releia obrigatoriamente este arquivo `agent.md` para assimilar o contexto atualizado por agentes em outros terminais.

## Últimas Atualizações
- 2026-04-08: Implementação do design "Ultra Glassmorphism" (3D realístico) nos cards de diferenciais (`index.html`) e produtos da loja (`suplementos.html`), com bordas direcionais, blur de 24px e animação de brilho (shine).
- 2026-04-08: Padronização total da tipografia de seções (`h2` e `p`) entre Home e Loja, seguindo o padrão visual do Hero.
- 2026-04-08: Refino dos endereços das Unidades em `index.html` (por extenso, bairro JK corrigido e centralização total).
- 2026-04-08: Modernização dos botões de compra na loja com ícone nativo Lucide (cart-plus) e design edge-to-edge nas imagens dos produtos (mobile e desktop).
- 2026-04-08: Sincronização estrutural da Navbar entre Home e Loja, incluindo suporte funcional ao carrinho em todas as páginas e navegação suave via script JS e CSS.
- 2026-04-08: Simplificação do Hero da Home: remoção de textos excessivos, centralização do foco nos títulos e elevação do carrossel 3D para ocupação de espaço.
- 2026-04-07: Redução forçada do título do carrinho (`Seu Carrinho`) em `suplementos.html` usando a tag `span` e estilo inline para garantir especificidade visual.
- 2026-04-07: Ajuste fino no título do carrinho (`Seu Carrinho`) em `suplementos.html`, reduzindo para `text-lg` para maior refinamento estético.
- 2026-04-07: Ajuste estético no título do carrinho (`Seu Carrinho`) em `suplementos.html`, reduzindo o tamanho da fonte para melhor equilíbrio visual.
- 2026-04-07: Refatoração do carrinho para agrupar itens iguais e permitir controle de quantidade (+/-), com atualização automática de totais e integração com o checkout.
- 2026-04-07: Restauração da funcionalidade do menu lateral do carrinho (`sidebar`) em `suplementos.html` e integração completa com os botões de adicionar produto.
- 2026-04-07: Implementação de lógica funcional do carrinho de compras na Loja (`suplementos.html`) usando `localStorage` com feedback visual de confirmação nos botões.
- 2026-04-07: Ajuste de largura e margem da barra de pesquisa na Loja (`suplementos.html`) para melhorar a experiência em dispositivos móveis.
- 2026-04-07: Simplificação da Navbar da Loja (`suplementos.html`) para foco em conversão, mantendo apenas os links de 'Início' e 'Carrinho'.
- 2026-04-07: Padronização da Navbar da Loja (`suplementos.html`) com o modelo responsivo e centralizado da Home (`index.html`), integrando o botão de carrinho.
- 2026-04-07: Padronização do estilo global (background, fontes e cores) da Loja (suplementos.html) com a Página Inicial (index.html), incluindo efeitos de beams e canvas.
- 2026-04-07: Corrigido o padding lateral (`px-6`) e o alinhamento central (`justify-center`) da barra de navegação mobile em `index.html`.
- 2026-04-07: Atualizada a foto da unidade São José em `index.html` para o formato JPEG (`public/unidade-sao-jose.jpeg`).
- 2026-04-07: Refatorada a navbar mobile em `public/mobile-fix.css` para centralização da logo e suporte aprimorado para scroll horizontal dos links, removendo regras de menu legadas.
- 2026-04-07: Corrigido `public/mobile-fix.css` para restaurar a visibilidade e funcionalidade de rolagem horizontal dos botões de navegação no header mobile.
- 2026-04-07: Refatoração da Navbar em `index.html` para um design responsivo in-line com logo centralizada e remoção de elementos de menu mobile legados.
- 2026-04-07: Implementado protocolo de sincronização multi-terminal para coordenação entre agentes em diferentes sessões.

## Arquitetura e Stack Tecnológico
- **Frontend:** Vanilla JS, HTML5 e Tailwind CSS (via CDN). Sem frameworks pesados (React/Vue).
- **Backend:** Vercel Serverless Functions (Node.js) alocadas na pasta `/api`.
- **Banco de Dados:** Vercel KV (Upstash Redis) para persistência dos produtos.
- **Mídia:** Cloudinary para armazenamento de imagens via upload do painel de controle.
- **Pagamentos:** Stripe Checkout (via `/api/checkout.js`).
- **Hospedagem:** Vercel (utilizando `vercel dev` para ambiente local).

## Regras Estritas de Desenvolvimento
1. **Simplicidade e Performance:** Manter a abordagem estática/serverless. Não introduzir bundlers complexos se não for estritamente necessário.
2. **Estilização:** Utilizar classes utilitárias do Tailwind CSS. Evitar o uso indiscriminado de `!important` ou altas fixas engessadas; priorizar `flexbox`, `aspect-ratio` e design fluido (Mobile-First).
3. **Segurança:** Nunca expor chaves sensíveis (Stripe, Cloudinary, KV) no frontend. Toda a comunicação com serviços de terceiros deve ser feita pelas rotas da pasta `/api` lendo do arquivo `.env`.
4. **Navegação:** O menu principal é construído via Flexbox horizontal estendido, sem modais ou botões hambúrguer.
5. **Feedback Auditivo Universal:** Implementar uma rotina centralizada de áudio para fornecer feedback sonoro discreto em todas as interações de clique (botões e links), garantindo uma experiência sensorial consistente e acessível.

## Estado Atual do Projeto
- **Concluído:** Estruturação da Landing Page (`index.html`), Loja (`suplementos.html`) e CMS/Painel (`admin.html`).
- **Concluído:** Integração e validação do fluxo Vercel KV + Cloudinary (O admin salva no banco e faz upload, a loja consome e exibe).
- **Concluído:** Refatoração de UI (Navbar e proporção 1:1 das imagens dos produtos).
- **Objetivo Imediato:** Injetar a chave secreta (`STRIPE_SECRET_KEY`) no ambiente local e validar o funil de pagamento conectando o carrinho ao Stripe Checkout.
