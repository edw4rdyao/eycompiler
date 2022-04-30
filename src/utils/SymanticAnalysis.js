/**
 * @class: SemanticSymbol
 * @description: the symbol in analysis symbol table
 */
class SemanticSymbol {
  constructor(token, value, row, col, tableIdx, idx) {
    this.token = token;
    this.value = value;
    this.position = { row: row, col: col };
    this.tableIdx = tableIdx;
    this.idx = idx;
  }
}

/**
 * @class: Identifier
 * @description: the information of identifier including var function...
 */
class Identifier {
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

class Quaternary {
  constructor(index, op, arg1, arg2, res) {
    this.index = index;
    this.op = op;
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.res = res;
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
    // craete glbal symbols tables
    this.tables.push(new SemanticSymbolTable('global table', 'global table'));
    // create tmp var table
    this.tables.push(new SemanticSymbolTable('tmp var table'));
    // init domain
    this.domainStack.push(0);
  }
  analysisSemantic(pl, pr) {
    if (pl === 'Program') {
      // no main procedure
      if (this.entry === -1) {
        throw 'no main procedure'
      }
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, '', -1, -1, -1, -1));
      this.quaternaries.unshift(new Quaternary(0, 'j', '-', '-', this.entry.toString()));
    }
    else if (pl === 'ExtDef') {
      // if is var define
      if (pr.length === 3) {
        // get type and id
        const type = this.symbols.slice(-3)[0];
        const id = this.symbols.slice(-2)[0];
        // redefine check
        const curDomain = this.tables[this.domainStack.slice(-1)[0]];
        if (curDomain.table.findIndex(s => s.value === id.value) !== -1) {
          throw 'redefine'
        }
        // add to cur table
        curDomain.table.push(new Identifier('var', type.value, id.value, -1, -1, -1));
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, id.value, id.position.row, id.position.col,
          this.domainStack.slice(-1)[0], curDomain.table.length - 1));
      }
      // procedure define
      else {
        const id = this.symbols.slice(-2)[0];
        // exist cur domain
        this.domainStack.pop();
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, id.value, id.position.row,
          id.position.col, id.tableIdx, id.idx));
      }
    }
    else if (pl === 'VarSpecifier' || pl === 'FunSpecifier') {
      const type = this.symbols.slice(-1)[0];
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, type.value, type.position.row,
        type.position.col, -1, -1));
    }
    else if (pl === 'FunDec') {
      const m = this.symbols.slice(-4)[0];
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, m.value, m.position.row,
        m.position.col, m.tableIdx, m.idx));
    }
    else if (pl === 'CreateFunTableM') {
      // create procedure table
      const id = this.symbols.slice(-1)[0];
      const returnType = this.symbols.slice(-2)[0];
      // redefine check
      if (this.tables[0].findIndex(s => s.value === id.value) !== -1) {
        throw 'redefine'
      }
      // create procedure table
      this.tables.push(new SemanticSymbolTable('function table', id.value));
      // add fuction symbol
      this.tables[0].table.push(new Identifier('fuction', returnType.value, id.value, 0, 0, this.tables.length - 1));
      // push to domain
      this.domainStack.push(this.tables.length - 1);
      // if it is main fuction
      if (id.value === 'main') {
        this.entry = this.nextQ;
      }
      // add quaternary
      this.quaternaries.push(new Quaternary(this.nextQ++, id.value, '-', '-', '-'));
      // add return value to fuction table
      this.tables[this.domainStack.slice(-1)[0]].table.push(new SemanticSymbol(new Identifier(
        'return', returnType.value, id.value + ' return',
        -1, -1, -1
      )))
      // add symbol
      this.symbols.push(new SemanticSymbol(pl, id.value, id.position.row,
        id.position.col, 0, this.tables[0].table.length - 1));
    }
    else if (pl === 'ParamDec') {
      const id = this.symbols.slice(-1)[0];
      const type = this.symbols.slice(-2)[0];
      const curDomain = this.tables[this.domainStack.slice(-1)[0]];
      // check redefine
      if (curDomain.table.findIndex(s => s.value === id.value) !== -1) {
        throw 'redefine'
      }
      // add param
      curDomain.table.push(new Identifier('var', type.value, id.value,
        -1, -1, -1));
      this.tables[0].table.find(s => s.value === curDomain.name).fnParamNum ++;
      // add quaternary
      this.quaternaries.push(new Quaternary(this.nextQ ++, 'param', '-', '-', id.value));
      // update symbols
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, id.value, id.position.row,
        id.position.col, this.domainStack.slice(-1)[0], curDomain.table.length - 1));
    }
  }
}