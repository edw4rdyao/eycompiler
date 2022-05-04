import React, { Component } from 'react'

import InputBox from './components/InputBox'
import Split from './components/Split'
import TableResult from './components/TableResult'
import GrammarTree from './components/GrammarTree'
import Alert from './components/Alert'

import LexicalAnalysis from './utils/LexicalAnalysis'
import GrammarAnalysis from './utils/GrammarAnalysis'

var complier = {
  lA: null,
  gA: null
}

export default class Complier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      process: 1,
      err: {
        code: -1,
        msg: ''
      }
    }
  }

  setProcess(process) {
    this.setState({
      process: process
    })
  }

  getNewProcess(errCode) {
    if (errCode >= 100 && errCode < 200) {
      return 1;
    }
    else if (errCode >= 200 && errCode < 300) {
      return 3;
    }
    else if (errCode >= 300 && errCode < 400) {
      return 4;
    }
  }

  handleSubmitSource(sources) {
    complier.lA = new LexicalAnalysis(sources);
    try {
      complier.lA.analysisTokenStream();
      this.setProcess(2);
    } catch (e) {
      this.setState({
        err: {
          code: e.code,
          msg: e.msg
        }
      })
      return;
    }
  }

  handleSubmitGrammar(grammar) {
    try {
      complier.gA = new GrammarAnalysis(grammar, complier.lA.getTokenStream);
      this.setProcess(4);
    }
    catch (e) {
      this.setState({
        err: {
          code: e.code,
          msg: e.msg
        }
      })
      return;
    }
  }

  handleContinueAnalysis() {
    try {
      if (complier.gA) {
        complier.gA.analysisGrammarSemantic();
        this.setProcess(5);
      }
    }
    catch (e) {
      this.setState({
        err: {
          code: e.code,
          msg: e.msg
        }
      })
      return;
    }
  }

  handleErrClose(newProcess) {
    this.setState({
      process: newProcess,
      err: {
        code: -1,
        msg: ''
      }
    })
  }

  handleErrReset() {
    this.setState({
      process: 1,
      err: {
        code: -1,
        msg: ''
      }
    })
    complier = {
      lA: null,
      gA: null
    }
  }

  render() {
    return (
      <div className="s-main">
        {(this.state.err.code !== -1) ?
          <Alert
            errMsg={this.state.err.msg}
            newProcess={this.getNewProcess(this.state.err.code)}
            handleErrClose={this.handleErrClose.bind(this)}
            handleErrReset={this.handleErrReset.bind(this)}
          ></Alert> : null}
        {this.state.process >= 1 ?
          <InputBox
            type={'code'}
            header={'Input the source code'}
            initValue={defaultSourceCode}
            handleSubmit={this.handleSubmitSource.bind(this)}
          ></InputBox> : null}
        {this.state.process >= 2 ? <>
          <Split x={300} y={-30}></Split>
          <TableResult
            header={'Lexical Analysis Result'}
            type={'lexicalResult'}
            tableData={(complier.lA == null) ? [] : complier.lA.getTokenStream}
            description={'Type is token kind, value is token string.'}
            handleContinue={() => {
              this.setState({
                process: 3
              })
            }}
          ></TableResult>
        </> : null}
        {this.state.process >= 3 ? <>
          <Split x={400} y={-30}></Split>
          <InputBox
            type={'grammar'}
            header={'Input the grammar rules'}
            initValue={defaultGrammarRules}
            handleSubmit={this.handleSubmitGrammar.bind(this)}
          ></InputBox>
        </> : null}
        {this.state.process >= 4 ? <>
          <Split x={250} y={-30}></Split>
          <TableResult
            header={'LR(1) Analysis Table'}
            type={'lr1Table'}
            tableData={complier.gA ? complier.gA.getParserTable : []}
            description={'State is the index of "Item Group Set" of LR(1) and this is analysis table.'}
            handleContinue={this.handleContinueAnalysis.bind(this)}
          ></TableResult>
        </> : null}
        {this.state.process >= 5 ? <>
          <Split x={450} y={-30}></Split>
          <GrammarTree
            grammarTreeData={complier.gA.getGrammarTreeData}
          ></GrammarTree>
        </> : null}
      </div>
    )
  }
}

var defaultSourceCode = `int program(int a,int b, int c)
{
	int i;
	int j;
	i=0;
	if(a>(b+c))
	{
		j=a+(b*c+1);
	}
	else
	{
		j=a;
	}
	i=j*2;
	while(i<=100)
	{
		i=i*2;
	}
	return i;
}

int demo(int a)
{
  a=a+2;
  return a*2;
}
//aaaaaaaaaaaaaaaa
/*aaaaa
qqq
// */  
void main()
{
  int a;
  int b;
  int c;
  a=3;
  b=4;
  c=2;
  a=program(a,b,demo(c));
  return ;
}`;

var defaultGrammarRules = `@Declear -> return | if | else | while | void | int | <ID> | <INT> | ; | , | ( | ) | { | } | + | - | * | / | = | > | < | >= | <= | != | ==

S -> Program
Program -> ExtDefList 
ExtDefList -> ExtDef ExtDefList | @
ExtDef -> VarSpecifier <ID> ; | FunSpecifier FunDec Block
VarSpecifier -> int
FunSpecifier -> void | int 
FunDec -> <ID> FunTableM ( VarList )
FunTableM -> @
VarList -> ParamDec , VarList | ParamDec | @
ParamDec -> VarSpecifier <ID>
Block -> { DefList StmtList }
DefList -> Def DefList | @
Def -> VarSpecifier <ID> ;
StmtList -> Stmt StmtList | @
Stmt -> AssignStmt ; | ReturnStmt ; | IfStmt | WhileStmt | CallStmt ;
AssignStmt -> <ID> = Exp
Exp -> AddSubExp | Exp Relop AddSubExp
AddSubExp -> Item | Item + Item | Item - Item
Item -> Factor | Factor * Factor | Factor / Factor
Factor -> <INT> | ( Exp ) | <ID> | CallStmt
CallStmt -> <ID> ( CallFunCheck Args )
CallFunCheck -> @
Args -> Exp , Args | Exp | @
ReturnStmt -> return Exp | return
Relop -> > | < | >= | <= | == | !=
IfStmt -> if IfM1 ( Exp ) IfM2 Block IfNext
IfM1 -> @
IfM2 -> @
IfNext -> @ | IfStmtNext else Block
IfStmtNext -> @
WhileStmt -> while WhileM1 ( Exp ) WhileM2 Block
WhileM1 -> @
WhileM2 -> @`;