/**
* @class: Token
* @description: the token class
*/
class Token {
    constructor(token, value, row, col) {
        this.token = token;     // the type of token
        this.value = value;     // the value of token 
        this.position = {row: row, col: col} // position of the token
    }
}

/**
* @class: LexicalAnalysis
* @description: do lexical analysis, transform the file to token list
*/
export default class LexicalAnalysis {
    constructor(sources) {
        this.sources = sources;
        this.tokenStream = [];
    }
    analysisTokenStream() {
        const keyword = ["int", "void", "if", "else", "while", "return"];
        const separator = [",", ";", "(", ")", "{", "}"];
        const operatorOne = ["+", "-", "*", "/", "=", ">", "<"];
        const operatorTwo = ["==", ">=", "<=", "!="];
        const identifier = "<ID>";
        const constInt = "<INT>";

        // analysis
        var curRow = 1, curCol = 0;
        var curString = "";
        for (let i = 0; i < this.sources.length;) {
            curCol++;
            // is blank
            if (this.sources[i] === "\n") {
                curRow++;
                curCol = 0;
                i++;
                continue;
            }
            else if (this.sources[i] === "\t") {
                curCol += 3;
                i++;
                continue;
            }
            else if (this.sources[i] === " " || this.sources[i] === "\r") {
                i++;
                continue;
            }
            // ia not blank
            curString = this.sources[i];
            var alpheRep = /^[a-zA-Z]$/;
            var numRep = /^[0-9]$/;
            // is alpha
            if (alpheRep.test(curString)) {
                while (alpheRep.test(this.sources[i + 1]) || numRep.test(this.sources[i + 1])) {
                    curString += this.sources[i + 1];
                    i++;
                    curCol++;
                }
                i++;
                // is keyword
                if (keyword.indexOf(curString) != -1) {
                    let tmpToken = new Token(curString, curString, curRow, curCol - curString.length + 1);
                    this.tokenStream.push(tmpToken);
                }
                // is not keyword
                else {
                    let tmpToken = new Token(identifier, curString, curRow, curCol - curString.length + 1);
                    this.tokenStream.push(tmpToken);
                }
            }
            // is digit
            else if (numRep.test(curString)) {
                while (numRep.test(this.sources[i + 1])) {
                    curString += this.sources[i + 1];
                    i++;
                    curCol++;
                }
                i++;
                let tmpToken = new Token(constInt, curString, curRow, curCol - curString.length + 1)
                this.tokenStream.push(tmpToken);
            }
            // is separator
            else if (separator.indexOf(curString) != -1) {
                let tmpToken = new Token(curString, curString, curRow, curCol);
                this.tokenStream.push(tmpToken);
                i++;
            }
            // is one line comment
            else if (curString === "/" && this.sources[i + 1] === "/") {
                while (i + 1 < this.sources.length && this.sources[i + 1] != "\n") {
                    i++;
                }
                i += 2;
            }
            // is multiline comment
            else if (curString === "/" && this.sources[i + 1] === "*") {
                i += 2;
                curCol += 2;
                while (i + 1 < this.sources.length && !(this.sources[i] === "*" && this.sources[i + 1] === "/")) {
                    curCol++;
                    if (this.sources[i] === "\n") {
                        curRow++;
                        curCol = 0;
                    }
                    else if (this.sources[i] === "\t") {
                        curCol += 3;
                    }
                    i++;
                }
                i += 2;
            }
            // is two operator
            else if (operatorTwo.indexOf(curString + this.sources[i + 1]) != -1) {
                curString += this.sources[i + 1];
                i += 2;
                let tmpToken = new Token(curString, curString, curRow, curCol - 1);
                this.tokenStream.push(tmpToken);
            }
            // is one operator
            else if (operatorOne.indexOf(curString) != -1) {
                i++;
                let tmpToken = new Token(curString, curString, curRow, curCol);
                this.tokenStream.push(tmpToken);
            }
            // error
            else {
                throw {
                    code: 100,
                    msg: `Lexical Error: Undefined Symbol '${curString}', in (${curRow},${curCol})`
                }
            }
        }
        // add end symbol '#'
        this.tokenStream.push(new Token('#', '#', -1, -1));
    }

    get getTokenStream() {
        return this.tokenStream;
    }
}