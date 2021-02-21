import { CTokenizer, TokenType } from "./ctokenizer";
import { ParserGenerator, RuleAssocitive } from "./ParserGenerator/generator";

enum NonTermSymbol {
    Declaration = 'Declaration', DeclarationSpecifiers = 'DeclarationSpecifiers',
    InitDeclaratorList = 'InitDeclaratorList', StorageClassSpecifier = 'StorageClassSpecifier',
    TypeSpecifier = 'TypeSpecifier', TypeQualifier = 'TypeQualifier',
    FunctionSpecifier = 'FunctionSpecifier', InitDeclarator = 'InitDeclarator',
    Declarator = 'Declarator', Initializer = 'Initializer',
    StructOrUnionSpecifier = 'StructOrUnionSpecifier',
    StructOrUnion = 'StructOrUnion',
    StructDeclarationList = 'StructDeclarationList', StructDeclaration = 'StructDeclaration',
    SpecifierQualifierList = 'SpecifierQualifierList', StructDeclaratorList = 'StructDeclaratorList',
    StructDeclarator = 'StructDeclarator',
    EnumSpecifier = 'EnumSpecifier', EnumeratorList = 'EnumeratorList',
    Enumerator = 'Enumerator',
    DirectDeclarator = 'DirectDeclarator', IdentifierList = 'IdentifierList',
    ParameterTypeList = 'ParameterTypeList', Pointer = 'Pointer',
    TypeQualifierList = 'TypeQualifierList', ParameterList = 'ParameterList',
    ParameterDeclaration = 'ParameterDeclaration', AbstractDeclarator = 'AbstractDeclarator',
    TypeName = 'TypeName', DirectAbstractDeclarator = 'DirectAbstractDeclarator',
    TypedefName = 'TypedefName', InitializerList = 'InitializerList',
    Designation = 'Designation', DesignatorList = 'DesignatorList',
    Designator = 'Designator',
}

export class CParser {
    private tokenizer: CTokenizer;
    private parser: ParserGenerator;
    private filename: string;

    constructor(filename: string) {
        this.filename = filename;
        this.tokenizer = new CTokenizer(filename);
        this.parser = new ParserGenerator();
        this.InitParser();
    }

    private InitParser() {
        this.parser.addStartSymbol(NonTermSymbol.Declaration);

        // Expressions
        this.GrammarExpr();

        // Declarations
        this.GrammarDeclaration();

        // Statements
        this.GrammarBasicStatement();
        this.GrammarIfStatement();
        this.GrammarForStatement();
        this.GrammarWhileStatement();
        this.GrammarDoWhileStatement();
        this.GrammarSwitchStatement();

        this.parser.compile();
    }

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

