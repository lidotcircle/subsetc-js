import { ASTType, BinaryExprASTType } from "../ast";
import { Parser } from "../parser";


describe('parser test', () => {
    test('basic expression 1: a = b + c;', () => {
        const parser = new Parser('hello.c');
        parser.feed('a = b + c;');
        const ast = parser.parseExprBottomUp();
        expect(ast.astType).toBe(ASTType.Expr);
        expect(ast.exprType).toBe(BinaryExprASTType.SimpleAssignment);
    });

    const gtest = (expr: string) => {
        test(`gtest -${expr}`, () => {
            const parser = new Parser('hello.c');
            parser.feed(expr);
            const ast = parser.parseExprBottomUp();

            expect(ast.stringify() + ';').toBe(expr);
        });
    }

    gtest('a = b + c;');
    gtest('a = b + c * d + 99 % 23;');
    gtest('a += (b + c) * d;');
    gtest('b + c * d;');
    gtest('(b + c) * d;');
    gtest('(b + c) * f(d, f, k, b) / 22.01;');
    gtest('f(1, 2, 3, 4, 5);');
    gtest('a + b + c;');
    gtest('a * b * c;');
    gtest('a - b - c;');
    gtest('a / b / c;');
    gtest('a / b * c + 22 / 123 + (a += c);');
    gtest('b = *a + 100;');
    gtest('b = a[2] + 1;');
    gtest('b = &a + 1;');
    gtest('b = &a[2] + 1;');
    gtest('b = a ? c : d;');
    gtest('b = b + (a ? c : d);');
    gtest('b = b * ******f;');
    gtest('++b++;');
    gtest('a ^= b;');
    gtest('a++ + b-- + f(1, 2, 3) + uv[(22 + 33 / 44)] + uu . m + uu -> n + --c + ++c + -c + +c + !c + ~c + *b + &c * 2 / 2 % 2 + v << 4 >> 5 + 5 < 6 + 7 > 9 + 5 >= 6 + 7 <= 7 + 8 != 0 + 9 == 10 & 22 ^ 11 && 20 || ***cv + (a ? b : 0) + (a = b) + (a += b) + (a -= b) + (a *= b) + (a /= b) + (a %= b) + (a <<= b) + (a >>= b) + (a &= b) + (a ^= b) + (a |= b);');
});

