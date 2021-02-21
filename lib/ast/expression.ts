import { AST, ASTCatogory } from "../ast";

export class ExpressionAST extends AST {
    constructor() {
        super(ASTCatogory.Expression);
    }
}

