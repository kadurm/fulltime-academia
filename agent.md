# Fulltime Academia - Diretrizes do Projeto e Contexto para IA

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

## Estado Atual do Projeto
- **Concluído:** Estruturação da Landing Page (`index.html`), Loja (`suplementos.html`) e CMS/Painel (`admin.html`).
- **Concluído:** Integração e validação do fluxo Vercel KV + Cloudinary (O admin salva no banco e faz upload, a loja consome e exibe).
- **Concluído:** Refatoração de UI (Navbar e proporção 1:1 das imagens dos produtos).
- **Objetivo Imediato:** Injetar a chave secreta (`STRIPE_SECRET_KEY`) no ambiente local e validar o funil de pagamento conectando o carrinho ao Stripe Checkout.
