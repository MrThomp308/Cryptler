const numKeys = ['0Btn', '1Btn', '2Btn', '3Btn', '4Btn', '5Btn'];
const dirKeys = ['upBtn', 'downBtn'];
const misKeys = ['submitBtn', 'backBtn'];
const rightArrow = '&#9654;';
const leftArrow = '&#9664;';

startTime = new Date();

activeRow = 0;
activeColumn = 0;
var rows = [];
word = "";
definition = "";
scrambledWord = "";
answers = {};


function main() {
    //createNotification('cool :)');
    setWord(scrambleWord(getWordFromList()));
    setDefinition(definition);
    console.log(word);
    console.log(definition);

    getRows();
    updateActiveCellColor("var(--outlineBlue)");
    changeTileColors();

    keyList = dirKeys.concat(['submitBtn']);
    deactivateKeyboard(keyList);
}

function setDefinition(nDef) {
    defModule = document.getElementsByClassName(`definitionModule`)
    defModule[0].textContent = nDef;
}

function setWord(nWord) {
    wordTiles = document.getElementsByClassName(`wordTileModule`)

    if (nWord.length == wordTiles.length) {
        for (let i = 0; i < nWord.length; i++) {
            wordTiles[i].innerHTML = nWord[i];
        }
    }
}

function getWordFromList() {
    wordAccepted = false;
    do {
        //select letter
        var letters = Object.keys(wordDict);
        var rInt = Math.floor(Math.random() * letters.length);
        var letter = letters[rInt];

        //select word
        var words = wordDict[letter];
        rInt = Math.floor(Math.random() * words.length);
        nWord = words[rInt]["word"].toUpperCase();

        if (nWord.length == 5) { wordAccepted = true; }
    } while (!wordAccepted);

    word = nWord;
    definition = words[rInt]["definition"].toUpperCase();
    return word;
}

function getRows() {
    var rowsElems = Array.from(document.getElementsByClassName("rowModule"));
    rowsElems.forEach((row) => {
        console.log(row.id)
    });
    rows = rowsElems;
}

const sendToActiveCell = async (arg1) => {
    activeCell = getActiveCell();
    activeCell.textContent = activeCell.textContent + arg1;

    var timeout = .3 * 1000;
    activeCell.classList.add('tileModuleRotationShort');
    await setTimeout(() => {
        activeCell.classList.remove('tileModuleRotationShort');
    }, timeout);
}

function clearActiveCell() {
    activeCell = getActiveCell();
    activeCell.textContent = "";
}

function isActiveCellEmpty() {
    activeCell = getActiveCell();
    if (activeCell.textContent.trim().length == 0) { return true; }
    else { return false; }
}

function getActiveCell() {
    activeRowElem = rows[activeRow];
    activeColumnElem = activeRowElem.getElementsByClassName("tileModule")
    activeCell = activeColumnElem[activeColumn];
    return activeCell;
}

function updateActiveCellColor(clr) {
    activeCell = getActiveCell();
    activeCell.style.borderColor = clr;
}

function shiftColumn(arg1) {
    updateActiveCellColor("var(--color-tone-4)");

    activeColumn = activeColumn + arg1;
    if (activeColumn >= 5) {
        activeColumn = 4;
    }
    if (activeColumn <= 0) {
        activeColumn = 0;
    }

    updateActiveCellColor("var(--outlineBlue)");
}

function shiftRow() {
    //updateActiveCellColor("var(--color-tone-4)");

    activeColumn = 0;

    activeRow = activeRow + 1
    if (activeRow >= 5) {
        activeRow = 4;
        activeColumn = 4;
    }

    updateActiveCellColor("var(--outlineBlue)");
}

function keyPress(arg1) {
    if (document.getElementById(`${arg1}Btn`).active == 'false') { return; }
    switch (arg1.toString()) {
        case '0':
            if (getActiveCell().textContent.trim().length < 1) {
                console.log(`number: ${arg1}`);
                sendToActiveCell(arg1);

                if (activeColumn == 4) {
                    deactivateKeyboard(numKeys);
                    deactivateKeyboard(dirKeys);
                    activateKeyboard(['submitBtn']);
                }

                shiftColumn(1);
            }
            break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
            if (getActiveCell().textContent.trim().length < 1) {
                console.log(`number: ${arg1}`);
                sendToActiveCell(arg1);
                deactivateKeyboard(numKeys);
                activateKeyboard(dirKeys);
            }
            break;
        case 'up':
        case 'down':
            if (getActiveCell().textContent.trim().length >= 1 &&
                getActiveCell().textContent.trim().length < 2 &&
                getActiveCell().textContent.trim() != '0') {
                console.log(`direction: ${arg1}`);
                if (arg1 == 'up') { sendToActiveCell('▶'); }
                else if (arg1 == 'down') { sendToActiveCell('◀'); }

                if (activeColumn == 4) {
                    deactivateKeyboard(numKeys);
                    deactivateKeyboard(dirKeys);
                    activateKeyboard(['submitBtn']);
                }
                else {
                    deactivateKeyboard(dirKeys);
                    activateKeyboard(numKeys);
                }

                shiftColumn(1);
            }
            break;
        case 'back':
            console.log(`backspace`);
            if (!isActiveCellEmpty()) {
                clearActiveCell();

            }
            else {
                shiftColumn(-1);
                clearActiveCell();
            }
            deactivateKeyboard(dirKeys);
            activateKeyboard(numKeys);
            break;
        case 'submit':
            console.log(`submit`);
            if (activeColumn == 4 &&
                !isActiveCellEmpty()) {
                submit();
            }
            break;
        default:
            console.log(`oops.`);
    }
}

