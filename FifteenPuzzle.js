/**
* Javascript implementation of "Fifteen puzzle" game
* (http://en.wikipedia.org/wiki/15_puzzle)
*
* Tested in the following browsers: IE 6.0 - 8.0, FF 17, Chrome 22, Safari 5.1.1
*
* FifteenPuzzle.js requires Event.js package, which can be acquired at the following links:
* Github - https://github.com/mark-rolich/Event.js
* JS Classes - http://www.jsclasses.org/package/212-JavaScript-Handle-events-in-a-browser-independent-manner.html
*
* @author Mark Rolich <mark.rolich@gmail.com>
*/
Array.prototype.shuffle = function () {
    var temp, j, i;

    for (temp, j, i = this.length; i; ) {
        j = parseInt(Math.random () * i);
        temp = this[--i];
        this[i] = this[j];
        this[j] = temp;
    }
};

var FifteenPuzzle = function (evt, board) {
    "use strict";
    this.speed      = 1;

    var tiles       = null,
        freeCell    = 15,
        tileNums    = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        tileSize    = 110,
        moveCnt     = 0,
        self        = this,
        handler     = null,
        isWin = function () {
            var i       = 0,
                ids     = [];

            for (i = 0; i < tiles.length; i++) {
                ids.push(parseInt(tiles[i].getAttribute('idx'), 10));
            }

            return (tileNums.join(' ') === ids.join(' ')) ? true : false;
        },
        move        = function (element, ori, dir) {
            var elemPos     = 'left',
                i           = 0,
                pos         = 0,
                interval    = null,
                multiplier  = self.speed,
                remainder   = tileSize % self.speed,
                winner       = isWin();

            if (remainder !== 0) {
                multiplier = 1;
            }

            element.setAttribute('moving', 1);

            if (ori === 2) {
                elemPos = 'top';
            }

            pos = parseInt(element.style[elemPos], 10);

            interval = window.setInterval(function () {
                if (i >= tileSize / multiplier) {
                    window.clearInterval(interval);
                    element.setAttribute('moving', 0);

                    if (winner) {
                        if (self.onwin !== undefined) {
                            self.onwin(moveCnt);
                        } else {
                            window.alert('Win!');
                        }

                        evt.detach('mousedown', board, handler);
                        handler = null;
                    }
                }

                element.style[elemPos] = pos + 'px';

                pos = pos + (dir * multiplier);
                i++;
            }, 10);
        },
        getDirection = function (idx) {
            var dir = 0,
                ori = 0,
                to  = freeCell - idx;

            if (to === 1 || to === -1) {
                ori = 1;
                dir = to;
            } else if (to === 4 || to === -4) {
                ori = 2;
                dir = to / 4;
            }

            return [ori, dir];
        },
        play = function (e, src) {
            if (src.nodeName === 'A') {
                var idx     = src.getAttribute('idx'),
                    data    = getDirection(idx),
                    ori     = data[0],
                    dir     = data[1];

                if (ori !== 0) {
                    src.style.top = src.offsetTop + 'px';
                    src.style.left = src.offsetLeft + 'px';

                    if (parseInt(src.getAttribute('moving'), 10) === 0) {
                        src.setAttribute('idx', freeCell);

                        freeCell = idx;

                        move(src, ori, dir);
                        moveCnt++;

                        if (self.onslide !== undefined) {
                            self.onslide(moveCnt);
                        }
                    }
                }
            }
        };

    this.render = function () {
        var i       = 0,
            j       = 0,
            k       = 0,
            table   = document.createElement('table'),
            tbody   = document.createElement('tbody'),
            row     = document.createElement('tr'),
            cell    = document.createElement('td'),
            tile    = document.createElement('a');

        tile.setAttribute('href', 'javascript:void(0)');

        moveCnt = 0;
        freeCell = 15;

        tileNums.shuffle();

        for (i = 0; i < 4; i++) {
            row = row.cloneNode(false);

            for (j = 0; j < 4; j++) {
                cell = cell.cloneNode(false);

                if (k !== 15) {
                    tile = tile.cloneNode(false);

                    tile.setAttribute('idx', k);
                    tile.setAttribute('moving', 0);
                    tile.appendChild(document.createTextNode(tileNums[k] + 1));

                    tile.className = ((tileNums[k] + 1) % 2 !== 0) ? 'odd' : 'even';

                    cell.appendChild(tile);
                }

                row.appendChild(cell);
                tbody.appendChild(row);

                k++;
            }

            table.appendChild(tbody);
        }

        if (board.childNodes.length > 1) {
            board.replaceChild(table, board.childNodes[1]);
        } else {
            board.appendChild(table);
        }

        tiles = board.getElementsByTagName('a');
        tileSize = tiles[1].offsetLeft - tiles[0].offsetLeft;

        if (handler === null) {
            handler = evt.attach('mousedown', board, play);
        }
    };
};