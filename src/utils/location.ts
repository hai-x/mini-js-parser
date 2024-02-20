export class Loc {
  column: number
  line: number

  constructor(line: number, col: number) {
    this.line = line
    this.column = col
  }

  extends(pos: number) {
    return new Loc(this.line, this.column + pos)
  }
}
