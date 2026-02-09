import { useEffect, useRef } from "react";

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
			el.textContent = editContext.text;
			sel?.collapse(el.firstChild, event.selectionStart);
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

			editContext.updateSelection(
				selection.anchorOffset,
				selection.focusOffset,
			);
			editContext.updateSelectionBounds(
				selection.getRangeAt(0).getBoundingClientRect(),
			);
		};

		// Add event listeners
		editContext.addEventListener("textupdate", handleTextUpdate);
		editContext.addEventListener("textformatupdate", handleTextFormatUpdate);
		editContext.addEventListener(
			"characterboundsupdate",
			handleCharacterBoundsUpdate,
		);
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
			document.removeEventListener("selectionchange", handleSelectionChange);
			el.editContext = null;
		};
	}, [initialText]);

	return ref;
}
