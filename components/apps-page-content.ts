import { Activity, BarChart3, CalendarDays, Dumbbell, FileBarChart2, Route, Users } from "lucide-react";

export const appPageCopy = {
  pt: {
    lead: "Planejamento e controle de carga com o LoadPro. Treinos, acompanhamento e execução com o Raptor Pro. Encontre a ferramenta para a sua rotina no futebol.",
    loadFeatures: [
      [CalendarDays, "Planejamento do microciclo", "Organize sessões, jogos e recuperação ao longo da semana."],
      [Activity, "Coletas pré e pós-treino", "Acompanhe prontidão, dor e percepção de esforço dos atletas."],
      [BarChart3, "Carga com contexto", "Compare o planejado e o realizado, com PSE, duração e carga em UA."],
      [Users, "Informação para a comissão", "Reúna o acompanhamento da equipe e os relatórios do trabalho."]
    ],
    raptorFeatures: [
      [CalendarDays, "Calendário individual e de equipes", "Monte e revise o planejamento, com continuidade entre as semanas."],
      [Dumbbell, "Execução e registro de carga", "O atleta segue a sessão e registra a carga nos exercícios habilitados."],
      [FileBarChart2, "Evolução e testes", "Consulte registros, intensidade, progressão e avaliações para orientar o próximo ciclo."],
      [Route, "GPS no calendário", "Importe CSV de PlayerData ou Catapult/Vector nos acessos habilitados."]
    ],
    comparison: [
      ["Foco principal", "Microciclo, coletas e controle de carga da equipe.", "Prescrição, execução dos treinos e acompanhamento do atleta."],
      ["Rotina do treinador", "Planejar, monitorar respostas e compartilhar relatórios.", "Montar sessões, revisar registros e acompanhar a evolução."],
      ["Participação do atleta", "Respostas às coletas pré e pós-treino.", "Calendário, orientações, feedback e registros da sessão."],
      ["Para começar", "Teste de 7 dias nos planos disponíveis abaixo.", "Assessoria, programa compatível ou convite para o piloto de treinadores."]
    ],
    faq: [
      ["Qual é a diferença entre os aplicativos?", "O LoadPro concentra o planejamento do microciclo e o monitoramento de carga da equipe. O Raptor Pro reúne prescrição, execução de sessões e acompanhamento de atletas, individualmente ou em equipes."],
      ["Como funciona o teste do LoadPro?", "Os planos mensais oferecem 7 dias grátis. Depois, há cobrança mensal automática no cartão nas condições confirmadas no checkout. Se o anual estiver disponível, a escolha e suas condições aparecem na área de planos e na assinatura."],
      ["Já comprei um programa. Como entro no Raptor Pro?", "Compradores de programas compatíveis recebem acesso ao ambiente do Raptor Pro. Use a conta vinculada à compra e as instruções de acesso recebidas. Se precisar de ajuda, fale com o suporte."],
      ["Como participo do piloto para treinadores?", "O grupo inicial será formado por 3 treinadores convidados, com 7 dias de acompanhamento. O acesso desses participantes continuará gratuito após o piloto, sem cobrança automática. Converse com a gente para combinar a participação e o escopo do acesso."],
      ["Todos os exercícios pedem registro de carga?", "Não. No Raptor Pro, o registro de carga aparece nos exercícios em que essa opção foi habilitada. O treinador pode consultar esses registros ao revisar o planejamento."],
      ["Posso importar dados de GPS?", "O Raptor Pro permite importar arquivos CSV compatíveis de PlayerData e Catapult/Vector nos acessos habilitados. A disponibilidade das métricas depende do equipamento e das colunas exportadas; os indicadores de marcas diferentes mantêm seus próprios significados."]
    ]
  },
  en: {
    lead: "Planning and training-load monitoring with LoadPro. Sessions, coaching and training execution with Raptor Pro. Find the tool for your football workflow.",
    loadFeatures: [
      [CalendarDays, "Microcycle planning", "Organize sessions, matches and recovery throughout the week."],
      [Activity, "Pre and post-training forms", "Follow player readiness, pain and perceived exertion."],
      [BarChart3, "Training load in context", "Compare planned and completed work through RPE, duration and load in AU."],
      [Users, "Information for the staff", "Bring team monitoring and reports together in your workflow."]
    ],
    raptorFeatures: [
      [CalendarDays, "Individual and team calendars", "Build and review plans, maintaining continuity between weeks."],
      [Dumbbell, "Training and load logging", "Players follow the session and log weights for enabled exercises."],
      [FileBarChart2, "Progress and testing", "Review logs, intensity, progression and assessments to inform the next cycle."],
      [Route, "GPS in the calendar", "Import PlayerData or Catapult/Vector CSV files with enabled access."]
    ],
    comparison: [
      ["Main focus", "Team microcycles, daily forms and load monitoring.", "Session planning, training execution and athlete coaching."],
      ["Coach workflow", "Plan, monitor responses and share reports.", "Build sessions, review logs and follow player progress."],
      ["Player participation", "Responses to pre and post-training forms.", "Calendar, guidance, feedback and session logs."],
      ["Getting started", "A 7-day trial on the plans below.", "Coaching, a compatible program or an invitation to the coach pilot."]
    ],
    faq: [
      ["How do the apps differ?", "LoadPro focuses on microcycle planning and team load monitoring. Raptor Pro brings together session planning, training execution and athlete coaching, individually or in teams."],
      ["How does the LoadPro trial work?", "Monthly plans include 7 days free. Automatic monthly card billing then follows the terms confirmed at checkout. When annual billing is available, its options and conditions appear in the plans section and your subscription."],
      ["I bought a program. How do I access Raptor Pro?", "Buyers of compatible programs receive access to Raptor Pro. Use the account linked to your purchase and the access instructions you received. Contact support if you need help."],
      ["How can I join the coach pilot?", "The initial group will include 3 invited coaches with 7 days of support. Their access will remain free after the pilot, with no automatic charge. Contact us to discuss participation and the scope of access."],
      ["Does every exercise require weight logging?", "No. Raptor Pro shows weight logging for exercises where that option is enabled. The coach can review these logs when adjusting the plan."],
      ["Can I import GPS data?", "Raptor Pro supports compatible PlayerData and Catapult/Vector CSV imports for enabled accounts. Available metrics depend on the device and exported columns; indicators from different brands retain their own meanings."]
    ]
  }
} as const;
