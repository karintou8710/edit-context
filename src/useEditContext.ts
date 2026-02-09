import { useEffect, useRef } from "react";
import { clearImeHighlight, updateImeHighlight } from "./editContext/highlight";
import { render } from "./editContext/render";
import { getOffsetFromSelection } from "./editContext/selection";

const HIGHLIGHT_NAME = "IME_UNDERLINE";

export function useEditContext(initialText: string = "") {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const editContext = new EditContext({
			text: initialText || el.textContent || "",
		});

		el.editContext = editContext;

		const updateContextSelection = (start: number, end: number) => {
			const sel = document?.getSelection();
			if (!sel) return;

			editContext.updateSelection(start, end);
			editContext.updateSelectionBounds(
				sel.getRangeAt(0).getBoundingClientRect(),
			);
		};

		// Update control bounds
		const controlBound = el.getBoundingClientRect();
		editContext.updateControlBounds(controlBound);

		// Handle text updates
		const handleTextUpdate = (event: TextUpdateEvent) => {
			const start = event.selectionStart;
			const end = event.selectionEnd ?? event.selectionStart;
			render(el, editContext.text, start, end);
		};

		// Handle text format updates
		const handleTextFormatUpdate = (event: TextFormatUpdateEvent) => {
			updateImeHighlight(el, event.getTextFormats(), HIGHLIGHT_NAME);
		};

		// Handle selection changes
		const handleSelectionChange = () => {
			const selection = window.getSelection();
			if (!selection || selection.rangeCount === 0) return;

			const range = selection.getRangeAt(0);
			const start = getOffsetFromSelection(
				el,
				range.startContainer,
				range.startOffset,
			);
			const end = getOffsetFromSelection(
				el,
				range.endContainer,
				range.endOffset,
			);

			updateContextSelection(start, end);
		};

		const insertTextAtSelection = (text: string) => {
			const start = editContext.selectionStart;
			const end = editContext.selectionEnd;
			const next = start + text.length;

			editContext.updateText(start, end, text);
			render(el, editContext.text, next, next);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			// IME 入力中には
			if (event.keyCode === 229) {
				return;
			}

			if (event.key === "Enter") {
				insertTextAtSelection("\n");
			}
		};

		editContext.addEventListener("textupdate", handleTextUpdate);
		editContext.addEventListener("textformatupdate", handleTextFormatUpdate);
		el.addEventListener("keydown", handleKeyDown);
		document.addEventListener("selectionchange", handleSelectionChange);

		return () => {
			clearImeHighlight(HIGHLIGHT_NAME);
			editContext.removeEventListener("textupdate", handleTextUpdate);
			editContext.removeEventListener(
				"textformatupdate",
				handleTextFormatUpdate,
			);
			el.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("selectionchange", handleSelectionChange);
			el.editContext = null;
		};
	}, [initialText]);

	return ref;
}
