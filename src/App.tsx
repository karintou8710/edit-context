import { useEffect, useRef } from "react"

function App() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const el = ref.current
    const editContext = new EditContext({
      text: el.textContent || '',
    })

    el.editContext = editContext

    editContext.addEventListener('textupdate', event => {
      const sel = window.getSelection();
      el.textContent = editContext.text;
      sel?.collapse(el.firstChild, event.selectionStart);
    });

    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();

      editContext.updateSelection(selection!.anchorOffset, selection!.focusOffset);
    });
  }, [])

  return <div>
    <div ref={ref}>Hello World</div>
  </div>
}

export default App