---
name: mock-endpoint
description: Adiciona endpoints ao backend simulado de desenvolvimento (`src/mocks`) para que telas novas funcionem com `npm start` sem servidor real — CRUD em memória, autenticação por token, latência e cenários de erro (401, 404, 422 por campo, 500). Use quando o usuário pedir para mockar, simular ou "fazer funcionar sem backend" um endpoint, ou ao criar uma feature que consome uma API ainda inexistente.
---

# Endpoint no backend simulado

O mock é um `HttpInterceptorFn` (`src/mocks/mock-backend.interceptor.ts`) que só entra no build `development`
(`fileReplacements` troca `mock-interceptors.ts` por `mock-interceptors.development.ts`) e só responde a URLs que
começam com `api.baseUrl`. Leia o arquivo inteiro antes de editar; os helpers `ok()` e `fail()` e o roteamento
de `/estoque/itens` são o modelo.

## Regras

- `src/mocks` pode importar **tipos** das features (`import type { ... } from '@features/...'`), mas o código da
  aplicação nunca importa `mocks/` (exceto `app.config.ts`; o ESLint verifica).
- Dados iniciais vão em `src/mocks/mock-data.ts` como `readonly X[]`; no interceptor, o "banco" é uma variável
  de módulo iniciada com `structuredClone([...MOCK_X])` e reiniciada a cada recarga da página.
- Respostas sempre por `ok(body, status)` (já clona o corpo) e erros por `fail(req, status, error?)`.
- Mantenha a latência (`timer(LATENCY_MS)`), que já é aplicada a todas as rotas: ela deixa os estados de
  "carregando" visíveis.
- O mock deve ter o mesmo contrato da API real (URLs, métodos, status, formato de erro). Se o contrato real for
  conhecido, siga-o; se não for, siga o padrão REST do `/estoque/itens` e diga ao usuário que é uma suposição.

## Passos

1. **Dados** em `mock-data.ts`: 3 a 5 registros realistas em pt-BR, com casos que exercitem a tela (campo opcional
   vazio, valor no limite de alguma regra, nome longo). Datas ISO em `updatedAt`.
2. **Roteamento** em `route()`: adicione um bloco `if (path.startsWith('/<recurso>'))` antes do `fail(req, 404)`
   final. Endpoints protegidos conferem `Authorization: Bearer ${MOCK_TOKEN}` e respondem 401 sem ele.
3. **Coleção** (`GET` com filtro `q`, `POST`) e **item** (`GET`, `PUT`, `DELETE` por id), em funções separadas
   como `collectionRoute`/`itemRoute`. Método não suportado → 405. Id inexistente → 404.
4. **Cenários de erro** que as telas precisam demonstrar:
   - **422 por campo**, no formato `{ errors: { <campo>: '<chave.i18n>' } }`, para uma regra de unicidade ou de
     negócio (ex.: código já cadastrado). A chave precisa existir em `src/i18n/{pt-BR,en}/<feature>.json` — o
     formulário mostra a mensagem no próprio campo;
   - **500** quando a busca for `erro500`, para mostrar o tratamento de erro do servidor. Se a tela tiver hint
     de busca, cite isso nele como em `estoque.list.searchHint`.
5. Se o endpoint estiver fora de `/estoque`, o nome do helper de conflito deve dizer o que verifica (como
   `skuTaken`), e o id gerado no `POST` segue `String(Date.now())`.

## Verificação

```bash
npm run lint
npm run build
```

O `npm run build` (produção) precisa continuar sem nada do mock: confirme que `MOCK_CREDENTIALS` e
`MOCK_TOKEN` não aparecem em `dist/`:

```bash
grep -r "token-de-demonstracao" dist/ || echo "ok: mock fora do bundle"
```

Depois suba o preview (`sugestao-front` em `.claude/launch.json`), faça login com as credenciais de teste do
README e exercite a tela: listagem, busca, `erro500`, cadastro com conflito (422), item inexistente na URL (404).
