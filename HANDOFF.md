# Handoff — A Sereia Esposa-Troféu

Painel pessoal para acompanhar o desafio de The Sims 4 **A Sereia Esposa-Troféu**: checklists das quatro fases,
progresso, regras, patrimônio e diário da jogatina.

| | |
| --- | --- |
| **Repositório** | https://github.com/aneroliveira/desafios-thesims (branch `main`) |
| **Deploy** | Vercel, via integração com o GitHub (importação do projeto pendente — ver “Próximos passos”) |
| **Stack** | HTML + CSS + JavaScript puro, sem build e sem dependências |
| **Persistência** | LocalStorage do navegador (chave `sereia-esposa-trofeu:v1`) |
| **Rodar local** | Dois cliques em `index.html` **ou** `npx http-server -p 5173` |

---

## Histórico por data

### 07/11/2026 — Versão inicial do painel

**Desenvolvimento**
- Estrutura do projeto criada do zero (pasta vazia):
  - `index.html` — esqueleto da página, menu lateral, áreas de toast/modal e a ilustração SVG da sereia (usada como reserva).
  - `css/styles.css` — identidade visual oceânica (turquesa, azul profundo, verde-água, lilás e dourado), cards com transparência, fundo com raios de luz e bolhas animadas, responsivo para desktop, tablet e celular.
  - `js/data.js` — **todo o conteúdo do desafio** (fases, objetivos, dicas, regras, campos financeiros).
  - `js/storage.js` — camada única de leitura/gravação no LocalStorage.
  - `js/icons.js` — ícones marítimos em SVG (concha, pérola, cauda, coroa, baú etc.).
  - `js/app.js` — telas, roteamento por hash, checklists, progresso, patrimônio, diário, toasts e celebrações.
- Telas: **Início**, **Fases 1 a 4**, **Regras gerais**, **Patrimônio da Sereia**, **Diário da Sereia**.
- Funcionalidades:
  - Checkbox por objetivo, com a **data de conclusão** gravada e exibida.
  - Progresso por fase e geral atualizado na hora (barras e anéis animados), também no menu lateral e na barra do celular.
  - Bloqueio visual das fases seguintes; selo de fase concluída; celebração com chuva de pérolas ao concluir uma fase e uma comemoração final ao concluir o desafio.
  - Toasts a cada objetivo, com botão **Desfazer**.
  - Botão **Desmarcar todos** por fase (com confirmação e desfazer).
  - **Reiniciar desafio** com confirmação e escolha do que apagar (objetivos, patrimônio, diário, nome).
  - **Exportar/Importar backup** em JSON.
  - Sincronização entre abas abertas ao mesmo tempo.
  - Campo para o **nome da Sim** na página inicial.
- Patrimônio: 6 campos em §, indicadores (família, próprio da sereia, cônjuge), barra próprio × conjugal, meta da reserva, composição, **histórico** com gráfico de evolução e variação desde o último registro.
- Diário: criar, editar e excluir registros; filtro por fase; botão **“+ objetivos concluídos”** que preenche as conquistas com o que foi marcado desde o último registro.
- Testado no navegador em 1366×860 e 375×812 (celular): marcação, conclusão e desbloqueio de fase, persistência após recarregar, patrimônio, diário, reinício e ausência de rolagem horizontal.

**Alterações — arte oficial**
- A arte oficial (PNG na raiz do projeto) foi incorporada:
  - `assets/arte-oficial.jpg` — versão otimizada (~420 KB) do pôster, que abre em tela cheia (Início e Regras).
  - `assets/sereia.jpg` — retrato recortado, usado no topo da página inicial em moldura de arco.
  - `assets/fase-1.jpg` … `fase-4.jpg` — foto de cada fase, usada nos cards da jornada (em tons de cinza quando bloqueada) e no cabeçalho de cada fase.
  - Se uma imagem não carregar, o site volta para a ilustração em SVG.
- Correção: janelas abertas (ex.: arte em tela cheia) continuavam na tela ao trocar de página; agora fecham.

**Alterações — sincronização com a arte oficial**
- Fases, objetivos e regras passaram a seguir o texto da arte (ver “Regras de negócio”).
- Novo card **“Objetivo da fase”** em cada fase.
- Novo painel **“Critérios para concluir o desafio”** (Início e Regras), calculado automaticamente.

**Deploy**
- `vercel.json` (só cache e cabeçalhos; sem build), `.gitignore`, seção de deploy no README.
- Repositório Git criado na branch `main` e enviado para o GitHub (`aneroliveira/desafios-thesims`), seguindo o padrão dos outros projetos (pokestudio, agendador_reunioes).
- O PNG original em alta (2,4 MB) ficou **fora do repositório** — o site usa a versão otimizada.

---

## Regras de negócio e decisões

