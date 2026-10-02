// Lint de estilos. Complementa o Prettier (formatação) com regras semânticas:
// - cores em hexadecimal/rgb só podem existir em `_tokens.scss` (fonte única de verdade);
// - escala de fonte, z-index e sombras também vêm de tokens;
// - nomenclatura BEM (`bloco__elemento--modificador`) para as classes.
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],
    'declaration-property-value-disallowed-list': {
      // Força o uso de --z-* e --shadow-* definidos nos tokens.
      'z-index': [/^\d+$/],
      'box-shadow': [/^(?!none|var\().+/],
    },
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: 'Use nomes de classe no padrão BEM: bloco__elemento--modificador' },
    ],
    'scss/dollar-variable-pattern': '^[a-z][a-z0-9-]*$',
    // Hex com 6 dígitos facilita comparar com o DESIGN.md e com ferramentas de contraste.
    'color-hex-length': 'long',
    // Linhas em branco separam grupos de tokens; não é ruído.
    'custom-property-empty-line-before': null,
    // `(min-width: 48em)` é a forma mais reconhecida; a notação de intervalo é opcional.
    'media-feature-range-notation': null,
    // Preferimos `inset`, mas `top/right/...` seguem válidos em código antigo.
    'declaration-block-no-redundant-longhand-properties': null,
    // Angular: `:host` e `::ng-deep` são pseudo-seletores legítimos.
    'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['ng-deep'] }],
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['host'] }],
  },
  overrides: [
    {
      files: ['src/assets/styles/_tokens.scss'],
      rules: {
        'color-no-hex': null,
        'function-disallowed-list': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
  ],
};
