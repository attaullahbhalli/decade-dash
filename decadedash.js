document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', function() {
        const year = dot.getAttribute('data-year');

        // Define URLs based on year
        const urls = {
            '2000': '../bejeweled/bejeweled.html',
            '2010': '../flappy/flappy.html',
            '2020': '../colourswitch/colourswitch.html',
            '1990': '../minesweeper/minesweeper.html',
            '1980': '../snake/snake.html',
            '1970': '../pacman/pacman.html',
            '1960': '../simonsays/simonsays.html',
            '1950': '../tennis42/tennis42.html'
        };

        // Apply fade-out transition
        document.body.classList.add('fade-out');

        // Delay navigation to allow the transition to finish
        setTimeout(() => {
            window.location.href = urls[year];
        }, 500); // Matches the fadeOut duration in CSS
    });
});