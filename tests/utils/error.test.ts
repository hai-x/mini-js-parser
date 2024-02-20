import { describe, expect, it } from 'vitest'
import { parse } from '../../src/index'

describe('unexpected character', () => {
  it('unexpected character', () => {
    expect(() =>
      parse('const a = -', {
        ecmaVersion: '6'
      })
    ).toThrowError('unexpected character (1:10)')
  })
})
