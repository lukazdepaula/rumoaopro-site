# Atualização de segurança preparada — 29/09/2026

## Estado e escopo

Preparada e validada **localmente**, sem push, PR, deploy ou alteração de produção.
Branch: `codex/site-security-dependencies-2026-09-29`.
Base: `29afb5818445252db9c72ec8da83812957ef2fb5`, confirmada como main no GitHub antes do trabalho.

Somente o site RumoAoPro foi atualizado nesta etapa. Load Pro e Raptor permanecem sem alterações.
Nenhum banco remoto, conta real, senha, exigência de MFA, sessão produtiva, formulário de coleta,
pagamento, e-mail, conteúdo comprado ou página da assessoria foi alterado.
As mudanças anteriores da pasta principal foram preservadas em outra cópia de trabalho.

## Mudanças

| Componente | Antes | Preparado |
|---|---|---|
| Next.js e SWC WASM | 15.5.21 | 15.5.24 |
| sharp (override em package.json e pnpm-workspace.yaml) | 0.35.3 | 0.35.4 |
| Browserslist | 4.28.2 | 4.29.2 |
| baseline-browser-mapping | 2.10.34 | 2.11.26 |
| postcss-selector-parser | 6.1.2 | 6.1.4 |

O lockfile também atualiza os binários correspondentes de Next/sharp/libvips e os dados de
compatibilidade exigidos pelo Browserslist. Não houve salto de versão principal nem alteração
de React, componentes, CSS, rotas ou lógica de negócio. O lockfile foi gerado com pnpm 9.15.4,
a versão fixada pelo projeto; metadados `libc` escritos anteriormente por pnpm mais recente
foram normalizados por essa versão.

O teste existente de MFA ganhou verificações de que senha/sessão pendente não liberam a API,
o painel autenticado não pode ser armazenado em cache e duas atualizações consecutivas da
página não encerram a sessão. Isso altera apenas o teste, não a política de autenticação.

## Resultados

- Instalação com scripts de pacotes desativados; instalação final com
  `pnpm install --frozen-lockfile --ignore-scripts --offline`: aprovada.
- `pnpm check`: aprovado, inclusive após os testes.
- `pnpm build`: aprovado, Next 15.5.24, 40 páginas estáticas geradas.
- `node --test scripts/tests/*.test.mjs`: **155 aprovados, zero falhas ou ignorados**.
  Inclui pagamentos anuais, idempotência, separação de ambientes, consentimento,
  assinatura de webhooks e preservação/revogação de acesso adquirido. Serviços externos
  são substituídos por respostas fictícias; SQL usa PostgreSQL local em memória.
- `node scripts/test-discount-links.mjs`: aprovado (cupom, arredondamento, moeda,
  expiração, limite de uso e produto).
- Teste HTTP real de MFA no build local: senha, configuração TOTP, sessão pendente bloqueada,
  recuperação de uso único, recusa de reutilização de TOTP, limite de tentativas,
  sessão completa após atualizar e bloqueio de origem externa: aprovados.
- 19 verificações HTTP locais: páginas PT/EN e checkout 200; áreas privadas redirecionam;
  API administrativa, materiais e download sem autorização 401; aprovação mock em modo
  produção 404; checkout com origem externa 403 e corpo inválido 400; imagem local otimizada
  200 e origem remota não permitida 400. Cabeçalhos no-store e DENY do admin confirmados.
- Conferência visual: produto Speed Pro e checkout em 1365×900 e 390×844;
  passagem produto → checkout e mudança Brasil → internacional funcionando.
  Não foram enviadas compras nem dados pessoais. Tamanho do navegador restaurado.
- Auditoria final `pnpm audit --json`: **zero avisos conhecidos** (antes: sete ocorrências),
  incluindo consulta da árvore completa, sem filtros ou avisos silenciados.
- `git diff --check`: aprovado.

## Isolamento e limites

A prévia foi executada apenas na interface de loopback, com SQLite temporário, administrador
fictício, segredos aleatórios exclusivos do teste e sem herdar credenciais de provedores.
O servidor e a aba de teste foram encerrados. Nenhum segredo produtivo foi copiado.

O primeiro teste de MFA usando Origin `http://127.0.0.1:4399` recebeu 403. Repetido com
`http://localhost:4399`, passou integralmente. O resultado é compatível com normalização da
origem de loopback nesse fluxo local; não foi afrouxada a proteção de origem para fazer o teste passar.

Esta validação não é um pentest completo, não significa risco zero e não comprova o estado
da publicação Vercel. Não foram executados pagamento real/sandbox hospedado, e-mail real,
login com conta de cliente ou download de material privado real. A integração Linux/Vercel
ainda requer verificação após uma publicação autorizada; o teste local foi no Windows/Node 24.

## Próximo passo, mediante autorização

