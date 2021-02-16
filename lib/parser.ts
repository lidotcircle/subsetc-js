import { ArrayIndexExprAST, BinaryExprASTType, ExprAST, ExprASTType, FloatPointExprAST, FunctionCallASTType, FunctionCallExprAST, IntegerExprAST, OperatorPriorityGreaterEqual, OperatorTokenToBinaryExprASTType, OperatorTokenToUnaryPrefixExprASTType, OperatorTokenToUnarySuffixExprASTType, StringExprAST, TenaryExprASTType, UnaryExprASTType, VariableExprAST, ZeronaryASTType } from "./ast";
import { FloatToken, IdentifierToken, IntegerToken, OperatorToken, OperatorType, PunctuationToken, PunctuationType, StringToken, Token, Tokenizor, TokenType } from "./tokenizor";
import assert from 'assert';


export class Parser {
    private tokenizor: Tokenizor;

    constructor(filename: string) {
        this.tokenizor = new Tokenizor(filename);
    }

    feed(text: string) {
        this.tokenizor.feed(text);
    }

    /**
     * Expr         := ( Expr ) | FCall | AExpr | iD | String | iNTEGER | DefExpr | RefExpr | IdxExpr | DotExpr | PointExpr | CondExpr
     * String       := sTRING | sTRING String                     DONE
     * FCall        := Expr lBRACE [Expr [cOMMA Expr] *] ? rBRACE DOEN
     * AExpr        := AExpr_B | AExpr_U_PRE | AExpr_U_POST       DONE
     * AExpr_B      := Expr { +, -, *, /, &, |, ^, <<, >>, &&, ||, <, <=, >, >=, ==, !=, =, +=, -=, %=, /=, &=, ^=, |=, <<=, >>= } Expr
     * AExpr_U_PRE  := { ++, --, !, ~ } Expr DONE
     * AExpr_U_POST := Expr { ++, -- }       DONE
     * DefExpr      := * Expr                DONE
     * RefExpr      := & Expr                DONE
     * IdxExpr      := Expr [ Expr ]         DONE
     * DotExpr      := Expr . iD             DONE
     * PointExpr    := Expr -> iD            DONE
     * CondExpr     := Expr ? Expr : Expr    DONE
     * CastExpr     := ( Type ) Expr    // TODO
     * CompoundExpr := ( Type ) { .Id } // TODO
     */
    parseExprBottomUp(): ExprAST {
        const thestack: (ExprAST | Token) [] = [];
        this.parseExprBottomUpRec(thestack);
        return thestack[0] as ExprAST;

        throw new Error('expect an expression');
    }

    private parseExprBottomUpRec(stack: (ExprAST | Token) []) //{
    {
        // FIXME
        if(this.tokenizor.front == null) {
            this.tokenizor.next();
        }

        for(let token = this.tokenizor.front;; 
            this.tokenizor.next(), token=this.tokenizor.front) 
        {
            stack.push(token);
            switch(token.token_type) {
                case TokenType.ID: {
                    this.tokenizor.next();
                    if(this.tokenizor.front.token_type == TokenType.Punctuation &&
                       (this.tokenizor.front as PunctuationToken).punctuation == PunctuationType.lRBracket) {
                        stack.push(this.tokenizor.front);
                    } else {
                        this.tokenizor.shift();
                        this.assertMerge(this.tryMerge_IntegerFloatStringVariable(stack));
                        this.doSomethingInLastIsExpr(stack);
                    }
                } break;
                case TokenType.INTEGER:
                case TokenType.FLOAT:
                    this.assertMerge(this.tryMerge_IntegerFloatStringVariable(stack));
                    this.doSomethingInLastIsExpr(stack);
                    break;
                case TokenType.STRING: {
                    while(true) {
                        this.tokenizor.next();
                        if(this.tokenizor.front.token_type == TokenType.STRING) {
                            stack.push(this.tokenizor.front);
                        } else {
                            this.tokenizor.shift();
                        }
                    }
                    this.assertMerge(this.tryMerge_IntegerFloatStringVariable(stack));
                    this.doSomethingInLastIsExpr(stack);
                } break;
                case TokenType.Punctuation: {
                    const ptoken = token as PunctuationToken;
                    switch(ptoken.punctuation) {
                        case PunctuationType.lCBracket:
                        case PunctuationType.lRBracket:
                        case PunctuationType.lSBracket:
                            // TODO
                            break;
                        case PunctuationType.rCBracket: {
                            throw new Error('not implemented');
                        } break;
                        case PunctuationType.rRBracket: {
                            if(!this.tryMergeStack_Funcall(stack)) {
                                this.assertMerge(this.tryMergeStack_RoundBacket(stack));
                            }
                            this.doSomethingInLastIsExpr(stack);
                        } break;
                        case PunctuationType.rSBracket: {
                            this.assertMerge(this.tryMergeStack_ArrayIndexOperator(stack));
                            this.doSomethingInLastIsExpr(stack);
                        } break;
                        case PunctuationType.Semicolon: {
                            this.tokenizor.shift();
                            stack.pop();
                            if(stack.length != 1 || !(stack[0] instanceof ExprAST)) {
                                console.error(stack);
                                throw new Error('bad expression');
                            }
                            return;
                        } break;
                    }
                } break;
                case TokenType.Operator: {
                    /** suffix operator ++ --, here suffix operator has hightest priority and it's left associative */
                    if(this.tryMergeStack_SuffixUnaryOperator(stack)) {
                        this.doSomethingInLastIsExpr(stack);
                    }
                } break;
                case TokenType.End: {
                    throw new Error(`unexpected end at ${token.file}:${token.line}:${token.column}`);
                } break;
                default: throw new Error(`unexpected token at ${token.file}:${token.line}:${token.column}`);
            }
        }
    } //}

