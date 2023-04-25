import { IImageManager } from './imageManager'
import { PillChunk, VirusChunk, VisualElement } from './models'

let lastId = 0

export interface IPillManager {
  elements: VisualElement[]
  currentChunks: PillChunk[]
  pills: () => PillChunk[]
  virusChunks: () => VirusChunk[]
  nextPill: PillChunk[]
  removedVirus: number
  generatePill: () => void
  next: () => void
  generateVirus: (count: number) => void
  move: (x: number, y: number) => void
  moveDown: () => void
  rotate: () => void
  rotateRight: () => void
  clearPills: () => number
  clear: () => VisualElement[]
  hasRemovable: () => boolean
  fallDown: (row: number) => number
}

export default class PillManager implements IPillManager {
  public elements: VisualElement[] = []
  public currentChunks: PillChunk[] = []
  public pills = (): PillChunk[] =>
    this.elements.filter((x) => (<PillChunk>x).id !== undefined).map((x) => <PillChunk>x)
  public virusChunks = (): VirusChunk[] =>
    this.elements.filter((x) => (<PillChunk>x).id === undefined).map((x) => <VirusChunk>x)
  public nextPill: PillChunk[] = []
  public removedVirus = 0
  private toRemove: VisualElement[] = []

  constructor(
    private readonly colors: string[],
    private readonly maxRow: number,
    private readonly maxColumns: number,
    private readonly imageManager: IImageManager
  ) {}

  private randomColor = (): string => this.colors[Math.floor(Math.random() * this.colors.length)]

  generatePill(): void {
    this.nextPill = [
      { id: lastId, color: this.randomColor(), row: 0, column: 0, canMove: true, image: '' },
      { id: lastId, color: this.randomColor(), row: 0, column: 1, canMove: true, image: '' },
    ]

    lastId++
  }

  next(): void {
    this.currentChunks = this.nextPill
    this.currentChunks[0].column = 3
    this.currentChunks[0].row = 0
    this.currentChunks[1].column = 4
    this.currentChunks[1].row = 0

    this.imageManager.setCurrentPillImages(this.currentChunks)
    if (this.elements.some((x) => (x.column == 3 || x.column == 4) && x.row == 0)) {
      throw new Error('Game over')
    }
    this.elements.push(...this.currentChunks)
    this.generatePill()
  }

  generateVirus(count: number): void {
    for (let i = 0; i < count; i++) {
      const row = Math.floor(Math.random() * (this.maxRow / 2) + this.maxRow / 2)
      const column = Math.floor(Math.random() * this.maxColumns)

      const color = this.randomColor()

      this.elements.push({ row, column, color, image: this.imageManager.getVirus(color) })
    }
  }

  move(x: number, y: number): void {
    const leftChunk =
      this.currentChunks[0].column < this.currentChunks[1].column
        ? this.currentChunks[0]
        : this.currentChunks[1]
    const rightChunk = this.currentChunks.find((x) => x !== leftChunk)

    if (
      rightChunk.column + x < this.maxColumns &&
      !this.checkCollision(rightChunk, x, y) &&
      leftChunk.column + x >= 0 &&
      !this.checkCollision(leftChunk, x, y)
    ) {
      this.currentChunks.forEach((chunk) => {
        chunk.column += x
      })
    }
  }

  private checkCollision(chunk: PillChunk, x: number, y: number): boolean {
    return this.elements.some(
      (pill) =>
        pill.column == chunk.column + x &&
        chunk.row + y == pill.row &&
        !this.currentChunks.some((chunk) => chunk == pill)
    )
  }

  moveDown(): void {
    const pillCollision =
      this.currentChunks.some((x) => !x.canMove || x.row == this.maxRow - 1) ||
      this.currentChunks.some((curr) =>
        this.pills().some(
          (pill) =>
            curr.column == pill.column &&
            curr.row == pill.row - 1 &&
            !this.currentChunks.includes(pill)
        )
      )
    const virusCollision = this.currentChunks.some((chunk) =>
      this.virusChunks().some((x) => x.row == chunk.row + 1 && x.column == chunk.column)
    )

    if (pillCollision || virusCollision) {
      this.currentChunks.forEach((x) => (x.canMove = false))
      this.currentChunks = []
    }

    this.currentChunks.forEach((chunk) => {
      chunk.row++
      chunk.canMove = !this.pills().some(
        (x) => x.column == chunk.column && x.row == chunk.row + 1 && !this.currentChunks.includes(x)
      )
    })
  }

