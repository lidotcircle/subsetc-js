import assert from 'assert';
import { OperatorToken, OperatorType } from './tokenizor';


export enum ASTType {
    FunctionBlock, WhileBlock, ForBlock, DoWhileBlock, BasicBlock, 
    IfBlock, IfElseBlock, ElseBlock, Continue, Break, 

    SwitchBlock, CaseBlock,

    Expr
}

export class BasicAST {
    readonly astType: ASTType;

    constructor(t: ASTType) {
        this.astType = t;
    }
}

export class FunctionBlockAST extends BasicAST {
    readonly fname: string;
    private  _body: BasicBlock;
    get body(): BasicBlock {return this._body;}

    // TODO return type
    constructor(fname: string) {
        super(ASTType.FunctionBlock);
        this.fname = fname;
    }

    // TODO type
    push_args() {
    }

    push_body(body: BasicBlock) {
        assert.equal(this._body, null);
        assert.notEqual(body, null);
        this._body = body;
    }
}

export class DoWhileBlockAST extends BasicAST {
    private _condition: ExprAST;
    private _body: BasicBlock;

    constructor() {
        super(ASTType.DoWhileBlock);
    }

    set_condition(condition: ExprAST) {
        this._condition = condition;
    }

    push_body(body: BasicBlock) {
        assert.equal(this._body, null);
        assert.notEqual(body, null);
        this._body = body;
    }
}

export class BasicBlock extends BasicAST {
    readonly statements: BasicAST[] = [];

    constructor() {
        super(ASTType.BasicBlock);
    }
}

export enum ZeronaryASTType {
    StringLiteral, IntegerLiteral, FloatPointLiteral, Variable
}

export enum UnaryExprASTType {
    SuffixInc = 100, SufficDec, PrefixInc, PrefixDec,
    UnaryPlus, UnaryMinus, LogicalNot, BitwiseNot,
    AddressOf, Reference, Cast, CompoundLiteral,
}

const b_mapping: Map<OperatorType, UnaryExprASTType> = new Map([
    [OperatorType.Increment, UnaryExprASTType.SuffixInc,],
    [OperatorType.Decrement, UnaryExprASTType.SufficDec,]
]);
export function OperatorTokenToUnarySuffixExprASTType(token: OperatorToken): UnaryExprASTType {
    return b_mapping.get(token.operator);
}

const c_mapping: Map<OperatorType, UnaryExprASTType> = new Map([
    [OperatorType.Increment, UnaryExprASTType.PrefixInc],
    [OperatorType.Decrement, UnaryExprASTType.PrefixDec],
    [OperatorType.Addition_UnaryPlus, UnaryExprASTType.UnaryPlus],
    [OperatorType.Substraction_UnaryMinus, UnaryExprASTType.UnaryMinus],
    [OperatorType.LogicalNot, UnaryExprASTType.LogicalNot],
    [OperatorType.BitwiseNot, UnaryExprASTType.BitwiseNot],
    [OperatorType.Multiplication_AddressOf, UnaryExprASTType.AddressOf],
    [OperatorType.BitwiseAnd_Reference, UnaryExprASTType.Reference],
]);
export function OperatorTokenToUnaryPrefixExprASTType(token: OperatorToken): UnaryExprASTType {
    return c_mapping.get(token.operator);
}

export enum BinaryExprASTType {
    ArrayIndex = 200,

    MemberAccess, MemberAccessByPointer,
    Multiplication, Division, Remainder, Addition, Substration,
    BitwiseLeftShift, BitwiseRightShift, BitwiseAnd, BitwiseXor, BitwiseOr,
    LessThan, LessEqual, GreaterThan, GreaterEqual, Equal, NotEqual,

    LogicalAnd, LogicalOr,

    SimpleAssignment,
    AssignmentAddition, AssignmentSubstraction,
    AssignmentProduct, AssignmentRemainder, AssignmentQuotient,
    AssignmentBitwiseLeftShift, AssignmentBitwiseRightShift,
    AssignmentBitwiseAnd, AssignmentBitwiseXor, AssignmentBitwiseOr,
}

