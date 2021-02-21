import { AST, ASTCatogory } from "../ast";
import { ExpressionAST } from "./expression";
import { TypeInfoAST } from "./type";

export class DeclarationAST extends AST {
    readonly id: string;
    type: TypeInfoAST;

    constructor(id: string) {
        super(ASTCatogory.Declaration);
        this.id = id;
    }
}

export class FunctionDefinitionAST extends AST {
    constructor() {
        super(ASTCatogory.FunctionDefinition);
    }
}

export class TranslationUnitAST extends AST {
    readonly units: (DeclarationAST | FunctionDefinitionAST)[];

    constructor() {
        super(ASTCatogory.TranslationUnit);
        this.units = [];
    }
}

export class CompoundStatementAST extends AST {
    readonly statements: (DeclarationAST | ExpressionAST)[];

    constructor() {
        super(ASTCatogory.CompoundStatement);
        this.statements = [];
    }
}

