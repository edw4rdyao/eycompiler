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
                throw `Undefined Symbol '${curString}', in (${curRow},${curCol})`;
            }
        }
    }

    get getTokenStream(){
        return this.tokenStream;
    }
}

/**
 * @class: SemanticSymbol
 * @description: the symbol in analysis symbol table
 */
class SemanticSymbol{
    constructor(){

    }
}

/**
 * @class: IdentifierInfo
 * @description: the information of identifier including var function...
 */
class IdentifierInfo{
    constructor(){
        
    }
}

/**
 * @class: SemanticSymbolTable
 * @description: the symbol table including glabal table, fuction table, block table
 *              temptable
 */
class SemanticSymbolTable{
    constructor(){

    }
}

/**
 * @class: SymanticAnalysis
 * @description: the symantic analysis while grammar analysis.
 */
class SymanticAnalysis{
    constructor(){

    }
}

/**
 * @class: GrammarSymbol
 * @description: the symbols in the grammar
 */
class GrammarSymbol{
    constructor(type, token){
        this.type = type;
        this.firstSet = new Set();
        this.followSet = new Set();
        this.token = token;
    }
}

/**
 * @class: GrammarProduction
 * @description: the production in grammar e.g. A->BS
 */
class GrammarProduction{
    constructor(leftSymbol, rightSymbol) {
        this.leftSymbol = leftSymbol;
        this.rightSymbol = rightSymbol;
    }
}

/**
 * @class: Grammar
 * @description: the grammar of the sources
 */
class Grammar{
    constructor(grammarSource) {
        this.symbols = [];
        this.terminal = [];
        this.nonTerminal = [];
        this.productions = [];
        this.startProduction = -1;
        this.parserGrammar(grammarSource);
        this.getFirstSet();
    }
    parserGrammar(grammarSource){
        // add endToken #
        this.symbols.push(new GrammarSymbol('end', '#'));
        this.terminal.push(this.symbols.length - 1);
        // add emptyToken @
        this.symbols.push(new GrammarSymbol('empty', '@'));

        // for every production
        var allProductions = grammarSource.split('\n');
        for(let i = 0; i < allProductions.length; i ++){
            // clear the blank in begin and end
            let tmpPro = allProductions[i].trim();
            let twoPart = tmpPro.split('->');
            if(twoPart.length != 2){
                throw 'grammar error!';
            }
            let productionLeft = twoPart[0].trim();
            let productionRight = twoPart[1].trim();

            // split production right by '|'
            productionRight = productionRight.split('|');
            if(productionRight.length === 0){
                throw 'grammar error';
            }
            
            // get index of left symbol
            let tmpProductionLeft = -1;
            if(productionLeft != '@Declear'){
                tmpProductionLeft = this.getSymbolIndex(productionLeft);
                if(tmpProductionLeft == -1){
                    this.symbols.push(new GrammarSymbol('nonTerminal', productionLeft));
                    tmpProductionLeft = this.symbols.length - 1;
                    this.nonTerminal.push(tmpProductionLeft);
                }
            }
            
            if(tmpProductionLeft != -1){
                // for every production on right
                for(let i = 0; i < productionRight.length; i ++){
                    let tmpProductionRight = [];
                    // split the every symbol in the right production
                    let everyRightSymbols = productionRight[i].trim().split(/ +/);
                    for(let i = 0;  i < everyRightSymbols.length; i ++){
                        let curRightSymbol = this.getSymbolIndex(everyRightSymbols[i]);
                        if(curRightSymbol == -1){
                            // add to symbols
                            this.symbols.push(new GrammarSymbol('nonTerminal', everyRightSymbols[i].trim()));
                            this.nonTerminal.push(this.symbols.length - 1);
                            curRightSymbol = this.symbols.length - 1;
                        }
                        tmpProductionRight.push(curRightSymbol);
                    }
                    // add to production in grammar
                    this.productions.push(new GrammarProduction(tmpProductionLeft, tmpProductionRight));
                    // first production
                    if(this.symbols[tmpProductionLeft].token === 'S'){
                        this.startProduction = this.productions.length - 1;
                    }
                }
            }
            else{
                // push the all terminal
                for(let i = 0; i < productionRight.length; i ++){
                    this.symbols.push(new GrammarSymbol('terminal', productionRight[i].trim()));
                    this.terminal.push(this.symbols.length - 1);
                }
            }
        }
    }
    getFirstSet(){
        var f = false;
        while(true){
            f = false;
            for(let i = 0; i < this.nonTerminal.length; i ++){
                let nt = this.nonTerminal[i], ntfs = this.symbols[nt].firstSet;
                for(let j = 0; j < this.productions.length; j ++){
                    if(i == 1 && j == 1){
                        var a = 0;
                    }
                    let p = this.productions[j];
                    if(p.leftSymbol != nt){
                        continue;
                    }
                    p = this.productions[j].rightSymbol;
                    // the right is start by terminal or empty
                    if(this.terminal.indexOf(p[0])!= -1 || this.symbols[p[0]].type === 'empty'){
                        // insert the symbol into firstset, and update flag
                        if(!ntfs.has(p[0])){
                            ntfs.add(p[0]);
                            f = true;
                        }
                        continue;
                    }
                    // the right is start by non terminal
                    let be = true;
                    for(let k = 0; k < p.length; k ++){
                        let pk = p[k], pkfs = this.symbols[p[k]].firstSet;
                        // meet terminal
                        if(this.terminal.indexOf(pk)!= -1){
                            // merge the firstset
                            f = this.mergeFirstSet(ntfs, pkfs) || f;
                            be = false;
                            break;
                        }
                        
                        f = this.mergeFirstSet(ntfs, pkfs) || f;
                        be = be && pkfs.has(this.getSymbolIndex('@'));

                        if(!be) break;
                    }
                    // can be empty
                    if(be){
                        if(!ntfs.has(this.getSymbolIndex('@'))){
                            ntfs.add(this.getSymbolIndex('@'));
                            f = true;
                        }
                    }
                }
            }
            if(!f) break;
        }
    }
    getSymbolIndex(str){
        for(let i = 0;  i < this.symbols.length; i ++){
            if(str === this.symbols[i].token){
                return i;
            }
        }
        return -1;
    }
    firstSetOfString(str){
        var sfs = new Set();
        if(str.length == 0) return sfs;
        var be = true;

        // for every symbol
        for(let i = 0; i < str.length; i ++){
            let sifs = this.symbols[str[i]].firstSet;
            // is teiminal
            if(this.symbols[str[i]].type === 'terminal'){
                this.mergeFirstSet(sfs, sifs);
                be = false;
                break;
            }
            // is empty
            if(this.symbols[str[i]].type === 'empty'){
                sfs.add(str[i]);
                be = false;
                break;
            }
            // is non terminal
            this.mergeFirstSet(sfs, sifs);
            // if can be empty, then loop
            be = be && sifs.has(this.getSymbolIndex('@'));
            if(!be) break;
        }
        // all can be empty
        if(be){
            sfs.add(this.getSymbolIndex('@'));
        }
        return sfs;
    }
    mergeFirstSet(des, src){
        let s = des.size;
        let srcarr = Array.from(src);
        for (let i = 0; i < Array.from(src).length; i ++) {
            if(this.symbols[srcarr[i]].type != 'empty'){
                des.add(srcarr[i]);
            }
        }
        if(s < des.size) return true;
        else return false;
    }
}

