import SymanticAnalysis from './SymanticAnalysis.js'

/**
 * @class: GrammarSymbol
 * @description: the symbols in the grammar
 */
 class GrammarSymbol {
    constructor(type, token) {
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
class GrammarProduction {
    constructor(leftSymbol, rightSymbol) {
        this.leftSymbol = leftSymbol;
        this.rightSymbol = rightSymbol;
    }
}

/**
 * @class: Grammar
 * @description: the grammar of the sources
 */
class Grammar {
    constructor(grammarSource) {
        this.symbols = [];
        this.terminal = [];
        this.nonTerminal = [];
        this.productions = [];
        this.startProduction = -1;
        this.parserGrammar(grammarSource);
        this.getFirstSet();
    }
    parserGrammar(grammarSource) {
        // add endToken #
        this.symbols.push(new GrammarSymbol('end', '#'));
        this.terminal.push(this.symbols.length - 1);
        // add emptyToken @
        this.symbols.push(new GrammarSymbol('empty', '@'));

        // for every production
        var allProductions = grammarSource.split('\n');
        for (let i = 0; i < allProductions.length; i++) {
            // clear the blank in begin and end
            let tmpPro = allProductions[i].trim();
            if(tmpPro === '') continue;
            let twoPart = tmpPro.split('->');
            if (twoPart.length !== 2) {
                throw {
                    code: 200,
                    msg: 'Grammar format error! Please referance the format beside.'
                }
            }
            let productionLeft = twoPart[0].trim();
            let productionRight = twoPart[1].trim();

            // split production right by '|'
            productionRight = productionRight.split('|');
            if ((productionRight.length === 1 && productionRight[0] === '') || productionRight.length === 0) {
                throw {
                    code: 200,
                    msg: 'Grammar format error! Please referance the format beside.'
                }
            }

            // get index of left symbol
            let tmpProductionLeft = -1;
            if (productionLeft !== '@Declear') {
                tmpProductionLeft = this.getSymbolIndex(productionLeft);
                if (tmpProductionLeft === -1) {
                    this.symbols.push(new GrammarSymbol('nonTerminal', productionLeft));
                    tmpProductionLeft = this.symbols.length - 1;
                    this.nonTerminal.push(tmpProductionLeft);
                }
            }

            if (tmpProductionLeft !== -1) {
                // for every production on right
                for (let i = 0; i < productionRight.length; i++) {
                    let tmpProductionRight = [];
                    // split the every symbol in the right production
                    let everyRightSymbols = productionRight[i].trim().split(/ +/);
                    everyRightSymbols.forEach((v)=>{
                        let curRightSymbol = this.getSymbolIndex(v);
                        if(curRightSymbol === -1){
                            // add to symbols
                            this.symbols.push(new GrammarSymbol('nonTerminal', v.trim()));
                            this.nonTerminal.push(this.symbols.length - 1);
                            curRightSymbol = this.symbols.length - 1;
                        }
                        tmpProductionRight.push(curRightSymbol);
                    })
                    // add to production in grammar
                    this.productions.push(new GrammarProduction(tmpProductionLeft, tmpProductionRight));
                    // first production
                    if (this.symbols[tmpProductionLeft].token === 'S') {
                        this.startProduction = this.productions.length - 1;
                    }
                }
            }
            else {
                // push the all terminal
                productionRight.forEach((v)=>{
                    this.symbols.push(new GrammarSymbol('terminal', v.trim()));
                    this.terminal.push(this.symbols.length - 1);
                })
            }
        }
    }
    getFirstSet() {
        // for terminal
        this.terminal.forEach((v)=>{
            this.symbols[v].firstSet.add(v);
        })
        // for non terminal
        var f = false;
        while (true) {
            f = false;
            for (let i = 0; i < this.nonTerminal.length; i++) {
                let nt = this.nonTerminal[i], ntfs = this.symbols[nt].firstSet;
                for (let j = 0; j < this.productions.length; j++) {
                    let p = this.productions[j];
                    if (p.leftSymbol !== nt) {
                        continue;
                    }
                    p = this.productions[j].rightSymbol;
                    // the right is start by terminal or empty
                    if (this.terminal.indexOf(p[0]) !== -1 || this.symbols[p[0]].type === 'empty') {
                        // insert the symbol into firstset, and update flag
                        if (!ntfs.has(p[0])) {
                            ntfs.add(p[0]);
                            f = true;
                        }
                        continue;
                    }
                    // the right is start by non terminal
                    let be = true;
                    for (let k = 0; k < p.length; k++) {
                        let pk = p[k], pkfs = this.symbols[p[k]].firstSet;
                        // meet terminal
                        if (this.terminal.indexOf(pk) !== -1) {
                            // merge the firstset
                            f = this.mergeFirstSet(ntfs, pkfs) || f;
                            be = false;
                            break;
                        }

                        f = this.mergeFirstSet(ntfs, pkfs) || f;
                        be = be && pkfs.has(this.getSymbolIndex('@'));

                        if (!be) break;
                    }
                    // can be empty
                    if (be) {
                        if (!ntfs.has(this.getSymbolIndex('@'))) {
                            ntfs.add(this.getSymbolIndex('@'));
                            f = true;
                        }
                    }
                }
            }
            if (!f) break;
        }
    }
    getSymbolIndex(str) {
        for (let i = 0; i < this.symbols.length; i++) {
            if (str === this.symbols[i].token) {
                return i;
            }
        }
        return -1;
    }
    firstSetOfString(str) {
        var sfs = new Set();
        if (str.length === 0) return sfs;
        var be = true;

        // for every symbol
        for (let i = 0; i < str.length; i++) {
            let sifs = this.symbols[str[i]].firstSet;
            // is teiminal
            if (this.symbols[str[i]].type === 'terminal') {
                this.mergeFirstSet(sfs, sifs);
                be = false;
                break;
            }
            // is empty
            if (this.symbols[str[i]].type === 'empty') {
                sfs.add(str[i]);
                be = false;
                break;
            }
            // is non terminal
            this.mergeFirstSet(sfs, sifs);
            // if can be empty, then loop
            be = be && sifs.has(this.getSymbolIndex('@'));
            if (!be) break;
        }
        // all can be empty
        if (be) {
            sfs.add(this.getSymbolIndex('@'));
        }
        return sfs;
    }
    mergeFirstSet(des, src) {
        let s = des.size;
        let srcarr = Array.from(src);
        for (let i = 0; i < srcarr.length; i++) {
            if (this.symbols[srcarr[i]].type !== 'empty') {
                des.add(srcarr[i]);
            }
        }
        if (s < des.size) return true;
        else return false;
    }
}

/**
 * @class: LR(1) Item
 * @description: the item in LR(1) method A -> B.S
 */
class ItemLR1 {
    constructor(leftSymbol, rightSymbol, proIndex, dotPosition, lookHead) {
        this.leftSymbol = leftSymbol;
        this.rightSymbol = rightSymbol;
        this.proIndex = proIndex;
        this.dotPosition = dotPosition;
        this.lookHead = lookHead;
    }
}

/**
 * @class: GrammarAnalysis
 * @description: the pocess of grammar analysis, using input produce
 */
export default class GrammarAnalysis extends Grammar {
    constructor(grammarSource, tokenStream) {
        super(grammarSource);
        // the token stream to be parsed
        this.tokenStream = tokenStream;
        // item set group I0~Ixx
        this.itemSetGroup = [];
        // goto and action table ralated
        this.gotoInfo = new Map();
        this.actionTable = new Map();
        this.gotoTable = new Map();
        this.parserTable = [];
        // information of analysis step
        this.parseInfo = {
            // stateStack
            sts: [],
            // symbolStack
            sys: [],
            // parse step
            ps: 0,
            // parse token stream index
            pi: 0,
            // parse is over
            po: false
        }
        this.grammarTree = null;

        // genarate item set group
        this.genItemSetGroup();
        // genarate item set group
        this.genParsingTable();
    }

    itemEqual(ita, itb){
        return ita.leftSymbol === itb.leftSymbol && JSON.stringify(ita.rightSymbol) === JSON.stringify(itb.rightSymbol) && 
            ita.proIndex === itb.proIndex && ita.dotPosition === itb.dotPosition && ita.lookHead === itb.lookHead;
    }

    itemSetEqual(itsa, itsb){
        if(itsa.length !== itsb.length){
            return false;
        }
        var cnt = 0;
        for(let i = 0; i < itsa.length; i ++){
            for(let j = 0; j < itsb.length; j ++){
                if(this.itemEqual(itsa[i], itsb[j])){
                    cnt ++;
                    break;
                }
            }
        }
        return cnt === itsa.length;
    }

    genItemSetGroup() {
        // init ItemSet({S-> .Program, $}) and push to itsg
        var sp = this.productions[this.startProduction];
        var it = new ItemLR1(sp.leftSymbol, sp.rightSymbol, this.startProduction, 0, this.getSymbolIndex('#'));
        var its = [], itsg = this.itemSetGroup;
        its.push(it);
        itsg.push(this.getClosure(its));

        // for every itemset in itemset group
        for(let i = 0; i < itsg.length; i ++){
            // for every symbol
            for(let j = 0; j < this.symbols.length; j ++){
                // termial or nonTerminal
                if(this.symbols[j].type !== 'terminal' && this.symbols[j].type !== 'nonTerminal'){
                    continue;
                }
                let toits = this.getGotoIts(itsg[i], j);
                if(toits.length === 0){
                    continue;
                }
                // if already exist
                let toid = itsg.findIndex((v)=>{
                    return this.itemSetEqual(v, toits);
                });
                if(toid !== -1){
                    // record goto info
                    this.gotoInfo.set(i.toString() + ',' + j.toString(), toid);
                }
                else{
                    // add to itsg and record info
                    this.itemSetGroup.push(toits);
                    this.gotoInfo.set(i.toString() + ',' + j.toString(), this.itemSetGroup.length - 1);
                }

            }
        }
    }

    getClosure(its){
        // every item
        for(let i = 0; i < its.length; i ++){
            let iti = its[i];
            // . in the end
            if(iti.dotPosition >= iti.rightSymbol.length){
                continue;
            }
            // . next symbol
            let ns = iti.rightSymbol[iti.dotPosition];
            if(this.symbols[ns].type === 'terminal'){
                continue;
            }
            if(this.symbols[ns].type === 'empty'){
                iti.dotPosition ++;
                continue;
            }
            // get firstset (A->α.Bβ, a) βa
            let betaA = iti.rightSymbol.slice(iti.dotPosition + 1, iti.rightSymbol.length);
            betaA.push(iti.lookHead);
            let betaAFs = this.firstSetOfString(betaA);
            // find the production begin by ns
            for(let j = 0; j < this.productions.length; j ++){
                let pj = this.productions[j];
                if(pj.leftSymbol !== ns){
                    continue;
                }
                // push to its
                for(let k = 0; k < betaAFs.size; k++){
                    let fsk = (Array.from(betaAFs))[k];
                    let ittmp = null;
                    if(this.symbols[pj.rightSymbol[0]].type === 'empty'){
                        ittmp = new ItemLR1(pj.leftSymbol, pj.rightSymbol, j, 1, fsk);
                    }
                    else{
                        ittmp = new ItemLR1(pj.leftSymbol, pj.rightSymbol, j, 0, fsk);
                    }
                    // to sure there is not yet include this same item
                    let s = 0;
                    for(s = 0;  s < its.length; s ++){
                        if(this.itemEqual(ittmp, its[s])) break;
                    }
                    if(s === its.length){
                        its.push(ittmp);
                    }
                }
            }
        }
        return its;
    }

    getGotoIts(itsa, s){
        let itsb = [];
        if(this.symbols[s].type !== 'terminal' && this.symbols[s].type !== 'nonTerminal'){
            return itsb;
        }
        for(let i = 0; i < itsa.length; i ++){
            let iti = itsa[i];
            if(iti.dotPosition >= iti.rightSymbol.length){
                continue;
            }
            if(iti.rightSymbol[iti.dotPosition] !== s){
                continue;
            }
            itsb.push(new ItemLR1(iti.leftSymbol,iti.rightSymbol, iti.proIndex, iti.dotPosition + 1, iti.lookHead));
        }
        return this.getClosure(itsb);
    }

    genParsingTable() {
        // for every its in itsg, gen goto and action table
        for(let i = 0; i < this.itemSetGroup.length; i ++){
            // for every item
            let itsi = this.itemSetGroup[i];
            for(let j = 0; j < itsi.length; j ++){
                let itj = itsi[j];
                if(itj.dotPosition >= itj.rightSymbol.length){
                    if(this.symbols[itj.leftSymbol].token !== 'S'){
                        // reduce
                        this.actionTable.set(i.toString() + ',' + itj.lookHead.toString(),{
                            act: 'Reduce',
                            v: itj.proIndex
                        });
                    }
                    else{
                        // accept
                        this.actionTable.set(i.toString() + ',' + itj.lookHead.toString(),{
                            act: 'Accept',
                            v: -1
                        })
                    }
                }
                else{
                    // next symbol
                    let nts = itj.rightSymbol[itj.dotPosition];
                    // find in goto info
                    let gt = this.gotoInfo.get(i.toString() + ',' + nts.toString());
                    if(gt !== undefined){
                        // add to goto table
                        if(this.symbols[nts].type === 'nonTerminal'){
                            this.gotoTable.set(i.toString() + ',' + nts.toString(),{
                                act: 'Shift',
                                v: gt
                            })
                        }
                        // add to action table
                        else if(this.symbols[nts].type === 'terminal'){
                            this.actionTable.set(i.toString() + ',' + nts.toString(),{
                                act: 'Shift',
                                v: gt
                            })
                        }
                    }
                }
            }
        }
        // for every its in itsg, sort for every symbol
        for(let i = 0; i < this.itemSetGroup.length; i ++){
            let tableInfo = [];
            // for every terminal
            this.terminal.forEach((v)=>{
                let gt = this.actionTable.get(i.toString() + ',' + v.toString());
                let lb = '';
                if(gt !== undefined){
                    if(gt.act === 'Accept'){
                        lb = 'acc';
                    }
                    else if(gt.act === 'Reduce'){
                        lb = ('r' + gt.v);
                    }
                    else if(gt.act === 'Shift'){
                        lb = ('s' + gt.v);
                    }
                }
                else{
                    lb = 'err';
                }
                tableInfo.push({
                    s: this.symbols[v].token,
                    lable: lb
                })
            })
            // for every non terminal
            for(let j = 0; j < this.nonTerminal.length; j ++){
                let ntj = this.nonTerminal[j];
                if(this.symbols[ntj].token === 'S'){
                    continue;
                }
                let gt = this.gotoTable.get(i.toString() + ',' + ntj.toString());
                let lb = '';
                if(gt !== undefined){
                    lb = gt.v.toString();
                }
                else{
                    lb = 'err';
                }
                tableInfo.push({
                    s: this.symbols[ntj].token,
                    lable: lb
                })
            }
            this.parserTable.push(tableInfo);
        }
    }

    analysisGrammarSemantic(){
        // init the user parse infomation
        this.parseInfo.sys.push(this.getSymbolIndex('#'));
        this.parseInfo.sts.push(0);
        // system parse infomation
        var sys = [this.getSymbolIndex('#')];
        var sts = [0];
        var tns = [];
        // for every token
        for(let i = 0; i < this.tokenStream.length; i ++){
            var cs = sts[sts.length - 1];
            // current token index in sysbolms
            var tokenpi = this.tokenStream[i];
            var cti = this.getSymbolIndex(tokenpi.token);
            if(cti === -1){
                throw {
                    code: 300,
                    msg: `Grammar Error: Undefined Words ${tokenpi.token}, in (${tokenpi.position.row},${tokenpi.position.col})`
                }
            }
            // find next action info in action table
            var next = this.actionTable.get(cs.toString() + ',' + cti.toString());
            // parse the action
            if(next === undefined){
                throw {
                    code: 301,
                    msg: `Grammar Error: Can't Analysis, in (${tokenpi.position.row},${tokenpi.position.col})`
                }
            }
            if(next.act === 'Shift'){
                sys.push(cti);
                sts.push(next.v);
                // push tree node
                tns.push({
                    name: tokenpi.token
                })
                // todo: semantical analysis
            }
            else if(next.act === 'Reduce'){
                var proi = next.v;
                var pro = this.productions[proi];
                var tnc = [];
                // empty need not pop
                if(this.symbols[pro.rightSymbol[0]].type !== 'empty'){
                    for(let i = 0; i < pro.rightSymbol.length; i ++){
                        sts.pop();
                        sys.pop();
                        tnc.push(tns.pop());
                    }
                }
                // search the goto table
                next = this.gotoTable.get(sts[sts.length - 1].toString() + ',' + pro.leftSymbol.toString());
                if(next === undefined){
                    throw {
                        code: 301,
                        msg: `Grammar Error: Can't Analysis, in (${tokenpi.position.row},${tokenpi.position.col})`
                    }
                }
                // push in
                sys.push(pro.leftSymbol);
                sts.push(next.v);
                // genarate grammar tree data
                var tn = {
                    name: this.symbols[pro.leftSymbol].token
                }
                if(tnc.length !== 0){
                    tn.children = tnc.reverse();
                    
                }
                tns.push(tn);

                i --;
                // todo: semantical analysis
            }
            else if(next.act === 'Accept'){
                this.grammarTree = tns[0];
                return ;
            }
        }
    }

    analysisGrammarSemanticStep(){
        var info = this.parseInfo;
        var cs = info.sts[info.sts.length - 1];
        // current token index in sysbolms
        var tokenpi = this.tokenStream[info.pi];
        var cti = this.getSymbolIndex(tokenpi.token);
        // find next action info in action table
        var next = this.actionTable.get(cs.toString() + ',' + cti.toString());
        // parse the action
        if(next.act === 'Shift'){
            info.sys.push(cti);
            info.sts.push(next.v);
        }
        else if(next.act === 'Reduce'){
            var proi = next.v;
            var pro = this.productions[proi];
            // empty need not pop
            if(this.symbols[pro.rightSymbol[0]].type !== 'empty'){
                for(let i = 0; i < pro.rightSymbol.length; i ++){
                    info.sts.pop();
                    info.sys.pop();
                }
            }
            // search the goto table
            next = this.gotoTable.get(info.sts[info.sts.length - 1].toString() + ',' + pro.leftSymbol.toString());
            // push in
            info.sys.push(pro.leftSymbol);
            info.sts.push(next.v);
            info.pi --;
        }
        else if(next.act === 'Accept'){
            info.po = true;
            return true;
        }
        return false;
    }

    get getProduction() {
        return this.productions;
    }

    get getSysmbol() {
        return this.symbols;
    }

    get getItemSetGroup(){
        return this.itemSetGroup;
    }

    get getParserTable(){
        return this.parserTable;
    }

    get getGrammarTreeData(){
        return this.grammarTree;
    }
}
