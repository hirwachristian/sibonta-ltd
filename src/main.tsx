import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Always open on the welcome section when the page is loaded or refreshed:
// stop the browser restoring the old scroll position and drop any #section from the URL.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (location.hash) {
  history.replaceState(null, '', location.pathname + location.search);
}
window.scrollTo(0, 0);

createRoot(document.getElementById('root')!).render(<App />);
