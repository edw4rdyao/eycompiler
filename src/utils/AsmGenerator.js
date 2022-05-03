const RegisterNum = 32;
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
class AsmGenerator {
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
    this.asm = "";
    this.labelSet = new Set();
    this.parSize = 8;
    this.loaclSize = 4;
    // get quaternaty lables(L)
    for (let q of quaternaries) {
      if (q.op === 'j' || q.op === 'j=' || q.op === 'j<' || q.op === 'j>'
        || q.op === 'j<=' || q.op === 'j>=') {
        this.labelSet.add(q.res);
      }
    }
    // init resgister info and value
    for (let i = 0; i < RegNames.length; i++) {
      this.regInfo.push({ name: r, idx: i, free: 0});
      if (i === 0) this.regVar[i] = '0';
      else this.regVar[i] = '';
    }
  }

  getIdx(name) {
    for (let i = 0; i < RegNames.length; i++) {
      if (RegNames[i] === name) return i;
    }
    return -1;
  }

  generate() {
    this.asm += `addi $sp, $sp, ${StackStartAddr}\naddi $sp, $sp, ${StackStartAddr - 4}\n`;
    for (let q of this.quaternaries) {
      for (let r of this.regInfo) {
        r.free++;
      }
      generateAsm(q);
    }
  }

  generateAsm(q) {
    // if it is a label
    if(this.labelSet.has(q.idx.toString())){
      this.asm+= `Label${q.idx}: \n`;
    }
    if (q.op === 'call') {
      // procedure call, create stack frame and jump
      // save context
      let saveReg = "";
      for (let l in this.localOffset) {
        if (!this.varRegs[l]) continue;
        freeMax = 1e7;
        for (let r of this.varRegs[l]) {
          let rfree = this.regInfo[this.getIdx(r)].free;
          if (rfree < freeMax) {
            freeMax = rfree;
            saveReg = r;
          }
        }
        this.asm += `sw ${saveReg}, ${this.localOffset[l]}($fp)\n`;
      }
      // jump
      this.asm += `jal ${q.arg1}\n`;
      // the return value save
      let regSaveIdx = assignReg(q.res, -1);
      // recover register
      for (let l in this.localOffset) {
        if (!this.varRegs[l]) continue;
        for (let r of this.varRegs[l]) {
          this.asm += `lw ${r}, ${this.localOffset[l]}\n`;
        }
      }
      this.asm += `move ${RegNames[regSaveIdx]}, $v1\n`;
      this.regInfo[regSaveIdx].free = 0;
    }
    else if(q.op === 'return'){
      // destory stack frame and jump
      if(q.arg1 !== '-'){
        this.asm+= `move $v1, ${this.varRegs[q.arg1][0]}\n`;
      }
      // release regs
      for(let l in this.localOffset){
        if(this.varRegs[l]){
          for(let r of this.varRegs[l]){
            this.regVar[this.getIdx(r)] = '';
          }
          this.varRegs[l] = undefined;
        }
      }
      // change esp
      this.asm+=`move $sp, $fp\naddi $sp, $sp, ${this.parSize}\n`;
      // return addr to $ra
      this.asm += `lw $ra, 4($fp)\n`;
      // change ebp
      this.asm += `lw $fp, 0($fp)\n`;
      if(this.tmpBlockName !== 'main') this.asm+= `jr $ra\n`;
      this.tmpBlockName = '';
      this.loaclSize = -4;
      this.parSize = 8;
      this.localOffset = {};
    }
    else if(q.op === 'j'){
    // jump
      this.asm += `j `;
      // jump to procedure ???
      if(/^[0-9]$/.test(q.res[0])){
        this.asm += `Lable${q.res}\n`;
      }else{
        // jump to label
        for(let qq of this.quaternaries){
          if(q.res === qq.idx.toString()){
            this.asm+=`${qq.op}`;
          }
        }
      }
    }
    else if(q.op === 'param'){

    }
  }

  assignReg(v, regExpIdx) {
    
  }

}