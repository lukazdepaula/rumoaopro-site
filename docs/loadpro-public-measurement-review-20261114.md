# Revisão da medição pública do LoadPro — 14/11/2026

Preparado para revisão, sem publicação, mudança de campanha ou orçamento.

## Diagnóstico confirmado

O Gerenciador de Eventos do pixel LoadPro App 2268536600662142 mostra:

- Domínio `loadpro.rumoaopro.com.br` classificado como prestador de serviços de
  saúde e bem-estar, com configuração básica e bloqueio de dados do site.
- Cobertura baixa de ViewContent pela API: 55 eventos a menos que o navegador
  nos últimos sete dias do alerta consultado. Essa contagem não é a coorte de
  anúncios de 6–12/11 e não deve ser usada como perda de vendas.
- Não há análise em andamento indicada na lista de categorias (status “–”).
  A opção “Pedir uma análise” existe. Nenhum pedido foi enviado nesta revisão.

Os dois pedidos da campanha preservaram UTMs e identificadores de navegador;
nenhum identificador pessoal foi copiado para esta documentação. Ausência de
atribuição no Ads Manager não prova ausência do teste real confirmado na Stripe.

## Correção preparada

A página pública estática emitia PageView/ViewContent apenas pelo navegador.
O endpoint dedicado `/api/loadpro/marketing/events` recebe somente os eventos
PageView, ViewContent e Contact da página comercial pública. O app usa o mesmo
nome e ID nas cópias de navegador e servidor. Repetições mantêm o horário original
e o recibo existente; falhas transitórias não criam um evento diferente.

- Origem CORS exata: `https://loadpro.rumoaopro.com.br`; sem credenciais do app.
- A URL enviada à Meta continua sendo a origem verdadeira, mesmo bloqueada.
  O transporte pelo backend RumoAoPro não remove nem contorna a restrição.
- Consentimento obrigatório, limite de tamanho, frequência e campos permitidos.
- Nenhum nome, e-mail, atleta, formulário, conta, URL privada ou dado de saúde é
  aceito pelo novo endpoint. Ele não pode registrar StartTrial ou Purchase.
- QA/preview não gravam nem enviam estes eventos à Meta; os testes de entrega
  usam banco em memória e transporte capturado, sem credenciais reais.
- A página mantém o identificador da visita durante re-renderizações e usa o
  clique atual em vez de um cookie de clique anterior quando há novo fbclid.
- O pixel desativa navegação automática antes da inicialização. As telas
  privadas continuam revogando a coleta publicitária para o documento.
- As páginas `/apps/loadpro` e `/en/apps/loadpro` registram a visualização do
  produto. Os três planos usam o pixel LoadPro; Purchase continua exclusivo do
  webhook confirmado, e teste grátis continua valendo zero.

Não há migração, alteração de cobrança, permissões ou preenchimento retroativo.
Não reenviar eventos antigos nem inventar vendas para preencher o relatório.

## Publicação posterior, se aprovada

1. Publicar primeiro o backend do site RumoAoPro, com o endpoint novo.
2. Publicar depois o frontend LoadPro e a atualização do cache.
3. Validar visitas consentidas no painel, sem criar compra ou teste fictício.
4. Solicitar análise da categoria com uma descrição fiel do software e da
   separação entre página comercial e dados privados. A decisão é da Meta.
5. Conferir deduplicação e atribuição após consolidação. Aceitação pela API,
   deduplicação e atribuição são verificações diferentes. Não prometer que
   publicação do código, por si só, liberará o pixel.

Referência oficial de IDs de deduplicação:
https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events

Referência da Meta sobre categorias (também acessível no painel):
https://www.facebook.com/business/help/1402913027039332
