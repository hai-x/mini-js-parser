import { Node, finishNode } from './node'
import { Parser } from './parser'
import { TokenTypeMap } from './token'

export const parseLiteral = function (this: Parser) {
  const node = this.newNode()
  const { curVal } = this.tokenizeCtx
  node.value = curVal
  finishNode.call(this, node, { type: 'Literal' })
  return node
}

export const parseExpression = function (this: Parser) {
  let node: Node
  switch (this.tokenizeCtx.curType) {
    case TokenTypeMap.number: {
      node = parseLiteral.call(this)
      return node
    }
  }
}
