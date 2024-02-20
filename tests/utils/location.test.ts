import { describe, expect, it } from 'vitest'
import { findLineBreak, findLocByOffset } from '../../src/utils/error'

describe('assignment', () => {
  it('findLineBreak', () => {
    expect(findLineBreak('const\n a = 1\n11', 1)).equal(5)
    expect(findLineBreak('const\n a = 1\n11', 2)).equal(12)
  })
  it('findLocByOffset(this.input, this.pos)', () => {
    const loc = findLocByOffset('const\n a = 1\n\n\n\n11', 17)
    expect(loc.line).equal(6)
    expect(loc.column).equal(2)
  })
})
