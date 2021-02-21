import { CParser } from "../cpraser";


describe('cparser test', () => {
    /*
    test('basic expression 1: a = b + c;', () => {
        const parser = new CParser('hello.c');
        parser.feed('a++ + b-- + f(1, 2, 3) + uv[(22 + 33 / 44)] + uu . m + uu -> n + --c + ++c + -c + +c + !c + ~c + *b + &c * 2 / 2 % 2 + v << 4 >> 5 + 5 < 6 + 7 > 9 + 5 >= 6 + 7 <= 7 + 8 != 0 + 9 == 10 & 22 ^ 11 && 20 || ***cv + (a ? b : 0) + (a = b) + (a += b) + (a -= b) + (a *= b) + (a /= b) + (a %= b) + (a <<= b) + (a >>= b) + (a &= b) + (a ^= b) + (a |= b)');
        parser.run();
    });
    */

    test('uvn', () => {
        const parser = new CParser('hello.c');
        console.log('asdfasdf');
        parser.feed('struct ui {} mimi[]');
        parser.run();
    }, 2000);

});

