import { CTokenizer, TokenType } from "./ctokenizer";
import { ParserGenerator, RuleAssocitive } from "./ParserGenerator/generator";

export class CParser {
    private tokenizer: CTokenizer;
    private parser: ParserGenerator;

    constructor(filename: string) {
        this.tokenizer = new CTokenizer(filename);
        this.parser = new ParserGenerator();
        this.InitParser();
    }

    private InitParser() {
        this.parser.addStartSymbol('Expr', 'TypeName');
        this.GrammarExpr();

        this.GrammarDeclaration();
        this.GrammarStruct();
        this.GrammarDeclarator();

        this.GrammarBasicStatement();
        this.GrammarIfStatement();
        this.GrammarForStatement();
        this.GrammarWhileStatement();
        this.GrammarDoWhileStatement();
        this.GrammarSwitchStatement();

        this.parser.compile();
    }

    private GrammarDeclaration() //{
    { 
        [
            TokenType.TYPEDEF, TokenType.STATIC,
            TokenType.EXTERN,  TokenType.AUTO,
            TokenType.REGISTER
        ].forEach(tt => this.parser.addRule({name: 'StorageClassSpecifier'}, [{name: tt}]));

        [
            TokenType.CONST, TokenType.VOLATILE, TokenType.RESTRICT
        ].forEach(tt => this.parser.addRule({name: 'TypeQualifier'}, [{name: tt}]));
        this.parser.addRule({name: 'TypeQualifier'}, [{name: 'TypeQualifier'}, {name: 'TypeQualifier'}]);

        [
            TokenType.VOID,
            TokenType.CHAR,   TokenType.SHORT,
            TokenType.INT,    TokenType.LONG,
            TokenType.FLOATV,  TokenType.DOUBLE,
            TokenType.SIGNED, TokenType.UNSIGNED,
        ].forEach(tt => this.parser.addRule({name: 'TypeSpecifier'}, [{name: tt}]));

        this.parser.addRule({name: 'TypeSpecifier'}, [{name: 'StructSpecifier'}]);
        this.parser.addRule({name: 'TypeSpecifier'}, [{name: 'UnionSpecifier'}]);
        this.parser.addRule({name: 'TypeSpecifier'}, [{name: 'EnumSpecifier'}]);

        [
            'StorageClassSpecifier', 'TypeSpecifier',
            'TypeQualifier', 'FunctionSpecifier'
        ].forEach(tp => this.parser.addRule({name: 'DeclarationSpecifiers'}, [{name: tp}]));
        this.parser.addRule({name: 'DeclarationSpecifiers'}, [
            {name: 'DeclarationSpecifiers'},
            {name: 'DeclarationSpecifiers'}
        ]);

        this.parser.addRule({name: 'SpecifierQualifierList'}, [
            {name: 'TypeSpecifier'}
        ], {priority: 2});
        this.parser.addRule({name: 'SpecifierQualifierList'}, [
            {name: 'TypeQualifier'}
        ], {priority: 2});
        this.parser.addRule({name: 'SpecifierQualifierList'}, [
            {name: 'TypeSpecifier'},
            {name: 'SpecifierQualifierList'}
        ], {priority: 1});
        this.parser.addRule({name: 'SpecifierQualifierList'}, [
            {name: 'TypeQualifier'},
            {name: 'SpecifierQualifierList'}
        ], {priority: 1});
    } //}
    private GrammarStruct() //{
    {
        this.parser.addRule({name: 'StructSpecifier'}, [
            {name: TokenType.STRUCT},
            {name: TokenType.ID},
        ], {priority: 2});
        this.parser.addRule({name: 'StructSpecifier'}, [
            {name: TokenType.STRUCT},
            {name: TokenType.ID},
            {name: TokenType.lCBracket},
            {name: TokenType.rCBracket},
        ], {priority: 1});
        this.parser.addRule({name: 'StructSpecifier'}, [
            {name: TokenType.STRUCT},
            {name: TokenType.lCBracket},
            {name: TokenType.rCBracket},
        ]);
        this.parser.addRule({name: 'StructDeclaration'}, [
            {name: TokenType.STRUCT},
            {name: TokenType.ID},
            {name: TokenType.Semicolon},
        ], {priority: 1});
    } //}
    private GrammarDeclarator() //{
    {
        this.parser.addRule({name: 'Declarator'}, [
            {name: 'Pointer', optional: true},
            {name: 'DirectDeclarator'}
        ]);

        this.parser.addRule({name: 'DirectDeclarator'}, [{name: TokenType.ID}]);
        this.parser.addRule({name: 'DirectDeclarator'}, [
            {name: TokenType.lRBracket},
            {name: 'Declarator'},
            {name: TokenType.rRBracket},
        ]);
        this.parser.addRule({name: 'DirectDeclarator'}, [
            {name: TokenType.lSBracket},
            {name: 'TypeQualifier', optional: true},
            {name: 'Expr', optional: true},
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: 'DirectDeclarator'}, [
            {name: TokenType.lSBracket},
            {name: TokenType.STATIC},
            {name: 'TypeQualifier', optional: true},
            {name: 'Expr'},
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: 'DirectDeclarator'}, [
            {name: TokenType.lSBracket},
            {name: 'TypeQualifier'},
            {name: TokenType.STATIC},
            {name: 'Expr'},
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: 'DirectDeclarator'}, [
            {name: TokenType.lSBracket},
            {name: 'TypeQualifier', optional: true},
            {name: TokenType.Multiplication_AddressOf},
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: 'DirectDeclarator'}, [
            {name: TokenType.lRBracket},
            {name: 'ParameterTypeList'},
            {name: TokenType.rRBracket},
        ]);
        this.parser.addRule({name: 'DirectDeclarator'}, [
            {name: TokenType.lRBracket},
            {name: 'IDList', optional: true},
            {name: TokenType.rRBracket},
        ]);
        this.parser.addRule({name: 'DirectDeclarator'}, [
            {name: TokenType.lRBracket},
            {name: TokenType.ID},
            {name: TokenType.rRBracket},
        ]);

        this.parser.addRule({name: 'Pointer'}, [
            {name: TokenType.Multiplication_AddressOf},
            {name: 'TypeQualifier', optional: true},
            {name: 'Pointer', optional: true},
        ]);

        this.parser.addRule({name: 'ParameterTypeList'}, [
            {name: 'ParamterList'}
        ], {priority: 2});
        this.parser.addRule({name: 'ParameterTypeList'}, [
            {name: 'ParamterList'},
            {name: TokenType.Comma},
            {name: TokenType.DOTS},
        ], {priority: 1});

        this.parser.addRule({name: 'ParameterList'}, [
            {name: 'ParameterDeclaration'}
        ], {priority: 2});
        this.parser.addRule({name: 'ParameterList'}, [
            {name: 'ParameterList'},
            {name: TokenType.Comma},
            {name: 'ParameterDeclaration'}
        ], {priority: 1});

        this.parser.addRule({name: 'ParameterDeclaration'}, [
            {name: 'DeclarationSpecifiers'},
            {name: 'Declarator'},
        ]);
        this.parser.addRule({name: 'ParameterDeclaration'}, [
            {name: 'DeclarationSpecifiers'},
            {name: 'AbstractDeclarator', optional: true},
        ]);

        this.parser.addRule({name: 'IDList'}, [
            {name: TokenType.ID},
            {name: TokenType.Comma},
            {name: TokenType.ID},
        ]);
        this.parser.addRule({name: 'IDList'}, [
            {name: 'IDList'},
            {name: TokenType.Comma},
            {name: TokenType.ID}
        ]);

        this.parser.addRule({name: 'TypeName'}, [
            {name: 'SpecifierQualifierList'}
        ], {priority: 2});

        this.parser.addRule({name: 'TypeName'}, [
            {name: 'SpecifierQualifierList'},
            {name: 'AbstractDeclarator'}
        ], {priority: 1});

        this.parser.addRule({name: 'AbstractDeclarator'}, [
            {name: 'Pointer'},
        ], {priority: 2});

        this.parser.addRule({name: 'AbstractDeclarator'}, [
            {name: 'Pointer'},
            {name: 'DirectAbstractDeclarator'},
        ], {priority: 1});
    } //}

