// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const themePink = document.getElementById('themePink');
    const themeCyan = document.getElementById('themeCyan');
    const themeGreen = document.getElementById('themeGreen');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'pink';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateActiveButton(savedTheme);
    
    // Toggle theme on button click
    themePink.addEventListener('click', () => {
        setTheme('pink');
    });
    
    themeCyan.addEventListener('click', () => {
        setTheme('cyan');
    });
    
    themeGreen.addEventListener('click', () => {
        setTheme('green');
    });
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateActiveButton(theme);
    }
    
    function updateActiveButton(theme) {
        // Remove active class from all buttons
        themePink.classList.remove('active');
        themeCyan.classList.remove('active');
        themeGreen.classList.remove('active');
        
        // Add active class to current theme button
        switch(theme) {
            case 'pink':
                themePink.classList.add('active');
                break;
            case 'cyan':
                themeCyan.classList.add('active');
                break;
            case 'green':
                themeGreen.classList.add('active');
                break;
        }
    }
}); 