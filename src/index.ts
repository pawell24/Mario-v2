import PillManager from './pillManager'
import ImageManager from './imageManager'
import UIManager from './uiManager'

/**
 * Max number of columns
 */
const MAX_X = 8
/**
 * Max number of rows
 */
const MAX_Y = 15

/**
 * Used colors
 */
const COLORS = ['brown', 'blue', 'yellow']

const imageManager = new ImageManager()
const pillManager = new PillManager(COLORS, MAX_Y, MAX_X, imageManager)
const uiManager = new UIManager(MAX_X, MAX_Y, COLORS, imageManager)

uiManager.generateCells()

/**
 * Moves all possible pills down and waits 100ms
 * @param i falling rows number
 * @returns Promise
 */
const fallPills = (i: number): Promise<number> =>
  new Promise<number>((resolve, reject) => {
    const count = pillManager.fallDown(i)

    if (count == 0) {
      resolve(count)
      return
    }

    setTimeout(() => {
      resolve(count)
    }, 100)
  })

/**
 * Shows images of deleted pills and viruses, waits 150ms if anything can be removed
 * @returns Promise
 */
const showDelete = (): Promise<any> =>
  new Promise<any>((resolve, reject) => {
    if (pillManager.hasRemovable()) {
      uiManager.refreshCells(pillManager.elements)
      pillManager.clear().forEach((x) => {
        const cell = uiManager.getCell(x)

        cell.element.style.backgroundImage = `url(${x.image})`
      })

      setTimeout(() => {
        uiManager.refreshCells(pillManager.elements)
        resolve(null)
      }, 150)
    } else {
      resolve(null)
    }
  })

/**
 * Moves current pills down, checks if they collide on bottom, ends game of new pill cannot move,
 * Executes another time after 750ms
 */
const movePills = async () => {
  if (pillManager.currentChunks.length < 1) {
    do {
      await showDelete()
      let fall = 0
      do {
        fall = 0
        for (let i = MAX_Y - 2; i >= 0; i--) {
          fall += await fallPills(i)
        }
        uiManager.refreshCells(pillManager.elements)
      } while (fall > 0)
    } while (pillManager.clearPills() > 0)
    uiManager.updateScore(pillManager.removedVirus)
    pillManager.removedVirus = 0
    uiManager.updateVirus(pillManager.virusChunks().length)
    if (pillManager.virusChunks().length < 1) {
      pillManager.elements = []
      pillManager.nextPill = []
      pillManager.currentChunks = []
      uiManager.refreshCells(pillManager.elements)
      await uiManager.showNextLevelScreen()
      uiManager.level++
      start().then(() => movePills())
      return
    }
    try {
      await uiManager.animateNextPills()
      pillManager.next()
      uiManager.renderNextPill(pillManager.nextPill)
    } catch (err) {
      uiManager.gameOver()
      return
    }
  }
  uiManager.refreshCells(pillManager.elements)
  pillManager.moveDown()

  setTimeout(() => movePills(), 750)
}

/**
 * Refreshes the game, generates viruses, updates score and virus, and also generates new pill
 * @returns Promise
 */
const start = async (): Promise<any> => {
  uiManager.updateScore(0)
  uiManager.updateLevel()
  pillManager.generateVirus(Math.ceil(Math.random() * 2) + 2)
  pillManager.generatePill()
  uiManager.refreshCells(pillManager.elements)
  uiManager.updateVirus(pillManager.virusChunks().length)
  uiManager.renderNextPill(pillManager.nextPill)
  await uiManager.animateNextPills()
  pillManager.next()
  uiManager.renderNextPill(pillManager.nextPill)
  return new Promise<any>((res) => res(null))
}

/**
 * Adds event listeners to movement keyboard clicks
 */
const setMovement = () => {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (uiManager.blockMove) {
      return
    }
    if (pillManager.currentChunks.length < 1) {
      return
    }

    if (e.key == 's') {
      pillManager.moveDown()
    } else if (e.key == 'a') {
      pillManager.move(-1, 0)
    } else if (e.key == 'd') {
      pillManager.move(1, 0)
    } else if (e.key == 'w') {
      pillManager.rotate()
    } else if (e.key == 'Shift') {
      pillManager.rotateRight()
    }
    uiManager.refreshCells(pillManager.elements)
  })
}

uiManager.animateCovids()
setMovement()
start().then(() => {
  movePills()
})
