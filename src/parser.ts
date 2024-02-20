import { keywordsSets } from './identifier'
import { Node, finishNode } from './node'
import { parseVarStatement } from './statement'
import {
  TokenCtx,
  TokenCtxMap,
  TokenType,
  TokenTypeMap,
  readToken
} from './token'
import { raiseError } from './utils/error'

type Options = {
  ecmaVersion: '5' | '5+module' | '6'
}

export class Parser {
  keywords: Set<string>
  pos: number
  start: number
  end: number
  // lastTokenEnd: number
  input: string
  tokenizeCtx: {
    curType?: TokenType
    prevType?: TokenType
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    curVal?: any
    canAcceptExpr: boolean
    // ctxStack:
  }
  syntacticCtx: {
    stack: TokenCtx[]
  }
  raiseError: typeof raiseError

  constructor(options: Options) {
    this.parse = this.parse.bind(this)
    this.parsing = this.parsing.bind(this)
    this.nextToken = this.nextToken.bind(this)
    this.finishToken = this.finishToken.bind(this)
    this.curSyntacticCtx = this.curSyntacticCtx.bind(this)
    this.raiseError = raiseError.bind(this)

    options.ecmaVersion ??= '5'
    const { ecmaVersion } = options
    this.keywords = keywordsSets[ecmaVersion]
    this.pos = 0
    this.start = 0
    this.end = 0
    // this.lastTokenEnd = 0
    this.input = ''
    this.tokenizeCtx = {
      curType: undefined,
      curVal: undefined,
      prevType: undefined,
      canAcceptExpr: true
    }
    this.syntacticCtx = {
      stack: []
    }

    this.tokenizeCtx.curType = TokenTypeMap.eof
    this.syntacticCtx.stack = [TokenCtxMap.b_stat]
  }

  newNode() {
    return new Node(this, {
      pos: this.start
    })
  }

  curSyntacticCtx() {
    const stack = this.syntacticCtx.stack
    return stack[stack.length - 1]
  }

  parse(input: string) {
    const node = this.newNode()
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while (this.pos <= (this.input = input).length) {
      const token = this.nextToken()
      if (!token) continue
      this.parsing(node, token)
      this.pos++
    }
    finishNode.call(this, node, {
      type: 'Program',
      pos: this.pos - 1
    })

    return node
  }

  finishToken(type: TokenType, val?: string | number | bigint) {
    this.end = this.pos
    const tokenizeCtx = this.tokenizeCtx
    const preType = tokenizeCtx.prevType
    if (tokenizeCtx.canAcceptExpr === false && this.curSyntacticCtx().isExpr) {
      new Error('can not AcceptExpr but type is expr')
    }
    tokenizeCtx.prevType = tokenizeCtx.curType
    tokenizeCtx.curType = type
    tokenizeCtx.curVal = val
    tokenizeCtx.canAcceptExpr = type.beforeExpr
  }

  nextToken() {
    // this.lastTokenEnd = this.end
    const curSyntacticCtx = this.curSyntacticCtx()
    if (!curSyntacticCtx.preserveSpace) this.skipSpace()
    this.start = this.pos
    if (this.pos >= this.input.length) return this.finishToken(TokenTypeMap.eof)
    const token = readToken.call(this)
    return token
  }

  skipSpace() {
    outer: while (true) {
      while (this.pos < this.input.length) {
        const ch = this.input.charCodeAt(this.pos)
        switch (ch) {
          case 32:
            ++this.pos
            break
          default:
            break outer
        }
      }
    }
  }

  parseStatement(token: TokenType) {
    switch (token) {
      case TokenTypeMap.const: {
        const kind = this.tokenizeCtx.curVal
        return parseVarStatement.call(this, kind)
      }
      default:
        return null
    }
  }

  parsing(node: Node, token: TokenType) {
    node.body ??= []
    // while (this.tokenizeCtx.curType !== TokenTypeMap.eof) {
    const stmt = this.parseStatement(token)
    if (stmt) node.body.push(stmt)
    return node
    // }
  }

  eat(token: TokenType) {
    if (this.tokenizeCtx.curType === token) {
      this.nextToken()
      return true
    }
    return false
  }

  static parse(...args: [string, Options]) {
    return new Parser(args[1]).parse(args[0])
  }
}

export const parse = (...args: [string, Options]) => {
  return Parser.parse(...args)
}
