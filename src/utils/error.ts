import { Parser } from '../parser'
import { Loc } from './location'

let lastQueryStr = ''
let lineBreaks: number[] = []

export function isNewLine(code: number) {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
}

export const findLineBreak = (str: string, line: number) => {
  if (lineBreaks[line]) return lineBreaks[line]
  let beforeLineBreak = -1
  if (line > 1) {
    beforeLineBreak = lineBreaks[line - 1] = findLineBreak(str, line - 1)
  }
  let start = beforeLineBreak + 1
  for (; start < str.length; start++) {
    const ch = str.charCodeAt(start)
    if (isNewLine(ch)) {
      lineBreaks[line] =
        ch === 13 && str.charCodeAt(ch + 1) === 10 ? start + 1 : start
      return lineBreaks[line]
    }
  }
  return -1
}

export const findLocByOffset = (str: string, offset: number) => {
  let line = 1
  let column = offset
  while (true) {
    const lineBreak = findLineBreak(str, line)
    if (offset < lineBreak || lineBreak === -1) {
      return new Loc(line, column)
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      line++
      column = offset - lineBreak
    }
  }
}

export const raiseError = function (this: Parser, msg: string, pos: number) {
  let _msg = msg
  if (lastQueryStr !== this.input) {
    lineBreaks = []
    lastQueryStr = this.input
  }
  const loc = findLocByOffset(this.input, pos)
  _msg += ` (${loc.line}:${loc.column})`
  const err = new SyntaxError(_msg)
  // @ts-ignore
  err.pos = pos
  // @ts-ignore
  err.loc = loc
  // @ts-ignore
  err.raisedAt = this.pos
  throw err
}
