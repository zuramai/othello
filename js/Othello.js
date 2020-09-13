class Othello {
    constructor({canvas, playerColor, playerScoreEl, botScoreEl, highScoreEl}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.status = false;
        this.playerColor = playerColor;
        this.botColor = playerColor == 'white' ? 'black' : 'white';
        this.turnColor = "black";
        this.scoreBlack = 0;
        this.scoreWhite = 0;
        this.listener();
        this.flanked = [],
        this.score = {
            player: 0,
            bot: 0,
        };
        this.playerScoreEl = playerScoreEl;
        this.highScoreEl = highScoreEl;
        this.botScoreEl = botScoreEl;

        this.blockOptions = {
            width: 60,
            height: 60,
            offsetX: 40,
            offsetY: 40,
            padding: 5,
            color: {
                block: 'rgba(39, 174, 96,.1)',
                black: "#272729",
                white: "#e2e9fc",
            }
        };
        this.blocks = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
        ];
        this.initBoard();
        
        this.isFirstTurn = true;
    }

    initBoard() {
        this.blocks.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                let blockX = this.blockOptions.offsetX + colIndex + (this.blockOptions.padding * colIndex) + (!colIndex ? 0 : this.blockOptions.width * colIndex);
                let blockY = this.blockOptions.offsetX + rowIndex + (this.blockOptions.padding * rowIndex) + (!rowIndex ? 0 : this.blockOptions.height * rowIndex);
                
                this.blocks[rowIndex][colIndex] = {};
                this.blocks[rowIndex][colIndex].x = blockX;
                this.blocks[rowIndex][colIndex].y = blockY;
                this.blocks[rowIndex][colIndex].color = false;

                if((rowIndex == 3 && colIndex == 3) || (rowIndex == 4 && colIndex == 4)) {
                    this.blocks[rowIndex][colIndex].color = "white";
                }
                else if((rowIndex == 3 && colIndex == 4) || (rowIndex == 4 && colIndex == 3))
                    this.blocks[rowIndex][colIndex].color = "black";

            });
        })
        
        // Black always goes first
        if(this.botColor == this.turnColor) {
            this.getLegalMoves()
            setTimeout(() => {
                this.botMove()
            }, 1000)
        }

        let highScore = localStorage.getItem('othello_highscore') ?  localStorage.getItem('othello_highscore') : 0
        this.highScoreEl.innerText = highScore;
        this.countScore();
    }

    /**
     * Draw the board
     */
    draw() {
        this.blocks.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                this.ctx.fillStyle = this.blockOptions.color.block;
                let blockX = this.blockOptions.offsetX + colIndex + (this.blockOptions.padding * colIndex) + (!colIndex ? 0 : this.blockOptions.width * colIndex);
                let blockY = this.blockOptions.offsetX + rowIndex + (this.blockOptions.padding * rowIndex) + (!rowIndex ? 0 : this.blockOptions.height * rowIndex);
                this.ctx.fillRect(
                    blockX,
                    blockY,
                    this.blockOptions.width,
                    this.blockOptions.height,
                )

                // Check if the block has been filled by color
                if(col.color) {
                    if(col.color == 'legal' && this.playerColor == this.turnColor) {
                        this.ctx.beginPath();
                        this.ctx.arc(blockX + this.blockOptions.width/2, blockY + this.blockOptions.height/2, this.blockOptions.width*2/5, Math.PI * 2, false);
                        this.ctx.strokeStyle = this.turnColor;
                        this.ctx.stroke();
                    }else{
                        this.ctx.beginPath();
                        this.ctx.arc(blockX + this.blockOptions.width/2, blockY + this.blockOptions.height/2, this.blockOptions.width*2/5, Math.PI * 2, false);
                        this.ctx.fillStyle = col.color;
                        this.ctx.fill();
                    }
                }
            });
        });             
    }

    getLegalMoves() {
        this.blocks.forEach((row,rowIndex) =>  {
            row.forEach((col, colIndex) => {
                if(col.color == this.turnColor) {
                    this.checkLegalMove('right','legal',rowIndex,colIndex);
                    this.checkLegalMove('left','legal',rowIndex,colIndex);
                    this.checkLegalMove('top','legal',rowIndex,colIndex);
                    this.checkLegalMove('topLeft','legal',rowIndex,colIndex);
                    this.checkLegalMove('topRight','legal',rowIndex,colIndex);
                    this.checkLegalMove('bottom','legal',rowIndex,colIndex);
                    this.checkLegalMove('bottomLeft','legal',rowIndex,colIndex);
                    this.checkLegalMove('bottomRight','legal',rowIndex,colIndex);
                }
            });
        })
    }

    countScore() {
        let blacks = 0;
        let whites = 0;
        this.blocks.forEach((row,rowIndex) =>  {
            row.forEach((col, colIndex) => {
                let color = this.blocks[rowIndex][colIndex].color;
                if(color == 'black') blacks++;
                else if(color == 'white') whites++;
            });
        })
        this.scoreBlack = blacks;
        this.scoreWhite = whites;
        this.playerScoreEl.innerText = this.playerColor == 'black' ? blacks : whites;
        this.botScoreEl.innerText = this.botColor == 'black' ? blacks : whites;
    }

    checkLegalMove(direction, checkWhat, rowIndex, colIndex, isFlanked=false) {
        let calculateDirection = {
            right:  1,
            left: -1,
            bottom: 1,
            top: -1,
            topRight: [-1, 1],
            topLeft: [-1, -1],
            bottomRight: [1, 1],
            bottomLeft: [1, -1]
        }
        // Check if udah mentok
        if(checkWhat == 'move' && !isFlanked) this.flanked = [[rowIndex,colIndex]];
        if(direction=='top' && rowIndex == 0) return false; 
        else if(direction=='left' && colIndex == 0) return false; 
        else if(direction=='right' && colIndex == 7) return false; 
        else if(direction=='bottom' && rowIndex == 7) return false; 
        else if(direction=='bottomRight' && (colIndex == 7 || rowIndex == 7)) return false; 
        else if(direction=='bottomLeft' && (colIndex == 0 || rowIndex == 7)) return false; 
        else if(direction=='topLeft' && (colIndex == 0 || rowIndex == 0)) return false; 
        else if(direction=='topRight' && (colIndex == 7 || rowIndex == 0)) return false; 

        // Check Direction
        let arrayDirections = Object.keys(calculateDirection);
        let nextColIndex = colIndex;
        let nextRowIndex = rowIndex;
        let willReturn = null;

        if(direction == 'top' || direction == 'bottom') nextRowIndex = rowIndex + calculateDirection[direction];
        else if(direction == 'left' || direction == 'right') nextColIndex = colIndex + calculateDirection[direction];
        else {
            // If check diagonally, update the column and row index
            nextRowIndex = rowIndex + calculateDirection[direction][0];
            nextColIndex = colIndex + calculateDirection[direction][1];
        }
        
        let currentColor = this.blocks[rowIndex][colIndex].color;
        let nextColor = this.blocks[nextRowIndex][nextColIndex].color;
        
        if(checkWhat == 'legal') {
            if(!isFlanked && currentColor == this.oppositeColor()) return false;
            else if(!isFlanked && !nextColor && currentColor == this.turnColor) return false;
            if(nextColor == this.turnColor) return false;
        }

        if(nextColor == this.oppositeColor()) {

            // Recursive Check The Next Column
            if(checkWhat == 'move') this.flanked.push([nextRowIndex, nextColIndex])
            this.checkLegalMove(direction, checkWhat, nextRowIndex, nextColIndex, true)

        }else if(isFlanked){

            // Found the legal move block
            if(checkWhat == "legal" && !nextColor) 
                this.blocks[nextRowIndex][nextColIndex].color = "legal"
            else if(checkWhat == "move" && nextColor == this.turnColor) {
                this.flipFlanked()
            }
        }
    }

    flipFlanked() {
        this.flanked.forEach(flanked => {
            let flankedRow = flanked[0];
            let flankedCol = flanked[1];

            this.blocks[flankedRow][flankedCol].color = this.turnColor;
        });
        this.flanked = [];
        this.resetLegalMoves();
    }

    resetLegalMoves() {
        this.blocks.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                if(this.blocks[rowIndex][colIndex].color == 'legal') this.blocks[rowIndex][colIndex].color = false
            })
        })
    }

    move(rowIndex, colIndex) {
        this.checkLegalMove('right','move',rowIndex,colIndex);
        this.checkLegalMove('left','move',rowIndex,colIndex);
        this.checkLegalMove('top','move',rowIndex,colIndex);
        this.checkLegalMove('topLeft','move',rowIndex,colIndex);
        this.checkLegalMove('topRight','move',rowIndex,colIndex);
        this.checkLegalMove('bottom','move',rowIndex,colIndex);
        this.checkLegalMove('bottomLeft','move',rowIndex,colIndex);
        this.checkLegalMove('bottomRight','move',rowIndex,colIndex);

        this.turnColor = this.oppositeColor();
        this.countScore();

        if(this.turnColor !== this.playerColor) setTimeout(() => {
            this.botMove()
        }, 500) 
    }

    botMove() {
        let legalMoves = [];
        this.blocks.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                if(this.blocks[rowIndex][colIndex].color == 'legal') legalMoves.push([rowIndex, colIndex]);
            })
        })
        let botWillMoveTo = legalMoves[legalMoves.length * Math.random() | 0];
        if(botWillMoveTo == undefined) {
            alert(this.scoreBlack > this.scoreWhite ? 'Black Win!' : 'White Win!')
        }
        this.move(botWillMoveTo[0], botWillMoveTo[1])
        if(this.isFirstTurn) this.isFirstTurn = false
    }

    render() {
        this.getLegalMoves();
        this.draw();
        this.isGameOver();

        if(this.status !== 'gameOver') {
            requestAnimationFrame(() => {
                this.render();
            });
        }
    }

    isGameOver() {
        let legalCount = 0;
        this.blocks.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                if(this.blocks[rowIndex][colIndex].color == 'legal') legalCount++;
                return;
            })
        })
        if(legalCount == 0) {
            this.status = 'gameOver';
            
            let winner = this.scoreBlack > this.scoreWhite ? this.scoreBlack : this.scoreWhite;
            localStorage.setItem('othello_highscore', winner);
            if(this.scoreBlack > this.scoreWhite) 
                alert(this.playerColor == 'black' ? 'You Win!' : 'Computer Win!')
            else
                alert(this.playerColor == 'black' ? 'Computer Win!' : 'You Win!')
        } 
    }

    listener() {
        let that = this;
        this.canvas.addEventListener('click', function(event) {
            let canvas = that.canvas;
            let blocks = that.blocks;

            let rect = canvas.getBoundingClientRect();
            let clickPosition = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            }
            console.log(clickPosition)
            blocks.forEach((row, rowIndex) => {
                row.forEach((col, colIndex) => {
                    let color = that.blocks[rowIndex][colIndex].color;
                    if(clickPosition.x >= col.x &&
                        clickPosition.x <= col.x + that.blockOptions.width &&
                        clickPosition.y >= col.y &&
                        clickPosition.y <= col.y + that.blockOptions.height &&
                        color == 'legal') {
                            that.move(rowIndex, colIndex);
                        }
                })
            })
        });
    }

    oppositeColor() {
        return this.turnColor == 'black' ? 'white' : 'black';
    }
}