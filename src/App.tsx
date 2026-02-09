import styles from "./App.module.css";
import { useEditContext } from "./useEditContext";

function App() {
	const ref = useEditContext("Hello World");

	return (
		<div>
			<div className={styles.editor} ref={ref} spellCheck="false">
				Hello World
			</div>
		</div>
	);
}

export default App;
