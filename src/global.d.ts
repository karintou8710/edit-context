interface EditContext extends EventTarget {
  readonly text: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
  readonly characterBoundsRangeStart: number;
  readonly characterBounds: DOMRect[];
  readonly textFormat: TextFormat[];
  
  updateText(rangeStart: number, rangeEnd: number, text: string): void;
  updateSelection(start: number, end: number): void;
  updateControlBounds(controlBounds: DOMRect): void;
  updateSelectionBounds(selectionBounds: DOMRect): void;
  updateCharacterBounds(rangeStart: number, characterBounds: DOMRect[]): void;
  attachedElements(): HTMLElement[];
  
  addEventListener(type: 'textupdate', listener: (event: TextUpdateEvent) => void, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: 'textformatupdate', listener: (event: TextFormatUpdateEvent) => void, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: 'characterboundsupdate', listener: (event: CharacterBoundsUpdateEvent) => void, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: 'compositionstart', listener: (event: CompositionEvent) => void, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: 'compositionend', listener: (event: CompositionEvent) => void, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  
  removeEventListener(type: 'textupdate', listener: (event: TextUpdateEvent) => void, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: 'textformatupdate', listener: (event: TextFormatUpdateEvent) => void, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: 'characterboundsupdate', listener: (event: CharacterBoundsUpdateEvent) => void, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: 'compositionstart', listener: (event: CompositionEvent) => void, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: 'compositionend', listener: (event: CompositionEvent) => void, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface EditContextInit {
  text?: string;
  selectionStart?: number;
  selectionEnd?: number;
}

interface EditContextConstructor {
  prototype: EditContext;
  new(options?: EditContextInit): EditContext;
}

declare const EditContext: EditContextConstructor;

interface TextUpdateEvent extends Event {
  readonly updateRangeStart: number;
  readonly updateRangeEnd: number;
  readonly text: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
}

interface TextFormat {
  readonly rangeStart: number;
  readonly rangeEnd: number;
  readonly underlineStyle: string;
  readonly underlineThickness: string;
}

interface TextFormatUpdateEvent extends Event {
  getTextFormats(): TextFormat[];
}

interface CharacterBoundsUpdateEvent extends Event {
  readonly rangeStart: number;
  readonly rangeEnd: number;
}

interface HTMLElement {
  editContext?: EditContext | null;
}
