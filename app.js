/*
AutoComplete Lyft Interview question
Joshua Teitelbaum 7/15/2019
 */
/*
1. Read in number of dictionary words on each line (NUMBER)
2. Read in the number of input words (NUMBER)
3. Read in the dictionary (normalize to lowercase ) hereby known as {D} NOTE WHAT ABOUT INTERNATIONALIZATION LOL :P
4. Read in the words to test relevance on set hereby known as {TW}
5. For each W in {TW}
   normalize W to lower case
   find all "matches" in D, hereby known as {M}
   sort {M} as SM
   filter {SM} to 5
   emit "W:\n SM[x] (IDX[x])....\n\n"
 */

const STATE_DICTIONARY_WORDS_SIZE = 0
const STATE_INPUT_WORDS_SIZE = 1
const STATE_INPUT_DICTIONARY = 2
const STATE_INPUT_WORDS = 3

const MAX_DICTIONARY_WORDS = 20000
const MAX_INPUT_WORDS = 1000
const MAX_WORD_LENGTH = 1024 //NOT SPECIFIED!!!

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

var state = STATE_DICTIONARY_WORDS_SIZE


var dictSize = -1
var inputWordsSize = -1
var wordsRead = 0

var dictionaryWordsRead = 0

var theNormalizedDictionary = {}

var theInput = []

/*
getDictionarySize:
protocol:
input string as number
output -1 for failure
constaints: 0 < N < 20000
TODO: test getDictionarySize, already did by hand :P
 */
function getDictionarySize(strInput) {

    if (!strInput) {
        return -1
    }
    try {

        let i =  parseInt(strInput,10)
        if (isNaN(i)) {
            return -1
        }
        if (i >=  MAX_DICTIONARY_WORDS || i <= 0) {
            return -1
        }
        return i
    } catch(e) {
        return -1
    }
}

/*
getInputWordsSize:
protocol:
input string as number
output -1 for failure
constaints: 0 < N < 20000
TODO: test getInputWordsSize, already did by hand :P
TODO: factor above with different modalities DICT/WORD
 */
function getInputWordsSize(strInput) {

    if (!strInput) {
        return -1
    }
    try {

        let i =  parseInt(strInput,10)
        if (isNaN(i)) {
            return -1
        }
        if (i >=  MAX_INPUT_WORDS || i <= 0) {
            return -1
        }
        return i
    } catch(e) {
        return -1
    }
}

/*
putLineInDictionary:
input: line
output: -1 fail, 0 success
1. trim input
2. normalize to lower case
3. if collision WHISKEY TANGO FOXTROT return failure
 */
function putLineInDictionary(strLine, wordNumber) {
    if (!strLine) {
        return -1
    }
    /*
    To grader: MAX_WORD_LENGTH must be reasonable I picked 1024 :)
     */
    if (strLine.length >= MAX_WORD_LENGTH) {
        return -1
    }

    normalizedInput = strLine.trim().toLowerCase()

    if (theNormalizedDictionary[normalizedInput]) {
        return -1
    } else {
        theNormalizedDictionary[normalizedInput] = wordNumber
    }
    return 0
}

function putLineIntoInput(strLine) {
    if (!strLine) {
        return -1
    }
    /*
    To grader: MAX_WORD_LENGTH must be reasonable I picked 1024 :)
     */
    if (strLine.length >= MAX_WORD_LENGTH) {
        return -1
    }

    normalizedInput = strLine.trim()

    theInput.push(normalizedInput)
    return 0
}

/**
 * getWordScore
 * this needs to be filled out:
 * input, key
 */
function getWordScore(strInput, strKey) {
    /*
    Clamp the iteration availability so you don't but either string
    while there is a match between strInput[x] and strKey[x] increment score
    return score
     */
    console.log('input ', strInput)
    var score = 0
    var len = strInput.length
    if (strInput.length > strKey.length) {
        len = strKey.length
    }
    for(var x=0; x < len; x++) {
        if (strInput[x] === strKey[x]) {
            score++
        } else {
            break
        }
    }
    return score
}
/**
 * calculateMatches
 * @param word
 *
 * returns: list of {dictionary index, score}
 */
function calculateMatches(word) {

    output = []
    keys = Object.keys(theNormalizedDictionary)


    keys.forEach( function (item,idx) {

        score = getWordScore(word.toLowerCase(),item)

        if (score > 0) {
            output.push({
                theDictWord:item,
                score: score,
                idx: theNormalizedDictionary[item]
            })
        }

    })
    return output
}
/**
 * calculateAutoCompletesAndExit
 * inputs: from above, most global...pretty sloppy :( sorry
 * outputs: emits results to stdout
 * Algorithm:
 * for each input word W
 * {
 *     for each dictionary word d
 *     r = calculate dictionary wordrank for w
 *     if (r > 0) {
 *     save word in list
 *     }
 *     newlist = sort unranked list and chop 5
 *     emit "word:"
 *     for each word in new list
 *     {
 *
 *         emit dictionary (location in dictionary)
 *     }
 */
function calculateAutoCompletesAndExit() {
    theInput.forEach(function (item, index) {

        l = calculateMatches(item)
        if (l && l.length) {
            l.sort((a, b) => (a.score > b.score) ? -1 : 1)
        }


        clamp = 5
        if (l.length < 5) {
            clamp = l.length
        }
        if (l.length > 0) {
            console.log(item + ':')
            for(var x = 0; l && l.length && x < clamp; x++) {
                console.log(l[x].theDictWord + "(" + l[x].idx + ")")
            }

        }

    });

    process.exit(0)
}
rl.on('line', function(line){

    switch(state) {
        case STATE_DICTIONARY_WORDS_SIZE:
        {
            dictSize = getDictionarySize(line)

            if (dictSize < 0) {
                console.error("*****ERROR MET INVALID dictionary size", line)
                process.exit(-1);
            }
            /*
            Move to next parse state
             */
            state = STATE_INPUT_WORDS_SIZE
        }
        break;
        case STATE_INPUT_WORDS_SIZE:
        {
            inputWordsSize = getInputWordsSize(line)

            if (inputWordsSize < 0) {
                console.error("*****ERROR MET INVALID input words size", line)
                process.exit(-1);
            }
            /*
            Move to next parse state
             */
            state = STATE_INPUT_DICTIONARY
        }
        break;
        case STATE_INPUT_DICTIONARY:
        {
            res = putLineInDictionary(line,dictionaryWordsRead)
            if (res < 0) {
                console.error("*****ERROR MET INVALID input dictionary word", line)
                process.exit(-1);
            }
            dictionaryWordsRead++;
            if (dictionaryWordsRead === dictSize) {
                state = STATE_INPUT_WORDS;
            }
        }
        break;

        case STATE_INPUT_WORDS:
        {
            res = putLineIntoInput(line)
            if (res < 0) {
                console.error("*****ERROR MET INVALID input dictionary word", line)
                process.exit(-1);
            }
            wordsRead++;
            if (wordsRead === inputWordsSize) {
                calculateAutoCompletesAndExit()

            }
        }
        break;



    }
})