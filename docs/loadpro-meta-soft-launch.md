# LoadPro — soft launch no Meta Ads

## Decisão de lançamento

- Oferta: Plano Treinadores Fundadores por R$ 49,90/mês.
- Conversão comercial: 7 dias grátis com cartão; cobrança apenas após o teste.
- Orçamento inicial: R$ 30/dia por 7 dias (R$ 210).
- Mercado inicial: Brasil, português, treinadores e preparadores físicos de futebol.
- Objetivo inicial recomendado: conversas qualificadas no WhatsApp. O volume pago ainda é pequeno para otimizar a campanha diretamente para `Purchase`.
- Objetivo de segunda etapa: campanha de vendas otimizada para `StartTrial` depois que o evento estiver validado e tiver volume.

## Eventos e definições

| Evento Meta | Quando ocorre | É receita? |
| --- | --- | --- |
| `PageView` | Página carregada após consentimento | Não |
| `ViewContent` | Página/seção comercial do LoadPro visualizada | Não |
| `Contact` | Clique em WhatsApp | Não |
| `InitiateCheckout` | Formulário enviado para criar a sessão segura do checkout | Não |
| `StartTrial` | Stripe confirma assinatura em período de teste | Não |
| `Purchase` | Stripe confirma fatura paga com valor maior que zero | Sim |

O navegador e o servidor reutilizam o mesmo `event_id` sempre que possível para deduplicação. Uma fatura de R$ 0,00 criada no começo do teste nunca dispara `Purchase`.

No checkout central, o Pixel geral RumoAoPro mede o `PageView` do site e o Pixel LoadPro recebe os eventos comerciais do produto via `trackSingle`. Essa separação é intencional e evita enviar o mesmo evento aos dois conjuntos. A página pública `loadpro.rumoaopro.com.br` pertence a outro repositório e precisa instalar o Pixel LoadPro respeitando o consentimento nesse projeto.

## Estrutura da primeira campanha

### Campanha

- Nome: `BR | LoadPro | WhatsApp | Fundadores | Soft launch`
- Objetivo: Leads/Mensagens, destino WhatsApp.
- Orçamento: R$ 30/dia no conjunto.
- Duração inicial: 7 dias sem alterações grandes nas primeiras 72 horas.

### Conjunto

- Brasil; idioma português.
- Idade inicial: 22–50.
- Posicionamentos Advantage+.
- Público amplo com sinais relacionados a futebol, preparação física, ciência do esporte, treinamento esportivo e análise de desempenho. Evitar empilhar interesses demais.
- Excluir compradores/assinantes quando houver público suficiente.

### Anúncio 1 — dor da planilha

- Formato: vídeo vertical curto ou carrossel.
- Gancho: `Seu trabalho não deveria terminar organizando planilhas.`
- Texto: `Planejamento, prontidão, PSE, carga e relatórios no mesmo fluxo. Conheça o LoadPro, feito para a rotina do preparador físico no futebol.`
- CTA: `Falar no WhatsApp`.
- UTM: `?utm_source=meta&utm_medium=paid_social&utm_campaign=loadpro_foundadores_soft_launch&utm_content=planilha`

### Anúncio 2 — prova de produto

- Formato: vídeo vertical com calendário, dashboard e relatório em sequência.
- Gancho: `Do formulário do atleta ao report da comissão.`
- Texto: `Veja quem respondeu, acompanhe prontidão, PSE e AU e entregue relatórios visuais sem montar tudo do zero.`
- CTA: `Conhecer o LoadPro` ou `Falar no WhatsApp`.
- UTM: `?utm_source=meta&utm_medium=paid_social&utm_campaign=loadpro_foundadores_soft_launch&utm_content=produto`

### Anúncio 3 — prova social

- Formato: depoimento com foto do treinador, clube e telas do produto integradas ao layout.
- Gancho: `Mais controle. Menos tempo organizando dados.`
- Texto: usar somente depoimentos autorizados e atribuições confirmadas. Não prometer prevenção de lesão ou diagnóstico.
- CTA: `Testar por 7 dias`.
- UTM: `?utm_source=meta&utm_medium=paid_social&utm_campaign=loadpro_foundadores_soft_launch&utm_content=depoimento`

## Mensagem inicial do WhatsApp

`Olá! Vi o LoadPro e quero entender como ele pode organizar o planejamento, as coletas e os relatórios da minha equipe.`

## Painel de acompanhamento diário

- Investimento e alcance.
- CTR de link e custo por visita.
- Cliques no WhatsApp (`Contact`) e custo por conversa qualificada.
- `InitiateCheckout` e taxa visita → checkout.
- `StartTrial` e taxa checkout → teste.
- `Purchase`, receita e CAC somente após a primeira cobrança real.
- Respostas qualitativas: cargo, número de equipes, processo atual e principal dor.

## Regras de decisão

- Não desligar anúncio apenas por poucas horas; observar no mínimo 3 dias, salvo erro de entrega ou promessa incorreta.
- Criativo com gasto relevante, nenhum contato e CTR de link fraco deve ser substituído, não apenas receber mais orçamento.
- Escalar orçamento em passos de aproximadamente 20% quando houver conversas qualificadas e testes dentro do CAC aceitável.
- Não declarar uma campanha rentável usando `StartTrial`; rentabilidade depende de `Purchase` após os 7 dias.

## Checklist técnico antes de ativar

1. Criar/selecionar Pixel no Gerenciador de Eventos.
2. Configurar `NEXT_PUBLIC_LOADPRO_META_PIXEL_ID` na Vercel.
3. Gerar token da API de Conversões e salvar como `LOADPRO_META_CONVERSIONS_API_TOKEN` somente na Vercel.
4. Usar `LOADPRO_META_CONVERSIONS_API_TEST_EVENT_CODE` durante o teste e removê-lo antes da campanha.
5. Fazer redeploy.
6. Aceitar medição no banner e validar `PageView`, `ViewContent` e `Contact` em Eventos de Teste; `InitiateCheckout` deve aparecer somente ao enviar o formulário do checkout.
7. Fazer um checkout controlado e confirmar `StartTrial` uma única vez.
8. Confirmar que nenhuma fatura de R$ 0,00 aparece como `Purchase`.
9. Testar uma cobrança real/controlada antes de otimizar mídia para `Purchase`.
10. Publicar somente depois de revisar política de privacidade, WhatsApp de destino, preço e texto do teste grátis.
