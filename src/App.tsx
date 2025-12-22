import { useEffect, useRef } from "react";

import styles from "./App.module.css";

function App() {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		const el = ref.current;
		const editContext = new EditContext({
			text: el.textContent || "",
		});

		el.editContext = editContext;

		const controlBound = el.getBoundingClientRect();
		const selection = document.getSelection();
		if (!selection) return;
		editContext.updateControlBounds(controlBound);

		editContext.addEventListener("textupdate", (event) => {
			const sel = window.getSelection();
			el.textContent = editContext.text;
			sel?.collapse(el.firstChild, event.selectionStart);
		});

		editContext.addEventListener("textformatupdate", (event) => {
			console.log("textformatupdate", event);
		});

		editContext.addEventListener("characterboundsupdate", (event) => {
			console.log("characterboundsupdate", event);
		});

		document.addEventListener("selectionchange", () => {
			const selection = window.getSelection();
			if (!selection) return;

			editContext.updateSelection(
				selection.anchorOffset,
				selection.focusOffset,
			);
			editContext.updateSelectionBounds(
				selection.getRangeAt(0).getBoundingClientRect(),
			);
		});
	}, []);

	return (
		<div>
			<div className={styles.editor} ref={ref}>
				Hello World
			</div>
		</div>
	);
}

export default App;
