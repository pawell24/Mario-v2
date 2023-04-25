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
