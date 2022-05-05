const DataStartAddr = 0x10010000;
const StackStartAddr = 0x10040000;
// 32 regs name of mips
const RegNames = [
  '$zero', '$at', '$v0', '$v1', '$a0', '$a1', '$a2', '$a3',
  '$t0', '$t1', '$t2', '$t3', '$t4', '$t5', '$t6', '$t7',
  '$s0', '$s1', '$s2', '$s3', '$s4', '$s5', '$s6', '$s7',
  '$t8', '$t9', '$k0', '$k1', '$gp', '$sp', '$fp', '$ra'
]

/**
 * @class AsmGenerator
 * @description generate asm code from quaternaries
 */
export default class AsmGenerator {
  constructor(quaternaries) {
    // var in register
    this.regVar = [];
    // quaternaries
    this.quaternaries = quaternaries;
    // the usage of regster
    this.regInfo = [];
    // the regfiles of var
    this.varRegs = {};
    // local var offset of ebp
    this.localOffset = {};
    // global var address
    this.globalAddr = {};
    // current produre block name
    this.tmpBlockName = "";
    this.asm = [];
    this.labelSet = new Set();
    this.paramSize = 8;
    this.loaclSize = 4;
    this.globalSize = DataStartAddr;
    // get quaternaty lables(L)
    for (let q of quaternaries) {
      if (q.op === 'j' || q.op === 'j=' || q.op === 'j<' || q.op === 'j>'
        || q.op === 'j<=' || q.op === 'j>=') {
        this.labelSet.add(q.res);
      }
    }
    // init resgister info and value
    for (let i = 0; i < RegNames.length; i++) {
      this.regInfo.push({ name: RegNames[i], free: 0 });
      if (i === 0) this.regVar[i] = '0';
      else this.regVar[i] = '';
    }
  }
  generate() {
    this.asm.push(`addi $sp, $sp, 0x${StackStartAddr.toString(16)}`);
    this.asm.push(`addi $sp, $sp, 0x${(StackStartAddr - 4).toString(16)}`);
    for (let q of this.quaternaries) {
      for (let r of this.regInfo) {
        r.free++;
      }
      this.generateAsm(q);
    }
  }
  generateAsm(q) {
    // if it is a label
    if (this.labelSet.has(q.index.toString())) {
      this.asm.push(`label${q.index}: `);
    }
    if (q.op === 'call') {
      // procedure call, create stack frame and jump
      // save context
      let saveReg = "";
      for (let l in this.localOffset) {
        if (!this.varRegs[l]) continue;
        let freeMax = 1e7;
        let r = this.varRegs[l];
        let rfree = this.regInfo.find(rr => rr.name === r).free;;
        if (rfree < freeMax) {
          freeMax = rfree;
          saveReg = r;
        }
        this.asm.push(`sw ${saveReg}, ${this.localOffset[l]}($fp)`);
      }
      // jump
      this.asm.push(`jal ${q.arg1}`);
      // the return value save
      let regSaveIdx = this.assignReg(q.res, -1);
      // recover register
      for (let l in this.localOffset) {
        if (!this.varRegs[l]) continue;
        let r = this.varRegs[l];
        this.asm.push(`lw ${r}, ${this.localOffset[l]}($fp)`);
      }
      this.asm.push(`move ${RegNames[regSaveIdx]}, $v1`);
      this.regInfo[regSaveIdx].free = 0;
    }
    else if (q.op === 'return') {
      // destory stack frame and jump
      if (q.arg1 !== '-') {
        this.asm.push(`move $v1, ${this.varRegs[q.arg1]}`);
      }
      // release regs
      for (let l in this.localOffset) {
        if (this.varRegs[l]) {
          let r = this.varRegs[l];
          this.regVar[this.regInfo.findIndex(rr => rr.name === r)] = '';
          this.varRegs[l] = undefined;
        }
      }
      // change esp
      this.asm.push(`move $sp, $fp`);
      this.asm.push(`addi $sp, $sp, ${this.paramSize}`);
      // return addr to $ra
      this.asm.push(`lw $ra, 4($fp)`);
      // change ebp
      this.asm.push(`lw $fp, 0($fp)`);
      if (this.tmpBlockName !== 'main') this.asm.push(`jr $ra`);
      this.tmpBlockName = '';
      this.loaclSize = -4;
      this.paramSize = 8;
      this.localOffset = {};
    }
    else if (q.op === 'j') {
      // jump to procedure ???
      if (/^[0-9]$/.test(q.res[0])) {
        this.asm.push(`j label${q.res}`);
      } else {
        // jump to label
        for (let qq of this.quaternaries) {
          if (q.res === qq.idx.toString()) {
            this.asm.push(`j ${qq.op}`);
          }
        }
      }
    }
    else if (q.op === 'param') {
      let reg;
      // param push to stack
      // if it isn't at reg
      if (!this.varRegs[q.arg1]) {
        // it is local var
        if (this.localOffset[q.arg1]) {
          const offset = this.localOffset[q.arg1];
          reg = this.assignReg(q.arg1, -1);
          this.asm.push(`lw ${RegNames[reg]}, ${offset}($fp)`);
          this.asm.push(`subi $sp, $sp, 4`);
          this.asm.push(`sw ${RegNames[reg]}, 0($sp)`);
        } else if (this.globalAddr[q.arg1]) {
          const addr = this.globalAddr[q.arg1];
          this.asm.push(`lw ${RegNames[reg]}, ${addr}($zero)`);
          this.asm.push(`subi $sp, $sp, 4`);
          this.asm.push(`sw ${RegNames[reg]}, 0($sp)`);
        }
      } else {
        reg = this.regInfo.findIndex(r => r.name === this.varRegs[q.arg1]);
        this.asm.push(`subi $sp, $sp, 4`);
        this.asm.push(`sw ${RegNames[reg]}, 0($sp)`);
        this.regInfo[reg].free = 0;
      }
    }
    else if (q.op === 'fparam') {
      this.localOffset[q.res] = this.paramSize;
      this.paramSize += 4;
    }
    else if (q.op === '+' || q.op === '-' || q.op === '*' || q.op === '/') {
      const regA = this.assignReg(q.res, -1);
      var regB, regC;
      // check regB
      if (!this.varRegs[q.arg1]) {
        if (this.localOffset[q.arg1]) {
          const offset = this.localOffset[q.arg1];
          this.asm.push(`lw ${RegNames[regA]}, ${offset}($fp)`);
        } else if (this.globalAddr[q.arg1]) {
          const addr = this.globalAddr[q.arg1];
          this.asm.push(`lw ${RegNames[regA]}, ${addr}($zero)`);
        }
        regB = regA;
      } else {
        regB = this.regInfo.findIndex(r => r.name === this.varRegs[q.arg1]);
      }
      this.regInfo[regB].free = 0;
      // check regC
      if (/^[0-9]+$/.test(q.arg2)) {
        if (q.op === '+') {
          this.asm.push(`addi ${RegNames[regA]}, ${RegNames[regB]}, ${q.arg2}`);
        } else if (q.op === '*') {
          this.asm.push(`addi $t8, $zero, ${q.arg2}`);
          this.asm.push(`mul ${RegNames[regA]}, ${RegNames[regB]}, $t8`);
        } else if (q.op === '-') {
          this.asm.push(`subi ${RegNames[regA]}, ${RegNames[regB]}, ${q.arg2}`);
        } else if (q.op === '/') {
          this.asm.push(`addi $t8, $zero, ${q.arg2}`);
          this.asm.push(`div ${RegNames[regB]}, $t8`);
          this.asm.push(`mov ${RegNames[regA]}, $lo`);
        }
      }
      else {
        // check regC
        if (!this.varRegs[q.arg2]) {
          regC = this.assignReg(q.arg2, regA);
        } else {
          regC = this.regInfo.findIndex(r => r.name === this.varRegs[q.arg2]);
        }
        this.regInfo[regC].free = 0;
        if (q.op === '+') {
          this.asm.push(`add ${RegNames[regA]}, ${RegNames[regB]}, ${RegNames[regC]}`);
        } else if (q.op === '-') {
          this.asm.push(`sub ${RegNames[regA]}, ${RegNames[regB]}, ${RegNames[regC]}`);
        } else if (q.op === '*') {
          this.asm.push(`mul ${RegNames[regA]}, ${RegNames[regB]}, ${RegNames[regC]}`);
        } else if (q.op === '/') {
          this.asm.push(`div ${RegNames[regB]}, ${RegNames[regC]}`);
          this.asm.push(`mov ${RegNames[regA]}, $lo`);
        }
      }
    }
    else if (q.op === '=') {
      const reg = this.assignReg(q.res, -1);
      if (/^[0-9]+$/.test(q.arg1)) {
        this.asm.push(`addi ${RegNames[reg]}, $zero, ${q.arg1}`);
        this.regInfo[reg].free = 0;
      } else {
        // check b
        if (this.varRegs[q.arg1]) {
          const regB = this.regInfo.findIndex(r => r.name === this.varRegs[q.arg1]);
          this.asm.push(`move ${RegNames[reg]}, ${RegNames[regB]}`);
          this.regInfo[reg].free = 0;
          this.regInfo[regB].free = 0;
        } else {
          if (this.localOffset[q.arg1]) {
            const offset = this.localOffset[q.arg1];
            this.asm.push(`lw ${RegNames[reg]}, ${offset}($fp)`);
          } else if (this.globalAddr[q.arg1]) {
            const addr = this.globalAddr[q.arg1];
            this.asm.push(`lw ${RegNames[reg]}, ${addr}($zero)`);
          }
          this.regInfo[reg].free = 0;
        }
      }
    }
    else if (q.arg1 === '-' && q.arg2 === '-' && q.res == '-') {
      // entry to block
      this.tmpBlockName = q.op;
      this.localOffset = {};
      this.paramSize = 8;
      this.loaclSize = -4;
      // block id
      this.asm.push(`${q.op}:`);
      // return addr
      this.asm.push(`subi $sp, $sp, 4`);
      this.asm.push(`sw $ra, 0($sp)`);
      this.asm.push(`subi $sp, $sp, 4`);
      // old fp
      this.asm.push(`sw $fp, 0($sp)`);
      // new fp
      this.asm.push(`move $fp, $sp`);
    }
    else if (q.op === 'j>' || q.op === 'j<' || q.op === 'j>=' || q.op === 'j<=' || q.op === 'j=') {
      let regA, regB;
      if (/^[0-9]+$/.test(q.arg1)) {
        this.asm.push(`subi $t8, $zero, ${q.arg1}`);
        regA = this.regInfo.findIndex(r => r.name === '$t8');
      } else {
        regA = this.assignReg(q.arg1, -1);
      }
      if (/^[0-9]+$/.test(q.arg2)) {
        this.asm.push(`subi $t9, $zero, ${q.arg2}`);
        regB = this.regInfo.findIndex(r => r.name === '$t9');
      } else {
        regB = this.assignReg(q.arg2, -1);
      }
      if (q.op === 'j>') {
        this.asm.push(`bgt ${RegNames[regA]}, ${RegNames[regB]}, label${q.res}`);
      } else if (q.op === 'j<') {
        this.asm.push(`blt ${RegNames[regA]}, ${RegNames[regB]}, label${q.res}`);
      } else if (q.op === 'j>=') {
        this.asm.push(`bge ${RegNames[regA]}, ${RegNames[regB]}, label${q.res}`);
      } else if (q.op === 'j<=') {
        this.asm.push(`ble ${RegNames[regA]}, ${RegNames[regB]}, label${q.res}`);
      } else if (q.op === 'j=') {
        this.asm.push(`beq ${RegNames[regA]}, ${RegNames[regB]}, label${q.res}`);
      }
    }
  }
  assignReg(v, regExpIdx) {
    if (v === '-') {
      let a = 0;
      let b = 0;
    }
    let reg;
    // assign memory
    if (!this.localOffset[v] && !this.globalAddr[v]) {
      // global var
      if (this.tmpBlockName === '') {
        this.globalAddr[v] = this.globalSize;
        this.globalSize += 4;
      } else {
        this.localOffset[v] = this.loaclSize;
        this.loaclSize -= 4;
        this.asm.push(`subi $sp, $sp, 4`);
      }
    }
    // assign reg
    if (!this.varRegs[v]) {
      // find $t
      for (let i = 8; i <= 15; i++) {
        if (this.regVar[i] === '') {
          reg = i;
          this.regVar[i] = v;
          this.varRegs[v] = RegNames[i];
          break;
        }
      }
      // grab a register
      if (!reg) {
        const regGrab = this.getLruReg(regExpIdx);
        const varGrab = this.regVar[regGrab];
        // local var
        if (this.localOffset[varGrab]) {
          const offset = this.localOffset[varGrab];
          this.asm.push(`sw ${RegNames[regGrab]}, ${offset}($fp)`);
        }
        else if (this.globalAddr[varGrab]) {
          const addr = this.globalAddr[varGrab];
          this.asm.push(`sw ${RegNames[regGrab]}, ${addr}($zero)`);
        }
        this.varRegs[varGrab] = undefined;
        reg = regGrab;
        this.regVar[reg] = varGrab;
        this.varRegs[v] = RegNames[reg];
      }
      // local var
      if (this.localOffset[v]) {
        const offset = this.localOffset[v];
        this.asm.push(`lw ${RegNames[reg]}, ${offset}($fp)`);
      }
      else if (this.globalAddr[v]) {
        const addr = this.globalAddr[v];
        this.asm.push(`lw ${RegNames[reg]}, ${addr}($zero)`);
      }
    }
    else {
      reg = this.regInfo.findIndex(r => r.name === this.varRegs[v]);
    }
    this.regInfo[reg].free = 0;
    return reg;
  }
  getLruReg(regExpIdx) {
    let reg = -1, maxFree = -1;
    for (let i = 8; i <= 15; i++) {
      if (this.regInfo[i].free > maxFree && (regExpIdx === -1 || regExpIdx !== i)) {
        reg = i;
        maxFree = this.regInfo[i].free;
      }
    }
    return reg;
  }
  get getAsm() {
    return this.asm;
  }
}