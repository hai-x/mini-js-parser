export const ecma5AndLessKeywords: [
  'break',
  'case',
  'catch',
  'continue',
  'debugger',
  'default',
  'do',
  'while',
  'else',
  'finally',
  'for',
  'if',
  'function',
  'return',
  'switch',
  'throw',
  'try',
  'var',
  'with',
  'null',
  'true',
  'false',
  'instanceof',
  'typeof',
  'void',
  'delete',
  'new',
  'in',
  'this'
] = [
  'break',
  'case',
  'catch',
  'continue',
  'debugger',
  'default',
  'do',
  'while',
  'else',
  'finally',
  'for',
  'if',
  'function',
  'return',
  'switch',
  'throw',
  'try',
  'var',
  'with',
  'null',
  'true',
  'false',
  'instanceof',
  'typeof',
  'void',
  'delete',
  'new',
  'in',
  'this'
]

export const keywordsSets = {
  5: new Set(ecma5AndLessKeywords),
  '5+module': new Set([...ecma5AndLessKeywords, 'export', 'import']),
  '6': new Set([
    ...ecma5AndLessKeywords,
    'export',
    'import',
    'super',
    'extends',
    'const',
    'class'
  ])
}

export function isIdentifierCharStart(code: number) {
  if (code < 65) return code === 36
  if (code < 91) return true
  if (code < 97) return code === 95
  if (code < 123) return true
  if (code <= 0xffff) return code >= 0xaa
}

export function isIdentifierChar(code: number) {
  if (code < 48) return code === 36
  if (code < 58) return true
  if (code < 65) return false
  if (code < 91) return true
  if (code < 97) return code === 95
  if (code < 123) return true
  if (code <= 0xffff) return code >= 0xaa
}