    private GrammarDeclaration() //{
    { 
        // (6.7)
        this.parser.addRule({name: NonTermSymbol.Declaration}, [
            {name: NonTermSymbol.DeclarationSpecifiers},
            {name: NonTermSymbol.InitDeclaratorList},
            {name: TokenType.Semicolon}
        ]);

        this.parser.addRule({name: NonTermSymbol.DeclarationSpecifiers}, [
            {name: NonTermSymbol.DeclarationSpecifiers, optional: true},
            {name: NonTermSymbol.StorageClassSpecifier},
        ]);
        this.parser.addRule({name: NonTermSymbol.DeclarationSpecifiers}, [
            {name: NonTermSymbol.DeclarationSpecifiers, optional: true},
            {name: NonTermSymbol.TypeSpecifier},
        ]);
        this.parser.addRule({name: NonTermSymbol.DeclarationSpecifiers}, [
            {name: NonTermSymbol.DeclarationSpecifiers, optional: true},
            {name: NonTermSymbol.TypeQualifier},
        ]);
        this.parser.addRule({name: NonTermSymbol.DeclarationSpecifiers}, [
            {name: NonTermSymbol.DeclarationSpecifiers, optional: true},
            {name: NonTermSymbol.FunctionSpecifier},
        ]);

        this.parser.addRule({name: NonTermSymbol.InitDeclaratorList}, [
            {name: NonTermSymbol.InitDeclaratorList, optional: true},
            {name: NonTermSymbol.InitDeclarator},
        ]);

        this.parser.addRule({name: NonTermSymbol.InitDeclarator}, [
            {name: NonTermSymbol.Declarator},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.InitDeclarator}, [
            {name: NonTermSymbol.Declarator},
            {name: TokenType.SimpleAssignment},
            {name: NonTermSymbol.Initializer},
        ], {priority: 1});

        // (6.7.1)
        [
            TokenType.TYPEDEF, TokenType.EXTERN,
            TokenType.STATIC,  TokenType.AUTO,
            TokenType.REGISTER
        ].forEach(tt => this.parser.addRule({name: NonTermSymbol.StorageClassSpecifier}, [{name: tt}]));

        // (6.7.2)
        [
            TokenType.VOID,
            TokenType.CHAR,   TokenType.SHORT,
            TokenType.INT,    TokenType.LONG,
            TokenType.FLOATV,  TokenType.DOUBLE,
            TokenType.SIGNED, TokenType.UNSIGNED,
            NonTermSymbol.TypedefName
        ].forEach(tt => this.parser.addRule({name: NonTermSymbol.TypeSpecifier}, [{name: tt}]));

        // FIXME
        this.parser.addRule({name: NonTermSymbol.Declaration}, [
            {name: NonTermSymbol.StructOrUnionSpecifier},
            {name: TokenType.Semicolon}
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.Declaration}, [
            {name: NonTermSymbol.EnumSpecifier},
            {name: TokenType.Semicolon}
        ], {priority: 1});

        this.parser.addRule({name: NonTermSymbol.TypeSpecifier}, [
            {name: NonTermSymbol.StructOrUnionSpecifier},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.TypeSpecifier}, [
            {name: NonTermSymbol.EnumSpecifier}
        ], {priority: 2});

        // (6.7.2.1)
        this.parser.addRule({name: NonTermSymbol.StructOrUnionSpecifier}, [
            {name: NonTermSymbol.StructOrUnion},
            {name: TokenType.ID},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.StructOrUnionSpecifier}, [
            {name: NonTermSymbol.StructOrUnion},
            {name: TokenType.ID, optional: true},
            {name: TokenType.lCBracket},
            {name: NonTermSymbol.StructDeclarationList, optional: true},
            {name: TokenType.rCBracket},
        ], {priority: 1});

        this.parser.addRule({name: NonTermSymbol.StructOrUnion}, [
            {name: TokenType.STRUCT}
        ]);
        this.parser.addRule({name: NonTermSymbol.StructOrUnion}, [
            {name: TokenType.UNION}
        ]);

        this.parser.addRule({name: NonTermSymbol.StructDeclarationList}, [
            {name: NonTermSymbol.StructDeclarationList, optional: true},
            {name: NonTermSymbol.StructDeclaration},
        ]);

        this.parser.addRule({name: NonTermSymbol.StructDeclaration}, [
            {name: NonTermSymbol.SpecifierQualifierList},
            {name: NonTermSymbol.StructDeclaratorList},
            {name: TokenType.Semicolon}
        ]);
        this.parser.addRule({name: NonTermSymbol.StructDeclaration}, [
            {name: TokenType.Semicolon}
        ]);

        this.parser.addRule({name: NonTermSymbol.SpecifierQualifierList}, [
            {name: NonTermSymbol.SpecifierQualifierList, optional: true},
            {name: NonTermSymbol.TypeSpecifier},
        ]);
        this.parser.addRule({name: NonTermSymbol.SpecifierQualifierList}, [
            {name: NonTermSymbol.SpecifierQualifierList, optional: true},
            {name: NonTermSymbol.TypeQualifier},
        ]);

        this.parser.addRule({name: NonTermSymbol.StructDeclaratorList}, [
            {name: NonTermSymbol.StructDeclarator}
        ]);
        this.parser.addRule({name: NonTermSymbol.StructDeclaratorList}, [
            {name: NonTermSymbol.StructDeclaratorList},
            {name: TokenType.Comma},
            {name: NonTermSymbol.StructDeclarator}
        ]);

        this.parser.addRule({name: NonTermSymbol.StructDeclarator}, [
            {name: NonTermSymbol.Declarator},
        ]);

        this.parser.addRule({name: NonTermSymbol.StructDeclarator}, [
            {name: NonTermSymbol.Declarator, optional: true},
            {name: TokenType.Colon},
            {name: 'Expr'} // TODO
        ]);

        // (6.7.2.2)
        this.parser.addRule({name: NonTermSymbol.EnumSpecifier}, [
            {name: TokenType.ENUM},
            {name: TokenType.ID},
        ], {priority: 2});

        this.parser.addRule({name: NonTermSymbol.EnumSpecifier}, [
            {name: TokenType.ENUM},
            {name: TokenType.ID, optional: true},
            {name: TokenType.lCBracket},
            {name: NonTermSymbol.EnumeratorList},
            {name: TokenType.Comma, optional: true},
            {name: TokenType.rCBracket},
        ], {priority: 1});

        this.parser.addRule({name: NonTermSymbol.EnumeratorList}, [
            {name: NonTermSymbol.EnumeratorList},
            {name: TokenType.Comma},
            {name: NonTermSymbol.Enumerator},
        ]);
        this.parser.addRule({name: NonTermSymbol.EnumeratorList}, [
            {name: NonTermSymbol.Enumerator},
        ], {priority: 2});

        this.parser.addRule({name: NonTermSymbol.Enumerator}, [
            {name: TokenType.ID}
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.Enumerator}, [
            {name: TokenType.ID},
            {name: TokenType.SimpleAssignment},
            {name: 'Expr'} // TODO
        ], {priority: 1});

        // (6.7.3)
        [
            TokenType.CONST, TokenType.VOLATILE, TokenType.RESTRICT
        ].forEach(tt => this.parser.addRule({name: NonTermSymbol.TypeQualifier}, [{name: tt}]));

        // (6.7.4)
        this.parser.addRule({name: NonTermSymbol.FunctionSpecifier}, [
            {name: TokenType.INLINE}
        ]);

        // (6.7.5)
        this.parser.addRule({name: NonTermSymbol.Declarator}, [
            {name: NonTermSymbol.Pointer, optional: true},
            {name: NonTermSymbol.DirectDeclarator},
        ], {priority: 2});

        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [{name: TokenType.ID}]);
        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [
            {name: TokenType.lRBracket},
            {name: NonTermSymbol.Declarator},
            {name: TokenType.rRBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [
            {name: NonTermSymbol.DirectDeclarator},
            {name: TokenType.lSBracket},
            {name: NonTermSymbol.TypeQualifierList, optional: true},
            {name: 'Expr', optional: true}, // TODO
            {name: TokenType.rSBracket},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [
            {name: NonTermSymbol.DirectDeclarator},
            {name: TokenType.lSBracket},
            {name: TokenType.STATIC},
            {name: NonTermSymbol.TypeQualifierList, optional: true},
            {name: 'Expr'}, // TODO
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [
            {name: NonTermSymbol.DirectDeclarator},
            {name: TokenType.lSBracket},
            {name: NonTermSymbol.TypeQualifierList},
            {name: TokenType.STATIC},
            {name: 'Expr'}, // TODO
            {name: TokenType.rSBracket},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [
            {name: NonTermSymbol.DirectDeclarator},
            {name: TokenType.lSBracket},
            {name: NonTermSymbol.TypeQualifierList, optional: true},
            {name: TokenType.Multiplication_AddressOf},
            {name: TokenType.rSBracket},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [
            {name: NonTermSymbol.DirectDeclarator},
            {name: TokenType.lRBracket},
            {name: NonTermSymbol.ParameterTypeList, optional: true},
            {name: TokenType.rRBracket},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [
            {name: NonTermSymbol.DirectDeclarator},
            {name: TokenType.lRBracket},
            {name: NonTermSymbol.IdentifierList},
            {name: TokenType.rRBracket},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [
            {name: NonTermSymbol.DirectDeclarator},
            {name: TokenType.lRBracket},
            {name: TokenType.ID},
            {name: TokenType.rRBracket},
        ], {priority: 1});

        this.parser.addRule({name: NonTermSymbol.Pointer}, [
            {name: TokenType.Multiplication_AddressOf},
        ]);
        this.parser.addRule({name: NonTermSymbol.Pointer}, [
            {name: NonTermSymbol.Pointer},
            {name: TokenType.Multiplication_AddressOf},
        ]);
        this.parser.addRule({name: NonTermSymbol.Pointer}, [
            {name: NonTermSymbol.Pointer},
            {name: NonTermSymbol.TypeQualifierList},
        ]);

        this.parser.addRule({name: NonTermSymbol.TypeQualifierList}, [
            {name: NonTermSymbol.TypeQualifierList, optional: true},
            {name: NonTermSymbol.TypeQualifier},
        ]);

        this.parser.addRule({name: NonTermSymbol.ParameterTypeList}, [
            {name: NonTermSymbol.ParameterList}
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.ParameterTypeList}, [
            {name: NonTermSymbol.ParameterList},
            {name: TokenType.Comma},
            {name: TokenType.DOTS},
        ], {priority: 1});

        this.parser.addRule({name: NonTermSymbol.ParameterList}, [
            {name: NonTermSymbol.ParameterList},
            {name: TokenType.Comma},
            {name: NonTermSymbol.ParameterDeclaration},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.ParameterList}, [
            {name: NonTermSymbol.ParameterDeclaration},
        ], {priority: 2});

        this.parser.addRule({name: NonTermSymbol.ParameterDeclaration}, [
            {name: NonTermSymbol.DeclarationSpecifiers},
            {name: NonTermSymbol.Declarator}, // TODO
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.ParameterDeclaration}, [
            {name: NonTermSymbol.DeclarationSpecifiers},
            {name: NonTermSymbol.AbstractDeclarator},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.ParameterDeclaration}, [
            {name: NonTermSymbol.DeclarationSpecifiers},
        ], {priority: 2});

        this.parser.addRule({name: NonTermSymbol.IdentifierList}, [
            {name: TokenType.ID},
            {name: TokenType.Comma},
            {name: TokenType.ID}
        ]);

        this.parser.addRule({name: NonTermSymbol.IdentifierList}, [
            {name: NonTermSymbol.IdentifierList},
            {name: TokenType.Comma},
            {name: TokenType.ID}
        ]);

        // (6.7.6)
        this.parser.addRule({name: NonTermSymbol.TypeName}, [
            {name: NonTermSymbol.SpecifierQualifierList},
            {name: NonTermSymbol.AbstractDeclarator},
        ]);

        this.parser.addRule({name: NonTermSymbol.AbstractDeclarator}, [
            {name: NonTermSymbol.Pointer},
        ]);
        this.parser.addRule({name: NonTermSymbol.AbstractDeclarator}, [
            {name: NonTermSymbol.Pointer, optional: true},
            {name: NonTermSymbol.DirectAbstractDeclarator},
        ]);

        this.parser.addRule({name: NonTermSymbol.DirectAbstractDeclarator}, [
            {name: TokenType.lRBracket},
            {name: NonTermSymbol.AbstractDeclarator},
            {name: TokenType.rRBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.DirectAbstractDeclarator}, [
            {name: NonTermSymbol.DirectAbstractDeclarator, optional: true},
            {name: TokenType.lSBracket},
            {name: NonTermSymbol.TypeQualifierList, optional: true},
            {name: 'Expr', optional: true}, // TODO
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.DirectAbstractDeclarator}, [
            {name: NonTermSymbol.DirectAbstractDeclarator, optional: true},
            {name: TokenType.lSBracket},
            {name: TokenType.STATIC},
            {name: NonTermSymbol.TypeQualifierList, optional: true},
            {name: 'Expr'}, // TODO
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.DirectAbstractDeclarator}, [
            {name: NonTermSymbol.DirectAbstractDeclarator, optional: true},
            {name: TokenType.lSBracket},
            {name: NonTermSymbol.TypeQualifierList},
            {name: TokenType.STATIC},
            {name: 'Expr'}, // TODO
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.DirectAbstractDeclarator}, [
            {name: NonTermSymbol.DirectAbstractDeclarator, optional: true},
            {name: TokenType.lSBracket},
            {name: TokenType.Multiplication_AddressOf},
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.DirectAbstractDeclarator}, [
            {name: NonTermSymbol.DirectAbstractDeclarator, optional: true},
            {name: TokenType.lRBracket},
            {name: NonTermSymbol.ParameterTypeList, optional: true},
            {name: TokenType.rRBracket},
        ]);

        // (6.7.7)
        /* TODO
        this.parser.addRule({name: NonTermSymbol.TypeName}, [
            {name: TokenType.ID}
        ], {uid: 'typename-rule'});
        */

        // (6.7.8)
        this.parser.addRule({name: NonTermSymbol.Initializer}, [
            {name: 'Expr'} // TODO
        ]);
        this.parser.addRule({name: NonTermSymbol.Initializer}, [
            {name: TokenType.lCBracket},
            {name: NonTermSymbol.InitializerList},
            {name: TokenType.Comma, optional: true},
            {name: TokenType.rCBracket}
        ]);

        this.parser.addRule({name: NonTermSymbol.InitializerList}, [
            {name: NonTermSymbol.InitializerList, optional: true},
            {name: NonTermSymbol.Designation, optional: true},
            {name: NonTermSymbol.Initializer}
        ]);

        this.parser.addRule({name: NonTermSymbol.Designation}, [
            {name: NonTermSymbol.DesignatorList},
            {name: TokenType.SimpleAssignment},
        ]);

        this.parser.addRule({name: NonTermSymbol.DesignatorList}, [
            {name: NonTermSymbol.DesignatorList, optional: true},
            {name: NonTermSymbol.Designator}
        ]);

        this.parser.addRule({name: NonTermSymbol.Designator}, [
            {name: TokenType.lSBracket},
            {name: 'Expr'}, // TODO
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.Designator}, [
            {name: TokenType.MemberAccess},
            {name: TokenType.ID},
        ]);
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

    reset() {
        this.tokenizer = new CTokenizer(this.filename);
    }

    run() {
        if(this.tokenizer.current() == null) {
            this.tokenizer.next();
        }
        this.parser.parse(this.tokenizer);
    }
}

