import { useEffect, useRef } from "react";
import { renderTextWithBr } from "./editContext/render";
import {
	getOffsetFromSelection,
	setDomSelection,
} from "./editContext/selection";

export function useEditContext(initialText: string = "") {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const editContext = new EditContext({
			text: initialText || el.textContent || "",
		});

		el.editContext = editContext;

		// Update control bounds
		const controlBound = el.getBoundingClientRect();
		editContext.updateControlBounds(controlBound);

		// Handle text updates
		const handleTextUpdate = (event: TextUpdateEvent) => {
			const sel = window.getSelection();
			renderTextWithBr(el, editContext.text);
			if (!sel) return;

			const start = event.selectionStart;
			const end = event.selectionEnd ?? event.selectionStart;
			setDomSelection(el, start, end, sel);
		};

		// Handle text format updates
		const handleTextFormatUpdate = (event: TextFormatUpdateEvent) => {
			console.log("textformatupdate", event);
		};

		// Handle character bounds updates
		const handleCharacterBoundsUpdate = (event: CharacterBoundsUpdateEvent) => {
			console.log("characterboundsupdate", event);
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

			editContext.updateSelection(start, end);
			editContext.updateSelectionBounds(range.getBoundingClientRect());
		};

		const insertTextAtSelection = (text: string) => {
			const start = editContext.selectionStart;
			const end = editContext.selectionEnd;
			editContext.updateText(start, end, text);
			renderTextWithBr(el, editContext.text);
			const next = start + text.length;
			editContext.updateSelection(next, next);
			const sel = window.getSelection();
			if (sel) {
				setDomSelection(el, next, next, sel);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Enter") {
				event.preventDefault();
				insertTextAtSelection("\n");
			}
		};

		// Add event listeners
		editContext.addEventListener("textupdate", handleTextUpdate);
		editContext.addEventListener("textformatupdate", handleTextFormatUpdate);
		editContext.addEventListener(
			"characterboundsupdate",
			handleCharacterBoundsUpdate,
		);
		el.addEventListener("keydown", handleKeyDown);
		document.addEventListener("selectionchange", handleSelectionChange);

		// Cleanup
		return () => {
			editContext.removeEventListener("textupdate", handleTextUpdate);
			editContext.removeEventListener(
				"textformatupdate",
				handleTextFormatUpdate,
			);
			editContext.removeEventListener(
				"characterboundsupdate",
				handleCharacterBoundsUpdate,
			);
			el.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("selectionchange", handleSelectionChange);
			el.editContext = null;
		};
	}, [initialText]);

	return ref;
}
