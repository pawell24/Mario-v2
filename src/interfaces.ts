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

export interface IImageManager {
  getVirusImg: (color: string) => string
  getPillImg: (pill: PillChunk) => string
  getPillLeftImg: (pill: PillChunk) => string
  setCurrentPillImgs: (pills: PillChunk[]) => void
  setNewPillImgs: (pills: PillChunk[]) => void
  deleteImgs: (elements: VisualElement[]) => void
  getNumberImg: (num: string) => string
  getCovidImg: (color: string, num: number) => string
  getPillTopImg: (pill: PillChunk) => string
  getPillDownImg: (pill: PillChunk) => string
}

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
