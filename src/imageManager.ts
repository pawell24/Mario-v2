import { PillChunk, VirusChunk, VisualElement, IImageManager } from './interfaces'

export default class ImageManager implements IImageManager {
  getVirusImg(color: string): string {
    return `img/covid_${color}.png`
  }

  getPillImg(pill: PillChunk): string {
    return `img/${pill.color}_dot.png`
  }

  getPillLeftImg(pill: PillChunk): string {
    return `img/${pill.color}_left.png`
  }

  setCurrentPillImgs(pills: PillChunk[]): void {
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

  deleteImgs(elements: VisualElement[]) {
    const pills: PillChunk[] = elements
      .filter((x) => (<PillChunk>x).id !== undefined)
      .map((x) => <PillChunk>x)
    const virus: VirusChunk[] = elements
      .filter((x) => (<PillChunk>x).id === undefined)
      .map((x) => <VirusChunk>x)

    pills.forEach((pill) => {
      pill.image = `img/${pill.color}_o.png`
    })

    virus.forEach((vir) => {
      vir.image = `img/${vir.color}_x.png`
    })
  }

  setNewPillImgs(pills: PillChunk[]): void {
    pills.forEach((pill) => {
      if (pills.some((x) => x.id == pill.id && x != pill)) {
        return
      }
      pill.image = `img/${pill.color}_dot.png`
    })
  }

  getPillTopImg(pill: PillChunk): string {
    return `img/${pill.color}_up.png`
  }

  getPillDownImg(pill: PillChunk): string {
    return `img/${pill.color}_down.png`
  }

  getCovidImg(color: string, num: number): string {
    return `img/lupa/${color}/${num}.png`
  }

  getNumberImg(num: string): string {
    return `img/cyfry/${num}.png`
  }
}