### Progressão
- As fases são liberadas **em ordem**: uma fase só aceita marcações quando a anterior está 100% concluída.
- Fases bloqueadas continuam **legíveis** (história, objetivo da fase, dicas, regras); só os checkboxes ficam desativados.
- Se um objetivo de uma fase já concluída for desmarcado, as fases seguintes **voltam a ser bloqueadas**, mas **as marcações delas são mantidas** (o usuário é avisado por toast).
- **Fase atual** = primeira fase que ainda não está 100%. Com tudo concluído, o painel mostra “Lenda”.
- Objetivos **opcionais** (ex.: filho) precisam ser marcados para fechar a fase — marca-se quando a decisão estiver resolvida. Eles aparecem com a etiqueta “opcional”.

### Objetivos (fonte: arte oficial) — 24 no total, 6 por fase
- **Fase 1 — A Sereia Recém-Chegada.** Itens que no briefing eram separados foram unidos como na arte: “Ter § 1.000 e morar em um lote simples (preferencialmente em Sulani)”.
- **Fase 2 — A Construção da Imagem.** Entrou “Investir em autocuidado e beleza”.
- **Fase 3 — A Esposa-Troféu.** Entrou “O casamento deve acontecer por relacionamento”. **Saíram**, por não estarem na arte:
  - “Conquistar uma residência de luxo” — já coberto na Fase 4.
  - “Registrar separadamente o patrimônio próprio e o conjugal” — continua valendo como **regra** e é feito no painel de Patrimônio.
- **Fase 4 — O Legado da Sereia.** “Casa de luxo” e “piscina” viraram um item só: “Ter uma casa de luxo (com piscina)”.

### Regras gerais — 11
- As 6 primeiras vêm da arte: começar com § 1.000; ser sereia (desde o CAS ou transformar no jogo); sem cheats financeiros; presentes e herança permitidos; emprego opcional após o casamento; casamento por relacionamento, sem edição de família.
- As demais vêm do briefing e foram mantidas por não contradizerem a arte: sem mods de vantagem financeira; conquistas só durante a jogatina; dinheiro do casamento contabilizado à parte; respeitar as expansões instaladas; seguir a ordem das fases.

### Critérios de conclusão (fonte: arte oficial)
- São **calculados**, não marcados à mão:
  - A maioria depende de objetivos — ex.: “Sereia criada e jogável” = “Começar como jovem adulta” + “Ser uma sereia”.
  - “§ 50.000 em patrimônio (conjugal ou individual)” usa o **maior** valor entre o patrimônio da família e (patrimônio próprio da sereia + patrimônio do cônjuge).
  - “Pelo menos um filho” é opcional.
- A comemoração final continua sendo disparada pela conclusão da Fase 4.

### Patrimônio
- **Patrimônio da família** = dinheiro atual + valor da residência + valor dos bens.
- **Patrimônio próprio da sereia** = patrimônio individual + reserva própria (o campo individual **não** deve incluir a reserva).
- **Patrimônio do cônjuge** é contabilizado à parte — inclui o que entrou com o casamento.
- Meta da reserva própria padrão: **§ 50.000** (editável; alinhada ao critério da arte).
- Histórico: **um registro por dia** (registrar de novo no mesmo dia atualiza o registro). A variação compara com o último registro de um dia anterior.

### Dados
- Progresso salvo pelo **id** do objetivo (ex.: `f2-o3`), não pelo texto — o texto pode mudar à vontade. Os ids antigos foram mantidos quando o sentido do objetivo era o mesmo.
- O LocalStorage é **por endereço**: arquivo local, `localhost` e `*.vercel.app` têm progressos separados. Para migrar, usar Exportar/Importar.

---

## Arquitetura

```
index.html          esqueleto + template SVG da sereia (reserva)
css/styles.css      tema, componentes e responsivo (cores em :root)
js/data.js          CONTEÚDO: fases, objetivos, dicas, regras, critérios, campos financeiros, imagens
js/storage.js       Store.load / Store.save / Store.normalize — única camada de persistência
js/icons.js         icon(nome) → SVG
js/app.js           roteamento (#inicio, #fase-1…4, #regras, #patrimonio, #diario), telas e eventos
assets/             arte oficial otimizada e recortes
vercel.json         cache e cabeçalhos para o deploy estático
```

Formato salvo (`sereia-esposa-trofeu:v1`):

```js
{
  version: 1,
  profile: { name },
  checked: { [objetivoId]: dataISO },
  completedPhases: { [faseId]: dataISO },
  finance: { familia, sereia, conjuge, residencia, bens, reserva },
  reserveGoal: 50000,
  financeHistory: [{ id, date, values }],
  diary: [{ id, date, phase, events, achievements, difficulties, notes, createdAt, updatedAt }]
}
```

---

## Próximos passos

- [ ] Importar o repositório no Vercel (vercel.com/new → `desafios-thesims` → Framework Preset **Other**, sem build) e conferir o site publicado.
- [ ] Migrar o progresso local para o site publicado com Exportar/Importar, se já houver marcações.
- [ ] Futuro (previsto no briefing): login e banco de dados — a troca fica concentrada em `js/storage.js`.
