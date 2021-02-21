
export enum ASTCatogory {
    TypeInfo = 'TypeInfo', Expression = 'Expression', 
    IfStatement = 'IfStatement', SwitchStatement = 'SwitchStatement',
    WhileStatement = 'WhileStatement', DoWhileStatement = 'DoWhileStatement',
    GotoStatement = 'GotoStatement', BreakStatement = 'BreakStatment',
    ContinueStatement = 'ContinueStatement', ReturnStatement = 'ReturnStatement',
    CompoundStatement = 'CompoundStatement', FunctionDefinition = 'FunctionDefinition',
    TranslationUnit = 'TranslationUnit', Declaration = 'Declaration',
}

export class AST {
    readonly category: ASTCatogory;

    constructor(cat: ASTCatogory) {
        this.category = cat;
    }
}

