/**
 * @file:compiler.js
 * @author:edward yao
 */

/**
 * @class: Token
 * @description: the token class
 */
class Token {
    constructor(token, value, row, col) {
        this.token = token;     // the type of token
        this.value = value;     // the value of token 
        this.position = {       // position of the token
            row: row,
            col: col
        }
    }
}

/**
 * @class: LexicalAnalysis
 * @description: do lexical analysis, transform the file to token list
 */
class LexicalAnalysis {
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
        // const allToken = keyword.concat(separator, operatorOne, operatorTwo, identifier, constInt);

        // analysis
        var curRow = 1, curCol = 0;
        var curString = "";
        for(let i = 0; i < this.sources.length;){
            curCol ++;
            // is blank
            if(this.sources[i] === "\n"){
                curRow ++;
                curCol = 0;
                i ++;
                continue;
            }
            else if(this.sources[i] === "\t"){
                curCol += 3;
                i ++;
                continue;
            }
            else if(this.sources[i] === " "){
                i ++;
                continue;
            }
            // ia not blank
            curString = this.sources[i];
            var alpheRep = /^[a-zA-Z]$/;
            var numRep = /^[0-9]$/;
            // is alpha
            if(alpheRep.test(curString)){
                while(alpheRep.test(this.sources[i + 1]) || numRep.test(this.sources[i + 1])){
                    curString += this.sources[i + 1];
                    i ++;
                    curCol ++;
                }
                i ++;
                // is keyword
                if(keyword.indexOf(curString) != -1){
                    let tmpToken = new Token(curString, curString, curRow, curCol - curString.length + 1);
                    this.tokenStream.push(tmpToken);
                }
                // is not keyword
                else{
                    let tmpToken = new Token(identifier, curString, curRow, curCol - curString.length + 1);
                    this.tokenStream.push(tmpToken);
                }
            }
            // is digit
            else if(numRep.test(curString)){
                while(numRep.test(this.sources[i + 1])){
                    curString += this.sources[i + 1];
                    i ++;
                    curCol ++;
                }
                i ++;
                let tmpToken = new Token(constInt, curString, curRow, curCol - curString.length + 1)
                this.tokenStream.push(tmpToken);
            }
            // is separator
            else if(separator.indexOf(curString) != -1){
                let tmpToken = new Token(curString, curString, curRow, curCol);
                this.tokenStream.push(tmpToken);
                i ++;
            }
            // is one line comment
            else if(curString === "/" && this.sources[i + 1] === "/"){
                while(this.sources[i + 1] != "\n"){
                    i ++;
                }
                i ++;
            }
            // is multiline comment
            else if(curString === "/" && this.sources[i + 1] === "*"){
                i += 2;
                curCol += 2;
                while(!(this.sources[i] === "*" && this.sources[i + 1] === "/")){
                    curCol ++;
                    if(this.sources[i] === "\n"){
                        curRow ++;
                        curCol = 0;
                    }
                    else if(this.sources[i] === "\t"){
                        curCol += 3;
                    }
                    i ++;
                }
            }
            // is two operator
            else if(operatorTwo.indexOf(curString + this.sources[i + 1]) != -1){
                curString += this.sources[i + 1];
                i += 2;
                let tmpToken = new Token(curString, curString, curRow, curCol - 1);
                this.tokenStream.push(tmpToken);
            }
            // is one operator
            else if(operatorOne.indexOf(curString) != -1){
                i ++;
                let tmpToken = new Token(curString, curString, curRow, curCol);
                this.tokenStream.push(tmpToken);
            }
            // error
            else{
                throw "Undefined Symbol!";
            }
        }
    }

    get getTokenStream(){
        return this.tokenStream;
    }
}

/**
 * @class: Compiler
 * @description: mian class
 */
class Compiler {

}

/**
 * @description: main fuction to work
 * @param: config
 */
function Work() {
    var testSources = "int main(){\n\tint a = 1 + 98304230;\n\treturn 0;\n}";
    var lexicalAnalysis = new LexicalAnalysis(testSources);
    lexicalAnalysis.analysisTokenStream();
    console.log(lexicalAnalysis.getTokenStream);
}