import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

const t_constAssignment = JSON.stringify({
  type: 'Program',
  span: {
    start: 0,
    end: 13
  },
  body: [
    {
      type: 'VariableDeclaration',
      span: {
        start: 0,
        end: 13
      },
      declarations: [
        {
          type: 'VariableDeclarator',
          span: {
            start: 6,
            end: 13
          },
          id: {
            type: 'Identifier',
            span: {
              start: 6,
              end: 7
            },
            value: 'a'
          },
          init: {
            type: 'Literal',
            span: {
              start: 10,
              end: 13
            },
            value: 111
          }
        }
      ],
      kind: 'const'
    }
  ]
})

describe('assignment', () => {
  it('const assignment', () => {
    expect(
      JSON.stringify(
        parse('const a = 111', {
          ecmaVersion: '6'
        })
      )
    ).equal(t_constAssignment)
  })
})
