/**
 * Interface for combining cell div and its position
 * @property row - cell row
 * @property column - cell column
 * @property element - html element with cell
 * @interface
 */
export interface Cell {
    row: number,
    column: number,
    element?: HTMLDivElement
}

/**
 * Interface for marking elements that are displayed on the cell, they contain row and column
 * @property color - element color
 * @property row - element row
 * @property column - element column
 * @property image - current image of element, can be empty
 * @interface
 */
export interface VisualElement {
    color: string,
    row: number,
    column: number
    image: string
}

/**
 * Interface representing one part of pill
 * @property id - id of pill
 * @property canMove - does chunk have the ability to move down
 * @interface
 */
export interface PillChunk extends VisualElement {
    id: number,
    canMove: boolean,
}

/**
 * Interface marking visual element as a virus
 * @interface
  */
export interface VirusChunk extends VisualElement { }

/**
 * Class containing info about covid image
 */
export class CovidImage {
    /** Color of covid */
    color: string
    /** Current image frame
     * @default 1
     */
    frame: number = 1
    //** Maximal frame of image */
    maxFrame: number
    //** img element with image */
    image = new Image(50, 50)
    /** Current index of position on canvas
     * @default 0
     */
    position: number = 0
    /** Maximal possible position of image */
    maxPosition: number

    /**
     * @param color image color
     * @param maxFrame number of frame images - 1
     * @param position index od current position on canvas
     * @param maxPosition maximal possible position on canvas
     */
    constructor(color: string, maxFrame: number, position: number, maxPosition: number) {
        this.color = color
        this.maxPosition = maxPosition
        this.position = position
        this.maxFrame = maxFrame
    }

    /**
     * Changes image frame to next one, returns back to first of grater than max
     */
    nextFrame(): void {
        this.frame++
        if (this.frame > this.maxFrame) {
            this.frame = 1
        }
    }

    /**
     * Moves image to next position on canvas, returns to 0 if index is grater than max position
     */
    nextPosition() {
        this.position++
        if (this.position > this.maxPosition) {
            this.position = 0
        }
    }
}