import { getNodeAtOffset } from "./selection";

const supportsHighlights = typeof CSS !== "undefined" && "highlights" in CSS;

export const updateImeHighlight = (
	root: HTMLElement,
	formats: TextFormat[],
	highlightName: string,
) => {
	if (!supportsHighlights) return;

	if (formats.length === 0) {
		CSS.highlights.delete(highlightName);
		return;
	}

	const ranges: Range[] = [];
	for (const format of formats) {
		if (format.underlineStyle === "none") continue;
		const startPos = getNodeAtOffset(root, format.rangeStart);
		const endPos = getNodeAtOffset(root, format.rangeEnd);
		const range = document.createRange();
		range.setStart(startPos.node, startPos.offset);
		range.setEnd(endPos.node, endPos.offset);
		if (!range.collapsed) {
			ranges.push(range);
		}
	}

	if (ranges.length === 0) {
		CSS.highlights.delete(highlightName);
		return;
	}

	const highlight = new Highlight(...ranges);
	CSS.highlights.set(highlightName, highlight);
};

export const clearImeHighlight = (highlightName: string) => {
	if (!supportsHighlights) return;
	CSS.highlights.delete(highlightName);
};
