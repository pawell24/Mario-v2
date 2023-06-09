import { Cell, PillChunk, VisualElement, IImageManager } from './interfaces'
import { ANIMATION_CORDINATES } from './constants'
import { CovidImage } from './covidImage'

export interface IUIManager {
  container: HTMLDivElement
  scoreContainer: HTMLParagraphElement
  highScoreEl: HTMLParagraphElement
  virusCountEl: HTMLParagraphElement
  levelEl: HTMLParagraphElement
  covidCanvas: HTMLCanvasElement
  nextPillEl: HTMLDivElement
  gameOverScreen: HTMLDivElement
  nextLevelScreen: HTMLDivElement
  gameOverDr: HTMLDivElement
  handUpEl: HTMLDivElement
  handMidEl: HTMLDivElement
  handDownEl: HTMLDivElement
  score: number
  highScore: number
  level: number
  cells: Cell[]
  covidImages: CovidImage[]
  stopAnimation: boolean
  blockMove: boolean
  generateCells: () => void
  animateCovids: () => void
  showNextLevelScreen: () => Promise<any>
  getCell: (pill: VisualElement) => Cell
  renderNextPill: (pills: PillChunk[]) => void
  animateNextPills: () => Promise<any>
  refreshCells: (elements: VisualElement[]) => void
  updateScore: (count: number) => void
  updateLevel: () => void
  updateVirus: (count: number) => void
  gameOver: () => void
}

export default class UIManager implements IUIManager {
  container!: HTMLDivElement
  scoreContainer!: HTMLParagraphElement
  highScoreEl!: HTMLParagraphElement
  virusCountEl!: HTMLParagraphElement
  levelEl!: HTMLParagraphElement
  covidCanvas!: HTMLCanvasElement
  nextPillEl!: HTMLDivElement
  gameOverScreen!: HTMLDivElement
  nextLevelScreen!: HTMLDivElement
  gameOverDr!: HTMLDivElement
  handUpEl!: HTMLDivElement
  handMidEl!: HTMLDivElement
  handDownEl!: HTMLDivElement

  score = 0
  highScore = 0
  level = 0
  cells: Cell[] = []
  covidImages: CovidImage[] = []
  stopAnimation = false
  blockMove = false

  constructor(
    private readonly maxX,
    private readonly maxY,
    private readonly colors: string[],
    private readonly imageManager: IImageManager
  ) {
    this.container = <HTMLDivElement>document.getElementById('container')
    this.scoreContainer = <HTMLParagraphElement>document.getElementById('score')
    this.highScoreEl = <HTMLParagraphElement>document.getElementById('top-score')
    this.virusCountEl = <HTMLParagraphElement>document.getElementById('virus')
    this.levelEl = <HTMLParagraphElement>document.getElementById('level')
    this.covidCanvas = <HTMLCanvasElement>document.getElementById('virus-canvas')
    this.nextPillEl = <HTMLDivElement>document.getElementById('next-pill')
    this.gameOverScreen = <HTMLDivElement>document.getElementById('game-over')
    this.nextLevelScreen = <HTMLDivElement>document.getElementById('next-level')
    this.gameOverDr = <HTMLDivElement>document.getElementById('game-over-dr')
    this.handUpEl = <HTMLDivElement>document.getElementById('hand')
    this.handMidEl = <HTMLDivElement>document.getElementById('hand-middle')
    this.handDownEl = <HTMLDivElement>document.getElementById('hand-down')

    this.highScore = parseInt(localStorage.getItem('score') ?? '0')
    this.covidImages = colors.map(
      (col, index) => new CovidImage(col, 4, index, ANIMATION_CORDINATES.length - 1)
    )
  }

  generateCells(): void {
    for (let i = 0; i < this.maxY; i++) {
      const row = document.createElement('div')
      row.classList.add('row')
      for (let j = 0; j < this.maxX; j++) {
        const cell = document.createElement('div')
        cell.classList.add('cell')
        row.appendChild(cell)
        this.cells.push({ column: j, row: i, element: cell })
      }
      this.container.appendChild(row)
    }
  }

  animateCovids = (): void => {
    if (this.stopAnimation) {
      return
    }
    const ctx = this.covidCanvas.getContext('2d')
    ctx.clearRect(0, 0, this.covidCanvas.width, this.covidCanvas.height)

    this.covidImages.forEach((img) => {
      img.setNextFrame()
      img.setNextPosition()

      img.image.src = this.imageManager.getCovidImg(img.color, img.frame)

      ctx.drawImage(
        img.image,
        ANIMATION_CORDINATES[img.position].x,
        ANIMATION_CORDINATES[img.position].y
      )
    })

    setTimeout(() => {
      this.animateCovids()
    }, 500)
  }

