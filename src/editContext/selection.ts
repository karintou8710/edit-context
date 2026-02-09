const isExtraBr = (node: Node) =>
	node.nodeType === Node.ELEMENT_NODE &&
	(node as HTMLElement).tagName === "BR" &&
	(node as HTMLElement).dataset.extra === "true";

const getNodeTextLength = (node: Node): number => {
	if (node.nodeType === Node.TEXT_NODE) {
		return node.textContent?.length ?? 0;
	}
	if (
		node.nodeType === Node.ELEMENT_NODE &&
		(node as HTMLElement).tagName === "BR"
	) {
		return isExtraBr(node) ? 0 : 1;
	}
	if (node.nodeType === Node.ELEMENT_NODE) {
		let total = 0;
		for (const child of Array.from(node.childNodes)) {
			total += getNodeTextLength(child);
		}
		return total;
	}
	return 0;
};

export const getOffsetFromSelection = (
	root: HTMLElement,
	node: Node | null,
	offset: number,
) => {
	if (!node || !root.contains(node)) return 0;

	if (node === root) {
		const children = Array.from(root.childNodes);
		const limit = Math.min(offset, children.length);
		let total = 0;
		for (let i = 0; i < limit; i += 1) {
			total += getNodeTextLength(children[i]);
		}
		return total;
	}

	let total = 0;
	const visit = (current: Node): boolean => {
		if (current === node) {
			if (current.nodeType === Node.TEXT_NODE) {
				const len = current.textContent?.length ?? 0;
				total += Math.min(offset, len);
				return true;
			}
			if (
				current.nodeType === Node.ELEMENT_NODE &&
				(current as HTMLElement).tagName === "BR"
			) {
				total += isExtraBr(current) ? 0 : Math.min(offset, 1);
				return true;
			}
			if (current.nodeType === Node.ELEMENT_NODE) {
				const children = Array.from(current.childNodes);
				const limit = Math.min(offset, children.length);
				for (let i = 0; i < limit; i += 1) {
					total += getNodeTextLength(children[i]);
				}
				return true;
			}
			return true;
		}

		if (current.nodeType === Node.TEXT_NODE) {
			total += current.textContent?.length ?? 0;
			return false;
		}
		if (
			current.nodeType === Node.ELEMENT_NODE &&
			(current as HTMLElement).tagName === "BR"
		) {
			total += isExtraBr(current) ? 0 : 1;
			return false;
		}
		if (current.nodeType === Node.ELEMENT_NODE) {
			for (const child of Array.from(current.childNodes)) {
				if (visit(child)) return true;
			}
		}
		return false;
	};

	for (const child of Array.from(root.childNodes)) {
		if (visit(child)) break;
	}

	return total;
};

export const getNodeAtOffset = (root: HTMLElement, offset: number) => {
	let remaining = Math.max(0, offset);
	let lastText: Text | null = null;
	let lastTextLength = 0;
	let extraBrLocation: { parent: Node; index: number } | null = null;

	const visit = (current: Node, parent: Node, index: number): {
		node: Node;
		offset: number;
	} | null => {
		if (current.nodeType === Node.TEXT_NODE) {
			const length = current.textContent?.length ?? 0;
			if (remaining <= length) {
				return { node: current, offset: remaining };
			}
			remaining -= length;
			lastText = current as Text;
			lastTextLength = length;
			return null;
		}
		if (
			current.nodeType === Node.ELEMENT_NODE &&
			(current as HTMLElement).tagName === "BR"
		) {
			if (isExtraBr(current)) {
				extraBrLocation = { parent, index };
				return null;
			}
			if (remaining === 0) {
				if (lastText) {
					return { node: lastText, offset: lastTextLength };
				}
				return { node: parent, offset: index };
			}
			if (remaining === 1) {
				return { node: parent, offset: index + 1 };
			}
			remaining -= 1;
			return null;
		}
		if (current.nodeType === Node.ELEMENT_NODE) {
			const children = Array.from(current.childNodes);
			for (let i = 0; i < children.length; i += 1) {
				const result = visit(children[i], current, i);
				if (result) return result;
			}
		}
		return null;
	};

	const rootChildren = Array.from(root.childNodes);
	for (let i = 0; i < rootChildren.length; i += 1) {
		const result = visit(rootChildren[i], root, i);
		if (result) return result;
	}

	if (extraBrLocation) {
		return { node: extraBrLocation.parent, offset: extraBrLocation.index };
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