    private doSomethingInLastIsExpr(stack: (ExprAST | Token)[]) //{
    {
        const op = this.stackIs_InBinaryOperator(stack) || this.stackIs_PrefixUnaryOpeartor(stack) ||
                   (this.stackIs_TenaryCondition(stack) && TenaryExprASTType.TenaryCondition);
        if(op) {
            this.tokenizor.next();
            const token = this.tokenizor.front;
            this.tokenizor.shift();
            let v0: ExprASTType;
            if(token.token_type == TokenType.Punctuation) {
                const ptoken = token as PunctuationToken;
                if(ptoken.punctuation == PunctuationType.lSBracket) {
                    v0 = BinaryExprASTType.ArrayIndex;
                } else if (ptoken.punctuation == PunctuationType.Question) {
                    v0 = TenaryExprASTType.TenaryCondition;
                }
            }

            if(token.token_type == TokenType.Operator || v0) {
                const v1 = token.token_type == TokenType.Operator ? 
                               OperatorTokenToUnarySuffixExprASTType(token as OperatorToken) : null;
                const v2 = token.token_type == TokenType.Operator ?
                               OperatorTokenToBinaryExprASTType(token as OperatorToken) : null;
                if((!v0 || OperatorPriorityGreaterEqual(op, v0)) &&
                   (!v1 || OperatorPriorityGreaterEqual(op, v1)) && 
                   (!v2 || OperatorPriorityGreaterEqual(op, v2)))
                {
                    this.assertMerge(this.tryMergeStack_InBinaryOperator(stack) ||
                                     this.tryMergeStack_PrefixUnaryOperator(stack) ||
                                     this.tryMergeStack_TenaryCondition(stack));
                    this.doSomethingInLastIsExpr(stack);
                }
            } else {
                this.mergeStackUtilNothingCanDo(stack);
            }
        }
    } //}

    private mergeStackUtilNothingCanDo(stack: (ExprAST | Token) []) //{
    {
        let run = true;
        while(run) {
            run = this.tryMergeStack_Funcall(stack) ||
                  this.tryMergeStack_RoundBacket(stack) ||
                  this.tryMergeStack_InBinaryOperator(stack) ||
                  this.tryMergeStack_PrefixUnaryOperator(stack) ||
                  this.tryMergeStack_SuffixUnaryOperator(stack) ||
                  this.tryMergeStack_ArrayIndexOperator(stack) ||
                  this.tryMergeStack_TenaryCondition(stack);
        }
    } //}