  showNextLevelScreen = (): Promise<any> =>
    new Promise((resolve) => {
      this.nextLevelScreen.style.display = 'block'

      setTimeout(() => {
        this.nextLevelScreen.style.display = 'none'
        resolve(null)
      }, 1000)
    })

  getCell = (pill: VisualElement): Cell =>
    this.cells.find((x) => x.column == pill.column && x.row == pill.row)

  renderNextPill(pills: PillChunk[]) {
    this.nextPillEl.innerHTML = ''

    this.imageManager.setCurrentPillImgs(pills)

    pills.forEach((p) => {
      const cell = document.createElement('div')
      cell.classList.add('cell')
      cell.style.backgroundImage = `url(${p.image})`
      this.nextPillEl.appendChild(cell)
    })
  }

  animateNextPills = (): Promise<any> =>
    new Promise((resolve) => {
      let y = 100
      let x = 900
      let moveDown = false
      let moveLeft = false
      const time = 30
      this.blockMove = true

      this.handUpEl.style.display = 'none'
      this.handMidEl.style.display = 'block'

      setTimeout(() => {
        this.handMidEl.style.display = 'none'
        this.handDownEl.style.display = 'block'
      }, 100)

      this.nextPillEl.style.animationName = 'nextPill'

      const moveUpInterval = setInterval(() => {
        y -= 10
        this.nextPillEl.style.top = `${y}px`
        if (y <= 40) {
          moveLeft = true
        }
        if (y <= 20) {
          clearInterval(moveUpInterval)
          moveLeft = true
        }
      }, time)

      const moveLeftInterval = setInterval(() => {
        if (!moveLeft) {
          return
        }

        x -= 10

        this.nextPillEl.style.left = `${x}px`
        if (x <= 660) {
          moveDown = true
        }

        if (x <= 610) {
          clearInterval(moveLeftInterval)
          moveDown = true
        }
      }, time)

      const moveDownInterval = setInterval(() => {
        if (!moveDown) {
          return
        }

        y += 10

        if (y >= 150) {
          this.nextPillEl.style.animationName = ''
        }

        this.nextPillEl.style.top = `${y}px`
        if (y >= 200) {
          clearInterval(moveDownInterval)
          this.nextPillEl.style.top = '120px'
          this.nextPillEl.style.left = '900px'
          this.nextPillEl.style.animationName = ''
          this.handDownEl.style.display = 'none'
          this.handUpEl.style.display = 'block'
          this.blockMove = false
          resolve(null)
        }
      }, time)
    })

  /**
   * Rerenders pills in the jar
   * @param elements elements to rerender
   */
  refreshCells(elements: VisualElement[]): void {
    this.cells.forEach((cell) => {
      cell.element.style.backgroundColor = 'black'
      cell.element.style.backgroundImage = ''
    })

    elements.forEach((el) => {
      const cell = this.getCell(el)
      cell.element.style.backgroundImage = `url(${el.image})`
    })
  }

  updateScore(count: number): void {
    this.score += count * 100
    this.scoreContainer.innerHTML = ''

    this.score
      .toString()
      .split('')
      .forEach((num) => {
        const img = document.createElement('img')
        img.src = this.imageManager.getNumberImg(num)

        this.scoreContainer.appendChild(img)
      })
    if (this.score > this.highScore) {
      this.highScore = this.score
      localStorage.setItem('score', this.highScore.toString())
    }

    this.highScoreEl.innerHTML = ''

    this.highScore
      .toString()
      .split('')
      .forEach((num) => {
        const img = document.createElement('img')
        img.src = this.imageManager.getNumberImg(num)

        this.highScoreEl.appendChild(img)
      })
  }

  updateLevel(): void {
    this.levelEl.innerHTML = ''
    this.level
      .toString()
      .split('')
      .forEach((num) => {
        const img = document.createElement('img')
        img.src = this.imageManager.getNumberImg(num)

        this.levelEl.appendChild(img)
      })
  }

  updateVirus(count: number): void {
    this.virusCountEl.innerHTML = ''

    count
      .toString()
      .split('')
      .forEach((x) => {
        const img = new Image()
        img.src = this.imageManager.getNumberImg(x)
        this.virusCountEl.appendChild(img)
      })
  }

  gameOver(): void {
    this.gameOverScreen.style.display = 'block'
    this.gameOverDr.style.display = 'block'
    this.stopAnimation = true
    this.blockMove = true
  }
}
