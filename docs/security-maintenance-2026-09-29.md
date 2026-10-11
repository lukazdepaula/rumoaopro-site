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

## Ponte de QA explicitamente limitada ao Raptor de staging — 08/10/2026

Preparado um opt-in temporário, desligado por padrão, para validar entrega de acesso
sem usar o Raptor público. A reativação e as consultas somente de leitura do projeto
de staging foram autorizadas separadamente; nenhum seed ou catálogo foi reaplicado.

A ponte exige simultaneamente a branch de segurança, Vercel Preview, Stripe TEST,
checkout sandbox, origem exata da Preview, banco isolado do checkout e banco isolado
do Raptor. Exige ainda um único UUID de pedido e um único destinatário configurados
no servidor. Apenas `project_36` é aceito e seu acesso é mapeado exclusivamente ao
fixture já existente `speed-pro-qa-20260913`, nunca ao programa comercial real.

Concessões exigem pedido pago. Mock, outros produtos, pedidos, e-mails, branches,
bancos ou origens são recusados antes de chamar o provedor. Em produção, a recusa
de pedidos sandbox/mock continua incondicional. O botão público de acesso direto
continua recusando pedidos sandbox; o teste de integração será pela orquestração
de confirmação/reprocessamento autenticado, não por uma exceção nessa rota.

O retorno de Auth é limitado a um caminho exato em `http://127.0.0.1:3022`, onde a
prévia local e descartável do Raptor deve ser conferida antes de qualquer envio.
Links devolvidos pelo provedor fora do staging/retorno aprovado são recusados.
Requisições privilegiadas da QA não seguem redirects HTTP e erros do Raptor nessa
prévia não incluem o corpo bruto retornado pelo provedor.

E-mails genéricos, marketing, entrega de material e notificações de produção
continuam bloqueados. Apenas o template de acesso, rotulado TESTE SEM COBRANÇA,
pode ser enviado ao destinatário e pedido permitidos, com opt-in separado e chave
de envio exclusiva de QA. Nunca há fallback para `RESEND_API_KEY` da produção.
Não guardar o e-mail autorizado nem as credenciais neste documento ou no Git.

Validação: nove novos testes inteiramente simulados cobrem também conta nova,
convite, revogação, falha dos provedores e reprocessamento sequencial sem reenvio.
A suíte completa passou com **201/201**, zero falhas/ignorados; `pnpm check` passou.
Nesta execução, `pnpm build` local também terminou com exit code 0, compilação
bem-sucedida e 40/40 páginas geradas, sem alterar a proteção do Windows.
O template foi inspecionado no navegador em quadros de 640 e 375 px, sem corte ou
overflow horizontal na largura menor. Isso não comprova entrega nem renderização
em todos os clientes de e-mail e não valida o aplicativo Raptor em dispositivos.

Configuração real permanece desligada. Ainda faltam: retorno Auth cadastrado no
staging, credenciais dedicadas inseridas privadamente, aplicação local conferida,
novo pedido Stripe TEST do destinatário autorizado e teste ponta a ponta. O pedido
fictício anterior não deve ter seu e-mail trocado nem ser reutilizado como esse teste.
Ao concluir a QA, desligar os opt-ins e remover/revogar credenciais temporárias e
o retorno temporário mediante autorização; não promover a ponte temporária por
acidente. Esta preparação não é aprovação para merge/publicação em produção.

## Preparação local de recuperação de entrega — 11/10/2026

Escopo autorizado: preparar correções na cópia isolada, sem push, deploy, cobranças,
e-mails reais, mudanças nas configurações remotas ou aplicação de SQL remoto.
O responsável confirmou anteriormente recebimento do convite e abertura do programa
fictício após **reprocessamento manual**. Isso não comprova uma nova compra com
entrega automática completa. O pedido já concluído não deve ser reenviado.

### Dependências

- Next/SWC: 15.5.24 → 15.5.27; sharp: 0.35.4 → 0.35.5.
- source-map-js: 1.2.1 → 1.2.2; postcss-selector-parser: 6.1.4 → 7.1.6.
- `@swc/helpers` 0.5.15, já requerido pelo Next, declarado diretamente para resolver
  os helpers do `next.config.ts` no caminho WebAssembly de inicialização local.
- Overrides mantidos no package.json (pnpm 9) e pnpm-workspace.yaml (runtime novo).
- Auditoria após atualização: **1 alto, 0 moderados, 0 críticos**, contra 3 altos e
  3 moderados antes. Não houve silenciamento de avisos.
- Residual: `braces` 3.0.3, indireto do Tailwind/glob, sem release corrigido indicado
  pelo aviso. Uso observado na construção a partir dos arquivos confiáveis do
  projeto, não em uma API que recebe padrões do visitante. Não equivale a prova
  de ausência de exposição em qualquer configuração futura.

