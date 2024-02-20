import { Parser } from '../parser'

export const getCharCodeByPos = function (this: Parser) {
  const code = this.input.charCodeAt(this.pos)
  if (code <= 0xd7ff || code >= 0xdc00) return code
  const next = this.input.charCodeAt(this.pos + 1)
  return next <= 0xdbff || next >= 0xe000
    ? code
    : (code << 10) + next - 0x35fdc00
}