  rotate(): void {
    const movingChunk = this.currentChunks
      .slice(0)
      .sort((a, b) => b.column - a.column)
      .sort((a, b) => a.row - b.row)[0]

    const otherChunk = this.currentChunks.find((x) => x !== movingChunk)
    let xChange = movingChunk.column > otherChunk.column ? -1 : 0
    let yChange = movingChunk.row < otherChunk.row ? 1 : -1

    movingChunk.column += xChange
    movingChunk.row += yChange
    if (xChange == 0) {
      otherChunk.column++
    }

    if (otherChunk.column >= this.maxColumns || movingChunk.column >= this.maxColumns) {
      this.move(-1, 0)
    }

    this.imageManager.setCurrentPillImages(this.currentChunks)
  }

  rotateRight() {
    const movingChunk = this.currentChunks
      .slice(0)
      .sort((a, b) => b.column - a.column)
      .sort((a, b) => a.row - b.row)[0]

    const otherChunk = this.currentChunks.find((x) => x !== movingChunk)
    let xChange = movingChunk.column > otherChunk.column ? -1 : 0
    let yChange = movingChunk.row < otherChunk.row ? 1 : -1

    movingChunk.column += xChange
    movingChunk.row += yChange
    if (xChange == 0) {
      otherChunk.column++
    }

    if (otherChunk.column >= this.maxColumns || movingChunk.column >= this.maxColumns) {
      this.move(1, 0)
    }

    this.imageManager.setCurrentPillImages(this.currentChunks)
  }

  clearPills(): number {
    const toRemove: VisualElement[] = []

    this.elements.forEach((pill) => {
      let removable = this.elements
        .filter((x) => x.color == pill.color)
        .filter((x) => x.row == pill.row)
      removable = removable.filter(
        (x) =>
          x.column == pill.column + 1 || x.column == pill.column + 2 || x.column == pill.column + 3
      )

      if (removable.length == 3) {
        toRemove.push(...removable, pill)
      }
    })

    this.elements.forEach((pill) => {
      let removable = this.elements
        .filter((x) => x.color == pill.color)
        .filter((x) => x.column == pill.column)
      removable = removable.filter(
        (x) => x.row == pill.row + 1 || x.row == pill.row + 2 || x.row == pill.row + 3
      )
      if (removable.length == 3) {
        toRemove.push(...removable, pill)
      }
    })
    this.removedVirus += toRemove.filter((x) => (<PillChunk>x).id === undefined).length
    this.toRemove = toRemove

    return toRemove.length
  }

  clear(): VisualElement[] {
    this.elements = this.elements.filter((x) => !this.toRemove.some((y) => x == y))
    this.imageManager.setPillImages(this.pills())
    this.imageManager.setDelete(this.toRemove)
    return this.toRemove
  }

  hasRemovable = (): boolean => this.toRemove.length > 0

  fallDown(row: number): number {
    if (row >= this.maxRow - 1) {
      return 0
    }
    const cells = this.pills().filter((x) => x.row == row)

    let fallenCells = 0

    cells.forEach((pill) => {
      if (pill.row >= this.maxRow - 1) {
        return
      }

      const secondPill = this.pills().find((x) => x.id == pill.id && x !== pill)

      if (this.elements.some((x) => x.column == pill.column && x.row == pill.row + 1)) {
        return
      }

      if (secondPill) {
        if (this.elements.some((x) => x.column == secondPill.column && x.row == pill.row + 1)) {
          return
        }
      }

      pill.row++
      if (secondPill) {
        secondPill.row++
      }
      fallenCells++
    })

    return fallenCells
  }
}
