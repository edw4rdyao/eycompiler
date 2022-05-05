import LexicalAnalysis from "./LexicalAnalysis";
import GrammarAnalysis from "./GrammarAnalysis";
import AsmGenerator from "./AsmGenerator"
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

export const Test = ()=>{
  const la = new LexicalAnalysis(defaultSourceCode);
  la.analysisTokenStream();
  const ga = new GrammarAnalysis(defaultGrammarRules, la.getTokenStream);
  ga.analysisGrammarSemantic();
  console.log(ga.semanticAnalysis.getQuaternaries);
	const ag = new AsmGenerator(ga.semanticAnalysis.getQuaternaries);
	ag.generate()
	console.log(ag.getAsm);
	var s = '';
	for(let a of ag.getAsm){
		s += `${a}\n`;
	}
	console.log(s);
};

