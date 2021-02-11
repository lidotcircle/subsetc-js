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
    protected _parent: BasicAST;

    constructor(t: ASTType) {
        this.astType = t;
    }

    stringify(): string {
        throw new Error('not implemented');
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


enum OperatorAssociative {Left, Right}
const unary_operator_priority_associative: Map<UnaryExprASTType, [number, OperatorAssociative, string]> = new Map([
    [UnaryExprASTType.SuffixInc,  [1, OperatorAssociative.Left, '++']],
    [UnaryExprASTType.SufficDec,  [1, OperatorAssociative.Left, '--']],

    [UnaryExprASTType.PrefixInc,  [2, OperatorAssociative.Right, '++']],
    [UnaryExprASTType.PrefixDec,  [2, OperatorAssociative.Right, '--']],
    [UnaryExprASTType.UnaryPlus,  [2, OperatorAssociative.Right, '+']],
    [UnaryExprASTType.UnaryMinus, [2, OperatorAssociative.Right, '-']],
    [UnaryExprASTType.LogicalNot, [2, OperatorAssociative.Right, '!']],
    [UnaryExprASTType.BitwiseNot, [2, OperatorAssociative.Right, '~']],
    [UnaryExprASTType.Cast,       [2, OperatorAssociative.Right, '()']],
    [UnaryExprASTType.AddressOf,  [2, OperatorAssociative.Right, '*']],
    [UnaryExprASTType.Reference,  [2, OperatorAssociative.Right, '&']],
]);
const binary_operator_priority_associative: Map<BinaryExprASTType, [number, OperatorAssociative, string]> = new Map([
    [BinaryExprASTType.ArrayIndex,                  [1, OperatorAssociative.Left, '[]']],
    [BinaryExprASTType.MemberAccess,                [1, OperatorAssociative.Left, '.']],
    [BinaryExprASTType.MemberAccessByPointer,       [1, OperatorAssociative.Left, '->']],

    [BinaryExprASTType.Multiplication,              [3, OperatorAssociative.Left, '*']],
    [BinaryExprASTType.Division,                    [3, OperatorAssociative.Left, '/']],
    [BinaryExprASTType.Remainder,                   [3, OperatorAssociative.Left, '%']],

    [BinaryExprASTType.Addition,                    [4, OperatorAssociative.Left, '+']],
    [BinaryExprASTType.Substration,                 [4, OperatorAssociative.Left, '-']],

    [BinaryExprASTType.BitwiseLeftShift,            [5, OperatorAssociative.Left, '<<']],
    [BinaryExprASTType.BitwiseRightShift,           [5, OperatorAssociative.Left, '>>']],

    [BinaryExprASTType.LessThan,                    [6, OperatorAssociative.Left, '<']],
    [BinaryExprASTType.LessEqual,                   [6, OperatorAssociative.Left, '<=']],
    [BinaryExprASTType.GreaterThan,                 [6, OperatorAssociative.Left, '>']],
    [BinaryExprASTType.GreaterEqual,                [6, OperatorAssociative.Left, '>=']],
    [BinaryExprASTType.Equal,                       [7, OperatorAssociative.Left, '==']],
    [BinaryExprASTType.NotEqual,                    [7, OperatorAssociative.Left, '!=']],

    [BinaryExprASTType.BitwiseAnd,                  [8, OperatorAssociative.Left, '&']],
    [BinaryExprASTType.BitwiseXor,                  [9, OperatorAssociative.Left, '^']],
    [BinaryExprASTType.BitwiseOr,                   [10, OperatorAssociative.Left, '|']],

    [BinaryExprASTType.LogicalAnd,                  [11, OperatorAssociative.Left, '&&']],
    [BinaryExprASTType.LogicalOr,                   [12, OperatorAssociative.Left, '||']],

    [BinaryExprASTType.SimpleAssignment,            [14, OperatorAssociative.Right, '=']],
    [BinaryExprASTType.AssignmentAddition,          [14, OperatorAssociative.Right, '+=']],
    [BinaryExprASTType.AssignmentSubstraction,      [14, OperatorAssociative.Right, '-=']],
    [BinaryExprASTType.AssignmentProduct,           [14, OperatorAssociative.Right, '*=']],
    [BinaryExprASTType.AssignmentQuotient,          [14, OperatorAssociative.Right, '/=']],
    [BinaryExprASTType.AssignmentRemainder,         [14, OperatorAssociative.Right, '%=']],
    [BinaryExprASTType.AssignmentBitwiseLeftShift,  [14, OperatorAssociative.Right, '<<=']],
    [BinaryExprASTType.AssignmentBitwiseRightShift, [14, OperatorAssociative.Right, '>>=']],
    [BinaryExprASTType.AssignmentBitwiseAnd,        [14, OperatorAssociative.Right, '&=']],
    [BinaryExprASTType.AssignmentBitwiseXor,        [14, OperatorAssociative.Right, '^=']],
    [BinaryExprASTType.AssignmentBitwiseOr,         [14, OperatorAssociative.Right, '|=']],
]);
const tenary_operator_priority_associative: Map<TenaryExprASTType, [number, OperatorAssociative, string]> = new Map([
    [TenaryExprASTType.TenaryCondition, [13, OperatorAssociative.Right, '?:']],
]);
const funcall_operator_priority_associative: Map<FunctionCallASTType, [number, OperatorAssociative, string]> = new Map([
    [FunctionCallASTType.FunctionCall, [1, OperatorAssociative.Left, '()']],
]);

function opinfo(op: ExprASTType) //{
{
    return unary_operator_priority_associative.get(op as UnaryExprASTType) ||
           binary_operator_priority_associative.get(op as BinaryExprASTType) ||
           tenary_operator_priority_associative.get(op as TenaryExprASTType) ||
           funcall_operator_priority_associative.get(op as FunctionCallASTType);
} //}

export function OperatorPriorityGreaterEqual(left: ExprASTType, right: ExprASTType): boolean //{
{
    let leftp  = opinfo(left);
    let rightp = opinfo(right);

    assert.notEqual(leftp,  null);
    assert.notEqual(rightp, null);

    if(leftp[0] < rightp[0]) return true;
    if(leftp[0] == rightp[0]) {
        return leftp[1] == OperatorAssociative.Left;
    }

    return false;
} //}

function OperatorStr(op: ExprASTType): string //{
{
    let uuu = unary_operator_priority_associative.get(op as UnaryExprASTType) ||
              binary_operator_priority_associative.get(op as BinaryExprASTType) ||
              tenary_operator_priority_associative.get(op as TenaryExprASTType) ||
              funcall_operator_priority_associative.get(op as FunctionCallASTType);

    return uuu[2] || '';
} //}

export class ExprAST extends BasicAST {
    readonly exprType: ExprASTType;
    protected children: ExprAST[];
    protected parent_index: number;

    constructor(t: ExprASTType) {
        super(ASTType.Expr);
        this.exprType = t;
        this.children = [];
    }

    push_child   (expr: ExprAST) {
        this.children.push(expr);
        expr._parent = this;
        expr.parent_index = this.children.length - 1;
    }
    unshift_child(expr: ExprAST) {
        this.children.unshift(expr);
        expr._parent = this;
        for(let i=0;i<this.children.length;i++) this.children[i].parent_index = i;
    }

    stringify() //{
    {
        let ans;

        if(this.isUnary()) {
            assert.equal(this.children.length == 1, true);
            if(this.children[0].stringify == null) {
                console.log(this.children[0]);
            }
            assert.notEqual(this.children[0].stringify, null);

            ans = OperatorStr(this.exprType)
            if(this.isSuffixUnary()) {
                ans = this.children[0].stringify() + ans;
            } else {
                ans = ans + this.children[0].stringify();
            }
        } else if (this.isBinary()) {
            ans = `${this.children[0].stringify()} ${OperatorStr(this.exprType)} ${this.children[1].stringify()}`;
        } else if (this.isTenary()) {
            ans = `${this.children[0].stringify()} ? ${this.children[1].stringify()} : ${this.children[2].stringify()}`;
        } else {
            return super.stringify();
        }

        if(this._parent) {
            const parent = this._parent as ExprAST;
            let left: boolean;

            if(parent.isUnary()) {
                left = parent.isSuffixUnary();
            } else if (parent.isBinary()) {
                left = this.parent_index == 0;
            }

            const pinfo = opinfo(parent.exprType);
            const tinfo = opinfo(this.exprType);

            if(pinfo[0] < tinfo[0]) {
                ans = '(' + ans + ')';
            } else if (pinfo[0] == tinfo[0] && left !== (tinfo[1] == OperatorAssociative.Left)) {
                ans = '(' + ans + ')';
            }
        }

        return ans;
    } //}

    isUnary(): boolean {
        return this.exprType >= 100 && this.exprType <= 199;
    }

    isSuffixUnary(): boolean {
        return this.exprType == UnaryExprASTType.SufficDec || 
               this.exprType == UnaryExprASTType.SuffixInc;
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

    stringify() {
        return `${this.children[0].stringify()}[${this.children[1].stringify()}]`;
    }
}

export class FunctionCallExprAST extends ExprAST {
    readonly fname: string;

    constructor(fname: string) {
        super(FunctionCallASTType.FunctionCall);
        this.fname = fname;
    }

    stringify() {
        let ans = this.fname + '(';

        for(let i=0;i<this.children.length;i++) {
            ans += this.children[i].stringify();
            if(i<this.children.length-1) {
                ans += ', ';
            }
        }

        ans += ')';
        return ans;
    }
}


export class IntegerExprAST extends ExprAST {
    readonly value: number;
    constructor(val: number) {
        super(ZeronaryASTType.IntegerLiteral);
        this.value = val;
    }

    stringify() {return this.value.toString();}
}
export class FloatPointExprAST extends ExprAST {
    readonly value: number;
    constructor(val: number) {
        super(ZeronaryASTType.FloatPointLiteral);
        this.value = val;
    }

    stringify() {return this.value.toString();}
}
export class StringExprAST extends ExprAST {
    private _value: string;
    get value(): string {return this._value}
    constructor(val: string) {
        super(ZeronaryASTType.StringLiteral);
        this._value = val;
    }

    stringify() {return JSON.stringify(this._value);}

    append(str: string) {this._value += str;}
}
export class VariableExprAST extends ExprAST {
    readonly id: string;
    constructor(id: string) {
        super(ZeronaryASTType.IntegerLiteral);
        this.id = id;
    }

    stringify() {return this.id;}
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

