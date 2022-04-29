/**
 * @class: SemanticSymbol
 * @description: the symbol in analysis symbol table
 */
class SemanticSymbol {
    constructor(token, value, row, col, tableIdx, idx) {
        this.token = token;
        this.value = value;
        this.position = {row: row, col: col};
        this.tableIdx = tableIdx;
        this.idx = idx;
    }
}

/**
 * @class: IdentifierInfo
 * @description: the information of identifier including var function...
 */
class IdentifierInfo {
    constructor(type, typeType, value, fnParamNum, fnEntry, fnIdx) {
        this.type = type;
        this.typeType = typeType;
        this.value = value;
        this.fnParamNum = fnParamNum;
        this.fnEntry = fnEntry;
        this.fnIdx = fnIdx;
    }
}

/**
 * @class: SemanticSymbolTable
 * @description: the symbol table including glabal table, fuction table, block table
 *              temptable
 */
class SemanticSymbolTable {
    constructor(type, name) {
        this.type = type;
        this.name = name;
        this.table = [];
    }
}

/**
 * @class: SymanticAnalysis
 * @description: the symantic analysis while grammar analysis.
 */
export default class SymanticAnalysis {
    constructor() {
        this.symbols = []
        this.tables = []
        this.domainStack = []
        this.quaternaries = [];
        this.nextQ = 1;
        this.entry = -1;
        this.tmpCnt = 0;
        this.backpatchNum = 0;
        this.backpatchList = [];
    }
}