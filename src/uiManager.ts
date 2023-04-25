import { IImageManager } from "./imageManager"
import { Cell, CovidImage, PillChunk, VisualElement } from "./models"

const ANIMATION_POSITIONS: { x: number, y: number }[] = [{ x: 30, y: 30 }, { x: 130, y: 100 }, { x: 20, y: 140 }]


/**
 * Abstraction for UI manager
 */
export interface IUIManager {
    container: HTMLDivElement
    scoreContainer: HTMLParagraphElement
    highScoreContainer: HTMLParagraphElement
    virusCountContainer: HTMLParagraphElement
    levelContainer: HTMLParagraphElement
    covidCanvas: HTMLCanvasElement
    nextPillContainer: HTMLDivElement
    gameOverScreen: HTMLDivElement
    nextLevelScreen: HTMLDivElement
    gameOverDr: HTMLDivElement
    handUpContainer: HTMLDivElement
    handMidContainer: HTMLDivElement
    handDownContainer: HTMLDivElement
    score: number,
    highScore: number,
    level: number,
    cells: Cell[],
    covidImages: CovidImage[],
    stopAnimation: boolean,
    blockMove: boolean,
    generateCells: () => void,
    animateCovids: () => void,
    showNextLevelScreen: () => Promise<any>,
    getCell: (pill: VisualElement) => Cell,
    renderNextPill: (pills: PillChunk[]) => void,
    animateNextPills: () => Promise<any>
    refreshCells: (elements: VisualElement[]) => void,
    updateScore: (count: number) => void,
    updateLevel: () => void,
    updateVirus: (count: number) => void,
    gameOver: () => void
}

/**
 * Class that manages ui elements
 */
export default class UIManager implements IUIManager {
    container!: HTMLDivElement
    scoreContainer!: HTMLParagraphElement
    highScoreContainer!: HTMLParagraphElement
    virusCountContainer!: HTMLParagraphElement
    levelContainer!: HTMLParagraphElement
    covidCanvas!: HTMLCanvasElement
    nextPillContainer!: HTMLDivElement
    gameOverScreen!: HTMLDivElement
    nextLevelScreen!: HTMLDivElement
    gameOverDr!: HTMLDivElement
    handUpContainer!: HTMLDivElement
    handMidContainer!: HTMLDivElement
    handDownContainer!: HTMLDivElement

    /**
     * Current player score
     */
    score = 0
    /**
     * Biggest player score
     */
    highScore = 0
    /**
     * Current level
     */
    level = 0

    /**
     * Cells used in game
     */
    cells: Cell[] = []
    /**
     * Images used in down left animation 
     */
    covidImages: CovidImage[] = []
    //** Marks to stop animating */
    stopAnimation = false
    /** Marks to disable player movement */
    blockMove = false

    /**
     * 
     * @param maxX number of columns
     * @param maxY number of rows
     * @param colors colors used by pills and covids
     * @param imageManager image managing service
     */
    constructor(private readonly maxX,
        private readonly maxY,
        private readonly colors: string[],
        private readonly imageManager: IImageManager
    ) {
        this.container = <HTMLDivElement>document.getElementById('container')
        this.scoreContainer = <HTMLParagraphElement>document.getElementById('score')
        this.highScoreContainer = <HTMLParagraphElement>document.getElementById('top-score')
        this.virusCountContainer = <HTMLParagraphElement>document.getElementById('virus')
        this.levelContainer = <HTMLParagraphElement>document.getElementById('level')
        this.covidCanvas = <HTMLCanvasElement>document.getElementById('virus-canvas')
        this.nextPillContainer = <HTMLDivElement>document.getElementById('next-pill')
        this.gameOverScreen = <HTMLDivElement>document.getElementById('game-over')
        this.nextLevelScreen = <HTMLDivElement>document.getElementById('next-level')
        this.gameOverDr = <HTMLDivElement>document.getElementById('game-over-dr')
        this.handUpContainer = <HTMLDivElement>document.getElementById('hand')
        this.handMidContainer = <HTMLDivElement>document.getElementById('hand-middle')
        this.handDownContainer = <HTMLDivElement>document.getElementById('hand-down')

        this.highScore = parseInt(localStorage.getItem('score') ?? '0')
        this.covidImages = colors.map((col, index) => new CovidImage(col, 4, index, ANIMATION_POSITIONS.length - 1))
    }

    /** Generates cells */
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

