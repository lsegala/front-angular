# sugestao-front

Exemplo de arquitetura front-end com **Angular 21** (standalone, signals, zoneless), **Vitest** para testes
unitários e acessibilidade seguindo o **e-MAG** (Modelo de Acessibilidade em Governo Eletrônico).

## Requisitos

| Ferramenta  | Versão                                 | Observação                                                       |
| ----------- | -------------------------------------- | ---------------------------------------------------------------- |
| Node.js     | `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0` | Recomendado: **24 LTS** (fixado no `mise.toml`)                  |
| npm         | 11.x                                   | Vem com o Node 24. Veja [npm 11](#npm-11)                        |
| Angular CLI | 21.x                                   | Já vem no projeto (`npx ng ...`); a instalação global é opcional |

Versões principais do projeto: Angular 21.2, TypeScript 5.9, Vitest 4, ESLint 10 com angular-eslint 21.

O `package.json` declara a faixa de Node em `engines` e o `.npmrc` tem `engine-strict=true`: com um Node fora da
faixa (ex.: 18), o `npm install`/`npm ci` **para logo no início** com uma mensagem clara, em vez de falhar no meio
do build.

## Como rodar

```bash
npm ci               # instala exatamente as versões do package-lock.json
npm start            # http://localhost:4200 (ambiente development, com backend simulado)
npm test             # Vitest em modo watch
npm run test:ci      # Vitest uma vez (CI)
npm run test:coverage
npm run lint         # ESLint (inclui as regras de camadas)
npm run format       # Prettier em src/
npm run build        # produção
npm run build:hmg    # homologação
```

No ambiente `development` o backend é simulado (`src/mocks`). Credenciais de teste:
**admin@exemplo.gov.br** / **Senha@123**. Pesquise por `erro500` na lista de itens para ver o tratamento de erro.

## Versão do Node por projeto com o mise

O [mise](https://mise.jdx.dev) faz para o Node o que o `mvnw` faz para o Maven: o projeto declara a versão num
arquivo versionado (`mise.toml`) e o mise usa essa versão automaticamente dentro da pasta, sem mexer no Node dos
outros projetos.

```toml
# mise.toml
[tools]
node = "24"
```

**Primeira vez na máquina (Windows):**

```powershell
winget install jdx.mise
```

Coloque `%LOCALAPPDATA%\mise\shims` no início do PATH do usuário e reabra o terminal e a IDE. Se houver um Node
instalado pelo instalador oficial, desinstale-o: ele fica no PATH do sistema, que tem prioridade sobre o do
usuário. No Linux/macOS, use `mise activate` no seu shell (veja a documentação do mise).

**Em cada projeto clonado:**

```bash
mise trust     # autoriza o mise.toml do projeto (só na primeira vez)
mise install   # baixa a versão de Node declarada
npm ci
```

Comandos úteis: `mise current` (versões em uso na pasta), `mise ls` (versões instaladas), `mise doctor`
(diagnóstico). Ao instalar pacotes globais (`npm install -g ...`), rode `mise reshim` em seguida para que o comando
fique disponível no terminal.

Quem não usa o mise continua funcionando com qualquer Node dentro da faixa de `engines`.

## npm 11

- **Use `npm ci`** para instalar: ele respeita o `package-lock.json` e falha se o lock estiver fora de sincronia
  com o `package.json`. Ao adicionar ou atualizar dependências, use `npm install <pacote>` e **commite o
  `package-lock.json`** junto.
- **Scripts de instalação bloqueados:** o npm 11 não executa mais, por padrão, os scripts `install`/`postinstall`
  de dependências e mostra um aviso listando os pacotes (hoje: `esbuild`, `lmdb`, `@parcel/watcher`,
  `msgpackr-extract`, `unrs-resolver`). O projeto **funciona sem eles**: os binários vêm em pacotes pré-compilados
  por plataforma. Para revisar: `npm install-scripts ls`. Liberar (`npm install-scripts approve <pacote>`) ou
  negar (`deny`) grava a decisão no `package.json` e deve ser combinado com o time.

## Estrutura

```
src/
├── environments/        # Configuração por ambiente (URL do backend, timeout, idioma, flags)
├── app/
│   ├── app.config.ts    # Providers globais (router, http, interceptors, i18n, acessibilidade)
│   ├── app.routes.ts    # Rotas de 1º nível com lazy loading
│   ├── app.navigation.ts# Itens do menu lateral
│   ├── core/            # Instância única, usada pela aplicação inteira
│   │   ├── layout/          # Shell: menu lateral, cabeçalho, corpo e rodapé
│   │   ├── accessibility/   # Barra e-MAG, alto contraste, fonte, títulos, anúncios, página de acessibilidade
│   │   ├── error-handling/  # Interceptor HTTP, ErrorHandler global, notificações, páginas de erro
│   │   └── localization/    # TranslationService, pipe translate, seletor de idioma, locales
│   ├── shared/          # Reutilizável e sem regra de negócio
│   │   ├── forms/           # text, email, number, textarea, máscara, field-error, form-error-summary
│   │   ├── validation/      # validators (AppValidators, BrValidators), charsets, erro → mensagem traduzida
│   │   └── utils/
│   └── features/        # Um módulo por domínio, carregado sob demanda
│       ├── auth/
│       └── estoque/
├── i18n/{pt-BR,en}/     # Catálogos de tradução (JSON por domínio)
├── assets/              # Imagens e estilos globais (tokens, base, forms, components)
├── mocks/               # Backend simulado (somente dev)
└── testing/             # Helpers de teste
```

### Modelo de uma feature

```
features/<feature>/
├── <feature>.routes.ts      # rotas lazy da feature
├── data-access/             # "back-end do front"
│   ├── <feature>.models.ts  # interfaces/types: request, response, entidade (o "VO")
│   ├── <feature>.service.ts # chamadas HTTP
│   └── *.guard.ts / *.interceptor.ts / *.providers.ts
├── pages/                   # componentes ligados a rotas (smart)
└── components/              # componentes visuais só desta feature (dumb), quando houver
```

Os nomes de arquivo seguem o guia de estilo atual do Angular: `sign-in.ts` (e não `sign-in.component.ts`).

### Regras entre camadas (verificadas pelo `npm run lint`)

| De           | Pode importar                       | Não pode importar                                           |
| ------------ | ----------------------------------- | ----------------------------------------------------------- |
| `core/`      | `core`, `shared`                    | `features` (use um token de injeção, como `LAYOUT_SESSION`) |
| `shared/`    | `shared`, `core`                    | `features`                                                  |
| `features/x` | `core`, `shared`, a própria feature | outra feature (o que for comum vai para `shared` ou `core`) |
| aplicação    | —                                   | `mocks/` e `testing/`                                       |

Os arquivos soltos em `src/app` (`app.config.ts`, `app.routes.ts`...) montam a aplicação e podem importar qualquer
camada. As regras ficam em `eslint.config.js` (plugin `eslint-plugin-boundaries`).

### Aliases de import

Use os aliases quando o import cruza camadas; dentro do mesmo módulo, use caminho relativo.

| Alias         | Pasta                |
| ------------- | -------------------- |
| `@core/*`     | `src/app/core/*`     |
| `@shared/*`   | `src/app/shared/*`   |
| `@features/*` | `src/app/features/*` |
| `@env/*`      | `src/environments/*` |
| `@i18n/*`     | `src/i18n/*`         |
| `@mocks/*`    | `src/mocks/*`        |
| `@testing/*`  | `src/testing/*`      |

### Como criar uma feature

1. Crie `src/app/features/<feature>/` com `data-access/`, `pages/` e `<feature>.routes.ts` (modelo acima).
2. Registre a rota lazy em `app.routes.ts` (`loadChildren`) e, se precisar, o item de menu em `app.navigation.ts`.
3. Crie o catálogo `src/i18n/pt-BR/<feature>.json` **e** `src/i18n/en/<feature>.json`, e inclua os dois nos
   `index.ts` de cada idioma. O teste `i18n-catalogs.spec.ts` falha se as chaves ou os parâmetros `{{...}}` forem
   diferentes entre os idiomas.
4. Use os campos de `@shared/forms` e os validadores de `@shared/validation` (veja [Formulários](#formulários)).
5. Rode `npm run lint` e `npm run test:ci` antes de abrir o PR.

## Ambientes

Todos os arquivos `src/environments/environment*.ts` implementam a interface `AppEnvironment`, então um campo
esquecido vira erro de compilação. O Angular CLI troca o arquivo no build (`fileReplacements` no `angular.json`):

| Configuração  | Arquivo                      | Comando             |
| ------------- | ---------------------------- | ------------------- |
| `development` | `environment.development.ts` | `npm start`         |
| `homologacao` | `environment.homologacao.ts` | `npm run build:hmg` |
| `production`  | `environment.ts`             | `npm run build`     |

Nos serviços, use `inject(APP_ENVIRONMENT)` em vez de importar o arquivo, assim os testes podem sobrescrever a
configuração. Para criar um novo ambiente: copie um arquivo, adicione a configuração em `angular.json` e um script
em `package.json`.

## Acessibilidade (e-MAG)

| Recurso                                                             | Onde                                   |
| ------------------------------------------------------------------- | -------------------------------------- |
| Atalhos Alt+1 (conteúdo), Alt+2 (menu), Alt+4 (rodapé)              | `core/accessibility/accessibility-bar` |
| Alto contraste e ajuste de fonte (salvos no navegador)              | `AccessibilityService`                 |
| `lang` do `<html>` atualizado ao trocar idioma                      | `TranslationService`                   |
| Título descritivo por página + anúncio de navegação para leitores   | `AppTitleStrategy`, `LiveAnnouncer`    |
| Foco movido para o conteúdo após navegar                            | `Shell`                                |
| Label associado, dica e erro via `aria-describedby`, `aria-invalid` | `shared/forms/base-field.ts`           |
| Erro não depende só da cor (borda + ícone + texto)                  | `assets/styles/_forms.scss`            |
| Resumo de erros focado com links para os campos                     | `FormErrorSummary`                     |
| Mensagens de erro não somem sozinhas                                | `NotificationService`                  |
| Página "Acessibilidade" descrevendo os recursos                     | `/acessibilidade`                      |
| Regras de acessibilidade nos templates                              | `npm run lint` (angular-eslint)        |

## Formulários

Os campos recebem o `FormControl` por input e as regras ficam explícitas no formulário:

```ts
form = this.fb.group({
  name: ['', [Validators.required, AppValidators.letters]],
  email: ['', [Validators.required, AppValidators.email]],
  cpf: ['', [Validators.required, BrValidators.cpf]],
  price: this.fb.control<number | null>(null, [
    Validators.required,
    Validators.min(0),
    AppValidators.numeric({ allowDecimal: true, decimalPlaces: 2 }),
  ]),
});
```

```html
<app-email-field inputId="email" label="cadastro.fields.email" [control]="form.controls.email" />
<app-text-field
  inputId="cpf"
  label="cadastro.fields.cpf"
  [mask]="masks.cpf"
  [control]="form.controls.cpf"
/>
<app-number-field
  inputId="preco"
  label="cadastro.fields.price"
  [allowDecimal]="true"
  [decimalPlaces]="2"
  [control]="form.controls.price"
/>
```

(`masks = MASKS`, importado de `@shared/forms`.)

O `label`/`hint` são chaves de tradução. O erro aparece quando o usuário sai do campo ou quando o formulário chama
`markAllAsTouched()` no envio.

Cada campo combina três camadas:

| Camada                                                | Onde fica                           | Exemplo                                           |
| ----------------------------------------------------- | ----------------------------------- | ------------------------------------------------- |
| **Filtro na digitação**: impede o caractere de entrar | no componente (`charset`, `mask`)   | `charset="letters"` descarta números e símbolos   |
| **Validador**: decide se o valor é válido             | `AppValidators`, `BrValidators`     | cobre também valores colados ou vindos do backend |
| **Mensagem**: chave i18n com `{{field}}`              | `src/i18n/<idioma>/validation.json` | `"Preencha o campo {{field}}."`                   |

### Campos

| Componente           | Opções principais                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `app-text-field`     | `type`, `maxlength`, `charset` (`any`, `letters`, `alphanumeric`, `digits`), `mask`             |
| `app-email-field`    | bloqueia espaços, normaliza para minúsculas, teclado de e-mail                                  |
| `app-number-field`   | valor `number \| null`; `allowDecimal`, `allowNegative`, `decimalPlaces` (ex.: 2 para dinheiro) |
| `app-textarea-field` | `rows`, `maxlength` com contador de caracteres restantes                                        |

**Máscaras** (`MASKS` em `@shared/forms`): `cpf`, `cnpj` (inclusive alfanumérico), `cep`, `phone` (fixo ou
celular) e `date`. No padrão, `#` aceita dígito e `*` aceita letra ou dígito. O `FormControl` guarda o valor
mascarado; para enviar ao backend sem formatação use `unmask(valor)`.

### Validadores

| Validador                                                | Erro                                      |
| -------------------------------------------------------- | ----------------------------------------- |
| `AppValidators.notBlank`                                 | `notBlank`                                |
| `AppValidators.email`                                    | `email`                                   |
| `AppValidators.numeric({ allowDecimal, decimalPlaces })` | `numeric`, `decimalPlaces`                |
| `AppValidators.pattern(regex, 'chave.da.mensagem')`      | `pattern` com mensagem própria            |
| `AppValidators.letters` / `alphanumeric` / `digits`      | `letters` / `alphanumeric` / `digits`     |
| `BrValidators.cpf` / `cnpj` / `cep` / `phone` / `date`   | `cpf` / `cnpj` / `cep` / `phone` / `date` |

Os validadores ignoram campo vazio (isso é papel do `Validators.required`) e aceitam o valor com ou sem máscara.
O `cnpj` aceita o formato alfanumérico emitido pela Receita Federal a partir de julho/2026.

### Mensagens de erro

A mensagem de cada erro é escolhida nesta ordem:

1. `messageKey` enviado pelo próprio validador (ex.: `AppValidators.pattern(/^[A-Z0-9-]+$/, 'estoque.validation.sku')`);
2. o mapa de `validation-messages.ts` (erros do Angular e casos especiais);
3. a convenção **`validation.<nomeDoErro>`**; se a chave não existir, usa `validation.invalid`.

Para criar um validador novo, basta que ele retorne `{ meuErro: ... }` e que exista `"meuErro"` no
`validation.json` dos dois idiomas. Não é preciso alterar o `shared/`. Os parâmetros do erro ficam disponíveis na
mensagem, além de `{{field}}` com o rótulo traduzido.

### Resumo de erros

O `<app-form-error-summary>` lista automaticamente os campos do formulário recebido em `[form]`, na ordem da tela,
usando o `inputId` e o `label` declarados no próprio campo. Para um controle que não seja um campo compartilhado
(ex.: um `<select>` próprio), informe-o em `[fields]`.

### Decisão de arquitetura

Os campos recebem `[control]` em vez de implementar `ControlValueAccessor`. É mais simples de entender e testar,
mas não funciona com `formControlName`/`ngModel`. O Signal Forms do Angular 21 ainda é experimental; por isso o
projeto segue com Reactive Forms.

## Tratamento de erros

- `httpErrorInterceptor`: timeout, retry de GET em falhas transitórias, conversão para `AppError` e notificação
  traduzida.
- Telas que tratam um status sozinhas declaram isso com `handledErrors(404)` no `HttpContext`.
- Erros de validação do backend (`{ "errors": { "campo": "mensagem" } }`) aparecem no próprio campo.
- `GlobalErrorHandler` captura exceções não tratadas.

## Design system

A identidade visual está definida em [`DESIGN.md`](DESIGN.md) (formato
[Google DESIGN.md](https://github.com/google-labs-code/design.md): tokens normativos em YAML +
racional em prosa). Os mesmos valores vivem como custom properties em
`src/assets/styles/_tokens.scss` — cor, tipografia, espaçamento, raio, sombra, z-index e tamanhos
de toque. **Nenhum componente declara cor, tamanho de fonte ou sombra diretamente**; o Stylelint
bloqueia hex/`rgb()` fora de `_tokens.scss` e exige classes no padrão BEM.

```bash
npm run lint:style     # Stylelint (tokens, BEM, SCSS)
npm run design:lint    # valida DESIGN.md: referências, ordem das seções e contraste WCAG
npm run design:export  # exporta tokens no formato W3C DTCG (design-tokens.json)
```

Ao mudar um valor: edite `DESIGN.md` → espelhe em `_tokens.scss` → `npm run design:lint`.

## Pipeline

O projeto não tem pipeline de CI configurado no repositório. A verificação é feita localmente com
`npm run ci`, que deve passar antes de abrir um PR:

| Etapa         | Comando                | O que verifica                                                |
| ------------- | ---------------------- | ------------------------------------------------------------- |
| Formatação    | `npm run format:check` | Prettier em `src/`                                            |
| Estilos       | `npm run lint:style`   | Stylelint (tokens, BEM, SCSS)                                 |
| Design system | `npm run design:lint`  | Referências, ordem das seções e contraste WCAG do `DESIGN.md` |
| Testes        | `npm run test:ci`      | Vitest, uma execução                                          |
| Build         | `npm run build`        | Build `production`                                            |

O `npm run ci` não roda o ESLint; rode também `npm run lint` (inclui as regras de camadas). Antes de publicar,
confira ainda:

- `npm run build:hmg` — build de homologação;
- que a credencial do mock (`MOCK_CREDENTIALS` em `src/mocks/mock-data.ts`) não aparece em `dist/`;
- `npm audit --omit=dev --audit-level=high` — vulnerabilidades em dependências de produção.

Ao configurar um CI (GitHub Actions, GitLab CI...), use essas mesmas etapas e marque-as como verificações
obrigatórias na branch `main`.

## Skills do Claude Code

A pasta `.claude/skills/` traz skills que automatizam as tarefas repetitivas deste projeto, seguindo as
convenções descritas neste README:

| Skill             | Quando usar                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `nova-feature`    | Criar um domínio novo (rotas, data-access, páginas, i18n, menu, mock e testes)     |
| `novo-campo-form` | Criar um campo compartilhado em `shared/forms` (select, checkbox, data...)         |
| `mock-endpoint`   | Simular no backend de desenvolvimento um endpoint novo, inclusive cenários de erro |

No Claude Code, peça a tarefa normalmente (ex.: "crie a feature fornecedores") ou chame `/nova-feature`.

## Qualidade de código

- **ESLint** (`npm run lint`): regras recomendadas do Angular e do TypeScript, acessibilidade nos templates e
  regras de camadas. No VS Code, instale as extensões recomendadas (ESLint e Prettier).
- **Prettier** (`npm run format` / `npm run format:check`): formatação conforme o `.prettierrc`.
- **Quebra de linha**: o `.gitattributes` mantém LF em qualquer sistema operacional, evitando diferenças só de
  CRLF/LF no Windows.
