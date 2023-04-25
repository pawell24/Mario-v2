export interface Cell {
  row: number
  column: number
  element?: HTMLDivElement
}

export interface VisualElement {
  color: string
  row: number
  column: number
  image: string
}

export interface PillChunk extends VisualElement {
  id: number
  canMove: boolean
}

export interface VirusChunk extends VisualElement {}

export class CovidImage {
  color: string
  frame: number = 1
  maxFrame: number
  image = new Image(50, 50)
  position: number = 0
  maxPosition: number

  constructor(color: string, maxFrame: number, position: number, maxPosition: number) {
    this.color = color
    this.maxPosition = maxPosition
    this.position = position
    this.maxFrame = maxFrame
  }

  nextFrame(): void {
    this.frame++
    if (this.frame > this.maxFrame) {
      this.frame = 1
    }
  }

  nextPosition() {
    this.position++
    if (this.position > this.maxPosition) {
      this.position = 0
    }
  }
}
