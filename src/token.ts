import { isIdentifierChar, isIdentifierCharStart } from './identifier'
import { Parser } from './parser'
import { getCharCodeByPos } from './utils'

// TODO: type
type Label = string

type Options = {
  startsExpr?: boolean
  beforeExpr?: boolean
  keyword?: string
  isAssign?: boolean
  isLoop?: boolean
}

// acorn
// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

export class TokenType {
  label: Label
  keyword?: string
  beforeExpr: boolean
  startsExpr: boolean
  isAssign: boolean
  isLoop: boolean

  constructor(token: Label, options?: Options) {
    this.label = token
    this.keyword = options?.keyword
    this.beforeExpr = options?.beforeExpr ?? false
    this.startsExpr = options?.startsExpr ?? false
    this.isAssign = options?.isAssign ?? false
    this.isLoop = options?.isLoop ?? false
  }
}

export const TokenTypeMap = {
  name: new TokenType('name', {
    startsExpr: true
  }),
  eq: new TokenType('=', { beforeExpr: true, isAssign: true }),
  const: new TokenType('const', { keyword: 'const' }),
  number: new TokenType('number', { startsExpr: true }),
  eof: new TokenType('eof'),
  comma: new TokenType(',', { beforeExpr: true })
}

export class TokenCtx {
  token: string
  isExpr: boolean
  preserveSpace?: boolean
  override?: boolean

  constructor(
    token: string,
    isExpr: boolean,
    preserveSpace?: boolean,
    override?: boolean
  ) {
    this.token = token
    this.isExpr = !!isExpr
    this.preserveSpace = !!preserveSpace
    this.override = override
  }
}

export const TokenCtxMap = {
  b_stat: new TokenCtx('{', false),
  b_expr: new TokenCtx('{', true),
  b_tmpl: new TokenCtx('${', false),
  p_stat: new TokenCtx('(', false),
  p_expr: new TokenCtx('(', true),
  q_tmpl: new TokenCtx('`', true, true),
  f_stat: new TokenCtx('function', false),
  f_expr: new TokenCtx('function', true)
}

const readInt = function (this: Parser) {
  while (this.pos < this.input.length) {
    const ch = getCharCodeByPos.call(this)
    if (ch >= 48 && ch <= 57) {
      this.pos++
    } else {
      break
    }
  }
}

function stringToBigInt(str: string) {
  // `BigInt(value)` throws syntax error if the string contains numeric separators.
  return BigInt(str.replace(/_/g, ''))
}

export const readToken_number = function (this: Parser) {
  const start = this.pos
  readInt.call(this)
  const val = this.input.slice(start, this.pos)
  this.finishToken(TokenTypeMap.number, parseFloat(val))
}

export const readToken_eq_excl = function (this: Parser) {
  this.pos++
  const str = this.input.slice(this.pos, this.pos + 1)
  this.finishToken(TokenTypeMap.eq, str)
}

export const readToken_word = function (this: Parser) {
  const chunkStart = this.pos
  while (this.pos < this.input.length) {
    const ch = getCharCodeByPos.call(this)
    if (isIdentifierChar(ch)) {
      this.pos += ch <= 0xffff ? 1 : 2
    } else {
      break
    }
  }
  return this.input.slice(chunkStart, this.pos)
}

export const readToken_normal = function (this: Parser, charCode: number) {
  switch (charCode) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46: // '.'
      return console.log('dot')
    // return this.readToken_dot()

    // Punctuation tokens.
    case 40:
      ++this.pos
      return console.log('parenL')
    // return this.finishToken(TokenTypeMap.parenL)
    case 41:
      ++this.pos
      return console.log('parenR')
    // return this.finishToken(TokenTypeMap.parenR)
    case 59:
      ++this.pos
      return console.log('semi')
    // return this.finishToken(TokenTypeMap.semi)
    case 44:
      ++this.pos
      return this.finishToken(TokenTypeMap.comma)
    case 91:
      ++this.pos
      return console.log('bracketL')
    // return this.finishToken(TokenTypeMap.bracketL)
    case 93:
      ++this.pos
      return console.log('bracketR')
    // return this.finishToken(TokenTypeMap.bracketR)
    case 123:
      ++this.pos
      return console.log('braceL')
    // return this.finishToken(TokenTypeMap.braceL)
    case 125:
      ++this.pos
      return console.log('braceR')
    // return this.finishToken(TokenTypeMap.braceR)
    case 58:
      ++this.pos
      return console.log('colon')
    // return this.wrapToken(TokenTypeMap.colon)

    case 61:
    case 33: // '=!'
      return readToken_eq_excl.call(this)

    // number, or float.
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57: // 1-9
      return readToken_number.call(this)
  }
  return this.raiseError('unexpected character', this.pos)
}

export const readToken = function (this: Parser) {
  let tokenType = TokenTypeMap.name
  const charCode = getCharCodeByPos.call(this)
  if (isIdentifierCharStart(charCode)) {
    const word = readToken_word.call(this)
    if (this.keywords.has(word) && word in TokenTypeMap) {
      //@ts-ignore
      tokenType = TokenTypeMap[word]
    }
    this.finishToken(tokenType, word)
    return tokenType
  }
  return readToken_normal.call(this, charCode)
}