const a_mapping: Map<OperatorType, BinaryExprASTType> = new Map([
    [OperatorType.MemberAccess, BinaryExprASTType.MemberAccess],
    [OperatorType.MemberAccessByPointer, BinaryExprASTType.MemberAccessByPointer],
    [OperatorType.Multiplication_AddressOf, BinaryExprASTType.Multiplication],
    [OperatorType.Division, BinaryExprASTType.Division],
    [OperatorType.Remainder, BinaryExprASTType.Remainder],
    [OperatorType.Addition_UnaryPlus, BinaryExprASTType.Addition],
    [OperatorType.Substraction_UnaryMinus, BinaryExprASTType.Substration],

    [OperatorType.BitwiseLeftShift, BinaryExprASTType.BitwiseLeftShift],
    [OperatorType.BitwiseRightShift, BinaryExprASTType.BitwiseRightShift],
    [OperatorType.BitwiseAnd_Reference, BinaryExprASTType.BitwiseAnd],
    [OperatorType.BitwiseXor, BinaryExprASTType.BitwiseXor],
    [OperatorType.BitwiseOr, BinaryExprASTType.BitwiseOr],

    [OperatorType.LessThan, BinaryExprASTType.LessThan],
    [OperatorType.LessEqual, BinaryExprASTType.LessEqual],
    [OperatorType.GreaterThan, BinaryExprASTType.GreaterThan],
    [OperatorType.GreaterEqual, BinaryExprASTType.GreaterEqual],
    [OperatorType.Equal, BinaryExprASTType.Equal],
    [OperatorType.NotEqual, BinaryExprASTType.NotEqual],

    [OperatorType.LogicalAnd, BinaryExprASTType.LogicalAnd],
    [OperatorType.LogicalOr, BinaryExprASTType.LogicalOr],

    [OperatorType.SimpleAssignment, BinaryExprASTType.SimpleAssignment],
    [OperatorType.AssignmentAddition, BinaryExprASTType.AssignmentAddition],
    [OperatorType.AssignmentSubstraction, BinaryExprASTType.AssignmentSubstraction],
    [OperatorType.AssignmentProduct, BinaryExprASTType.AssignmentProduct],
    [OperatorType.AssignmentQuotient, BinaryExprASTType.AssignmentQuotient],
    [OperatorType.AssignmentRemainder, BinaryExprASTType.AssignmentRemainder],

    [OperatorType.AssignmentBitwiseLeftShift, BinaryExprASTType.AssignmentBitwiseLeftShift],
    [OperatorType.AssignmentBitwiseRightShift, BinaryExprASTType.AssignmentBitwiseRightShift],
    [OperatorType.AssignmentBitwiseAnd, BinaryExprASTType.AssignmentBitwiseAnd],
    [OperatorType.AssignmentBitwiseXor, BinaryExprASTType.AssignmentBitwiseXor],
    [OperatorType.AssignmentBitwiseOr, BinaryExprASTType.AssignmentBitwiseOr],
]);
export function OperatorTokenToBinaryExprASTType(token: OperatorToken): BinaryExprASTType | null {
    return a_mapping.get(token.operator);
}

export enum TenaryExprASTType {
    TenaryCondition = 300
}

export enum FunctionCallASTType {
    FunctionCall = 400
}

export type ExprASTType = ZeronaryASTType | UnaryExprASTType | BinaryExprASTType | TenaryExprASTType | FunctionCallASTType;

export class ExprAST extends BasicAST {
    readonly exprType: ExprASTType;
    readonly children: ExprAST[];

    constructor(t: ExprASTType) {
        super(ASTType.Expr);
        this.exprType = t;
    }

    isUnary(): boolean {
        return this.exprType >= 100 && this.exprType <= 199;
    }

    isBinary(): boolean {
        return this.exprType >= 200 && this.exprType <= 299;
    }

    isTenary(): boolean {
        return this.exprType >= 300 && this.exprType <= 399;
    }

    isFuncCall(): boolean {
        return this.exprType >= 400 && this.exprType <= 499;
    }
}

export class ArrayIndexExprAST extends ExprAST {
    constructor() {
        super(BinaryExprASTType.ArrayIndex);
    }
}

export class FunctionCallExprAST extends ExprAST {
    readonly fname: string;

    constructor(fname: string) {
        super(FunctionCallASTType.FunctionCall);
        this.fname = fname;
    }
}


export class IntegerExprAST extends ExprAST {
    readonly value: number;
    constructor(val: number) {
        super(ZeronaryASTType.IntegerLiteral);
        this.value = val;
    }
}
export class FloatPointExprAST extends ExprAST {
    readonly value: number;
    constructor(val: number) {
        super(ZeronaryASTType.FloatPointLiteral);
        this.value = val;
    }
}
export class StringExprAST extends ExprAST {
    private _value: string;
    get value(): string {return this._value}
    constructor(val: string) {
        super(ZeronaryASTType.StringLiteral);
        this._value = val;
    }

    append(str: string) {this._value += str;}
}
export class VariableExprAST extends ExprAST {
    readonly id: string;
    constructor(id: string) {
        super(ZeronaryASTType.IntegerLiteral);
        this.id = id;
    }
}
export class CastExprAST extends ExprAST {
    constructor() {
        super(UnaryExprASTType.Cast);
    }
}

export class CompoundLiteralExprAST extends ExprAST {
    constructor() {
        super(UnaryExprASTType.CompoundLiteral);
    }
}

