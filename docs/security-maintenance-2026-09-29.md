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
