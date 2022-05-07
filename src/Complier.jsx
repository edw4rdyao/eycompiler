import React, { useState } from 'react'

import InputBox from './components/InputBox'
import Split from './components/Split'
import TableResult from './components/TableResult'
import GrammarTree from './components/GrammarTree'
import Alert from './components/Alert'
import DisplayBox from './components/DisplayBox'

import LexicalAnalysis from './utils/LexicalAnalysis'
import GrammarAnalysis from './utils/GrammarAnalysis'
import AsmGenerator from './utils/AsmGenerator'

const defaultSourceCode = `int program(int a,int b, int c)
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

const defaultGrammarRules = `@Declear -> return | if | else | while | void | int | <ID> | <INT> | ; | , | ( | ) | { | } | + | - | * | / | = | > | < | >= | <= | != | ==

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

var complier = { la: null, ga: null, ag: null }

export default function Complier() {
  const [process, setProcess] = useState(1);
  const [err, setErr] = useState({ code: -1, msg: '' });
  const [lexicalResult, setLexicalResult] = useState();
  const [grammarResult, setGrammarResult] = useState();
  const [grammarTreeData, setGrammarTreeData] = useState();
  const [interCode, setInterCode] = useState();
  const [objCode, setObjCode] = useState();

  return (
    <div className="s-main">
      {(err.code !== -1) ? <Alert
        errMsg={err.msg}
        handleErrClose={() => {
          let newProcess;
          if (err.code >= 100 && err.code < 200) {
            newProcess = 1;
          } else if (err.code >= 200 && err.code < 300) {
            newProcess = 3;
          } else if (err.code >= 300 && err.code < 400) {
            newProcess = 4;
          }
          setProcess(newProcess);
          setErr({ code: -1, msg: '' })
        }}
        handleErrReset={() => {
          setProcess(1);
          setErr({ code: -1, msg: '' });
          complier = { la: null, ga: null, ag: null };
        }}>
      </Alert> : null}
      {process >= 1 ? <InputBox
        type={'code'}
        header={'Input the source code(源程序)'}
        initValue={defaultSourceCode}
        handleSubmit={(source) => {
          complier.la = new LexicalAnalysis(source);
          try {
            complier.la.analysisTokenStream();
            setProcess(2);
            setLexicalResult(complier.la.getTokenStream);
          } catch (e) {
            setErr({ code: e.code, msg: e.msg });
          }
        }}>
      </InputBox> : null}
      {process >= 2 ? <>
        <Split x={300} y={-30}></Split>
        <TableResult
          header={'Lexical Analysis Result(词法分析)'}
          type={'lexicalResult'}
          tableData={lexicalResult}
          description={'Type is token kind, value is token string.'}
          handleContinue={() => {
            setProcess(3);
          }}
        ></TableResult>
      </> : null}
      {process >= 3 ? <>
        <Split x={400} y={-30}></Split>
        <InputBox
          type={'grammar'}
          header={'Input the grammar rules(语法规则)'}
          initValue={defaultGrammarRules}
          handleSubmit={(grammar) => {
            try {
              complier.ga = new GrammarAnalysis(grammar, lexicalResult);
              setProcess(4);
              setGrammarResult(complier.ga.getParserTable);
            } catch (e) {
              console.log(e)
              setErr({ code: e.code, msg: e.msg });
            }
          }}
        ></InputBox>
      </> : null}
      {process >= 4 ? <>
        <Split x={250} y={-30}></Split>
        <TableResult
          header={'LR(1) Analysis Table(分析表)'}
          type={'lr1Table'}
          tableData={grammarResult}
          description={'State is the index of "Item Group Set" of LR(1) and this is analysis table.'}
          handleContinue={() => {
            try {
              complier.ga.analysisGrammarSemantic();
              setProcess(5);
              setGrammarTreeData(complier.ga.getGrammarTreeData);
              setInterCode(complier.ga.getQuaternaries);
            } catch (e) {
              console.log(e);
              setErr({ code: e.code, msg: e.msg });
            }
          }}
        ></TableResult>
      </> : null}
      {process === 5 ? <>
        <Split x={450} y={-30}></Split>
        <GrammarTree
          grammarTreeData={grammarTreeData}
          handleContinue={() => {
            setProcess(6);
          }}
        ></GrammarTree>
      </> : null}
      {process >= 6 ? <>
        <Split x={200} y={-30}></Split>
        <DisplayBox
          header={'Intermediate code(中间代码)'}
          displayData={interCode}
          handleContinue={() => {
            complier.ag = new AsmGenerator(interCode);
            complier.ag.generate();
            setProcess(7);
            setObjCode(complier.ag.getAsm);
          }}
          type={'interCode'}
        ></DisplayBox>
      </> : null}
      {process >= 7 ? <>
        <Split x={400} y={-30}></Split>
        <DisplayBox
          header={'Object code(目标代码)'}
          displayData={objCode}
          handleContinue={() => {
            setProcess(7);
          }}
          type={'objCode'}
        ></DisplayBox>
      </> : null}
    </div>
  )
}