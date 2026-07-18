export type LegalLocale = "pt" | "en";
export type LegalDocument = "terms" | "privacy" | "refunds";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalDocumentContent = {
  eyebrow: string;
  title: string;
  summary: string;
  updatedLabel: string;
  updatedAt: string;
  sections: LegalSection[];
};

export const legalRoutes: Record<
  LegalLocale,
  Record<LegalDocument, { label: string; href: string }>
> = {
  pt: {
    terms: { label: "Termos de uso", href: "/termos" },
    privacy: { label: "Privacidade", href: "/privacidade" },
    refunds: { label: "Reembolsos", href: "/reembolsos" }
  },
  en: {
    terms: { label: "Terms of use", href: "/en/terms" },
    privacy: { label: "Privacy", href: "/en/privacy" },
    refunds: { label: "Refunds", href: "/en/refunds" }
  }
};

export const legalContent: Record<
  LegalLocale,
  Record<LegalDocument, LegalDocumentContent>
> = {
  pt: {
    terms: {
      eyebrow: "RumoAoPro | Legal",
      title: "Termos de uso",
      summary:
        "Estas regras explicam como funcionam a compra, o acesso e o uso dos programas digitais, cursos e serviços da RumoAoPro.",
      updatedLabel: "Última atualização",
      updatedAt: "17 de julho de 2026",
      sections: [
        {
          title: "1. Aceitação dos termos",
          paragraphs: [
            "Ao acessar este site, criar uma conta, comprar um produto ou contratar um serviço, você declara que leu e concorda com estes Termos de Uso, com a Política de Privacidade e com a Política de Reembolso.",
            "Se você não concordar com alguma destas condições, não conclua a compra nem utilize os materiais disponibilizados."
          ]
        },
        {
          title: "2. Quem pode utilizar",
          paragraphs: [
            "As ofertas são destinadas a pessoas com capacidade legal para contratar. Atletas menores de 18 anos devem realizar a compra e utilizar os programas com autorização e acompanhamento de um responsável legal.",
            "O responsável deve avaliar se o conteúdo, a carga de treino e os equipamentos são adequados à idade, ao nível e à condição de saúde do atleta."
          ]
        },
        {
          title: "3. Produtos e serviços",
          paragraphs: [
            "A RumoAoPro oferece programas digitais de treinamento, cursos e serviços de assessoria esportiva. A descrição, o idioma, o prazo de acesso, os materiais incluídos, os requisitos de equipamento e o preço de cada oferta são apresentados na respectiva página de venda.",
            "Alguns produtos ou pagamentos podem ser operados por plataformas externas, como Kiwify, Stripe e Mercado Pago. Nesses casos, também se aplicam os termos e as políticas da plataforma utilizada, sem prejuízo dos direitos obrigatórios do consumidor."
          ]
        },
        {
          title: "4. Compra, preço e pagamento",
          items: [
            "O comprador deve fornecer informações verdadeiras, completas e atualizadas no checkout.",
            "Preços podem ser exibidos em reais, dólares ou outras moedas. Conversões apresentadas como estimativa podem variar conforme o câmbio e o emissor do pagamento.",
            "A liberação do produto depende da confirmação do pagamento pelo respectivo gateway.",
            "Tributos, tarifas bancárias, conversão de moeda e encargos do cartão podem ser aplicados conforme o país, o banco e a forma de pagamento do cliente.",
            "Promoções e cupons obedecem ao prazo, ao limite de uso e às condições informadas no momento da oferta."
          ]
        },
        {
          title: "5. Entrega e acesso digital",
          paragraphs: [
            "Após a confirmação do pagamento, o acesso é vinculado ao e-mail informado na compra. O cliente recebe instruções por e-mail e pode acessar os materiais pela área do cliente.",
            "O acesso é pessoal e intransferível. O cliente é responsável por manter seu e-mail, seus links de acesso e sua sessão protegidos e por informar imediatamente qualquer uso não autorizado.",
            "Se o acesso não for liberado ou o e-mail não chegar, o cliente deve verificar a caixa de spam e entrar em contato com a RumoAoPro, informando nome, e-mail e número do pedido."
          ]
        },
        {
          title: "6. Licença e propriedade intelectual",
          paragraphs: [
            "A compra concede uma licença limitada, pessoal, não exclusiva e intransferível para utilizar o conteúdo conforme a oferta adquirida. A titularidade dos materiais permanece com a RumoAoPro ou com seus licenciantes."
          ],
          items: [
            "Não é permitido compartilhar acesso, PDFs, vídeos, planilhas, links ou credenciais com terceiros.",
            "Não é permitido copiar, revender, sublicenciar, publicar, distribuir, adaptar ou explorar comercialmente os materiais sem autorização escrita.",
            "Uma compra individual licencia o uso por um único atleta ou usuário, salvo quando a oferta declarar expressamente outra condição."
          ]
        },
        {
          title: "7. Saúde, segurança e resultados",
          paragraphs: [
            "Os conteúdos têm finalidade educacional e de preparação física. Eles não substituem avaliação médica, diagnóstico, tratamento, fisioterapia, nutrição ou acompanhamento presencial de um profissional de saúde.",
            "Antes de iniciar qualquer treinamento, especialmente em caso de dor, lesão, cirurgia, condição clínica, uso de medicamentos ou longo período de inatividade, procure liberação de profissional habilitado. Interrompa a atividade diante de sintomas anormais e busque atendimento.",
            "Resultados dependem de fatores individuais, como histórico, nível, rotina, recuperação, alimentação e consistência. A RumoAoPro não garante resultado esportivo, contratação por clube, ausência de lesões nem um prazo específico de evolução."
          ]
        },
        {
          title: "8. Assessoria esportiva",
          paragraphs: [
            "Na assessoria, o planejamento depende das informações fornecidas pelo atleta, de sua disponibilidade, calendário, equipamentos e feedback. O cliente deve comunicar mudanças na rotina, dores, lesões e limitações relevantes.",
            "A assessoria é um serviço de preparação física e orientação esportiva. Ela não constitui atendimento médico e não substitui profissionais responsáveis por diagnóstico ou tratamento."
          ]
        },
        {
          title: "9. Cancelamentos e reembolsos",
          paragraphs: [
            "Pedidos de cancelamento e reembolso são tratados conforme a Política de Reembolso, o Código de Defesa do Consumidor e demais normas aplicáveis. Nada nestes termos limita direitos obrigatórios do consumidor.",
            "Quando um reembolso for aprovado, o acesso ao produto ou serviço correspondente poderá ser encerrado."
          ]
        },
        {
          title: "10. Uso adequado da plataforma",
          items: [
            "Não tente acessar contas, arquivos, áreas administrativas ou dados de terceiros.",
            "Não utilize automações, engenharia reversa, malware ou qualquer meio capaz de comprometer o site.",
            "Não use a plataforma para fraude, chargeback indevido ou violação de direitos de terceiros."
          ]
        },
        {
          title: "11. Disponibilidade e responsabilidade",
          paragraphs: [
            "A RumoAoPro adota medidas razoáveis para manter o site e os materiais disponíveis, mas serviços de internet, hospedagem, e-mail e pagamento podem apresentar indisponibilidades temporárias. Quando possível, falhas relevantes serão corrigidas e o acesso legítimo será restabelecido.",
            "A responsabilidade da RumoAoPro será apurada conforme a legislação aplicável. Nenhuma disposição destes termos exclui responsabilidade que não possa ser legalmente limitada."
          ]
        },
        {
          title: "12. Alterações",
          paragraphs: [
            "Estes termos podem ser atualizados para refletir mudanças no serviço, na tecnologia ou na legislação. A versão vigente será publicada nesta página com a data de atualização. Alterações relevantes não reduzirão retroativamente direitos já adquiridos."
          ]
        },
        {
          title: "13. Lei aplicável e contato",
          paragraphs: [
            "Aplicam-se as leis da República Federativa do Brasil, respeitadas as normas obrigatórias de proteção do consumidor do local em que forem aplicáveis. Eventuais controvérsias serão submetidas ao foro competente definido pela legislação de consumo.",
            "Dúvidas sobre estes termos podem ser enviadas para {{email}} ou pelo WhatsApp {{whatsapp}}."
          ]
        }
      ]
    },
    privacy: {
      eyebrow: "RumoAoPro | LGPD",
      title: "Política de privacidade",
      summary:
        "Esta política explica quais dados coletamos, por que os utilizamos e como você pode exercer seus direitos.",
      updatedLabel: "Última atualização",
      updatedAt: "17 de julho de 2026",
      sections: [
        {
          title: "1. Controlador e contato",
          paragraphs: [
            "A RumoAoPro é responsável pelas decisões sobre o tratamento dos dados pessoais coletados diretamente neste site e em seus canais de atendimento.",
            "Para dúvidas, solicitações ou exercício de direitos relacionados à privacidade, escreva para {{email}} ou fale pelo WhatsApp {{whatsapp}}."
          ]
        },
        {
          title: "2. Dados que podemos coletar",
          items: [
            "Identificação e contato: nome, e-mail, telefone, WhatsApp, país, CPF ou outro documento quando necessário.",
            "Endereço e dados fiscais: CEP ou código postal, rua, número, complemento, cidade, estado e país.",
            "Compra e pagamento: produto, valor, moeda, desconto, status, identificador do pedido e referências do gateway. A RumoAoPro não armazena o número completo do cartão.",
            "Conta e acesso: tokens de autenticação, histórico de acesso aos produtos e registros de segurança.",
            "Assessoria e aplicação: objetivo, rotina, calendário, equipamentos, histórico esportivo e informações sobre dores, lesões ou limitações que você decidir fornecer.",
            "Dados técnicos: endereço IP, navegador, dispositivo, páginas acessadas, data e hora, cookies essenciais e registros de erro ou prevenção a fraude.",
            "Comunicações: mensagens, solicitações de suporte, respostas a formulários e preferências informadas por você."
          ]
        },
        {
          title: "3. Como coletamos",
          paragraphs: [
            "Coletamos dados quando você preenche formulários, realiza uma compra, solicita acesso, usa a área do cliente, entra em contato ou se candidata à assessoria. Também recebemos confirmações e identificadores de provedores de pagamento e serviços técnicos usados para concluir a operação."
          ]
        },
        {
          title: "4. Para que utilizamos",
          items: [
            "Processar pagamentos, confirmar pedidos e liberar os produtos adquiridos.",
            "Criar e proteger contas, autenticar acessos e recuperar credenciais.",
            "Entregar materiais, enviar comunicações transacionais e prestar suporte.",
            "Avaliar candidaturas e, quando contratado, personalizar a assessoria esportiva.",
            "Emitir documentos fiscais, manter registros contábeis e cumprir obrigações legais.",
            "Prevenir fraude, abuso, chargebacks indevidos e incidentes de segurança.",
            "Melhorar o funcionamento, a navegação e a confiabilidade da plataforma.",
            "Enviar comunicações promocionais apenas quando houver uma base legal válida, com opção de cancelamento quando aplicável."
          ]
        },
        {
          title: "5. Bases legais",
          paragraphs: [
            "Conforme o caso, tratamos dados para executar um contrato ou adotar medidas antes da contratação, cumprir obrigação legal ou regulatória, exercer direitos, prevenir fraude e proteger a plataforma, atender interesses legítimos compatíveis com seus direitos ou mediante consentimento.",
            "Informações de saúde ou lesão podem constituir dados pessoais sensíveis. Elas são tratadas somente quando necessárias à avaliação ou execução segura do serviço e com a base legal adequada, incluindo consentimento específico quando exigido. Você pode evitar fornecer informações opcionais, mas isso pode impedir uma avaliação responsável do serviço."
          ]
        },
        {
          title: "6. Compartilhamento e operadores",
          paragraphs: [
            "Compartilhamos apenas os dados necessários com fornecedores que viabilizam o site, o pagamento, o armazenamento e a comunicação. Esses fornecedores tratam dados de acordo com seus contratos e políticas."
          ],
          items: [
            "Vercel, para hospedagem e entrega do site.",
            "Supabase, para banco de dados, autenticação e armazenamento privado de materiais.",
            "Stripe e Mercado Pago, para pagamentos e prevenção a fraude.",
            "Kiwify, quando a compra de um curso for concluída no checkout externo.",
            "Resend e provedores de e-mail, para mensagens de compra, acesso, suporte e notificações.",
            "Prestadores contábeis, fiscais, jurídicos e autoridades públicas, quando necessário ou exigido por lei."
          ]
        },
        {
          title: "7. Transferências internacionais",
          paragraphs: [
            "Alguns fornecedores podem processar ou armazenar dados fora do Brasil. Nessas situações, buscamos utilizar provedores reconhecidos e mecanismos contratuais e de segurança compatíveis com a LGPD e com as normas aplicáveis."
          ]
        },
        {
          title: "8. Cookies e tecnologias essenciais",
          paragraphs: [
            "O site pode usar cookies ou tecnologias equivalentes necessários para sessão, login, segurança, preferência de idioma e funcionamento do checkout. Você pode bloquear cookies no navegador, mas partes essenciais da conta ou da compra podem deixar de funcionar.",
            "Caso tecnologias opcionais de publicidade ou análise sejam adotadas no futuro, esta política e os controles de consentimento serão atualizados quando necessário."
          ]
        },
        {
          title: "9. Prazo de retenção",
          paragraphs: [
            "Mantemos dados pelo período necessário para entregar o produto ou serviço, prestar suporte, cumprir obrigações fiscais, contábeis e legais, prevenir fraude e exercer direitos em processos. Depois disso, os dados são eliminados ou anonimizados, salvo quando a conservação for autorizada ou exigida por lei."
          ]
        },
        {
          title: "10. Segurança",
          paragraphs: [
            "Adotamos controles administrativos e técnicos proporcionais ao serviço, como autenticação, segregação de áreas administrativas, links assinados, armazenamento privado e uso de conexões seguras. Nenhum sistema é absolutamente invulnerável; por isso, também monitoramos falhas e aperfeiçoamos as proteções.",
            "Nunca envie senhas, chaves de API ou dados completos de cartão por e-mail ou WhatsApp."
          ]
        },
        {
          title: "11. Seus direitos",
          paragraphs: [
            "Nos termos da LGPD, você pode solicitar confirmação do tratamento, acesso, correção, anonimização, bloqueio ou eliminação quando cabível, portabilidade conforme regulamentação, informação sobre compartilhamentos, revisão de decisões automatizadas, revogação do consentimento e informação sobre as consequências de não consentir.",
            "Para proteger o titular, podemos pedir informações adicionais para confirmar sua identidade. Algumas solicitações podem ser limitadas quando houver obrigação legal de retenção ou outra hipótese prevista em lei."
          ]
        },
        {
          title: "12. Crianças e adolescentes",
          paragraphs: [
            "Menores de 18 anos devem utilizar os serviços com ciência e acompanhamento do responsável legal. Se identificarmos tratamento inadequado de dados de menor, adotaremos as medidas necessárias para proteger o titular e ajustar ou excluir os dados conforme a lei."
          ]
        },
        {
          title: "13. Atualizações desta política",
          paragraphs: [
            "Podemos atualizar esta política para refletir mudanças legais, técnicas ou operacionais. A versão vigente e sua data de atualização estarão sempre disponíveis nesta página."
          ]
        }
      ]
    },
    refunds: {
      eyebrow: "RumoAoPro | Compras",
      title: "Política de reembolso",
      summary:
        "Veja os prazos, as condições e o caminho para solicitar cancelamento ou reembolso de uma compra.",
      updatedLabel: "Última atualização",
      updatedAt: "17 de julho de 2026",
      sections: [
        {
          title: "1. Direito de arrependimento",
          paragraphs: [
            "Nas compras realizadas pela internet, o consumidor pode exercer o direito de arrependimento no prazo legal de 7 dias corridos, contado da assinatura do contrato ou do recebimento do produto ou serviço, conforme aplicável.",
            "O pedido pode ser feito sem necessidade de justificativa. Quando o direito for aplicável, os valores pagos serão devolvidos integralmente, sem prejuízo de outros direitos previstos na legislação."
          ]
        },
        {
          title: "2. Produtos digitais",
          paragraphs: [
            "O acesso ou download do material não elimina direitos obrigatórios previstos em lei. Se a compra for cancelada ou reembolsada, o acesso ao programa, curso, PDF, vídeo ou área do cliente correspondente poderá ser encerrado.",
            "Depois do prazo legal, solicitações relacionadas a arquivo corrompido, conteúdo não entregue, acesso indevido ou oferta em desacordo serão analisadas e corrigidas conforme a legislação. Resultados físicos ou esportivos variam e, por si só, não caracterizam defeito do produto."
          ]
        },
        {
          title: "3. Assessoria esportiva",
          paragraphs: [
            "Pedidos de cancelamento da assessoria serão analisados conforme a data da solicitação, o início do serviço, o trabalho já realizado e as normas aplicáveis, sem limitar direitos obrigatórios do consumidor.",
            "Quando houver renovação futura prevista, o cancelamento confirmado impedirá novas cobranças após o ciclo aplicável."
          ]
        },
        {
          title: "4. Como solicitar",
          paragraphs: [
            "Envie o pedido para {{email}} ou pelo WhatsApp {{whatsapp}}. Para localizar a compra, informe nome completo, e-mail usado no checkout, número do pedido, produto adquirido e o motivo do contato, se desejar.",
            "A RumoAoPro enviará uma resposta inicial em até 5 dias. Solicitações urgentes de cobrança duplicada ou acesso indevido devem ser identificadas na mensagem."
          ]
        },
        {
          title: "5. Forma e prazo da devolução",
          paragraphs: [
            "Depois da aprovação, o reembolso será solicitado no mesmo meio de pagamento sempre que possível. Stripe, Mercado Pago, Kiwify, bandeiras, bancos e emissores podem aplicar seus próprios prazos operacionais para que o crédito apareça na conta ou fatura.",
            "Em cartão, o valor pode aparecer na fatura atual ou em uma próxima fatura, conforme a data de fechamento e as regras do emissor. Em Pix, a devolução será processada pelos dados e pelo fluxo disponibilizado pelo provedor."
          ]
        },
        {
          title: "6. Compras em plataformas externas",
          paragraphs: [
            "Quando a compra for concluída em checkout externo, como a Kiwify, o pedido também poderá ser iniciado dentro da própria plataforma. Se houver dificuldade, entre em contato com a RumoAoPro para orientação e acompanhamento."
          ]
        },
        {
          title: "7. Chargebacks e fraude",
          paragraphs: [
            "Antes de contestar uma cobrança legítima junto ao banco, fale com a RumoAoPro para que possamos localizar e resolver o pedido. Abertura deliberada de contestação fraudulenta, compartilhamento de acesso ou uso do conteúdo após reembolso pode resultar no bloqueio da conta e nas medidas legais cabíveis."
          ]
        },
        {
          title: "8. Direitos preservados",
          paragraphs: [
            "Esta política complementa os Termos de Uso e não restringe garantias, prazos ou direitos que sejam obrigatórios pelo Código de Defesa do Consumidor ou por outra lei aplicável."
          ]
        }
      ]
    }
  },
  en: {
    terms: {
      eyebrow: "RumoAoPro | Legal",
      title: "Terms of use",
      summary:
        "These rules explain how purchases, access and use of RumoAoPro digital programs, courses and services work.",
      updatedLabel: "Last updated",
      updatedAt: "July 17, 2026",
      sections: [
        {
          title: "1. Acceptance",
          paragraphs: [
            "By accessing this website, creating an account, purchasing a product or hiring a service, you confirm that you have read and accepted these Terms of Use, the Privacy Policy and the Refund Policy.",
            "If you do not agree with these conditions, do not complete a purchase or use the materials."
          ]
        },
        {
          title: "2. Eligibility",
          paragraphs: [
            "You must have legal capacity to enter into a contract. Athletes under 18 must purchase and use the programs with the authorization and supervision of a parent or legal guardian.",
            "The responsible adult must determine whether the content, training load and equipment are appropriate for the athlete's age, level and health condition."
          ]
        },
        {
          title: "3. Products and services",
          paragraphs: [
            "RumoAoPro offers digital training programs, courses and online coaching. The sales page identifies the language, access period, included materials, equipment requirements and price of each offer.",
            "Some products or payments may be operated through third-party platforms such as Kiwify, Stripe and Mercado Pago. Their terms and policies also apply to their services, without limiting mandatory consumer rights."
          ]
        },
        {
          title: "4. Orders, prices and payments",
          items: [
            "Customers must provide truthful, complete and current checkout information.",
            "Prices may be shown in Brazilian reais, US dollars or other currencies. Estimated conversions may vary based on exchange rates and the payment issuer.",
            "Access is released only after the relevant gateway confirms payment.",
            "Taxes, bank fees, currency conversion and card charges may apply depending on the customer's country, bank and payment method.",
            "Promotions and coupons are subject to the validity period, usage limits and conditions shown with the offer."
          ]
        },
        {
          title: "5. Digital delivery and account access",
          paragraphs: [
            "After payment confirmation, access is linked to the email provided at checkout. Instructions are sent by email and materials are available in the customer area.",
            "Access is personal and non-transferable. Customers are responsible for protecting their email account, access links and active sessions and must report unauthorized use promptly.",
            "If access is not released or an email does not arrive, check the spam folder and contact RumoAoPro with the customer's name, email and order number."
          ]
        },
        {
          title: "6. License and intellectual property",
          paragraphs: [
            "A purchase grants a limited, personal, non-exclusive and non-transferable license to use the content under the purchased offer. Ownership remains with RumoAoPro or its licensors."
          ],
          items: [
            "Do not share access, PDFs, videos, spreadsheets, links or credentials.",
            "Do not copy, resell, sublicense, publish, distribute, adapt or commercially exploit the materials without written permission.",
            "An individual purchase licenses use by one athlete or user unless the offer expressly states otherwise."
          ]
        },
        {
          title: "7. Health, safety and results",
          paragraphs: [
            "The content is educational and focused on physical preparation. It does not replace medical assessment, diagnosis, treatment, physiotherapy, nutrition or in-person care from a qualified health professional.",
            "Before beginning training, especially after pain, injury, surgery, a medical condition, medication use or a long period of inactivity, seek clearance from a qualified professional. Stop activity and seek care if abnormal symptoms occur.",
            "Results depend on individual factors such as history, level, routine, recovery, nutrition and consistency. RumoAoPro does not guarantee a sporting outcome, a club contract, freedom from injury or a specific timeline for improvement."
          ]
        },
        {
          title: "8. Online coaching",
          paragraphs: [
            "Coaching plans depend on the information, availability, calendar, equipment and feedback provided by the athlete. Customers must communicate relevant schedule changes, pain, injuries and limitations.",
            "Online coaching is a physical preparation and sports guidance service. It is not medical care and does not replace professionals responsible for diagnosis or treatment."
          ]
        },
        {
          title: "9. Cancellations and refunds",
          paragraphs: [
            "Cancellation and refund requests are handled under the Refund Policy and applicable consumer law. Nothing in these terms limits mandatory consumer rights.",
            "When a refund is approved, access to the corresponding product or service may be terminated."
          ]
        },
        {
          title: "10. Acceptable use",
          items: [
            "Do not attempt to access another person's account, private files, administration areas or data.",
            "Do not use automation, reverse engineering, malware or any method that may compromise the website.",
            "Do not use the platform for fraud, illegitimate chargebacks or infringement of third-party rights."
          ]
        },
        {
          title: "11. Availability and liability",
          paragraphs: [
            "RumoAoPro takes reasonable steps to keep the website and materials available, but internet, hosting, email and payment services may experience temporary downtime. Where possible, material failures will be corrected and legitimate access restored.",
            "RumoAoPro's liability will be determined under applicable law. Nothing in these terms excludes liability that cannot lawfully be limited."
          ]
        },
        {
          title: "12. Changes",
          paragraphs: [
            "These terms may be updated to reflect changes in the service, technology or law. The current version will be posted here with its update date. Material changes will not retroactively reduce acquired rights."
          ]
        },
        {
          title: "13. Governing law and contact",
          paragraphs: [
            "Brazilian law governs these terms, while any mandatory consumer protection rules applicable in the customer's location remain respected. Disputes will be submitted to the court or forum determined by applicable consumer law.",
            "Questions may be sent to {{email}} or WhatsApp {{whatsapp}}."
          ]
        }
      ]
    },
    privacy: {
      eyebrow: "RumoAoPro | Privacy",
      title: "Privacy policy",
      summary:
        "This policy explains what personal data we collect, why we use it and how you can exercise your rights.",
      updatedLabel: "Last updated",
      updatedAt: "July 17, 2026",
      sections: [
        {
          title: "1. Controller and contact",
          paragraphs: [
            "RumoAoPro determines how personal data collected directly through this website and its support channels is processed.",
            "For privacy questions, requests or rights, email {{email}} or contact us on WhatsApp at {{whatsapp}}."
          ]
        },
        {
          title: "2. Data we may collect",
          items: [
            "Identity and contact data: name, email, phone, WhatsApp, country, Brazilian CPF or another document when required.",
            "Address and tax data: postal code, street, number, additional address details, city, state and country.",
            "Order and payment data: product, amount, currency, discount, status, order identifier and gateway references. RumoAoPro does not store full card numbers.",
            "Account and access data: authentication tokens, product access history and security records.",
            "Coaching and application data: goals, routine, calendar, equipment, sporting background and information about pain, injuries or limitations that you choose to provide.",
            "Technical data: IP address, browser, device, pages accessed, date and time, essential cookies and error or fraud-prevention logs.",
            "Communications: messages, support requests, form responses and preferences you provide."
          ]
        },
        {
          title: "3. How we collect data",
          paragraphs: [
            "We collect data when you complete forms, purchase, request access, use the customer area, contact us or apply for coaching. We also receive payment confirmations and identifiers from payment and technical providers used to complete the transaction."
          ]
        },
        {
          title: "4. Why we use data",
          items: [
            "Process payments, confirm orders and release purchased products.",
            "Create and protect accounts, authenticate access and recover credentials.",
            "Deliver materials, send transactional messages and provide support.",
            "Review applications and personalize online coaching when contracted.",
            "Issue tax documents, retain accounting records and comply with legal obligations.",
            "Prevent fraud, abuse, illegitimate chargebacks and security incidents.",
            "Improve website operation, navigation and reliability.",
            "Send marketing messages only when there is a valid legal basis and an opt-out where required."
          ]
        },
        {
          title: "5. Legal bases",
          paragraphs: [
            "Depending on the context, we process data to perform a contract or take pre-contractual steps, comply with law, exercise legal rights, prevent fraud and protect the platform, pursue legitimate interests compatible with your rights, or with consent.",
            "Health or injury information may be sensitive personal data. It is processed only when necessary to assess or safely deliver a service and under an appropriate legal basis, including specific consent where required. You may decline optional information, but this may prevent a responsible assessment of the service."
          ]
        },
        {
          title: "6. Sharing and processors",
          paragraphs: [
            "We share only the data required with providers that operate the website, payments, storage and communications. Providers process data under their contracts and policies."
          ],
          items: [
            "Vercel, for website hosting and delivery.",
            "Supabase, for databases, authentication and private material storage.",
            "Stripe and Mercado Pago, for payments and fraud prevention.",
            "Kiwify, when a course purchase is completed through its external checkout.",
            "Resend and email providers, for purchase, access, support and notification messages.",
            "Accounting, tax, legal advisers and public authorities when required or permitted by law."
          ]
        },
        {
          title: "7. International transfers",
          paragraphs: [
            "Some providers may process or store data outside Brazil. In those situations, we seek established providers and contractual and security safeguards compatible with the Brazilian LGPD and other applicable rules."
          ]
        },
        {
          title: "8. Cookies and essential technologies",
          paragraphs: [
            "The website may use cookies or similar technologies required for sessions, login, security, language preferences and checkout operation. Blocking cookies may prevent important account or purchase features from working.",
            "If optional advertising or analytics technologies are adopted in the future, this policy and consent controls will be updated where required."
          ]
        },
        {
          title: "9. Retention",
          paragraphs: [
            "We retain data as needed to deliver products and services, support customers, comply with tax, accounting and legal obligations, prevent fraud and exercise legal rights. Data is then deleted or anonymized unless retention remains required or permitted by law."
          ]
        },
        {
          title: "10. Security",
          paragraphs: [
            "We use administrative and technical controls proportionate to the service, including authentication, restricted administration areas, signed links, private storage and secure connections. No system is entirely invulnerable, so we also monitor failures and improve protections.",
            "Never send passwords, API keys or full card details by email or WhatsApp."
          ]
        },
        {
          title: "11. Your rights",
          paragraphs: [
            "Depending on applicable law, you may request confirmation, access, correction, deletion, anonymization or restriction, information about sharing, portability, review of automated decisions, withdrawal of consent and information about the consequences of withholding consent.",
            "We may request additional information to verify identity. Requests may be limited where retention is legally required or another lawful exception applies. Brazilian data subjects may also exercise the rights provided by the LGPD."
          ]
        },
        {
          title: "12. Children and teenagers",
          paragraphs: [
            "Users under 18 must use the services with the knowledge and supervision of a parent or legal guardian. If we identify improper processing of a minor's data, we will take steps to protect the individual and adjust or delete the data as required by law."
          ]
        },
        {
          title: "13. Updates",
          paragraphs: [
            "We may update this policy to reflect legal, technical or operational changes. The current version and update date will remain available on this page."
          ]
        }
      ]
    },
    refunds: {
      eyebrow: "RumoAoPro | Purchases",
      title: "Refund policy",
      summary:
        "Review the timeframes, conditions and steps to request a cancellation or refund.",
      updatedLabel: "Last updated",
      updatedAt: "July 17, 2026",
      sections: [
        {
          title: "1. Cooling-off rights",
          paragraphs: [
            "For online purchases protected by Brazilian consumer law, consumers may exercise the statutory cooling-off right within 7 calendar days from the contract or receipt of the product or service, as applicable.",
            "No reason is required. Where the right applies, amounts paid will be fully refunded, without limiting any additional rights under applicable law. Customers in other locations may have additional mandatory rights."
          ]
        },
        {
          title: "2. Digital products",
          paragraphs: [
            "Accessing or downloading content does not remove mandatory rights granted by applicable law. If an order is cancelled or refunded, access to the relevant program, course, PDF, video or customer area may be terminated.",
            "After a statutory period, requests involving corrupted files, non-delivery, unauthorized access or content that materially differs from the offer will be reviewed and remedied under applicable law. Physical and sporting results vary and do not, by themselves, indicate a defective product."
          ]
        },
        {
          title: "3. Online coaching",
          paragraphs: [
            "Coaching cancellation requests will be reviewed based on the request date, service start, work already performed and applicable law, without limiting mandatory consumer rights.",
            "If future renewals apply, confirmed cancellation will stop charges after the relevant billing cycle."
          ]
        },
        {
          title: "4. How to request",
          paragraphs: [
            "Email {{email}} or contact WhatsApp {{whatsapp}}. To locate the order, include the full name, checkout email, order number, purchased product and, if you wish, the reason for the request.",
            "RumoAoPro will provide an initial response within 5 days. Urgent duplicate-charge or unauthorized-access requests should be identified in the message."
          ]
        },
        {
          title: "5. Refund method and processing time",
          paragraphs: [
            "After approval, the refund will be requested through the original payment method whenever possible. Stripe, Mercado Pago, Kiwify, card networks, banks and issuers may apply their own processing times before funds appear in an account or statement.",
            "Card refunds may appear on the current or a later statement depending on the closing date and issuer rules. Pix refunds are processed through the data and flow made available by the payment provider."
          ]
        },
        {
          title: "6. External platforms",
          paragraphs: [
            "When a purchase is completed through an external checkout such as Kiwify, the request may also be initiated on that platform. Contact RumoAoPro if you need guidance or help tracking the request."
          ]
        },
        {
          title: "7. Chargebacks and fraud",
          paragraphs: [
            "Before disputing a legitimate charge with a bank, contact RumoAoPro so we can locate and resolve the order. Deliberately fraudulent disputes, account sharing or continued use after a refund may result in account suspension and appropriate legal action."
          ]
        },
        {
          title: "8. Mandatory rights preserved",
          paragraphs: [
            "This policy complements the Terms of Use and does not restrict any guarantee, deadline or right that is mandatory under applicable consumer law."
          ]
        }
      ]
    }
  }
};
