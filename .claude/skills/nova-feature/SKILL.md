---
name: nova-feature
description: Cria uma feature (domínio) completa neste projeto Angular seguindo o modelo de `features/estoque` — rotas lazy, data-access (models + service HTTP), páginas de listagem, detalhe e cadastro/edição, catálogos i18n pt-BR e en, rota em app.routes, item de menu, backend simulado e testes Vitest. Use sempre que o usuário pedir para criar uma feature, módulo, domínio, CRUD, tela de cadastro/listagem ou "um novo estoque" para alguma entidade (ex.: "crie a feature fornecedores", "preciso de um CRUD de unidades"), mesmo que não use a palavra "feature".
---

# Nova feature

A feature `src/app/features/estoque/` é a **referência canônica**. Antes de escrever qualquer arquivo, leia os
equivalentes dela e copie a estrutura, os nomes e o estilo — não invente padrões novos:

| Gerar                          | Referência em `estoque`                                     |
| ------------------------------ | ----------------------------------------------------------- |
| `<feature>.routes.ts`          | `estoque.routes.ts`                                         |
| `data-access/<x>.models.ts`    | `data-access/inventory.models.ts`                           |
| `data-access/<x>.service.ts`   | `data-access/inventory.service.ts` (+ `.spec.ts`)           |
| `pages/<x>-list/`              | `pages/inventory-list/` (`.ts`, `.html`, `.spec.ts`)        |
| `pages/<x>-detail/`            | `pages/item-detail/`                                        |
| `pages/<x>-edit/`              | `pages/item-edit/`                                          |
| `src/i18n/{pt-BR,en}/<f>.json` | `src/i18n/pt-BR/estoque.json` e `src/i18n/en/estoque.json`  |

## 1. Levante os dados

Pergunte ao usuário só o que não puder deduzir do pedido:

- **Nome da feature** (pasta e URL, em português, kebab-case): `fornecedores`.
- **Entidade** (código em inglês, como em `estoque` → `InventoryItem`/`InventoryService`): `Supplier`.
- **Campos**: nome, tipo, obrigatório, limites e formato (CPF, CNPJ, e-mail, dinheiro...). Cada campo vira um
  controle do formulário com o componente e os validadores adequados (veja a seção "Formulários" do `README.md`).
- **Telas**: por padrão listagem + detalhe + cadastro/edição. Confirme se alguma não é necessária.
- **Autenticação** (padrão: sim, com `authGuard`) e **item no menu** (padrão: sim).

## 2. Data-access

- `<x>.models.ts`: interface da entidade com campos `readonly`, `id` e `updatedAt`, e
  `type <X>Input = Omit<X, 'id' | 'updatedAt'>`. Regras de negócio puras (como `isLowStock`) ficam aqui, como
  funções exportadas.
- `<x>.service.ts`: `@Injectable({ providedIn: 'root' })`, `inject(HttpClient)` e URL base a partir de
  `inject(APP_ENVIRONMENT).api.baseUrl` — nunca importe `environment.ts` direto.
  - `getById` declara `{ context: handledErrors(404) }` (a tela mostra "não encontrado");
  - `create`/`update` declaram `handledErrors(400, 422)` (erros vão para os campos);
  - IDs na URL passam por `encodeURIComponent`.
- `<x>.service.spec.ts`: `provideTestEnvironment()`, `provideHttpClient()`, `provideHttpClientTesting()`; a URL
  base nos testes é `http://api.test`. Teste URL, parâmetros, método/corpo e o `HANDLED_ERROR_STATUSES`.

## 3. Páginas

Todas: standalone, `ChangeDetectionStrategy.OnPush`, `inject()` em vez de construtor, estado em `signal`,
`takeUntilDestroyed(this.destroyRef)` nas cargas, `finalize` para desligar `loading`/`saving`.

- **Lista**: busca em `<form role="search">` com `app-text-field type="search"`; estados `loading` /
  `loadFailed` (com botão "tentar novamente") / vazio / tabela. Tabela com `<caption>`, `scope="col"`, a coluna
  principal como `<th scope="row">` e links de ação com texto `sr-only` que diferencia cada linha.
