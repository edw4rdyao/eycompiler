/**
 * @class SemanticSymbol
 * @description the symbol in analysis symbol table
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
 * @class Identifier
 * @description the information of identifier including var function...
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
 * @class SemanticSymbolTable
 * @description the symbol table including glabal table, fuction table, block table
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
 * @class Quaternary
 * @description the Quaternary object.
 */
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
 * @class SemanticAnalysis
 * @description the semantic analysis while grammar analysis.
 */
export default class SemanticAnalysis {
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
    this.tables.push(new SemanticSymbolTable('tmp table', 'tmp table'));
    // init domain
    this.domainStack.push(0);
  }
  addSymbols(token, value, row, col) {
    this.symbols.push(new SemanticSymbol(token, value, row, col, -1, -1));
  }
  analysisSemantic(pl, pr) {
    if (pl === 'program') {
      // no main procedure
      if (this.entry === -1) {
        throw {
          code: 300,
          msg: '[Semantic Error] No main function: 未定义main函数'
        }
      }
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, '', -1, -1, -1, -1));
      this.quaternaries.unshift(new Quaternary(0, 'j', '-', '-', this.entry.toString()));
    }
    else if (pl === 'ext_def') {
      // if is var define
      if (pr.length === 3) {
        // get type and id
        const type = this.symbols.slice(-3)[0];
        const id = this.symbols.slice(-2)[0];
        // redefine check
        const curDomain = this.tables[this.domainStack.slice(-1)[0]];
        if (curDomain.table.findIndex(s => s.value === id.value) !== -1) {
          throw {
            code: 300,
            mag: `[Semantic Error] Redefine '${id.value}', in (${id.position.row},${id.position.row}): 变量重定义`
          }
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
    else if (pl === 'var_type' || pl === 'fun_type') {
      const type = this.symbols.slice(-1)[0];
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, type.value, type.position.row,
        type.position.col, -1, -1));
    }
    else if (pl === 'fun_dec') {
      const m = this.symbols.slice(-4)[0];
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, m.value, m.position.row,
        m.position.col, m.tableIdx, m.idx));
    }
    else if (pl === 'fun_table_m') {
      // create procedure table
      const id = this.symbols.slice(-1)[0];
      const returnType = this.symbols.slice(-2)[0];
      // redefine check
      if (this.tables[0].table.findIndex(s => s.value === id.value) !== -1) {
        throw {
          code: 300,
          msg: `[Semantic Error] Redefine '${id.value}', in (${id.position.row}, ${id.position.col}): 函数重定义`
        }
      }
      // create procedure table
      this.tables.push(new SemanticSymbolTable('function table', id.value));
      // add fuction symbol
      this.tables[0].table.push(new Identifier('function', returnType.value, id.value, 0, 0, this.tables.length - 1));
      // push to domain
      this.domainStack.push(this.tables.length - 1);
      // if it is main fuction
      if (id.value === 'main') {
        this.entry = this.nextQ;
      }
      // add quaternary
      this.quaternaries.push(new Quaternary(this.nextQ++, id.value, '-', '-', '-'));
      // add return value to fuction table
      this.tables[this.domainStack.slice(-1)[0]].table.push(new Identifier(
        'return', returnType.value, id.value + ' return',
        -1, -1, -1
      ))
      // add symbol
      this.symbols.push(new SemanticSymbol(pl, id.value, id.position.row,
        id.position.col, 0, this.tables[0].table.length - 1));
    }
    else if (pl === 'param_dec') {
      const id = this.symbols.slice(-1)[0];
      const type = this.symbols.slice(-2)[0];
      const curDomain = this.tables[this.domainStack.slice(-1)[0]];
      // check redefine
      if (curDomain.table.findIndex(s => s.value === id.value) !== -1) {
        throw {
          code: 300,
          msg: `[Semantic Error] Redefine '${id.value}', in (${id.position.row}, ${id.position.col}): 参数重定义`
        }
      }
      // add param
      curDomain.table.push(new Identifier('var', type.value, id.value,
        -1, -1, -1));
      this.tables[0].table.find(s => s.value === curDomain.name).fnParamNum++;
      // add quaternary
      this.quaternaries.push(new Quaternary(this.nextQ++, 'fparam', '-', '-', id.value));
      // update symbols
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, id.value, id.position.row,
        id.position.col, this.domainStack.slice(-1)[0], curDomain.table.length - 1));
    }
    else if (pl === 'block') {
      // update symbols
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, this.nextQ.toString(),
        -1, -1, -1, -1));
    }
    else if (pl === 'def') {
      const id = this.symbols.slice(-2)[0];
      const type = this.symbols.slice(-3)[0];
      const curDomain = this.tables[this.domainStack.slice(-1)[0]];
      // check redefine
      if (curDomain.table.findIndex(s => s === id.value) !== -1) {
        throw {
          code: 300,
          msg: `[Semantic Error] Redefine '${id.value}', in (${id.position.row}, ${id.position.col}): 变量重定义`
        }
      }
      curDomain.table.push(new Identifier('var', type.value, id.value,
        -1, -1, -1));
      // update symbols
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, id.value, id.position.row,
        id.position.col, this.domainStack.slice(-1)[0], curDomain.table.length - 1))
    }
    else if (pl === 'assign_stmt') {
      const id = this.symbols.slice(-3)[0];
      const exp = this.symbols.slice(-1)[0];
      // check define, by above domains
      let idDomain = -1;
      let idIndex = -1;
      for (let i = this.domainStack.length - 1; i >= 0; i--) {
        idIndex = this.tables[this.domainStack[i]].table.findIndex(s => s.value === id.value);
        if (idIndex !== -1) {
          idDomain = this.domainStack[i];
          break;
        }
      }
      if (idDomain === -1) {
        throw {
          code: 300,
          msg: `[Semantic Error] Not define '${id.value}', in (${id.position.row}, ${id.position.col}): 变量未定义`
        }
      }
      // add quaternary
      this.quaternaries.push(new Quaternary(this.nextQ++, '=', exp.value,
        '-', id.value));
      // update symbols
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, id.value, id.position.row,
        id.position.col, idDomain, idIndex));
    }
    else if (pl === 'exp') {
      // relation?
      if (pr.length === 3) {
        const expLeft = this.symbols.slice(-3)[0];
        const op = this.symbols.slice(-2)[0];
        const expRight = this.symbols.slice(-1)[0];
        const nextQSave = this.nextQ;
        // add quaternary
        const tmp = `T${(this.tmpCnt++).toString()}`;
        this.quaternaries.push(new Quaternary(this.nextQ++, 'j' + op.value, expLeft.value,
          expRight.value, (nextQSave + 3).toString()));
        this.quaternaries.push(new Quaternary(this.nextQ++, '=', '0', '-', tmp));
        this.quaternaries.push(new Quaternary(this.nextQ++, 'j', '-', '-', (nextQSave + 4).toString()));
        this.quaternaries.push(new Quaternary(this.nextQ++, '=', '1', '-', tmp));
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, tmp, -1, -1, -1, -1));
      } else {
        const exp = this.symbols.slice(-1)[0];
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, exp.value, exp.position.row,
          exp.position.col, exp.tableIdx, exp.idx));
      }
    }
    else if (pl === 'add_sub_exp' || pl === 'item') {
      // addsubexp <= item
      if (pr.length === 1) {
        const exp = this.symbols.slice(-1)[0];
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, exp.value, exp.position.row,
          exp.position.col, exp.tableIdx, exp.idx));
      } else {
        const expLeft = this.symbols.slice(-3)[0];
        const op = this.symbols.slice(-2)[0];
        const expRight = this.symbols.slice(-1)[0];
        const tmp = `T${this.tmpCnt++}`;
        this.quaternaries.push(new Quaternary(this.nextQ++, op.value,
          expLeft.value, expRight.value, tmp));
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, tmp, -1, -1, -1, -1));
      }
    }
    else if (pl === 'factor') {
      if (pr.length === 1) {
        const exp = this.symbols.slice(-1)[0];
        // check define
        if (pr[0] === '<ID>') {
          let idDomain = -1;
          let idIndex = -1;
          for (let i = this.domainStack.length - 1; i >= 0; i--) {
            idIndex = this.tables[this.domainStack[i]].table.findIndex(s => s.value === exp.value);
            if (idIndex !== -1) {
              idDomain = this.domainStack[i];
              break;
            }
          }
          if (idDomain === -1) {
            throw {
              code: 300,
              msg: `[Semantic Error] Not define '${exp.value}', in (${exp.position.row}, ${exp.position.col}): 变量未定义`
            }
          }
        }
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, exp.value, exp.position.row,
          exp.position.col, exp.tableIdx, exp.idx));
      } else {
        const exp = this.symbols.slice(-2)[0];
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, exp.value, exp.position.row,
          exp.position.col, exp.tableIdx, exp.idx));
      }
    }
    else if (pl === 'call_stmt') {
      const fnid = this.symbols.slice(-5)[0];
      const fninfo = this.symbols.slice(-3)[0];
      const params = this.symbols.slice(-2)[0];
      // check param num
      const paramNum = this.tables[fninfo.tableIdx].table[fninfo.idx].fnParamNum;
      if (parseInt(params.value) !== paramNum) {
        throw {
          code: 300,
          msg: `[Semantic Error] Params not match '${fnid.value}', in (${fnid.position.row}, ${fnid.position.col}): 参数不匹配`
        }
      }
      const tmp = `T${this.tmpCnt++}`;
      this.quaternaries.push(new Quaternary(this.nextQ++, 'call', fnid.value, '-', tmp));
      // update symbols
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, tmp, -1, -1, -1, -1));
    }
    else if (pl === 'call_fun_check') {
      const fnid = this.symbols.slice(-2)[0];
      // check define
      const fnIdx = this.tables[0].table.findIndex(s => (s.value === fnid.value && s.type === 'function'));
      if (fnIdx === -1) {
        throw {
          code: 300,
          msg: `[Semantic Error] Not define '${fnid.value}', in (${fnid.position.row}, ${fnid.position.col}): 函数未定义`
        }
      }
      this.symbols.push(new SemanticSymbol(pl, fnid.value, fnid.position.row,
        fnid.position.col, 0, fnIdx));
    }
    else if (pl === 'args') {
      if (pr.length === 3) {
        const exp = this.symbols.slice(-3)[0];
        this.quaternaries.push(new Quaternary(this.nextQ++, 'param', exp.value, '-', '-'));
        const paramNumPre = parseInt(this.symbols.slice(-1)[0].value);
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, (paramNumPre + 1).toString(), -1, -1, -1, -1));
      } else if (pr[0] === '@') {
        this.symbols.push(new SemanticSymbol(pl, '0', -1, -1, -1, -1));
      } else {
        const exp = this.symbols.slice(-1)[0];
        this.quaternaries.push(new Quaternary(this.nextQ++, 'param', exp.value, '-', '-'));
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, '1', -1, -1, -1, -1));
      }
    }
    else if (pl === 'return_stmt') {
      if (pr.length === 2) {
        const returnExp = this.symbols.slice(-1)[0];
        const curDomain = this.tables[this.domainStack.slice(-1)[0]];
        this.quaternaries.push(new Quaternary(this.nextQ++, '=', returnExp.value, '-',
          curDomain.table[0].value));
        this.quaternaries.push(new Quaternary(this.nextQ++, 'return', curDomain.table[0].value,
          '-', curDomain.name));
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, returnExp.value, -1, -1, -1, -1));
      } else {
        const curDomain = this.tables[this.domainStack.slice(-1)[0]];
        // check return type
        if (this.tables[0].table.find(s => s.value === curDomain.name).typeType !== 'void') {
          throw {
            code: 300,
            msg: `[Semantic Error] Return error '${curDomain.name}': 函数返回值错误`
          }
        }
        this.quaternaries.push(new Quaternary(this.nextQ++, 'return', '-', '-', curDomain.name));
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
        this.symbols.push(new SemanticSymbol(pl, '', -1, -1, -1, -1));
      }
    }
    else if (pl === 'relop') {
      const op = this.symbols.slice(-1)[0];
      // update symbols
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, op.value, -1, -1, -1, -1));
    }
    else if (pl === 'if_stmt') {
      const m2 = this.symbols.slice(-3)[0];
      const next = this.symbols.slice(-1)[0];
      if (next.value.length === 0) {
        // ture export
        this.quaternaries[this.backpatchList.slice(-1)[0]].res = m2.value;
        this.backpatchList.pop();
        // false export
        this.quaternaries[this.backpatchList.slice(-1)[0]].res = this.nextQ.toString();
        this.backpatchList.pop();
      } else {
        // block export
        this.quaternaries[this.backpatchList.slice(-1)[0]].res = this.nextQ.toString();
        this.backpatchList.pop();
        // ture export
        this.quaternaries[this.backpatchList.slice(-1)[0]].res = m2.value;
        this.backpatchList.pop();
        // ture export
        this.quaternaries[this.backpatchList.slice(-1)[0]].res = next.value;
        this.backpatchList.pop();
      }
      this.backpatchNum--;
      // update symbols
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, '', -1, -1, -1, -1));
    }
    else if (pl === 'if_m1') {
      this.backpatchNum++;
      this.symbols.push(new SemanticSymbol(pl, this.nextQ.toString(), -1, -1, -1, -1));
    }
    else if (pl === 'if_m2') {
      const exp = this.symbols.slice(-2)[0];
      // false export, to be backpatch
      this.quaternaries.push(new Quaternary(this.nextQ++, 'j=', exp.value, '0', ''));
      this.backpatchList.push(this.quaternaries.length - 1);
      // ture export, to be backpatch
      this.quaternaries.push(new Quaternary(this.nextQ++, 'j', '-', '-', ''));
      this.backpatchList.push(this.quaternaries.length - 1);
      this.symbols.push(new SemanticSymbol(pl, this.nextQ.toString(), -1, -1, -1, -1));
    }
    else if (pl === 'if_next') {
      const next = this.symbols.slice(-3)[0];
      // update symbols
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, next.value, -1, -1, -1, -1));
    }
    else if (pl === 'if_stmt_next') {
      // if jump
      this.quaternaries.push(new Quaternary(this.nextQ++, 'j', '-', '-', ''));
      this.backpatchList.push(this.quaternaries.length - 1);
      this.symbols.push(new SemanticSymbol(pl, this.nextQ.toString(), -1, -1, -1, -1));
    }
    else if (pl === 'while_stmt') {
      const m1 = this.symbols.slice(-6)[0];
      const m2 = this.symbols.slice(-2)[0];
      // jump to while
      this.quaternaries.push(new Quaternary(this.nextQ++, 'j', '-', '-', m1.value));
      // ture export
      this.quaternaries[this.backpatchList.slice(-1)[0]].res = m2.value;
      this.backpatchList.pop();
      // fasle export
      this.quaternaries[this.backpatchList.slice(-1)[0]].res = this.nextQ.toString();
      this.backpatchList.pop();
      this.backpatchNum--;
      // update symbols
      for (let i = 0; i < pr.length; i++) {
        this.symbols.pop();
      }
      this.symbols.push(new SemanticSymbol(pl, '', -1, -1, -1, -1));
    }
    else if (pl === 'while_m1') {
      this.backpatchNum++;
      this.symbols.push(new SemanticSymbol(pl, this.nextQ.toString(), -1, -1, -1, -1));
    }
    else if (pl === 'while_m2') {
      const exp = this.symbols.slice(-2)[0];
      // false export
      this.quaternaries.push(new Quaternary(this.nextQ++, 'j=', exp.value, '0', ''));
      this.backpatchList.push(this.quaternaries.length - 1);
      // ture export
      this.quaternaries.push(new Quaternary(this.nextQ++, 'j', '-', '-', ''));
      this.backpatchList.push(this.quaternaries.length - 1);
      this.symbols.push(new SemanticSymbol(pl, this.nextQ.toString(), -1, -1, -1, -1));
    }
    else {
      if (pr[0] !== '@') {
        // update symbols
        for (let i = 0; i < pr.length; i++) {
          this.symbols.pop();
        }
      }
      this.symbols.push(new SemanticSymbol(pl, '', -1, -1, -1, -1));
    }
  }
  get getQuaternaries() {
    return this.quaternaries;
  }
}