function markCorrect(tile, column) {
    tile.style.borderColor = "var(--darkendGreen)";
    tile.style.backgroundColor = "var(--color-correct)";

    var rowWordElem = Array.from(document.getElementsByClassName("rowWordModule"));
    var rowWordTiles = Array.from(rowWordElem[0].getElementsByClassName("wordTileModule"));

    rowWordTiles[column].style.color = "var(--color-correct)";
    rowWordTiles[column].textContent = answers[`column ${column}`]['letter'];
}

function markWrongWord() {
    var rowWordElem = Array.from(document.getElementsByClassName("rowWordModule"))[0];
    var rowWordTiles = Array.from(rowWordElem.getElementsByClassName("wordTileModule"));

    var i = 0;
    rowWordTiles.forEach((wordTile) => {
        wordTile.style.color = "var(--red-4)";
        wordTile.textContent = answers[`column ${i}`]['letter'];

        i = i + 1;
    });

    rowWordElem.style.borderColor = "var(--red-4)";
}

function markInCorrect(tile, tileNum, answerNum) {
    var diff = findDiff(tileNum, answerNum);

    tile.style.borderColor = "var(--darkendRed)";
    tile.style.backgroundColor = `var(--red-${diff})`;
    console.log(`Diff: ${diff}`);
}

function markWrong(tile, tileNum, answerNum) {
    var diff = findDiff(tileNum, answerNum);

    tile.style.borderColor = "var(--darkendYellow)";
    tile.style.backgroundColor = `var(--yellow-${diff})`;
    console.log(`Diff: ${diff}`);
}

function findDiff(num1, num2) {
    var diff = Math.abs(num1 - num2);
    return diff;
}

function checkTile(tile, i) {
    tileContent = tile.textContent.trim();
    tileNum = parseInt(tileContent[0]);
    answerNum = parseInt(answers[`column ${i}`]['number']);
    correct = true;

    if (tileContent.length == 1) {
        if (tileContent == '0' &&
            answers[`column ${i}`]['number'] == '0') {
            markCorrect(tile, i);
        }
        else {
            markInCorrect(tile, tileNum, answerNum);
            correct = false;
        }
    }
    else if (tileContent.length > 1) {
        var directionMatch = false;
        if (tileContent[1] == '▶' &&
            answers[`column ${i}`]['direction'] == 'up') {
            directionMatch = true;
        }
        else if (tileContent[1] == '◀' &&
            answers[`column ${i}`]['direction'] == 'down') {
            directionMatch = true;
        }

        if (!directionMatch) {
            markInCorrect(tile, tileNum, answerNum);
            correct = false;
        }
        else {
            if (tileNum == answerNum) {
                markCorrect(tile, i);
            }
            else {
                markWrong(tile, tileNum, answerNum);
                correct = false;
            }
        }
    }
    return correct;
}

function changeTileColors() {
    //--gray-3 && --gray-4
    rowElems = Array.from(document.getElementsByClassName(`rowModule`));

    var i = 0;
    rowElems.forEach((row) => {
        tileElems = Array.from(row.getElementsByClassName(`tileModule`));
        tileElems.forEach((tile) => {
            if (i % 2 == 0) {
                tile.style.backgroundColor = "var(--row-mod-0)";
                console.log('even');
            }
            else {
                tile.style.backgroundColor = "var(--row-mod-1)";
                console.log('odd');
            }
        });
        i = i + 1;
    });
}

function deactivateKeyboard(keyList) {
    keyList.forEach((keyID) => {
        key = document.getElementById(keyID);
        key.style.backgroundColor = "var(--darkGray)";
        key.style.opacity = .5;
        key.active = "false";
    });
}

function activateKeyboard(keyList) {
    keyList.forEach((keyID) => {
        key = document.getElementById(keyID);
        key.style.backgroundColor = "var(--key-bg)";
        key.style.opacity = 1;
        key.active = "true";
    });
}

