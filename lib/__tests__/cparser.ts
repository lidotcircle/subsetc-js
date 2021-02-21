import { CParser } from "../cpraser";


describe('cparser test', () => {
    const parser = new CParser('hello.c');

    const shouldpass = (str: string) => {
        let lable = str;
        if(str.length > 13) {
            lable = str.substr(0, Math.min(str.length, 10)) + '...';
        }
        lable = 'Should Pass - ' + lable;
        test(lable, () => {
            parser.reset();
            parser.feed(str);
            parser.run();
        });
    }

    const shouldreject = (str: string) => {
        let lable = str;
        if(str.length > 13) {
            lable = str.substr(0, Math.min(str.length, 10)) + '...';
        }
        lable = 'Should Reject - ' + lable;
        test(lable, () => {
            parser.reset();
            parser.feed(str);
            try {
                parser.run();
                throw new Error('expect reject');
            } catch {}
        });
    }

    shouldreject('');
    shouldreject('const struct uu {int m, n, o;};');
    shouldreject('const enum uu {i=1,j,k,l,m};');

    shouldpass('struct hulu {} uvwx[];');
    shouldpass('static const int m;');
    shouldpass('static const int *m;');
    shouldpass('static const int *m[][];');
    shouldpass('static const int *m[][];');
    shouldpass('static const int * const * volatile m[][];');
    shouldpass('const struct {int m;} v;');
    shouldpass('const struct {int m, n, o;} v;');
    shouldpass('const struct {int m, n, o;;} v = 100;');
    shouldpass('struct uu {int m, n, o;};');
    shouldpass('enum uu {i=1,j,k,l,m};');
    shouldpass('const enum uu {i=1,j,k,l,m} m;');
    shouldpass('const enum uu vv(int m, int v, int k);');
    shouldpass('const enum uu (*vv)(int);');

    shouldpass('a + b');
    shouldpass('a++ + b-- + f(1, 2, 3) + uv[(22 + 33 / 44)] + uu . m + uu -> n + --c + ++c + -c + +c + !c + ~c + *b + &c * 2 / 2 % 2 + v << 4 >> 5 + 5 < 6 + 7 > 9 + 5 >= 6 + 7 <= 7 + 8 != 0 + 9 == 10 & 22 ^ 11 && 20 || ***cv + (a ? b : 0) + (a = b) + (a += b) + (a -= b) + (a *= b) + (a /= b) + (a %= b) + (a <<= b) + (a >>= b) + (a &= b) + (a ^= b) + (a |= b)');
});

