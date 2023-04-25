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

  setNextFrame(): void {
    this.frame++
    if (this.frame > this.maxFrame) {
      this.frame = 1
    }
  }

  setNextPosition() {
    this.position++
    if (this.position > this.maxPosition) {
      this.position = 0
    }
  }
}