/**
 * @class: LR(1) Item
 * @description: the item in LR(1) method A -> B.S
 */
class ItemLR1{
    constructor(leftSymbol, rightSymbol, proIndex, dotPosition, lookHead){
        this.leftSymbol = leftSymbol;
        this.rightSymbol = rightSymbol;
        this.proIndex = proIndex;
        this.dotPosition = dotPosition;
        this.lookHead = lookHead;
    }
    isEqual(tmpItem){
        return (this.leftSymbol === tmpItem.leftSymbol && this.rightSymbol === tmpItem.rightSymbol && 
                this.proIndex === tmpItem.proIndex && this.dotPosition === tmpItem.dotPosition &&
                this.lookHead === tmpItem.lookHead);
    }
}

/**
 * @class: GrammarAnalysis
 * @description: the grammar analysis, using input produce
 */
class GrammarAnalysis{
    constructor(grammarSource){
        this.grammar = new Grammar(grammarSource);
    }

    genItemSet(){
        // {S-> .Program, $}
        var it = new ItemLR1(this.grammar.getSymbolIndex());
    }

    genGotoTable(){

    }

    get getProduction(){
        return this.grammar.productions;
    }

    get getSysmbol(){
        return this.grammar.symbols;
    }
}

/**
 * @description: main fuction to work
 * @param: config
 */
function test() {
    var grammarSource = "\
        @Declear -> return | if | else | while | void | int | <ID> | <INT> | ; | , | ( | ) | { | } | + | - | * | / | = | > | < | >= | <= | != | ==\
        \nS -> Program\
        \nProgram -> ExtDefList \
        \nExtDefList -> ExtDef ExtDefList | @\
        \nExtDef -> VarSpecifier <ID> ; | FunSpecifier FunDec Block\
        \nVarSpecifier -> int\
        \nFunSpecifier -> void | int \
        \nFunDec -> <ID> CreateFunTable_m ( VarList )\
        \nCreateFunTable_m -> @\
        \nVarList -> ParamDec , VarList | ParamDec | @\
        \nParamDec -> VarSpecifier <ID>\
        \nBlock -> { DefList StmtList }\
        \nDefList -> Def DefList | @\
        \nDef -> VarSpecifier <ID> ;\
        \nStmtList -> Stmt StmtList | @\
        \nStmt -> AssignStmt ; | ReturnStmt ; | IfStmt | WhileStmt | CallStmt ;\
        \nAssignStmt -> <ID> = Exp\
        \nExp -> AddSubExp | Exp Relop AddSubExp\
        \nAddSubExp -> Item | Item + Item | Item - Item\
        \nItem -> Factor | Factor * Factor | Factor / Factor\
        \nFactor -> <INT> | ( Exp ) | <ID> | CallStmt\
        \nCallStmt -> <ID> ( CallFunCheck Args )\
        \nCallFunCheck -> @\
        \nArgs -> Exp , Args | Exp | @\
        \nReturnStmt -> return Exp | return\
        \nRelop -> > | < | >= | <= | == | !=\
        \nIfStmt -> if IfStmt_m1 ( Exp ) IfStmt_m2 Block IfNext\
        \nIfStmt_m1 -> @\
        \nIfStmt_m2 -> @\
        \nIfNext -> @ | IfStmt_next else Block\
        \nIfStmt_next -> @\
        \nWhileStmt -> while WhileStmt_m1 ( Exp ) WhileStmt_m2 Block\
        \nWhileStmt_m1 -> @\
        \nWhileStmt_m2 -> @\
    ";
    var gA = new GrammarAnalysis(grammarSource);
    var p = gA.getProduction;
    console.log(p);
    var s = gA.getSysmbol;
    console.log(gA.getSysmbol);
    p.forEach(function (v){
        console.log(`${s[v.leftSymbol].token}->`);
        v.rightSymbol.forEach(function (v){
            console.log(s[v].token);
        });
        console.log('\n');
    });
    
}