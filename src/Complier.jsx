import React, { Component } from 'react'

import InputBox from './steps/InputBox'
import Split from './components/Split'
import LexicalResult from './steps/LexicalResult'
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
            err: false,
            errMsg: ''
        }
    }

    setProcess(process) {
        this.setState({
            process: process
        })
    }

    handleSubmitSource(sources) {
        complier.lA = new LexicalAnalysis(sources);
        try {
            complier.lA.analysisTokenStream();
            this.setProcess(2);
        } catch (e) {
            this.setState({
                err: true,
                errMsg: e
            })
            return;
        }
    }

    handleSubmitGrammar(grammar){
        try{
            complier.gA = new GrammarAnalysis(grammar);
            
        }
        catch(e){

            return;
        }
    }
    
    handleErrClose(){
        this.setState({
            err: false,
            errMsg: ''
        })
    }

    handleErrReset(){
        this.setState({
            process: 1,
            err: false,
            errMsg: '',
        })
        complier = {
            lA: null,
            gA: null
        }
    }

    render() {
        return (
            <div className="s-main">
                {this.state.err ?
                    <Alert
                        errMsg={this.state.errMsg}
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
                    <LexicalResult
                        tokenStream={(complier.lA == null) ? [] : complier.lA.getTokenStream}
                        handleContinue={()=>{
                            this.setState({
                                process:3
                            })
                        }}
                    ></LexicalResult>
                </> : null}
                {this.state.process >= 3? <>
                    <Split x={400} y={-30}></Split>
                    <InputBox
                        type={'grammar'}
                        header={'Input the grammar rules'}
                        initValue={defaultGrammarRules}
                        handleSubmit={this.handleSubmitGrammar.bind(this)}
                    ></InputBox>
                </>:null}

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

// int demo(int a)
// {
// 	a=a+2;
// 	return a*2;
// }
//aaaaaaaaaaaaaaaa
/*aaaaa
qqq
// */  
// void main()
// {
// 	int a;
// 	int b;
// 	int c;
// 	a=3;
// 	b=4;
// 	c=2;
// 	a=program(a,b,demo(c));
// 	return ;
// }`;

var defaultGrammarRules = `@Declear -> return | if | else | while | void | int | <ID> | <INT> | ; | , | ( | ) | { | } | + | - | * | / | = | > | < | >= | <= | != | ==

S -> Program
Program -> ExtDefList 
ExtDefList -> ExtDef ExtDefList | @
ExtDef -> VarSpecifier <ID> ; | FunSpecifier FunDec Block
VarSpecifier -> int
FunSpecifier -> void | int 
FunDec -> <ID> CreateFunTable_m ( VarList )
CreateFunTable_m -> @
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
IfStmt -> if IfStmt_m1 ( Exp ) IfStmt_m2 Block IfNext
IfStmt_m1 -> @
IfStmt_m2 -> @
IfNext -> @ | IfStmt_next else Block
IfStmt_next -> @
WhileStmt -> while WhileStmt_m1 ( Exp ) WhileStmt_m2 Block
WhileStmt_m1 -> @
WhileStmt_m2 -> @`;