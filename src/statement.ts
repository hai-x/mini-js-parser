import { parseExpression } from './expression'
import { Node, finishNode } from './node'
import { Parser } from './parser'
import { TokenTypeMap } from './token'

export const parseVarId = function (this: Parser) {
  this.nextToken()
  const node = this.newNode()
  node.value = this.tokenizeCtx.curVal
  finishNode.call(this, node, { type: 'Identifier' })
  return node
}

export const parseVar = function (this: Parser, node: Node) {
  node.declarations = []
  while (true) {
    const varId = parseVarId.call(this)
    const declaration = this.newNode()
    declaration.id = varId
    this.nextToken()
    if (this.eat(TokenTypeMap.eq)) {
      const expr = parseExpression.call(this)
      if (expr) declaration.init = expr
    }
    node.declarations.push(
      finishNode.call(this, declaration, { type: 'VariableDeclarator' })
    )
    // if "," continue parse
    if (!this.eat(TokenTypeMap.comma)) {
      break
    }
  }
}

export const parseVarStatement = function (this: Parser, kind?: string) {
  const node = this.newNode()
  parseVar.call(this, node)
  node.kind = kind
  finishNode.call(this, node, { type: 'VariableDeclaration' })
  return node
}
