/**
 * Tema seçimini ilk boyamadan önce uygular — flash ve CLS olmasın diye
 * head'de senkron çalışır. React state'i beklemez.
 */
export function ThemeBoot() {
	const code = `(function(){try{var t=localStorage.getItem('tlk-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}})()`;
	return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
