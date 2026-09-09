window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,am,om,sw,fr,so,ar',
        autoDisplay: false
    }, 'google_translate_element');
};

// Load Google Translate
(function loadScript() {
    if (document.getElementById('google-translate-script')) return;
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
})();

// Trigger Translation via Custom Dropdown
document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('lang-select');
    
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            
            // Wait briefly for google element load if needed
            const googleSelect = document.querySelector('.goog-te-combo');
            if (googleSelect) {
                googleSelect.value = selectedLang;
                googleSelect.dispatchEvent(new Event('change'));
            } else {
                console.warn('Google Translate combo not ready yet.');
            }
        });
    }
});