import { setDomSelection } from "./selection";

export const render = (
	el: HTMLElement,
	text: string,
	start: number,
	end: number,
) => {
	while (el.firstChild) el.removeChild(el.firstChild);

	const parts = text.split("\n");
	parts.forEach((part, index) => {
		if (part.length > 0) {
			el.appendChild(document.createTextNode(part));
		}
		if (index < parts.length - 1) {
			el.appendChild(document.createElement("br"));
		}
	});

	if (text.endsWith("\n")) {
		const extra = document.createElement("br");
		extra.dataset.extra = "true";
		el.appendChild(extra);
	}

	const selection = window.getSelection();
	if (selection) {
		setDomSelection(el, start, end, selection);
	}
};