Fontes: [sharp](https://github.com/advisories/GHSA-wq5f-xc86-pv6w),
[Next 1](https://github.com/advisories/GHSA-4jqv-mc3x-m676),
[Next 2](https://github.com/advisories/GHSA-mcj8-r9mp-w47p),
[source-map-js](https://github.com/advisories/GHSA-68fv-2mgg-jv7q),
[selector parser](https://github.com/advisories/GHSA-rj75-hqrm-r3gf),
[braces residual](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

### Correção preparada, desligada por padrão

`STRIPE_RETRY_SAFE_FULFILLMENT_ENABLED` só liga o novo caminho com valor `true`.
Nenhuma configuração remota recebeu esse valor nesta preparação.

1. Após assinatura e ambiente válidos, uma reserva durável distingue processamento,
   conclusão e falha. Concorrência no mesmo evento recebe resposta temporária 503.
   Falhas recebem resposta não-2xx e liberam a reserva para nova tentativa da Stripe.
2. Eventos já registrados pelo código anterior são considerados históricos: não
   são automaticamente repetidos, pois não sabemos quais efeitos já ocorreram.
3. Há reserva separada por pedido do Raptor, inclusive para eventos diferentes e
   o botão administrativo. Eventos tardios não reabrem pedidos reembolsados/cancelados.
4. Falha de provisionamento/e-mail mantém o pagamento e as notificações originais,
   mas não marca o evento como concluído. LoadPro conserva seu sincronizador atual;
   esta implementação **não resolve todos os cenários de retry dos outros produtos**.
5. O convite usa corpo imutável e chave de idempotência por pedido no Resend. A cópia
   temporária do corpo/link é criptografada com AES-256-GCM e vinculada ao pedido.
   O marcador de envio é persistido antes de logs opcionais; ao confirmar, o corpo
   criptografado é removido. A tentativa seguinte não gera um novo magic link se
   já existe um convite preparado.
6. Em caso de confirmação de envio incerta, a repetição automática limita-se a
   **15 minutos desde a preparação**. Depois disso, recusa novo envio e requer
   revisão manual. Não se afirma entrega exatamente uma vez sob falhas ilimitadas;
   a política conservadora evita reenvio fora da janela e de links possivelmente usados.
7. Claims expiram em cinco minutos; token impede conclusão por um executor antigo.
   Rotas hospedadas de webhook/retry ficam limitadas a 60 segundos, e chamadas
   Raptor/Resend desse caminho têm timeout de 10 segundos. Validar a latência das
   integrações existentes antes de qualquer promoção.

Referências: [fulfillment Stripe](https://docs.stripe.com/checkout/fulfillment) e
[idempotência Resend](https://resend.com/changelog/idempotency-keys). O guia de boas
práticas Stripe orientou assinatura, separação de ambiente e processamento no servidor.

### Banco e ativação futura — não executados em ambientes remotos

- Migração aditiva: `supabase/checkout-retry-safety.sql`, **banco do checkout**, não
  banco do LoadPro nem do Raptor. Duas tabelas privadas e uma função service-only;
  RLS ativo, sem acesso de anon/authenticated, sem alteração de pedidos existentes.
- Requer `CHECKOUT_DELIVERY_ENCRYPTION_KEY`: segredo aleatório independente de pelo
  menos 32 caracteres, server-only e Sensitive. Não colocar valor no Git/chat.
  Não rotacionar enquanto houver mensagens preparadas sem plano de recuperação.
- Primeiro aplicar/validar no staging, configurar o segredo privado e só então
  ativar o flag na branch isolada. Sem migração, retorna erro; não há fallback inseguro.
- Usar novo pedido fictício, destinatário autorizado e os mesmos bloqueios QA
  específicos de banco/produto/retorno. Janela pública, webhooks TEST, e-mail real
  de teste e deploy continuam exigindo autorização própria. Não iniciar aqui.
- Repetir login/MFA/refresh, checkout, e-mail e programa, mais regressões de cobrança
  LoadPro, antes de considerar produção. Não habilitar recuperação histórica em massa.

### Recuo e limitações

Se for necessário recuar após uma ativação futura, desligar o flag e publicar a
configuração anterior autorizada. Não apagar tabelas, marcadores ou pedidos: podem
ser necessários para conciliação. Eventos recebidos durante a janela podem exigir
revisão individual ao voltar ao caminho antigo. Nunca usar replay em massa como rollback.
Nenhuma restauração de banco foi necessária ou efetuada nesta preparação.

Testes novos usam SQLite/PGlite em memória e serviços simulados: falha de consulta,
provisionamento, e-mail, resposta perdida após aceite do e-mail, gravação de metadados,
gravação de conclusão do evento, concorrência, expiração, criptografia, RLS, assinatura,
ambiente incorreto, pagamento pendente, histórico e pedidos encerrados. Não substituem
um teste hospedado com Stripe TEST. A compilação nativa Windows foi bloqueada pela
política do sistema; a alternativa WebAssembly do projeto compilou 40/40 páginas,
sem alteração das proteções do Windows.

### Validação final desta preparação

- `pnpm check`: aprovado; `pnpm build`: aprovado pelo caminho WebAssembly, 40/40 páginas.
- Suíte completa: **225 testes, 225 aprovados, zero falhas ou testes ignorados**.
- Auditoria final: um alerta alto residual (`braces`), nenhum moderado/crítico.
- Página Speed Pro e formulário do checkout conferidos no navegador local em
  1440×1000 e 390×844; sem falha visual observada nas áreas inspecionadas,
  imagens da página carregadas e sem erros de console capturados.
- O servidor de QA usou SQLite temporário, usuário fictício e nenhum segredo de
  provedor. Nenhuma compra foi enviada. Servidor encerrado após a conferência.
- Diff local conferido, sem erro de whitespace. Alterações ainda não commitadas,
  enviadas ou publicadas. O teste hospedado e a ativação continuam pendentes.