Rever o diff, confirmar que main não avançou, preparar PR/prévia isolada quando autorizado
e validar o ambiente de hospedagem antes de promover a produção. Não reutilizar credenciais
produtivas em prévia: o middleware existente bloqueia prévias sem sandbox configurado.
Esta preparação **ainda não remove os avisos da versão que os clientes utilizam**.

Permanecem fora desta etapa: atualizações do Raptor, limite compartilhado de tentativas do admin,
CSP do Load Pro em modo de bloqueio e demais pendências do check-up mensal.

## Referências dos mantenedores

- [Next.js: otimização de AVIF](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4).
- [Next.js: servidor Windows](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36).
- [sharp/libheif](https://github.com/lovell/sharp/security/advisories/GHSA-rgj7-g3m4-5g8c).

Os avisos dependem dos recursos e do ambiente utilizados; não foi demonstrada exploração do
site publicado nem afirmado que um incidente tenha ocorrido.

## Correção do retorno de checkout na Preview — 07/10/2026

Na QA isolada, a confirmação Stripe TEST foi aceita, mas `/checkout/success` falhou ao
montar um link público do Speed Pro. `getRaptorProProgramUrl` chamava a configuração
privilegiada do Raptor, cuja conexão de banco foi deliberadamente desabilitada nesta prévia.

- A montagem da URL pública agora é independente das credenciais de provisionamento.
- Preview/development/modo de teste aceitam apenas uma origem separada válida. Sem ela,
  o link aponta ao catálogo local `/apps`, nunca ao aplicativo real por fallback.
- A guarda de banco das operações de concessão/revogação de acesso e geração de links
  pessoais permanece intacta. Nenhum provisionamento real foi habilitado.
- Seis testes novos cobrem os produtos/aliases, URLs inválidas/produtivas, ausência de
  credenciais, bloqueio de operações privilegiadas e renderização do retorno pago.
  Retorno sem autorização continua sem consultar ou exibir o pedido.
- `node --test scripts/tests/*.test.mjs`: 161 aprovados, zero falhas/ignorados.
- `pnpm check` com a versão 9.15.4: aprovado. `pnpm build` foi tentado, mas o compilador
  nativo foi bloqueado pelo Windows Application Control; execução encerrada. Nenhuma
  proteção do Windows foi desativada. Build hospedado e QA desta correção ainda pendentes.

Escopo: branch de segurança/Preview e PR 19. Nenhum merge em main ou deploy de produção.
A main avançou para `e4bc59d3ac4d09baece4df0fc6ef28a4ead33ea7`; não foi rebaseada nem
alterada por esta correção. Antes de uma promoção futura, reconciliar/revisar a base atual.

## Próxima fase: entrega privada e fronteira de provisionamento — 07/10/2026

A main `e4bc59d` foi revisada e integrada somente à branch de segurança, preservando as
mudanças recentes do painel financeiro e Clube 150. Não houve publicação em produção.

Foi reproduzida localmente, com serviços inteiramente simulados, uma falha adicional:
`syncRaptorProProgramAccess` não recusava pedidos sandbox/mock por si só. A orquestração
de webhook os ignorava, mas o botão de acesso direto e ações administrativas chamavam
a função sem essa barreira. Assim, se um pedido fictício pago existisse em produção,
um retorno autorizado poderia tentar provisionar acesso real. Não foi verificada a
existência de pedidos afetados na produção nem demonstrado uso indevido por terceiros.

A função comum agora rejeita sandbox/mock antes de configurar ou chamar o provedor,
inclusive para concessão, revogação e geração de link pessoal. Compras reais e migrações
históricas mantêm o comportamento existente nos testes. A reprodução teve três falhas
antes da correção; os sete testes da fronteira passaram depois dela.

Outros sete testes, com bytes públicos fictícios em memória, verificam assinatura de
download, pedido pago, correspondência de arquivo, ausência de login, direito do cliente
ao produto, cache privado, confirmação de provisionamento e falha de envio de e-mail.
Nenhum arquivo privado, destinatário real ou serviço remoto foi usado nesses testes.

Um teste financeiro incorporado da main dependia da data atual e passou a receber 410
após a expiração intencional do diagnóstico. Somente o relógio desse teste foi fixado
para o período de validade. A rota real continua expirada em 03/10/2026, sem prorrogação.

Os testes simulados não substituem entrega real por e-mail nem provisionamento em um
Raptor isolado. Essas integrações continuam desligadas nesta Preview. A validação
hospedada deve conferir a recusa do pedido fictício já existente, sem criar outra compra.

Validação local da base integrada: `pnpm check` passou e a suíte completa terminou
com 192 testes aprovados, sem falhas ou testes ignorados. O build desta nova revisão
ainda precisa ser confirmado na Vercel; o compilador nativo local permanece bloqueado
pela política de controle de aplicativos do Windows, que não foi alterada.