    /** Starts animating left down covids every 500ms until its called to stop */
    animateCovids = (): void => {
        if (this.stopAnimation) {
            return
        }
        const ctx = this.covidCanvas.getContext('2d')
        ctx.clearRect(0, 0, this.covidCanvas.width, this.covidCanvas.height)


        this.covidImages.forEach(img => {
            img.nextFrame()
            img.nextPosition()

            img.image.src = this.imageManager.getCovid(img.color, img.frame)

            ctx.drawImage(img.image, ANIMATION_POSITIONS[img.position].x, ANIMATION_POSITIONS[img.position].y)
        })

        setTimeout(() => {
            this.animateCovids()
        }, 500);
    }

    /**
     * Shows stage completed screen for 1s
     * @returns Promise
     */
    showNextLevelScreen = (): Promise<any> => new Promise((resolve) => {
        this.nextLevelScreen.style.display = 'block'

        setTimeout(() => {
            this.nextLevelScreen.style.display = 'none'
            resolve(null)
        }, 1000);
    })

    /**
     * Gets cell by given element column and row
     * @param pill element to check
     * @returns cell
     */
    getCell = (pill: VisualElement): Cell => this.cells.find(x => x.column == pill.column && x.row == pill.row)

    renderNextPill(pills: PillChunk[]) {
        this.nextPillContainer.innerHTML = ''

        this.imageManager.setCurrentPillImages(pills)

        pills.forEach(p => {
            const cell = document.createElement('div')
            cell.classList.add('cell')
            cell.style.backgroundImage = `url(${p.image})`
            this.nextPillContainer.appendChild(cell)
        })
    }

    /**
     * Starts animation of dr Mario throwing next pill to jar
     * @returns Promise
     */
    animateNextPills = (): Promise<any> => new Promise((resolve) => {
        let y = 100
        let x = 900
        let moveDown = false
        let moveLeft = false
        const time = 30
        this.blockMove = true

        this.handUpContainer.style.display = 'none'
        this.handMidContainer.style.display = 'block'

        setTimeout(() => {
            this.handMidContainer.style.display = 'none'
            this.handDownContainer.style.display = 'block'
        }, 100);

        this.nextPillContainer.style.animationName = 'nextPill'

        const moveUpInterval = setInterval(() => {
            y -= 10
            this.nextPillContainer.style.top = `${y}px`
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

            this.nextPillContainer.style.left = `${x}px`
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
                this.nextPillContainer.style.animationName = ''
            }

            this.nextPillContainer.style.top = `${y}px`
            if (y >= 200) {
                clearInterval(moveDownInterval)
                this.nextPillContainer.style.top = '120px'
                this.nextPillContainer.style.left = '900px'
                this.nextPillContainer.style.animationName = ''
                this.handDownContainer.style.display = 'none'
                this.handUpContainer.style.display = 'block'
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
        this.cells.forEach(cell => {
            cell.element.style.backgroundColor = 'black'
            cell.element.style.backgroundImage = ''
        })

        elements.forEach(el => {
            const cell = this.getCell(el)
            cell.element.style.backgroundImage = `url(${el.image})`
        })
    }

    /**
     * Updates score and high score
     * @param count number of removed covids
     */
    updateScore(count: number): void {
        this.score += count * 100
        this.scoreContainer.innerHTML = ''

        this.score.toString().split('').forEach(num => {
            const img = document.createElement('img')
            img.src = this.imageManager.getNumber(num)

            this.scoreContainer.appendChild(img)
        })
        if (this.score > this.highScore) {
            this.highScore = this.score
            localStorage.setItem('score', this.highScore.toString())
        }

        this.highScoreContainer.innerHTML = ''

        this.highScore.toString().split('').forEach(num => {
            const img = document.createElement('img')
            img.src = this.imageManager.getNumber(num)

            this.highScoreContainer.appendChild(img)
        })
    }

    /**
     * Uptadates next level screen
     */
    updateLevel(): void {
        this.levelContainer.innerHTML = ''
        this.level.toString().split('').forEach(num => {
            const img = document.createElement('img')
            img.src = this.imageManager.getNumber(num)

            this.levelContainer.appendChild(img)
        })
    }
    /**
     * Updates covid count on right
     * @param count current number of covids
     */
    updateVirus(count: number): void {
        this.virusCountContainer.innerHTML = ''

        count.toString().split('').forEach(x => {
            const img = new Image()
            img.src = this.imageManager.getNumber(x)
            this.virusCountContainer.appendChild(img)
        })
    }

    /**
     * Blocks player movement and displays game over screen
     */
    gameOver(): void {
        this.gameOverScreen.style.display = 'block'
        this.gameOverDr.style.display = 'block'
        this.stopAnimation = true
        this.blockMove = true
    }
}