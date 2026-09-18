if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js?v=1')
            
            .catch((err) => console.log("Échec du SW :", err));
    });
}
