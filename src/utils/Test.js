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

const defaultGrammarRules = `@declear -> return | if | else | while | void | int | <ID> | <INT> | ; | , | ( | ) | { | } | + | - | * | / | = | > | < | >= | <= | != | ==

s -> program
program -> ext_def_list 
ext_def_list -> ext_def ext_def_list | @
ext_def -> var_type <ID> ; | fun_type fun_dec block
var_type -> int
fun_type -> void | int 
fun_dec -> <ID> fun_table_m ( var_list )
fun_table_m -> @
var_list -> param_dec , var_list | param_dec | @
param_dec -> var_type <ID>
block -> { def_list stmt_list }
def_list -> def def_list | @
def -> var_type <ID> ;
stmt_list -> stmt stmt_list | @
stmt -> assign_stmt ; | return_stmt ; | if_stmt | while_stmt | call_stmt ;
assign_stmt -> <ID> = exp
exp -> add_sub_exp | exp relop add_sub_exp
add_sub_exp -> item | item + item | item - item
item -> factor | factor * factor | factor / factor
factor -> <INT> | ( exp ) | <ID> | call_stmt
call_stmt -> <ID> ( call_fun_check args )
call_fun_check -> @
args -> exp , args | exp | @
return_stmt -> return exp | return
relop -> > | < | >= | <= | == | !=
if_stmt -> if if_m1 ( exp ) if_m2 block if_next
if_m1 -> @
if_m2 -> @
if_next -> @ | if_stmt_next else block
if_stmt_next -> @
while_stmt -> while while_m1 ( exp ) while_m2 block
while_m1 -> @
while_m2 -> @`;

export const Test = ()=>{
  const la = new LexicalAnalysis(defaultSourceCode);
  la.analysisTokenStream();
  const ga = new GrammarAnalysis(defaultGrammarRules, la.getTokenStream);
  ga.analysisGrammarSemantic();
  console.log(ga.semanticAnalysis.getQuaternaries);
	console.log(ga.getGrammarTreeData);
	const ag = new AsmGenerator(ga.semanticAnalysis.getQuaternaries);
	ag.generate()
	console.log(ag.getAsm);
	var s = '';
	for(let a of ag.getAsm){
		s += `${a}\n`;
	}
	console.log(s);
};