    private tryMergeStack_Funcall(stack: (ExprAST | Token) []): boolean //{
    {
        const n = this.stackIs_FunctionCall(stack);
        if(n != null) {
            const node = new FunctionCallExprAST((stack[n] as IdentifierToken).id);
            for(let i=n+2;i<stack.length;i++) {
                if(stack[i] instanceof ExprAST) {
                    node.push_child(stack[i] as ExprAST);
                }
            }
            stack.splice(n);
            stack.push(node);
            return true;
        } else {
            return false;
        }
    } //}
    private tryMergeStack_InBinaryOperator(stack: (ExprAST | Token) []): boolean //{
    {
        const slen = stack.length;
        const betype = this.stackIs_InBinaryOperator(stack);
        if(betype) {
            const node = new ExprAST(betype);
            node.unshift_child(stack.pop() as ExprAST);
            stack.pop();
            node.unshift_child(stack.pop() as ExprAST);
            stack.push(node);
            return true;
        } else {
            return false;
        }
    } //}
    private tryMergeStack_PrefixUnaryOperator(stack: (ExprAST | Token) []): boolean //{
    {
        const slen = stack.length;
        const utype = this.stackIs_PrefixUnaryOpeartor(stack);
        if(utype) {
            const node = new ExprAST(utype);
            node.unshift_child(stack.pop() as ExprAST);
            stack.pop();
            stack.push(node);
            return true;
        } else {
            return false;
        }
    } //}
    private tryMergeStack_SuffixUnaryOperator(stack: (ExprAST | Token) []): boolean //{
    {
        const slen = stack.length;
        const utype = this.stackIs_SuffixUnaryOperator(stack);
        if(utype) {
            stack.pop();
            const node = new ExprAST(utype);
            node.unshift_child(stack.pop() as ExprAST);
            stack.push(node);
            return true;
        } else {
            return false;
        }
    } //}
    private tryMergeStack_ArrayIndexOperator(stack: (ExprAST | Token) []): boolean //{
    {
        const slen = stack.length;
        if(this.stackIs_ArrayIndexOprator(stack)) {
            const node = new ArrayIndexExprAST();
            stack.pop();
            node.unshift_child(stack.pop() as ExprAST);
            stack.pop();
            node.unshift_child(stack.pop() as ExprAST);
            stack.push(node);
            return true;
        } else {
            return false;
        }
    } //}
    private tryMergeStack_RoundBacket(stack: (ExprAST | Token)[]): boolean //{
    {
        const slen = stack.length;
        if(this.stackIs_RoundBacket(stack)) {
            stack.pop();
            const node = stack.pop();
            stack.pop();
            stack.push(node);
            return true;
        } else {
            return false;
        }
    } //}
    private tryMerge_IntegerFloatStringVariable(stack: (ExprAST | Token)[]): boolean //{
    {
        const slen = stack.length;
        if(slen >= 1 && stack[slen - 1] instanceof Token) {
            switch((stack[slen - 1] as Token).token_type) {
                case TokenType.INTEGER: {
                    const t = stack.pop() as IntegerToken;
                    const node = new IntegerExprAST(t.value);
                    stack.push(node);
                } break;
                case TokenType.FLOAT: {
                    const t = stack.pop() as FloatToken;
                    const node = new FloatPointExprAST(t.value);
                    stack.push(node);
                } break;
                case TokenType.STRING: {
                    let i = slen - 2;
                    for(;i>0 && !(stack[i] instanceof StringToken);i--) {}
                    i++;

                    const t = stack[i] as StringToken;
                    const node = new StringExprAST(t.value);

                    for(let j=i+1;j<stack.length;j++) {
                        const t = stack[j] as StringToken;
                        node.append(t.value);
                    }
                    stack.splice(i);
                    stack.push(node);
                } break;
                case TokenType.ID: {
                    const t = stack.pop() as IdentifierToken;
                    const node = new VariableExprAST(t.id);
                    stack.push(node);
                } break;
                default: return false;
            }
            return true;
        } else {
            return false;
        }
    } //}
    private tryMergeStack_TenaryCondition(stack: (ExprAST | Token)[]): boolean //{
    {
        const slen = stack.length;
        if(this.stackIs_TenaryCondition(stack)) {
            const node = new ExprAST(TenaryExprASTType.TenaryCondition)
            node.unshift_child(stack.pop() as ExprAST);
            stack.pop();
            node.unshift_child(stack.pop() as ExprAST);
            stack.pop();
            node.unshift_child(stack.pop() as ExprAST);
            stack.push(node);
            return true;
        } else {
            return false;
        }
    } //}

    private assertMerge(result: boolean) //{
    {
        if(!result) throw new Error('unexpected tokens');
    } //}

