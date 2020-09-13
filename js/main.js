const canvas = document.getElementById('canvas');


function setPlayerColor(color) {
    document.querySelector('.choose-color').style.display = 'none';
    document.querySelector('#canvas').classList.remove('blur');

    let playerScoreEl = document.getElementById('playerScore')
    let botScoreEl = document.getElementById('botScore')
    let highScoreEl = document.getElementById('highScore')
    
    let othello = new Othello({
        canvas, 
        playerColor: color,
        playerScoreEl,
        botScoreEl,
        highScoreEl
    });
    othello.render();
}

let replayButton = document.getElementById('btn-replay');
replayButton.addEventListener('click', function() {
    location.reload();
})