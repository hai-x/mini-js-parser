import { Parser } from './parser'

export class Node {
  type: string
  span: {
    start: number
    end: number
  }
  body?: Node[]
  declarations?: Node[]
  init?: Node
  kind?: string
  value?: string | number
  id?: Node

  constructor(parser: Parser, p: { pos: number; type?: string }) {
    this.type = p.type || ''
    this.span = {
      start: p.pos,
      end: 0
    }
  }
}

export const finishNode = function (
  this: Parser,
  node: Node,
  params: {
    type: string
    pos?: number
  }
) {
  const { type, pos } = params
  node.type = type
  node.span.end = pos ?? this.pos
  return node
}
