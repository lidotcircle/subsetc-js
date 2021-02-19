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
        this.GrammarExpr();

        this.parser.compile();
    }

    private GrammarExpr() {
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
    }

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

