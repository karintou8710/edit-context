const isExtraBr = (node: Node) =>
	node.nodeType === Node.ELEMENT_NODE &&
	(node as HTMLElement).tagName === "BR" &&
	(node as HTMLElement).dataset.extra === "true";

const getNodeTextLength = (node: Node) => {
	if (node.nodeType === Node.TEXT_NODE) {
		return node.textContent?.length ?? 0;
	}
	if (
		node.nodeType === Node.ELEMENT_NODE &&
		(node as HTMLElement).tagName === "BR"
	) {
		return isExtraBr(node) ? 0 : 1;
	}
	return 0;
};

export const getOffsetFromSelection = (
	root: HTMLElement,
	node: Node | null,
	offset: number,
) => {
	if (!node || !root.contains(node)) return 0;
	const children = Array.from(root.childNodes);

	if (node === root) {
		const limit = Math.min(offset, children.length);
		let total = 0;
		for (let i = 0; i < limit; i += 1) {
			total += getNodeTextLength(children[i]);
		}
		return total;
	}

	let total = 0;
	for (const child of children) {
		if (child === node) {
			if (child.nodeType === Node.TEXT_NODE) {
				const len = child.textContent?.length ?? 0;
				return total + Math.min(offset, len);
			}
			if (
				child.nodeType === Node.ELEMENT_NODE &&
				(child as HTMLElement).tagName === "BR"
			) {
				return total + (isExtraBr(child) ? 0 : Math.min(offset, 1));
			}
			return total;
		}
		total += getNodeTextLength(child);
	}
	return total;
};

export const getNodeAtOffset = (root: HTMLElement, offset: number) => {
	const children = Array.from(root.childNodes);
	let remaining = Math.max(0, offset);
	let lastText: Text | null = null;
	let lastTextLength = 0;
	let extraBrIndex: number | null = null;

	for (let i = 0; i < children.length; i += 1) {
		const child = children[i];
		if (child.nodeType === Node.TEXT_NODE) {
			const length = child.textContent?.length ?? 0;
			if (remaining <= length) {
				return { node: child, offset: remaining };
			}
			remaining -= length;
			lastText = child as Text;
			lastTextLength = length;
			continue;
		}
		if (
			child.nodeType === Node.ELEMENT_NODE &&
			(child as HTMLElement).tagName === "BR"
		) {
			if (isExtraBr(child)) {
				extraBrIndex = i;
				continue;
			}
			if (remaining === 0) {
				if (lastText) {
					return { node: lastText, offset: lastTextLength };
				}
				return { node: root, offset: i };
			}
			if (remaining === 1) {
				return { node: root, offset: i + 1 };
			}
			remaining -= 1;
		}
	}

	if (extraBrIndex !== null) {
		return { node: root, offset: extraBrIndex };
	}
	if (lastText) {
		return { node: lastText, offset: lastTextLength };
	}
	return { node: root, offset: 0 };
};

export const setDomSelection = (
	root: HTMLElement,
	start: number,
	end: number,
	selection: Selection,
) => {
	const startPos = getNodeAtOffset(root, start);
	const endPos = getNodeAtOffset(root, end);
	const range = document.createRange();
	range.setStart(startPos.node, startPos.offset);
	range.setEnd(endPos.node, endPos.offset);
	selection.removeAllRanges();
	selection.addRange(range);
};
