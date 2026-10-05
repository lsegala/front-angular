---
name: novo-campo-form
description: Cria um novo componente de campo de formulário compartilhado em `src/app/shared/forms` (select, checkbox, radio, data, moeda, CPF/CNPJ dedicado etc.) seguindo o padrão `BaseField` + `FieldFrame` deste projeto, com acessibilidade e-MAG, integração com o resumo de erros, testes e documentação. Use quando o usuário pedir um campo, input, controle ou componente de formulário reutilizável, ou quando uma tela precisar de um tipo de campo que `@shared/forms` ainda não tem.
---

# Novo campo de formulário compartilhado

Leia antes de começar: `src/app/shared/forms/base-field.ts`, `field-frame/field-frame.ts`,
`form-field-registry.ts`, `textarea-field/textarea-field.ts` (exemplo mais simples) e `email-field/email-field.spec.ts`
(modelo de teste). As regras abaixo vêm deles.

## Decisões que já estão tomadas (não mude)

- O campo recebe o controle por `[control]` (`input.required<FormControl<T>>()` herdado de `BaseField`).
  **Não implemente `ControlValueAccessor`** — é uma decisão registrada no README ("Decisão de arquitetura").
- `label` e `hint` são **chaves de tradução**, nunca texto.
- A validação fica nos validadores do formulário (`AppValidators`/`BrValidators`); o componente, no máximo,
  filtra a digitação (como `charset`/`mask` no `TextField`).

## Estrutura

`src/app/shared/forms/<nome>-field/<nome>-field.ts` (+ `.spec.ts`):

```ts
@Component({
  selector: 'app-<nome>-field',
  imports: [FieldFrame],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-field-frame [field]="this">
      <!-- controle nativo -->
    </app-field-frame>
  `,
})
export class <Nome>Field extends BaseField<T> { ... }
```

O controle nativo precisa de:

- `[id]="inputId()"` — o `FieldFrame` liga o `<label for>` e o `FormErrorSummary` usa esse id para focar o campo;
- `[required]="state().required"`, `[disabled]="state().disabled"`;
- `[attr.aria-invalid]="showError() || null"` e `[attr.aria-describedby]="describedBy()"` (se o campo tiver
  elementos extras, como o contador do textarea, componha os ids como em `textareaDescribedBy`);
- valor lido de `state().value` e escrito com `this.setValue(...)` (marca como dirty);
- `(blur)="markAsTouched()"` — o erro só aparece depois que o usuário sai do campo ou tenta enviar.

Não é preciso registrar nada à mão: o construtor de `BaseField` já registra o campo no `FormFieldRegistry`, e o
`FormErrorSummary` o encontra.

## Casos que fogem do `FieldFrame`

- **Checkbox único**: o rótulo vem depois do input. Não use o `FieldFrame` como está: crie a marcação com as mesmas
  classes BEM (`field`, `field--invalid`, `field__hint`) e reutilize `FieldError` (`[errorId]`, `[errors]`,
  `[fieldLabel]`). O `Validators.requiredTrue` cobre "aceito os termos".
- **Grupo de rádios / checkboxes**: use `<fieldset>` + `<legend>` (e-MAG 6.2) em vez de `<label for>`. O
  `inputId()` vai no primeiro input do grupo para o link do resumo de erros funcionar.
- **Select**: `<select>` nativo (acessível por padrão). Opções por `input<readonly { value: T; label: string }[]>()`
  com `label` como chave de tradução, mais uma opção vazia "Selecione" quando o campo não for obrigatório ou ainda
  não tiver valor.

## Estilos

Estilos de campo ficam em `src/assets/styles/_forms.scss` (global), não no componente. Use somente as custom
properties de `_tokens.scss` e classes BEM (`field__<elemento>`, `field--<modificador>`). O erro não pode
depender só da cor: siga o padrão existente (borda + ícone + texto). Valide com `npm run lint:style`.

Se precisar de um token novo: `DESIGN.md` → `_tokens.scss` → `npm run design:lint`.

## Textos

Textos fixos do componente (ex.: "Selecione", contador) vão em `common.json` de `pt-BR` **e** `en`.
Mensagens de validação novas vão em `validation.json` dos dois idiomas, com a chave igual ao nome do erro.

## Teste

`<nome>-field.spec.ts` no estilo de `email-field.spec.ts`: um componente `Host` com o campo, um `FormControl`
com validadores, `provideTestEnvironment()` e `await loadTranslations()`. Cubra no mínimo:

1. o rótulo está associado ao controle (`label[for]` = `id`);
2. alterar o controle nativo atualiza o `FormControl` (use `typeInto`/`blur` de `@testing/test-helpers` ou
   `dispatchEvent(new Event('change'))`);
3. o valor vindo do `FormControl` (`setValue`) aparece na tela;
4. depois do blur com valor inválido: `aria-invalid="true"` e a mensagem traduzida em `.field-error`;
5. o campo desabilitado fica `disabled`.

## Exportação e documentação

1. Exporte em `src/app/shared/forms/index.ts`, mantendo a ordem alfabética.
2. Acrescente uma linha na tabela "Campos" do `README.md` com as opções principais.
3. Se fizer sentido, use o campo em uma tela existente ou mostre o trecho de uso ao usuário.

## Verificação

```bash
npm run lint
npm run lint:style
npm run test:ci
npm run format
```
