import { CTokenizer, TokenType } from "./ctokenizer";
import { ParserGenerator, RuleAssocitive } from "./ParserGenerator/generator";

enum NonTermSymbol {
    PrimaryExpression = 'PrimaryExpression', PostfixExpression = 'PostfixExpression',
    ArgumentExpressionList = 'ArgumentExpressionList',
    UnaryExpression = 'UnaryExpression', 
    CastExpression = 'CastExpression',
    MultiplicativeExpression = 'MultiplicativeExpression',
    AdditiveExpression = 'AdditiveExpression',
    ShiftExpression = 'ShiftExpression',
    RelationalExpression = 'RelationalExpression',
    EqualityExpression = 'EqualityExpression',
    AndExpression = 'AndExpression',
    ExclusiveOrExpression = 'ExclusiveOrExpression',
    InclusiveOrExpression = 'InclusiveOrExpression',
    LogicalAndExpression = 'LogicalAndExpression',
    LogicalOrExpression = 'LogicalOrExpression',
    ConditionalExpression = 'ConditionalExpression',
    AssignmentExpression = 'AssignmentExpression',
    AssignmentOperator = 'AssignmentOperator',
    Expression = 'Expression', 
    ConstantExpression = 'ConstantExpression',

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

    private InitParser() //{
    {
        this.parser.addStartSymbol(NonTermSymbol.Declaration);
        this.parser.addStartSymbol(NonTermSymbol.Expression);

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
    } //}