    private GrammarExpr() //{
    {
        this.parser.addRule({name: 'Expr'}, [{name: TokenType.ID}]);
        this.parser.addRule({name: 'Expr'}, [{name: TokenType.STRING}]);
        this.parser.addRule({name: 'Expr'}, [{name: TokenType.INTEGER}]);
        this.parser.addRule({name: 'Expr'}, [{name: TokenType.FLOAT}]);
        this.parser.addRule({name: 'Expr'}, [{name: TokenType.lRBracket}, {name: 'Expr'}, {name: TokenType.rRBracket}]);

        this.parser.addRule({name: 'Exprlist'}, [{name: 'Expr'}, {name: TokenType.Comma}, {name: 'Expr'}], {priority: 21});
        this.parser.addRule({name: 'Exprlist'}, [{name: 'Exprlist'}, {name: TokenType.Comma}, {name: 'Expr'}], {priority: 21});

        this.parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: TokenType.Increment}], {priority: 1});
        this.parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: TokenType.Decrement}], {priority: 1});
        this.parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: TokenType.MemberAccess}, {name: TokenType.ID}], {priority: 1});
        this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'},
            {name: TokenType.MemberAccessByPointer},
            {name: TokenType.ID}
        ], {priority: 1});

        this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'}, 
            {name: TokenType.lRBracket},
            {name: 'Expr'}, 
            {name: TokenType.rRBracket},
        ], {priority: 1});
        this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'}, 
            {name: TokenType.lRBracket},
            {name: 'Exprlist', optional: true}, 
            {name: TokenType.rRBracket},
        ], {priority: 1});

        this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'},
            {name: TokenType.lSBracket},
            {name: 'Expr'},
            {name: TokenType.rSBracket},
        ], {priority: 1});

        this.parser.addRule({name: 'Expr'}, [
            {name: TokenType.Increment}, 
            {name: 'Expr'}
        ], {priority: 2, associative: RuleAssocitive.Right});
        this.parser.addRule({name: 'Expr'}, [
            {name: TokenType.Decrement}, 
            {name: 'Expr'}
        ], {priority: 2, associative: RuleAssocitive.Right});
        this.parser.addRule({name: 'Expr'}, [
            {name: TokenType.Addition_UnaryPlus}, 
            {name: 'Expr'}
        ], {priority: 2, associative: RuleAssocitive.Right, uid: 'prefix_add'});
        this.parser.addRule({name: 'Expr'}, [
            {name: TokenType.Substraction_UnaryMinus}, 
            {name: 'Expr'}
        ], {priority: 2, associative: RuleAssocitive.Right, uid: 'prefix_minus'});
        this.parser.addRule({name: 'Expr'}, [
            {name: TokenType.LogicalNot}, 
            {name: 'Expr'}
        ], {priority: 2, associative: RuleAssocitive.Right});
        this.parser.addRule({name: 'Expr'}, [
            {name: TokenType.BitwiseNot}, 
            {name: 'Expr'}
        ], {priority: 2, associative: RuleAssocitive.Right});
        this.parser.addRule({name: 'Expr'}, [
            {name: TokenType.Multiplication_AddressOf}, 
            {name: 'Expr'}
        ], {priority: 2, associative: RuleAssocitive.Right, uid: 'prefix_address'});
        this.parser.addRule({name: 'Expr'}, [
            {name: TokenType.BitwiseAnd_Reference}, 
            {name: 'Expr'}
        ], {priority: 2, associative: RuleAssocitive.Right, uid: 'prefix_ref'});
        // TODO cast
        
        this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'},
            {name: TokenType.Multiplication_AddressOf}, 
            {name: 'Expr'}
        ], {priority: 3, uid: 'in_multiplication'});
        this.parser.addExtraPriority('prefix_address', 'in_multiplication');
        this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'},
            {name: TokenType.BitwiseAnd_Reference}, 
            {name: 'Expr'}
        ], {priority: 8, uid: 'in_bitand'});
        this.parser.addExtraPriority('prefix_ref', 'in_bitand');

        [TokenType.Division, TokenType.Remainder].forEach(
            tt => this.parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: tt}, {name: 'Expr'}], {priority: 3}));

        this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'},
            {name: TokenType.Addition_UnaryPlus}, 
            {name: 'Expr'}
        ], {priority: 4, uid: 'in_addition'});
        this.parser.addExtraPriority('prefix_add', 'in_addition');
        this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'},
            {name: TokenType.Substraction_UnaryMinus}, 
            {name: 'Expr'}
        ], {priority: 4, uid: 'in_minus'});
        this.parser.addExtraPriority('prefix_minus', 'in_minus');

        [
            [TokenType.BitwiseRightShift, 5], [TokenType.BitwiseLeftShift, 5],
            [TokenType.LessThan, 6],          [TokenType.LessEqual, 6],
            [TokenType.GreaterThan, 6],       [TokenType.GreaterEqual, 6],
            [TokenType.Equal, 7],             [TokenType.NotEqual, 7],
            [TokenType.BitwiseXor, 9],        [TokenType.BitwiseOr, 10],
            [TokenType.LogicalAnd, 11],       [TokenType.LogicalOr, 12],
        ].forEach(val => this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'}, 
            {name: val[0] as TokenType}, 
            {name: 'Expr'}
        ], {priority: val[1] as number}));

        this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'},
            {name: TokenType.Question},
            {name: 'Expr'},
            {name: TokenType.Colon},
            {name: 'Expr'},
        ], {priority: 13, associative: RuleAssocitive.Right});

        [
            TokenType.SimpleAssignment, 
            TokenType.AssignmentSubstraction,
            TokenType.AssignmentAddition,
            TokenType.AssignmentProduct, 
            TokenType.AssignmentQuotient,
            TokenType.AssignmentRemainder,
            TokenType.AssignmentBitwiseLeftShift,
            TokenType.AssignmentBitwiseRightShift,
            TokenType.AssignmentBitwiseAnd,
            TokenType.AssignmentBitwiseXor,
            TokenType.AssignmentBitwiseOr
        ].forEach(tt => this.parser.addRule({name: 'Expr'}, [
            {name: 'Expr'},
            {name: tt},
            {name: 'Expr'}
        ], {priority: 14, associative: RuleAssocitive.Right}));
    } //}

    private GrammarBasicStatement() //{
    {
        this.parser.addRule({name: 'Expr'}, [{name: TokenType.BREAK}]);
        this.parser.addRule({name: 'Expr'}, [{name: TokenType.CONTINUE}]);

        this.parser.addRule({name: 'Statement'}, [
            {name: 'Expr', optional: true},
            {name: TokenType.Semicolon}
        ]);

        this.parser.addRule({name: 'Statement'}, [
            {name: 'Exprlist'},
            {name: TokenType.Semicolon}
        ]);
        this.parser.addRule({name: 'Statement'}, [
            {name: 'Block'}
        ]);

        this.parser.addRule({name: 'Block'}, [
            {name: TokenType.lCBracket},
            {name: 'Statement'},
            {name: TokenType.rCBracket},
        ]);
        this.parser.addRule({name: 'Block'}, [
            {name: TokenType.lCBracket},
            {name: 'StatementList', optional: true},
            {name: TokenType.rCBracket},
        ]);
        this.parser.addRule({name: 'StatementList'}, [
            {name: 'Statement'},
            {name: TokenType.Comma},
            {name: 'Statement'},
        ]);
        this.parser.addRule({name: 'StatementList'}, [
            {name: 'StatementList'},
            {name: TokenType.Comma},
            {name: 'Statement'},
        ]);
    } //}
    private GrammarIfStatement() //{
    {
    } //}
    private GrammarForStatement() //{
    {
    } //}
    private GrammarWhileStatement() //{
    {
    } //}
    private GrammarDoWhileStatement() //{
    {
    } //}
    private GrammarSwitchStatement() //{
    {
    } //}

    feed(text: string) {
        this.tokenizer.feed(text);
    }

    run() {
        if(this.tokenizer.current() == null) {
            this.tokenizer.next();
        }
        this.parser.parse(this.tokenizer);
    }
}

