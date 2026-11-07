/*
 * ============================================================
 *  CONTEÚDO DO DESAFIO — edite aqui objetivos, regras e textos
 *  (sincronizado com a arte oficial em assets/arte-oficial.jpg)
 * ============================================================
 *
 *  Dicas para editar sem perder o progresso salvo:
 *  - Cada objetivo tem um "id" único. O progresso fica salvo pelo id,
 *    então você pode mudar o texto ("text") à vontade.
 *  - Se trocar o id de um objetivo, a marcação dele será perdida.
 *  - Para adicionar um objetivo, crie um novo id (ex.: "f2-o9").
 *  - Para remover, basta apagar a linha. O progresso dos demais continua.
 *  - A ordem das linhas é a ordem em que aparecem no site.
 */

window.CHALLENGE = {
  title: "A Sereia Esposa-Troféu",
  subtitle: "Do fundo do oceano ao topo da sociedade.",
  // Imagens (pasta assets/). A arte oficial completa abre em tela cheia.
  officialArt: "assets/arte-oficial.jpg",
  heroImage: "assets/sereia.jpg",
  intro:
    "De uma vida simples no mar a um casamento de luxo: conquiste status, amor e um futuro extraordinário. " +
    "Ela chegou à praia com a cauda ainda brilhando e § 1.000 no bolso. O caminho dela passa pelo charme, " +
    "pelas conexões certas e por um casamento que vai levá-la do bangalô simples até a mansão com piscina — " +
    "sem nunca esquecer de onde veio, e sem depender de ninguém para ter o próprio tesouro.",

  phases: [
    {
      id: "fase-1",
      number: 1,
      title: "A Sereia Recém-Chegada",
      tagline: "Início do desafio",
      icon: "shell",
      color: "#3fd0c9",
      image: "assets/fase-1.jpg",
      goal: "Sobreviver e construir uma identidade na sociedade humana.",
      story:
        "Uma jovem sereia chega ao mundo dos Sims com poucos recursos e precisa construir sua própria identidade.",
      objectives: [
        { id: "f1-o1", text: "Começar como jovem adulta" },
        { id: "f1-o2", text: "Ser uma sereia" },
        { id: "f1-o3", text: "Ter § 1.000 e morar em um lote simples (preferencialmente em Sulani)" },
        { id: "f1-o6", text: "Não ter emprego tradicional inicialmente" },
        { id: "f1-o7", text: "Ganhar dinheiro com pesca, jardinagem, coleta e venda de itens" },
        { id: "f1-o8", text: "Desenvolver habilidades sociais e de carisma" }
      ],
      tips: [
        "Sulani (Vida Ilhéu) é o lar natural das sereias — o mar fica a poucos passos.",
        "Treinar discursos no espelho é um jeito barato de subir Carisma logo no início.",
        "Venda peixes e coletáveis pelo celular/computador para manter o caixa girando."
      ]
    },
    {
      id: "fase-2",
      number: 2,
      title: "A Construção da Imagem",
      tagline: "Beleza, festas e contatos",
      icon: "pearl",
      color: "#9b8cff",
      image: "assets/fase-2.jpg",
      goal: "Encontrar um parceiro compatível com o estilo de vida desejado.",
      story:
        "A sereia começa a frequentar ambientes sociais, conhecer pessoas influentes e construir sua reputação.",
      objectives: [
        { id: "f2-o6", text: "Investir em autocuidado e beleza" },
        { id: "f2-o1", text: "Conhecer pelo menos 5 Sims novos" },
        { id: "f2-o2", text: "Frequentar festas, bares, lounges e eventos sociais" },
        { id: "f2-o3", text: "Desenvolver Carisma até o nível 5" },
        { id: "f2-o4", text: "Ter pelo menos uma habilidade complementar no nível 5" },
        { id: "f2-o5", text: "Começar a namorar um Sim com boa situação financeira" }
      ],
      tips: [
        "Habilidades que combinam com a personagem: Culinária, Mixologia, Pintura, Dança ou Bem-estar.",
        "Use o painel de relacionamentos para checar a casa e o emprego dos pretendentes.",
        "Registre no Diário quem são os candidatos — e por que cada um chamou atenção."
      ]
    },
    {
      id: "fase-3",
      number: 3,
      title: "A Esposa-Troféu",
      tagline: "Bem-vinda à alta sociedade",
      icon: "ring",
      color: "#f2c46d",
      image: "assets/fase-3.jpg",
      goal: "Consolidar o casamento e viver o estilo de vida de esposa-troféu.",
      story:
        "A sereia conquista seu espaço na alta sociedade e passa a desfrutar de uma vida confortável.",
      objectives: [
        { id: "f3-o2", text: "Casar com um Sim financeiramente estável" },
        { id: "f3-o8", text: "O casamento deve acontecer por relacionamento" },
        { id: "f3-o3", text: "Pode receber presentes e benefícios do cônjuge" },
        { id: "f3-o4", text: "Pode abandonar qualquer atividade remunerada depois do casamento" },
        { id: "f3-o5", text: "Construir uma imagem social elegante e influente" },
        { id: "f3-o1", text: "Manter o relacionamento com o cônjuge em níveis elevados" }
      ],
      tips: [
        "Ao casar, anote no Patrimônio quanto entrou na família — esse valor é conjugal, não seu.",
        "Use o histórico do Patrimônio para registrar o antes e o depois do casamento.",
        "Uma boa festa de casamento também conta como evento social!"
      ]
    },
    {
      id: "fase-4",
      number: 4,
      title: "O Legado da Sereia",
      tagline: "Identidade, tesouro e família",
      icon: "crown",
      color: "#ff8fb8",
      image: "assets/fase-4.jpg",
      goal: "Construir um legado de luxo, família e status, sem abrir mão de quem você é.",
      story:
        "A sereia consolida sua nova vida, preservando sua identidade e construindo um legado.",
      objectives: [
        { id: "f4-o1", text: "Ter uma casa de luxo (com piscina)" },
        { id: "f4-o5", text: "Ter pelo menos um filho (se fizer parte da história)", optional: true },
        { id: "f4-o3", text: "Preservar sua identidade de sereia" },
        { id: "f4-o4", text: "Ter uma reserva financeira própria" },
        { id: "f4-o7", text: "Concluir a aspiração Esposa-Troféu" },
        { id: "f4-o6", text: "Manter um casamento estável até o encerramento do desafio" }
      ],
      tips: [
        "Defina uma meta de reserva própria no Patrimônio e acompanhe a barra até 100%.",
        "Uma piscina é o melhor lugar para a cauda brilhar em casa.",
        "O filho é opcional: se não fizer parte da história, marque o objetivo quando decidir isso."
      ]
    }
  ],

  // As 6 primeiras vêm da arte oficial; as demais completam o regulamento.
  rules: [
    { icon: "coins", text: "Começar com § 1.000." },
    { icon: "tail", text: "Ser uma sereia (desde o CAS ou transformar durante o jogo)." },
    { icon: "ban", text: "Sem cheats financeiros — nem para obter dinheiro, nem para avançar no desafio." },
    { icon: "gift", text: "Presentes e herança são permitidos." },
    { icon: "briefcase", text: "Emprego opcional (após o casamento)." },
    { icon: "heart", text: "O casamento deve acontecer por relacionamento, sem edição de família." },
    { icon: "ban", text: "Não utilizar mods que concedam vantagens financeiras." },
    { icon: "play", text: "Todas as conquistas devem acontecer durante a jogatina." },
    { icon: "chest", text: "O dinheiro recebido pelo casamento deve ser contabilizado separadamente." },
    { icon: "puzzle", text: "Os objetivos devem respeitar as mecânicas disponíveis no jogo e nas expansões instaladas." },
    { icon: "steps", text: "A progressão deve acontecer na ordem das quatro fases." }
  ],

  /*
   * Critérios para concluir o desafio (da arte oficial).
   * São calculados automaticamente:
   *  - "objectives": cumprido quando todos esses objetivos estiverem marcados;
   *  - "wealth": cumprido quando o patrimônio (familiar ou próprio + cônjuge) atingir o valor.
   */
  criteria: [
    { id: "c-sereia", text: "Sereia criada e jogável", objectives: ["f1-o1", "f1-o2"] },
    { id: "c-patrimonio", text: "§ 50.000 em patrimônio (conjugal ou individual)", wealth: 50000 },
    { id: "c-casamento", text: "Casamento com um Sim financeiramente estável", objectives: ["f3-o2"] },
    { id: "c-aspiracao", text: "Aspiração Esposa-Troféu concluída", objectives: ["f4-o7"] },
    { id: "c-casa", text: "Casa de luxo construída ou adquirida", objectives: ["f4-o1"] },
    { id: "c-filho", text: "Pelo menos um filho (opcional, conforme sua história)", objectives: ["f4-o5"], optional: true },
    { id: "c-identidade", text: "Sereia mantendo sua identidade", objectives: ["f4-o3"] }
  ],

  // Campos do painel financeiro (Patrimônio da Sereia)
  financeFields: [
    { id: "familia", label: "Dinheiro atual da família", hint: "O saldo que aparece no jogo", icon: "coins" },
    { id: "sereia", label: "Patrimônio individual da sereia", hint: "Tudo que é só dela", icon: "pearl" },
    { id: "conjuge", label: "Patrimônio do cônjuge", hint: "Inclui o que veio do casamento", icon: "ring" },
    { id: "residencia", label: "Valor da residência", hint: "Valor do lote mobiliado", icon: "home" },
    { id: "bens", label: "Valor dos bens adquiridos", hint: "Joias, carros, objetos de luxo…", icon: "gem" },
    { id: "reserva", label: "Reserva financeira própria", hint: "O tesouro guardado da sereia", icon: "chest" }
  ],

  defaultReserveGoal: 50000
};