const submit = async () => {
    console.log(`Active Row: ${activeRow}`);
    console.log(answers);
    currentRowElems = document.getElementsByClassName(`rowModule`);
    currentRowElem = currentRowElems[activeRow];
    currentRowTiles = Array.from(currentRowElem.getElementsByClassName(`tileModule`));

    currentRowElem.classList.add('tileModuleRotationShort');
    allCorrect = true;

    for (let i = 0; i < currentRowTiles.length; i++) {
        tile = currentRowTiles[i];
        console.log(`${tile.id}: ${tile.textContent.trim()}`);
        correct = checkTile(tile, i);
        if (!correct) { allCorrect = false; }

    }

    if (!allCorrect) {
        if (activeRow != 4) {
            shiftRow();
            activateKeyboard(numKeys);
            deactivateKeyboard(dirKeys);
        }
        else {
            keyList = numKeys.concat(dirKeys).concat(misKeys);
            deactivateKeyboard(keyList);

            markWrongWord();
            createNotification('too bad..', type = 'lose');
        }
    }
    else {
        keyList = numKeys.concat(dirKeys).concat(misKeys);
        deactivateKeyboard(keyList);

        switch (activeRow) {
            case 0:
                createNotification('Excellent!', type = 'win');
                break;
            case 1:
                createNotification('Great!', type = 'win');
                break;
            case 2:
                createNotification('Good!', type = 'win');
                break;
            case 3:
                createNotification('Nice!', type = 'win');
                break;
            case 4:
                createNotification('Good Job!', type = 'win');
                break;
            default:
                break;
        }
    }

    rowWord = document.getElementsByClassName('rowWordModule')[0];
    var timeout = .3 * 1000;
    rowWord.classList.add('tileModuleRotationShort');
    await setTimeout(() => {
        rowWord.classList.remove('tileModuleRotationShort');
    }, timeout);
    deactivateKeyboard(['submitBtn']);
}

function scrambleWord(word) {
    var newWord = "";
    for (let i = 0; i < word.length; i++) {
        var letterList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        //down (0) or up (1)
        var dirInt = Math.floor(Math.random() * 2);
        //number (0-5)
        var numList = [0, 1, 2, 3, 4, 5];
        var numInt = numList[Math.floor(Math.random() * numList.length)];
        var directionNum = 0;
        if (numInt == 0) {
            answers[`column ${i}`] = { 'letter': word[i], 'direction': 'none', 'number': numInt };
            directionNum = numInt;
        }
        //Directions are reversed, so 0 == down instead of up
        else if (dirInt == 0) {
            answers[`column ${i}`] = { 'letter': word[i], 'direction': 'down', 'number': numInt };
            directionNum = numInt * 1;
        }
        else {
            answers[`column ${i}`] = { 'letter': word[i], 'direction': 'up', 'number': numInt };
            directionNum = numInt * -1;
        }
        console.log(`${answers[`column ${i}`]['letter']} -> ${answers[`column ${i}`]['direction']} -> ${answers[`column ${i}`]['number']}`);
        var newLetter = "";
        try {
            var letter = word[i];
            ogLetterIndex = letterList.indexOf(letter.toLowerCase());
            newLetterIndex = ogLetterIndex + directionNum;
            if (newLetterIndex > letterList.length - 1 || newLetterIndex < 0) {
                console.error(`**Out of Range**`);
                console.error(`LetterList: ${letterList.length - 1}`);
                console.error(`OG Letter Idx: ${ogLetterIndex}`);
                console.error(`New Letter Idx: ${newLetterIndex}`);

                if (newLetterIndex < 0) {
                    newLetterIndex = letterList.length + newLetterIndex;
                }
                else {
                    newLetterIndex = newLetterIndex - letterList.length;
                }

                console.error(`Updated Letter Idx: ${newLetterIndex}`);

            }
            else {
                console.log(`In Range`);
            }
            newLetter = letterList[newLetterIndex];
            newWord = newWord + newLetter;
        }
        catch (error) {
            console.error(error);
        }

    }

    return newWord;
}

function formatTime(milliseconds) {
    // Convert milliseconds to seconds
    const seconds = Math.floor(milliseconds / 1000);
    
    // Calculate hours, minutes, and remaining seconds
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    // Format the time components to have two digits (e.g., 01 instead of 1)
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
    // Return the formatted time as a string
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

function createNotification(message = null, type = null) {
    endTime = new Date();
    timeElapsed = formatTime(endTime - startTime);
    //timeout = 3 * 1000;

    const notif = document.createElement('div');
    const notifResult = document.createElement('div');
    const notifDetails = document.createElement('div');

    notifResult.textContent = message;
    notifDetails.innerHTML = `<br>Statistics:<br>${timeElapsed}`;

    notif.classList.add('toast');
    notif.classList.add('toastTranslate');

    notifResult.classList.add('toastHeader');

    notif.appendChild(notifResult);
    notif.appendChild(notifDetails);
    toasts.appendChild(notif);
    //setTimeout(() => {
    //    notif.remove();
    //}, timeout);
}

main();