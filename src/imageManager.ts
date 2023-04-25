import { PillChunk, VirusChunk, VisualElement } from './models'

/**
 * Abstraction for image manager
 */
export interface IImageManager {
  getVirus: (color: string) => string
  getPill: (pill: PillChunk) => string
  getPillLeft: (pill: PillChunk) => string
  setCurrentPillImages: (pills: PillChunk[]) => void
  setPillImages: (pills: PillChunk[]) => void
  setDelete: (elements: VisualElement[]) => void
  getNumber: (num: string) => string
  getCovid: (color: string, num: number) => string
  getPillTop: (pill: PillChunk) => string
  getPillDown: (pill: PillChunk) => string
}

/**
 * Class for getting image paths
 * @class
 */
export default class ImageManager implements IImageManager {
  /**
   * Returns path for covid image of given color
   * @param color color of wanted virus
   * @returns path to file
   */
  getVirus(color: string): string {
    return `img/covid_${color}.png`
  }

  /**
   * Returns path to dot pill image of given color
   * @param color color of desired pill
   * @returns path to file
   */
  getPill(pill: PillChunk): string {
    return `img/${pill.color}_dot.png`
  }

  /**
   * Returns path to left part of pill image
   * @param pill pill with wanted color
   * @returns path to file
   */
  getPillLeft(pill: PillChunk): string {
    return `img/${pill.color}_left.png`
  }

  /**
   * Changes images of two pills to change their images to ones fitting their position
   * @param pills pills to modify
   * @example
   * Sets most right pill right pill image
   */
  setCurrentPillImages(pills: PillChunk[]): void {
    const left = pills[0].column < pills[1].column ? pills[0] : pills[1]
    const right = pills.find((x) => x !== left)
    if (left.row < right.row) {
      left.image = `img/${left.color}_up.png`
      right.image = `img/${right.color}_down.png`
    } else if (left.row > right.row) {
      right.image = `img/${right.color}_up.png`
      left.image = `img/${left.color}_down.png`
    } else {
      left.image = `img/${left.color}_left.png`
      right.image = `img/${right.color}_right.png`
    }
  }

  /**
   * Sets fitting images to all given pills
   * @param pills pills
   */
  setPillImages(pills: PillChunk[]): void {
    pills.forEach((pill) => {
      if (pills.some((x) => x.id == pill.id && x != pill)) {
        return
      }
      pill.image = `img/${pill.color}_dot.png`
    })
  }

  /**
   * Sets delete images to given elements
   * @param elements elements to change
   */
  setDelete(elements: VisualElement[]) {
    const pills: PillChunk[] = elements
      .filter((x) => (<PillChunk>x).id !== undefined)
      .map((x) => <PillChunk>x)
    const virus: VirusChunk[] = elements
      .filter((x) => (<PillChunk>x).id === undefined)
      .map((x) => <VirusChunk>x)

    pills.forEach((pill) => {
      pill.image = `img/${pill.color}_o.png`
    })

    virus.forEach((v) => {
      v.image = `img/${v.color}_x.png`
    })
  }

  /**
   * Returns number image
   * @param num desired number
   * @returns path to file
   */
  getNumber(num: string): string {
    return `img/cyfry/${num}.png`
  }

  /**
   * Returns path to file with glass covid image
   * @param color desired color
   * @param num desired image number
   * @returns path to file
   */
  getCovid(color: string, num: number): string {
    return `img/lupa/${color}/${num}.png`
  }

  /**
   * Returns image with pill top
   * @param pill pill
   * @returns
   */
  getPillTop(pill: PillChunk): string {
    return `img/${pill.color}_up.png`
  }

  /**
   * Returns image with down pill image
   * @param pill pill
   * @returns file path
   */
  getPillDown(pill: PillChunk): string {
    return `img/${pill.color}_down.png`
  }
}