    private stackIs_FunctionCall       (stack: (ExprAST | Token)[]): number | null //{
    {
        if(stack.length < 3) return null;
        const last = stack[stack.length - 1];
        if(!(last instanceof Token)) return null;

        if(last.token_type != TokenType.Punctuation && 
           (last as PunctuationToken).punctuation != PunctuationType.rRBracket) return null;

        let n = stack.length - 2;
        let require_comma_lrbacket: boolean = false;
        for(;n>0;n--) {
            if(require_comma_lrbacket) {
                if(stack[n] instanceof PunctuationToken) {
                    const pu = (stack[n] as PunctuationToken).punctuation;
                    if(pu == PunctuationType.Comman) continue;
                    if(pu == PunctuationType.lRBracket) {
                        n--;
                        break;
                    }
                }
            } else {
                if(stack[n] instanceof ExprAST) {
                    require_comma_lrbacket = true;
                } else if(stack[n] instanceof PunctuationToken) {
                    if((stack[n] as PunctuationToken).punctuation != PunctuationType.lRBracket) {
                        break;
                    } else {
                        n--;
                        break;
                    }
                }
            }
        }
        if(stack[n] instanceof IdentifierToken) {
            return n;
        } else {
            return null;
        }
    } //}
    private stackIs_InBinaryOperator   (stack: (ExprAST | Token)[]): BinaryExprASTType | null //{
    {
        const slen = stack.length;
        if(!(slen >= 3 &&
            stack[slen - 1] instanceof ExprAST && 
            stack[slen - 2] instanceof OperatorToken && 
            stack[slen - 3] instanceof ExprAST))
        {
               return null;
        }

        return OperatorTokenToBinaryExprASTType(stack[slen - 2] as OperatorToken);
    } //}
    private stackIs_PrefixUnaryOpeartor(stack: (ExprAST | Token)[]): UnaryExprASTType | null //{
    {
        const slen = stack.length;
        if (!(slen >= 2 &&
            stack[slen - 1] instanceof ExprAST && 
            stack[slen - 2] instanceof OperatorToken))
        {
            return null;
        }

        return OperatorTokenToUnaryPrefixExprASTType(stack[slen - 2] as OperatorToken);
    } //}
    private stackIs_SuffixUnaryOperator(stack: (ExprAST | Token)[]): UnaryExprASTType | null //{
    {
        const slen = stack.length;
        if (!(slen >= 2 &&
            stack[slen - 2] instanceof ExprAST && 
            stack[slen - 1] instanceof OperatorToken))
        {
            return null;
        }

        return OperatorTokenToUnarySuffixExprASTType(stack[slen - 1] as OperatorToken);
    } //}
    private stackIs_ArrayIndexOprator  (stack: (ExprAST | Token)[]): boolean //{
    {
        const slen = stack.length;
        return (
            slen >= 4 &&
            stack[slen - 1] instanceof PunctuationToken && 
            (stack[slen - 1] as PunctuationToken).punctuation == PunctuationType.rSBracket &&
            stack[slen - 2] instanceof ExprAST && 
            stack[slen - 3] instanceof PunctuationToken && 
            (stack[slen - 3] as PunctuationToken).punctuation == PunctuationType.lSBracket &&
            stack[slen - 4] instanceof ExprAST);
    } //}
    private stackIs_RoundBacket        (stack: (ExprAST | Token)[]): boolean //{
    {
        const slen = stack.length;
        return (
            slen >= 3 &&
            stack[slen - 1] instanceof PunctuationToken && 
            (stack[slen - 1] as PunctuationToken).punctuation == PunctuationType.rRBracket &&
            stack[slen - 2] instanceof ExprAST && 
            stack[slen - 3] instanceof PunctuationToken && 
            (stack[slen - 3] as PunctuationToken).punctuation == PunctuationType.lRBracket);
    } //}
    private stackIs_TenaryCondition    (stack: (ExprAST | Token)[]): boolean //{
    {
        const slen = stack.length;
        return (
            slen >= 5 &&
            stack[slen - 1] instanceof ExprAST && 
            stack[slen - 2] instanceof PunctuationToken && 
            (stack[slen - 2] as PunctuationToken).punctuation == PunctuationType.Colon &&
            stack[slen - 3] instanceof ExprAST && 
            stack[slen - 4] instanceof PunctuationToken && 
            (stack[slen - 4] as PunctuationToken).punctuation == PunctuationType.Question &&
            stack[slen - 5] instanceof ExprAST);
    } //}

    parseDeclaration(): ExprAST {
        return null;
    }
}