- **Detalhe**: `readonly id = input.required<string>()` (a rota usa `withComponentInputBinding`); trata
  `error.kind === 'not-found'` separado de `loadFailed`; exclusão com `confirm` traduzido +
  `NotificationService.success` + navegação para a lista.
- **Edição** (uma página para `novo` e `:id/editar`): `id = input<string>()`, `isEdit = computed(...)`,
  `NonNullableFormBuilder`, `submitAttempt` alimentando `<app-form-error-summary>`, `markAllAsTouched()` no envio
  inválido, `applyServerErrors` copiado do `item-edit.ts` e `toPayload()` normalizando os valores (trim,
  `unmask` para campos com máscara). Use `inputId` explícito com prefixo da entidade (`supplier-name`).
- Campos: apenas os de `@shared/forms` (`TextField`, `EmailField`, `NumberField`, `TextareaField`) e
  validadores de `@shared/validation`. Se faltar um tipo de campo (select, checkbox...), pare e use a skill
  `novo-campo-form` antes de continuar.
- Estilos: reutilize as classes globais (`page-header`, `form`, `form-grid`, `form-actions`, `btn`, `alert`,
  `badge`, `table`...). Só crie `.scss` de componente se for indispensável, com tokens e BEM.

Cada página tem `.spec.ts` no estilo de `item-edit.spec.ts`: service mockado com `vi.fn()`,
`provideTestEnvironment()`, `provideRouter([])`, `await loadTranslations()`, `fixture.componentRef.setInput('id', ...)`
e asserções sobre o texto traduzido real.

## 4. Rotas e menu

- `<feature>.routes.ts`: `export const <FEATURE>_ROUTES: Routes` com `''`, `'novo'`, `':id'`, `':id/editar'`, todas
  com `loadComponent` e `title` como **chave de tradução** (resolvida pelo `AppTitleStrategy`).
- `src/app/app.routes.ts`: adicione antes das rotas de erro
  `{ path: '<feature>', canActivate: [authGuard], loadChildren: () => import('@features/<feature>/<feature>.routes').then((m) => m.<FEATURE>_ROUTES) }`.
- `src/app/app.navigation.ts`: `{ labelKey: 'common.menu.<chave>', path: '/<feature>', requiresAuth: true }` e
  a chave em `common.json` **dos dois idiomas**.

## 5. i18n

- Crie `src/i18n/pt-BR/<feature>.json` e `src/i18n/en/<feature>.json` com as **mesmas chaves e os mesmos
  parâmetros `{{...}}`**, organizadas como em `estoque.json`: `fields`, `hints`, `list`, `detail`, `edit`,
  `validation`, `errors`.
- Registre o catálogo no `index.ts` de **cada** idioma (import + chave no objeto exportado, em ordem alfabética).
- Textos em pt-BR claros e no padrão gov.br; traduza para inglês de fato, não copie o português.

## 6. Backend simulado

Use a skill `mock-endpoint` para que a feature funcione em `npm start` sem servidor (CRUD em memória, 401 sem
token, 404, 422 de validação e um termo de busca que provoca 500).

## 7. Verificação

Rode e corrija até passar:

```bash
npm run lint
npm run test:ci
npm run format
npm run lint:style
```

O `npm run lint` acusa violações de camadas (uma feature não importa outra; `core`/`shared` não importam
features). O `i18n-catalogs.spec.ts` falha se os catálogos divergirem entre os idiomas.

Por fim, suba o app com o preview (`sugestao-front` em `.claude/launch.json`), entre com as credenciais de
teste do README e percorra lista → cadastro (envio vazio e válido) → detalhe → edição → exclusão.
Mostre um screenshot ao usuário.

## Armadilhas comuns

- Esquecer o catálogo `en` ou o registro no `index.ts` → o teste de catálogos quebra.
- Importar algo de `features/estoque` → mova para `shared/` ou `core/`.
- `title` da rota com texto literal em vez de chave de tradução.
- Texto fixo no template em vez de `| translate`.
- `inputId` repetido entre páginas → links do resumo de erros levam ao campo errado.