    private GrammarExpr() //{
    {
        // (6.5.1)
        [
            TokenType.ID, TokenType.StringLiteral, TokenType.IntegerLiteral, TokenType.FloatLiteral
        ].forEach(tt => this.parser.addRule({name: NonTermSymbol.PrimaryExpression}, [{name: tt}]));
        this.parser.addRule({name: NonTermSymbol.PrimaryExpression}, [
            {name: TokenType.lRBracket}, 
            {name: NonTermSymbol.Expression}, 
            {name: TokenType.rRBracket}
        ]);

        // (6.5.2)
        this.parser.addRule({name: NonTermSymbol.PostfixExpression}, [
            {name: NonTermSymbol.PrimaryExpression},
        ], {priority: 1.5});
        this.parser.addRule({name: NonTermSymbol.PostfixExpression}, [
            {name: NonTermSymbol.PostfixExpression},
            {name: TokenType.lSBracket},
            {name: NonTermSymbol.Expression},
            {name: TokenType.rSBracket},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.PostfixExpression}, [
            {name: NonTermSymbol.PostfixExpression},
            {name: TokenType.lRBracket},
            {name: NonTermSymbol.ArgumentExpressionList, optional: true},
            {name: TokenType.rRBracket},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.PostfixExpression}, [
            {name: NonTermSymbol.PostfixExpression},
            {name: TokenType.MemberAccess},
            {name: TokenType.ID},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.PostfixExpression}, [
            {name: NonTermSymbol.PostfixExpression},
            {name: TokenType.MemberAccessByPointer},
            {name: TokenType.ID},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.PostfixExpression}, [
            {name: NonTermSymbol.PostfixExpression},
            {name: TokenType.Increment},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.PostfixExpression}, [
            {name: NonTermSymbol.PostfixExpression},
            {name: TokenType.Decrement},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.PostfixExpression}, [
            {name: TokenType.lRBracket},
            {name: NonTermSymbol.TypeName},
            {name: TokenType.rRBracket},
            {name: TokenType.lCBracket},
            {name: NonTermSymbol.InitializerList},
            {name: TokenType.Comma, optional: true},
            {name: TokenType.rCBracket},
        ]);

        this.parser.addRule({name: NonTermSymbol.ArgumentExpressionList}, [
            {name: NonTermSymbol.AssignmentExpression},
        ]);
        this.parser.addRule({name: NonTermSymbol.ArgumentExpressionList}, [
            {name: NonTermSymbol.ArgumentExpressionList},
            {name: TokenType.Comma},
            {name: NonTermSymbol.AssignmentExpression},
        ]);

        // (6.5.3)
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: NonTermSymbol.PostfixExpression}
        ], {priority: 2.5});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.Increment},
            {name: NonTermSymbol.UnaryExpression},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.Decrement},
            {name: NonTermSymbol.UnaryExpression},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.BitwiseAnd_Reference},
            {name: NonTermSymbol.UnaryExpression},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.Multiplication_AddressOf},
            {name: NonTermSymbol.UnaryExpression},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.Addition_UnaryPlus},
            {name: NonTermSymbol.UnaryExpression},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.Substraction_UnaryMinus},
            {name: NonTermSymbol.UnaryExpression},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.LogicalNot},
            {name: NonTermSymbol.UnaryExpression},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.BitwiseNot},
            {name: NonTermSymbol.UnaryExpression},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.SIZEOF},
            {name: NonTermSymbol.UnaryExpression},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.SIZEOF},
            {name: TokenType.lRBracket},
            {name: NonTermSymbol.TypeName},
            {name: TokenType.rRBracket},
        ], {priority: 2});
        this.parser.addRule({name: NonTermSymbol.UnaryExpression}, [
            {name: TokenType.SIZEOF},
            {name: TokenType.lRBracket},
            {name: NonTermSymbol.UnaryExpression},
            {name: TokenType.rRBracket},
        ], {priority: 2});

        // (6.5.4)
        this.parser.addRule({name: NonTermSymbol.CastExpression}, [
            {name: NonTermSymbol.UnaryExpression},
        ], {priority: 2.5});
        this.parser.addRule({name: NonTermSymbol.CastExpression}, [
            {name: TokenType.lRBracket},
            {name: NonTermSymbol.TypeName},
            {name: TokenType.rRBracket},
            {name: NonTermSymbol.CastExpression},
        ], {priority: 2});
        
        // (6.5.5)
        this.parser.addRule({name: NonTermSymbol.MultiplicativeExpression}, [
            {name: NonTermSymbol.CastExpression},
        ], {priority: 3.5});
        [ TokenType.Multiplication_AddressOf, TokenType.Division, TokenType.Remainder ]
        .forEach(tt => {
            this.parser.addRule({name: NonTermSymbol.MultiplicativeExpression}, [
                {name: NonTermSymbol.MultiplicativeExpression},
                {name: tt},
                {name: NonTermSymbol.CastExpression},
            ], {priority: 3});
        });

        // (6.5.6)
        this.parser.addRule({name: NonTermSymbol.AdditiveExpression}, [
            {name: NonTermSymbol.MultiplicativeExpression},
        ], {priority: 4.5});
        [ TokenType.Addition_UnaryPlus, TokenType.Substraction_UnaryMinus ]
            .forEach(tt => {
            this.parser.addRule({name: NonTermSymbol.AdditiveExpression}, [
                {name: NonTermSymbol.AdditiveExpression},
                {name: tt},
                {name: NonTermSymbol.MultiplicativeExpression},
            ], {priority: 4});
        });

        // (6.5.7)
        this.parser.addRule({name: NonTermSymbol.ShiftExpression}, [
            {name: NonTermSymbol.AdditiveExpression},
        ], {priority: 5.5});
        [ TokenType.BitwiseLeftShift, TokenType.BitwiseRightShift ]
            .forEach(tt => {
            this.parser.addRule({name: NonTermSymbol.ShiftExpression}, [
                {name: NonTermSymbol.ShiftExpression},
                {name: tt},
                {name: NonTermSymbol.AdditiveExpression},
            ], {priority: 5});
        });

        // (6.5.8)
        this.parser.addRule({name: NonTermSymbol.RelationalExpression}, [
            {name: NonTermSymbol.ShiftExpression},
        ], {priority: 6.5});
        [ TokenType.GreaterThan, TokenType.GreaterEqual, TokenType.LessThan, TokenType.LessEqual ]
            .forEach(tt => {
            this.parser.addRule({name: NonTermSymbol.RelationalExpression}, [
                {name: NonTermSymbol.RelationalExpression},
                {name: tt},
                {name: NonTermSymbol.ShiftExpression},
            ], {priority: 6});
        });

        // (6.5.9)
        this.parser.addRule({name: NonTermSymbol.EqualityExpression}, [
            {name: NonTermSymbol.RelationalExpression},
        ], {priority: 7.5});
        [ TokenType.Equal, TokenType.NotEqual ]
            .forEach(tt => {
            this.parser.addRule({name: NonTermSymbol.EqualityExpression}, [
                {name: NonTermSymbol.EqualityExpression},
                {name: tt},
                {name: NonTermSymbol.RelationalExpression},
            ], {priority: 7});
        });

        // (6.5.10)
        this.parser.addRule({name: NonTermSymbol.AndExpression}, [
            {name: NonTermSymbol.EqualityExpression},
        ], {priority: 8.5});
        this.parser.addRule({name: NonTermSymbol.AndExpression}, [
            {name: NonTermSymbol.AndExpression},
            {name: TokenType.BitwiseAnd_Reference},
            {name: NonTermSymbol.EqualityExpression},
        ], {priority: 8});

        // (6.5.11)
        this.parser.addRule({name: NonTermSymbol.ExclusiveOrExpression}, [
            {name: NonTermSymbol.AndExpression},
        ], {priority: 9.5});
        this.parser.addRule({name: NonTermSymbol.ExclusiveOrExpression}, [
            {name: NonTermSymbol.ExclusiveOrExpression},
            {name: TokenType.BitwiseXor},
            {name: NonTermSymbol.AndExpression},
        ], {priority: 9});

        // (6.5.12)
        this.parser.addRule({name: NonTermSymbol.InclusiveOrExpression}, [
            {name: NonTermSymbol.ExclusiveOrExpression},
        ], {priority: 10.5});
        this.parser.addRule({name: NonTermSymbol.InclusiveOrExpression}, [
            {name: NonTermSymbol.InclusiveOrExpression},
            {name: TokenType.BitwiseOr},
            {name: NonTermSymbol.ExclusiveOrExpression},
        ], {priority: 10});

        // (6.5.13)
        this.parser.addRule({name: NonTermSymbol.LogicalAndExpression}, [
            {name: NonTermSymbol.InclusiveOrExpression},
        ], {priority: 11.5});
        this.parser.addRule({name: NonTermSymbol.LogicalAndExpression}, [
            {name: NonTermSymbol.LogicalAndExpression},
            {name: TokenType.LogicalAnd},
            {name: NonTermSymbol.InclusiveOrExpression},
        ], {priority: 11});

        // (6.5.14)
        this.parser.addRule({name: NonTermSymbol.LogicalOrExpression}, [
            {name: NonTermSymbol.LogicalAndExpression},
        ], {priority: 12.5});
        this.parser.addRule({name: NonTermSymbol.LogicalOrExpression}, [
            {name: NonTermSymbol.LogicalOrExpression},
            {name: TokenType.LogicalOr},
            {name: NonTermSymbol.LogicalAndExpression},
        ], {priority: 12});

        // (6.5.15)
        this.parser.addRule({name: NonTermSymbol.ConditionalExpression}, [
            {name: NonTermSymbol.LogicalOrExpression},
        ], {priority: 13.5});
        this.parser.addRule({name: NonTermSymbol.ConditionalExpression}, [
            {name: NonTermSymbol.LogicalOrExpression},
            {name: TokenType.Question},
            {name: NonTermSymbol.Expression},
            {name: TokenType.Colon},
            {name: NonTermSymbol.ConditionalExpression},
        ], {priority: 13});

        // (6.5.16)
        this.parser.addRule({name: NonTermSymbol.AssignmentExpression}, [
            {name: NonTermSymbol.ConditionalExpression},
        ], {priority: 14.5});
        [
            TokenType.SimpleAssignment, TokenType.AssignmentProduct,
            TokenType.AssignmentQuotient, TokenType.AssignmentRemainder,
            TokenType.AssignmentAddition, TokenType.AssignmentSubstraction,
            TokenType.AssignmentBitwiseLeftShift, TokenType.AssignmentBitwiseRightShift,
            TokenType.AssignmentBitwiseAnd, TokenType.AssignmentBitwiseXor,
            TokenType.AssignmentBitwiseOr
        ].forEach(tt => {
            this.parser.addRule({name: NonTermSymbol.AssignmentExpression}, [
                {name: NonTermSymbol.UnaryExpression},
                {name: tt},
                {name: NonTermSymbol.AssignmentExpression},
            ]);
        }, {priority: 14});

        // (6.5.17)
        this.parser.addRule({name: NonTermSymbol.Expression}, [
            {name: NonTermSymbol.AssignmentExpression},
        ], {priority: 15.5});
        this.parser.addRule({name: NonTermSymbol.Expression}, [
            {name: NonTermSymbol.Expression},
            {name: TokenType.Comma},
            {name: NonTermSymbol.AssignmentExpression},
        ], {priority: 15});

        // (6.5.6)
        this.parser.addRule({name: NonTermSymbol.ConstantExpression}, [
            {name: NonTermSymbol.AssignmentExpression},
        ]);
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
            TokenType.FLOAT,  TokenType.DOUBLE,
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
            {name: NonTermSymbol.ConstantExpression}
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
            {name: NonTermSymbol.ConstantExpression}
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
            {name: NonTermSymbol.AssignmentExpression, optional: true},
            {name: TokenType.rSBracket},
        ], {priority: 1});
        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [
            {name: NonTermSymbol.DirectDeclarator},
            {name: TokenType.lSBracket},
            {name: TokenType.STATIC},
            {name: NonTermSymbol.TypeQualifierList, optional: true},
            {name: NonTermSymbol.AssignmentExpression},
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.DirectDeclarator}, [
            {name: NonTermSymbol.DirectDeclarator},
            {name: TokenType.lSBracket},
            {name: NonTermSymbol.TypeQualifierList},
            {name: TokenType.STATIC},
            {name: NonTermSymbol.AssignmentExpression},
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
            {name: NonTermSymbol.AssignmentExpression, optional: true},
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.DirectAbstractDeclarator}, [
            {name: NonTermSymbol.DirectAbstractDeclarator, optional: true},
            {name: TokenType.lSBracket},
            {name: TokenType.STATIC},
            {name: NonTermSymbol.TypeQualifierList, optional: true},
            {name: NonTermSymbol.AssignmentExpression},
            {name: TokenType.rSBracket},
        ]);
        this.parser.addRule({name: NonTermSymbol.DirectAbstractDeclarator}, [
            {name: NonTermSymbol.DirectAbstractDeclarator, optional: true},
            {name: TokenType.lSBracket},
            {name: NonTermSymbol.TypeQualifierList},
            {name: TokenType.STATIC},
            {name: NonTermSymbol.AssignmentExpression},
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
            {name: NonTermSymbol.AssignmentExpression}
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
            {name: NonTermSymbol.ConstantExpression},
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

