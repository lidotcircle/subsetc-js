import { IdentifierToken, IntegerToken, OperatorToken, OperatorType, PunctuationToken, PunctuationType, StringToken, Tokenizor, TokenType } from '../tokenizor';


describe('Tokenizor test', () => {

    test('basic expression - "mm = id + qq * vv"', () => {
        const t = new Tokenizor('hello.c');

        t.feed('mm = id + qq * vv');
        t.next();
        expect(t.front.token_type).toBe(TokenType.ID);
        expect(t.front.file).toBe('hello.c');
        expect((t.front as IdentifierToken).id).toBe('mm');
        t.next();
        expect(t.front.token_type).toBe(TokenType.Operator);
        expect((t.front as OperatorToken).operator).toBe(OperatorType.SimpleAssignment);
        t.next();
        expect(t.front.token_type).toBe(TokenType.ID);
        expect((t.front as IdentifierToken).id).toBe('id');
        t.next();
        expect(t.front.token_type).toBe(TokenType.Operator);
        expect((t.front as OperatorToken).operator).toBe(OperatorType.Addition_UnaryPlus);
        t.next();
        expect(t.front.token_type).toBe(TokenType.ID);
        expect((t.front as IdentifierToken).id).toBe('qq');
        t.next();
        expect(t.front.token_type).toBe(TokenType.Operator);
        expect((t.front as OperatorToken).operator).toBe(OperatorType.Multiplication_AddressOf);
        t.next();
        expect(t.front.token_type).toBe(TokenType.ID);
        expect((t.front as IdentifierToken).id).toBe('vv');
        t.next();
        expect(t.front.token_type).toBe(TokenType.End);
    }, 500);

    test('string expr', () => {
        const t = new Tokenizor('hello.c');

        t.feed('"hello\\\n world good"');
        t.next();
        expect(t.front.token_type).toBe(TokenType.STRING);
        expect((t.front as StringToken).value).toBe('hello world good');

        t.next();
        t.shift();
        t.next();
        expect(t.front.token_type).toBe(TokenType.End);
    });

    test('integer test', () => {
        const t = new Tokenizor('hello.c');

        t.feed('const int v = 1000; static int m = 0b1001 * 0x11 * 011;');
        t.next();
        expect(t.front.token_type).toBe(TokenType.CONST);
        t.next(); t.next(); t.next(); t.next();
        expect(t.front.token_type).toBe(TokenType.INTEGER);
        expect((t.front as IntegerToken).value).toBe(1000);
        t.next();
        expect(t.front.token_type).toBe(TokenType.Punctuation);
        expect((t.front as PunctuationToken).punctuation).toBe(PunctuationType.Semicolon);
        t.next(); t.next(); t.next(); t.next(); t.next()
        expect(t.front.token_type).toBe(TokenType.INTEGER);
        expect((t.front as IntegerToken).value).toBe(9);
        t.next(); t.next();
        expect(t.front.token_type).toBe(TokenType.INTEGER);
        expect((t.front as IntegerToken).value).toBe(17);
        t.next(); t.next();
        expect(t.front.token_type).toBe(TokenType.INTEGER);
        expect((t.front as IntegerToken).value).toBe(9);
    });

    test('basic block', () => {
        const t = new Tokenizor('hello.c');

        t.feed('while(hello + 1000 > 2000) { hello--;}');
        t.next(); expect(t.front.token_type).toBe(TokenType.WHILE);
        t.next(); expect(t.front.token_type).toBe(TokenType.Punctuation);
        t.next(); expect(t.front.token_type).toBe(TokenType.ID);
        t.next(); expect(t.front.token_type).toBe(TokenType.Operator);
        t.next(); expect(t.front.token_type).toBe(TokenType.INTEGER);
        t.next(); expect(t.front.token_type).toBe(TokenType.Operator);
        t.next(); expect(t.front.token_type).toBe(TokenType.INTEGER);
        t.next(); expect(t.front.token_type).toBe(TokenType.Punctuation);
        t.next(); expect(t.front.token_type).toBe(TokenType.Punctuation);
        t.next(); expect(t.front.token_type).toBe(TokenType.ID);
        t.next(); expect(t.front.token_type).toBe(TokenType.Operator);
        t.next(); expect(t.front.token_type).toBe(TokenType.Punctuation);
        t.next(); expect(t.front.token_type).toBe(TokenType.Punctuation);
        t.next(); expect(t.front.token_type).toBe(TokenType.End);

        try {
            t.next();
            throw new Error('bad bad, it\'s end');
        } catch {}
    });
});

