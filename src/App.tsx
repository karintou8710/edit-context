import styles from "./App.module.css";
import { useEditContext } from "./hooks/useEditContext";

function App() {
	const ref = useEditContext();

	return (
		<div>
			<div className={styles.editor} ref={ref} spellCheck="false">
				Hello World
			</div>
		</div>
	);
}

export default App;
