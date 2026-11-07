# A Sereia Esposa-Troféu 🧜‍♀️

Painel pessoal para acompanhar o desafio de The Sims 4 **A Sereia Esposa-Troféu**.

## Como abrir

- **Mais simples:** dê dois cliques em `index.html` (abre no navegador, sem instalar nada).
- **Ou com servidor local:** `npx http-server -p 5173` na pasta e acesse http://localhost:5173

> O progresso fica salvo no navegador (LocalStorage) **por endereço**: o que você marcar abrindo
> pelo arquivo não aparece em `localhost` e vice-versa. Escolha um jeito e use sempre ele —
> ou use **Exportar / Importar** no menu para levar o progresso de um lugar para outro.

## Deploy (Vercel)

**No ar:** https://desafios-thesims.vercel.app

Site estático: sem build, sem dependências. O Vercel serve os arquivos como estão
(`vercel.json` só define cache e cabeçalhos). Cada `git push` na branch `main` publica de novo.

> No site publicado, o progresso fica salvo no navegador **daquele endereço** (ex.: `*.vercel.app`).
> Para levar o que você já marcou localmente, use **Exportar** aqui e **Importar** lá.

## Estrutura

| Arquivo | O que tem |
| --- | --- |
| `js/data.js` | **Conteúdo do desafio**: fases, objetivos, dicas, regras e campos do patrimônio. Edite aqui. |
| `js/storage.js` | Camada de persistência (LocalStorage). Trocar por API/banco no futuro só mexe aqui. |
| `js/app.js` | Telas, checklists, progresso, patrimônio, diário, toasts e celebrações. |
| `js/icons.js` | Ícones marítimos em SVG. |
| `css/styles.css` | Visual (cores no topo, em `:root`). |
| `assets/` | Arte oficial (`arte-oficial.jpg`) e recortes dela: retrato da sereia e foto de cada fase. Os caminhos ficam em `js/data.js`. |

### Editando objetivos sem perder progresso
Cada objetivo tem um `id` (ex.: `f2-o3`). O progresso é salvo pelo id — pode mudar o texto à vontade;
só não troque o id de algo que já está marcado.
