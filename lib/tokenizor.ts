import assert from 'assert';

export enum TokenType {
    ID          = 'ID',
    Punctuation = 'Punc',
    Operator    = 'Operator',
    End         = 'End',

    STRING  = 'STRING',
    INTEGER = 'INTEGER',
    FLOAT   = 'FLOAT',

    IF       = 'IF',
    ELSE     = 'ELSE',
    DO       = 'DO',
    WHILE    = 'WHILE',
    FOR      = 'FOR',
    BREAK    = 'BREAK',
    CONTINUE = 'CONTINUE',
    SWITCH   = 'SWITCH',
    CASE     = 'CASE',
    DEFAULT  = 'DEFUALT',
    GOTO     = 'GOTO',
    RETURN   = 'RETURN',

    STRUCT = 'STRUCT',
    ENUM   = 'ENUM',
    UNION  = 'UNION',

    VOID     = 'VOID',
    CHAR     = 'CHAR',
    SHORT    = 'SHORT',
    INT      = 'INT',
    LONG     = 'LONG',
    FLOATV   = 'FLOAT',
    DOUBLE   = 'DOUBLE',
    SIGNED   = 'SIGNED',
    UNSIGNED = 'UNSIGNED',

    TYPEDEF  = 'TYPEDEF',
    EXTERN   = 'EXTERN',
    STATIC   = 'STATIC',
    AUTO     = 'AUTO',
    REGISTER = 'REGISTER',

    CONST    = 'CONST',
    RESTRICT = 'RESTRICT',
    VOLATILE = 'VOLATILE',

    INLINE = 'INLINE',
    DOTS   = 'DOTS',
}

const reserved_keywords = {
    'if':       TokenType.IF,
    'else':     TokenType.ELSE,
    'do':       TokenType.DO,
    'while':    TokenType.WHILE,
    'for':      TokenType.FOR,
    'break':    TokenType.BREAK,
    'continue': TokenType.CONTINUE,
    'switch':   TokenType.SWITCH,
    'case':     TokenType.CASE,
    'default':  TokenType.DEFAULT,
    'goto':     TokenType.GOTO,
    'return':   TokenType.RETURN,

    'struct': TokenType.STRUCT,
    'enum':   TokenType.ENUM,
    'union':  TokenType.UNION,

    'typedef':  TokenType.TYPEDEF,
    'extern':   TokenType.EXTERN,
    'static':   TokenType.STATIC,
    'auto':     TokenType.AUTO,
    'register': TokenType.REGISTER,

    'void':     TokenType.VOID,
    'char':     TokenType.CHAR,
    'short':    TokenType.SHORT,
    'int':      TokenType.INT,
    'long':     TokenType.LONG,
    'signed':   TokenType.SIGNED,
    'unsigned': TokenType.UNSIGNED,
    'float':    TokenType.FLOATV,
    'double':   TokenType.DOUBLE,
    
    'const':    TokenType.CONST,
    'restrict': TokenType.RESTRICT,
    'volatile': TokenType.VOLATILE,

    'inline': TokenType.INLINE
};

export class Token {
    readonly token_type: TokenType;
    readonly file: string;
    readonly line: number;
    readonly column: number;

    get end(): boolean {return this.token_type == TokenType.End;}

    constructor(ttype: TokenType, line: number, column: number, file: string) {
        this.token_type = ttype;
        this.line = line;
        this.column = column;
        this.file = file;
    }
}

export enum OperatorType {
    Increment = '++', Decrement = '--', 

    MemberAccess = '.', MemberAccessByPointer = '->',
    LogicalNot = '!', BitwiseNot = '~',

    Multiplication_AddressOf = '*', Division = '/', Remainder = '%',
    Addition_UnaryPlus = '+', Substraction_UnaryMinus = '-', 

    BitwiseLeftShift = '<<', BitwiseRightShift = '>>',

    LessThan = '<', LessEqual = '<=',
    GreaterThan = '>', GreaterEqual = '>=',
    Equal = '==', NotEqual = '!=',

    BitwiseAnd_Reference = '&', BitwiseXor = '^', BitwiseOr = '|',
    LogicalAnd = '&&', LogicalOr = '||',

    SimpleAssignment = '=',
    AssignmentAddition = '+=', AssignmentSubstraction = '-=',
    AssignmentProduct = '*=', AssignmentQuotient = '/=', AssignmentRemainder = '%=',
    AssignmentBitwiseLeftShift = '<<=',
    AssignmentBitwiseRightShift = '>>=',
    AssignmentBitwiseAnd = '&=',
    AssignmentBitwiseXor = '^=',
    AssignmentBitwiseOr  = '|=',
}

export class OperatorToken extends Token {
    readonly operator: OperatorType;

    constructor(operator: OperatorType, line: number, column: number, file: string) {
        super(TokenType.Operator, line, column, file);
        this.operator = operator;
    }
}
const operator_mapping = {
    '++': OperatorType.Increment,
    '--': OperatorType.Decrement,
    '.':   OperatorType.MemberAccess,
    '->':  OperatorType.MemberAccessByPointer,
    '+':   OperatorType.Addition_UnaryPlus,
    '-':   OperatorType.Substraction_UnaryMinus,
    '!':   OperatorType.LogicalNot,
    '~':   OperatorType.BitwiseNot,
    '*':   OperatorType.Multiplication_AddressOf,
    '&':   OperatorType.BitwiseAnd_Reference,
    '/':   OperatorType.Division,
    '%':   OperatorType.Remainder,
    '<<':  OperatorType.BitwiseLeftShift,
    '>>':  OperatorType.BitwiseRightShift,
    '<':   OperatorType.LessThan,
    '<=':  OperatorType.LessEqual,
    '>':   OperatorType.GreaterThan,
    '>=':  OperatorType.GreaterEqual,
    '==':  OperatorType.Equal,
    '!=':  OperatorType.NotEqual,
    '^':   OperatorType.BitwiseXor,
    '|':   OperatorType.BitwiseOr,
    '&&':  OperatorType.LogicalAnd,
    '||':  OperatorType.LogicalOr,

    '=':   OperatorType.SimpleAssignment,
    '+=':  OperatorType.AssignmentAddition,
    '-=':  OperatorType.AssignmentSubstraction,
    '*=':  OperatorType.AssignmentProduct,
    '%=':  OperatorType.AssignmentRemainder,
    '/=':  OperatorType.AssignmentQuotient,
    '<<=': OperatorType.AssignmentBitwiseLeftShift,
    '>>=': OperatorType.AssignmentBitwiseRightShift,
    '&=':  OperatorType.AssignmentBitwiseAnd,
    '|=':  OperatorType.AssignmentBitwiseOr,
    '^=':  OperatorType.AssignmentBitwiseXor,
};

export class IdentifierToken extends Token {
    readonly id: string;
    constructor(id: string, line: number, column: number, file: string) {
        super(TokenType.ID, line, column, file);
        this.id = id;
    }
}

export enum PunctuationType {
    lRBracket, rRBracket,
    lSBracket, rSBracket,
    lCBracket, rCBracket,
    Comman,
    Semicolon,
    Question,
    Colon
}
const punctuation_mapping = {
    '(': PunctuationType.lRBracket,
    ')': PunctuationType.rRBracket,
    '[': PunctuationType.lSBracket,
    ']': PunctuationType.rSBracket,
    '{': PunctuationType.lCBracket,
    '}': PunctuationType.rCBracket,
    ',': PunctuationType.Comman,
    ';': PunctuationType.Semicolon,
    '?': PunctuationType.Question,
    ':': PunctuationType.Colon,
}
export class PunctuationToken extends Token {
    readonly punctuation: PunctuationType;
    constructor(punc: PunctuationType, line: number, column: number, file: string) {
        super(TokenType.Punctuation, line, column, file);
        this.punctuation = punc;
    }
}

export class StringToken extends Token {
    readonly value: string;
    constructor(str: string, line: number, column: number, file: string) {
        super(TokenType.STRING, line, column, file);
        this.value = str;
    }
}

export class IntegerToken extends Token {
    readonly value: number;
    constructor(val: number, line: number, column: number, file: string) {
        super(TokenType.INTEGER, line, column, file);
        this.value = val;
    }
}

export class FloatToken extends Token {
    readonly value: number;
    constructor(val: number, line: number, column: number, file: string) {
        super(TokenType.FLOAT, line, column, file);
        this.value = val;
    }
}

export class Tokenizor {
    private file: string;
    private text: string;
    private line: number;
    private column: number;
    private cursor: number;
    private savedTokens: Token[];

    constructor(filename: string) {
        this.file = filename;
        this.line = 1;
        this.column = 1;
        this.cursor = 0;
        this.savedTokens = [];
    }

    public copy(): Tokenizor {
        const ans = new Tokenizor(this.file);
        for(const prop in this) {
            ans[prop as string] = this[prop];
        }
        return ans;
    }

    feed(text: string): void {
        this.text = this.text || '';
        this.text += text;
    }

    private minRedundant: number = 5;
    private token_ptr: number = -1;
    next(): void {
        if(this.prev() && this.prev().token_type == TokenType.End) {
            throw new Error('End of Token Stream');
        }

        if(this.token_ptr < this.savedTokens.length - 1) {
            if(this.savedTokens.length > this.minRedundant) {
                this.savedTokens.shift();
            } else {
                this.token_ptr++;
            }
            return;
        }

        this.gotoken();
        assert.equal(this.token_ptr < this.savedTokens.length - 1, true);
        this.next();
    }
    shift(): void {
        if(this.token_ptr <= 0) {
            throw new Error('no preceded token exists');
        }
        this.token_ptr--;
    }

    private prev(n: number = 1): Token | null{
        if(this.savedTokens.length < n) {
            return null;
        }

        return this.savedTokens[this.savedTokens.length + 1 - n];
    }

    private push_back(token: Token): void {
        this.savedTokens.push(token);
    }
    get front(): Token {
        return this.savedTokens[this.token_ptr];
    }

    static readonly idReg = /^[A-Za-z][A-Za-z0-9_]*/;
    static readonly cleanspaces = /^\s*/;
    static readonly operators_l1 = 
        /^(\.|\+|-|!|~|\*|&|\/|%|<|>|\^|\||=)/;
    static readonly operators_l2 = 
        /^(\+\+|--|->|<<|>>|<=|>=|==|!=|&&|\|\||\+=|-=|\*=|\/=|%=|&=|\^=|\|=)/;
    static readonly operators_l3 = 
        /^(<<=|>>=)/;
    static readonly punctuation = /^(\(|\)|\[|\]|\{|\}|,|;|\?|:)/;

    private gotoken() //{
    {
        while(true) {
            let p = this.cursor;
            this.eatSpaces();
            this.eatComment();
            if(p == this.cursor || this.cursor == this.text.length) break;
        }
        let um = this.text.substr(this.cursor);
        if(um.length == 0) {
            const end = new Token(TokenType.End, this.line, this.column, this.file);
            this.push_back(end);
            return;
        }

        // Keywords
        for(let keyword in reserved_keywords) {
            if(um.match(new RegExp('^' + keyword + '\\b'))) {
                const token = new Token(reserved_keywords[keyword], this.line, this.column, this.file);
                this.push_back(token);
                this.cursor += keyword.length;
                this.column += keyword.length;
                return;
            }
        }

        // String
        if(this.tryString(um)) return;

        // Char
        if(this.tryChar(um)) return;

        // Number
        if(this.tryNumber(um)) return;

        // Operators
        if(this.tryOperator(um)) return;

        // Punctuation
        if(this.tryPunctuation(um)) return;

        // Identifier
        const m1 = um.match(Tokenizor.idReg);
        if(m1) {
            const token = new IdentifierToken(m1[0], this.line, this.column, this.file);
            this.push_back(token);
            this.cursor += m1[0].length;
            this.column += m1[0].length;
            return;
        }

        throw new Error(`unrecognizaed text: '${um.substr(0, 20)} ...'`);
    } //}

    private tryOperator(str: string): boolean //{
    {
        const l3 = str.match(Tokenizor.operators_l3);
        const l2 = str.match(Tokenizor.operators_l2);
        const l1 = str.match(Tokenizor.operators_l1);
        const ll = l3 || l2 || l1;
        if(ll) {
            const op = ll[0];
            let op_type: OperatorType = operator_mapping[op];
            if(op_type == null) {
                throw new Error('operator not found');
            }

            const token = new OperatorToken(op_type, this.line, this.column, this.file);
            this.push_back(token);
            this.cursor += op.length;
            this.column += op.length;
        }

        return !!ll;
    } //}

    private tryPunctuation(str: string): boolean //{
    {
        const m = str.match(Tokenizor.punctuation);
        if(m) {
            const punc = m[0];
            let punc_type: PunctuationType = punctuation_mapping[punc];
            if(punc_type == null) {
                throw new Error('punctuation not found');
            }

            const token = new PunctuationToken(punc_type, this.line, this.column, this.file);
            this.push_back(token);
            this.cursor += punc.length;
            this.column += punc.length;
        }
        return !!m;
    } //}

    private tryString(str: string): boolean //{
    {
        if(str.startsWith('"')) {
            let escaping: boolean = false;
            let l: number;
            let strv: string[] = [];
            for(let i=1;i<str.length;i++) {
                if(str[i] == '\r' || str[i] == '\n') {
                    if(!escaping) throw new Error('bad string value');
                    escaping = false;

                    if((str[i+1] == '\r' || str[i+1] == '\n') && str[i] != str[i+1]) {
                        i++;
                    }
                    continue;
                }

                if(escaping) {
                    strv.push("\\");
                    strv.push(str[i]);
                    escaping = false;
                    continue;
                } else if(str[i] == '\\') {
                    escaping = true;
                } else if(str[i] == '"') {
                    l = i + 1;
                    break;
                } else {
                    strv.push(str[i]);
                }
            }

            if(l == null) {
                throw new Error('incomplete string value');
            }

            const v = strv.join('');
            // TODO
            const token = new StringToken(v, this.line, this.column, this.file);
            this.push_back(token);
            this.cursor += l;
            this.column += l;
            return true;
        }

        return false;
    } //}

    private tryChar(str: string): boolean //{
    {
        if(str.startsWith("'")) {
            const m = str.match(/^'([^']+)'/);
            let v: number;
            if(str.startsWith("'\\''")) {
                v = "'".charCodeAt(0);
            }
            
            if(!v) {
                if(m[1].startsWith('\\')) { 
                    // TODO
                } else  {
                    v = m[1].charCodeAt(0);
                }
            }
            const token = new IntegerToken(v, this.line, this.column, this.file);
            this.push_back(token);
            this.cursor += m[0].length;
            this.column += m[0].length;
            return true;
        }

        return false;
    } //}

    private tryNumber(str: string): boolean //{
    {
        const mf = str.match(/^([0-9]+\.[0-9]+|[0-9]+(\.[0-9]+)?[eE][0-9]+)/);
        const mi = str.match(/^(0[bB][0-1]+|0[0-7]+|0[xX][0-9a-fA-F]+|[0-9]+)/);
        if(mf) {
            const val = parseFloat(mf[1]);
            const token = new FloatToken(val, this.line, this.column, this.file);
            this.push_back(token);
            this.cursor += mf[0].length;
            this.column += mf[0].length;
            return true;
        }

        if(mi) {
            const val = mi[1].match(/^0[0-7]/) ? parseInt(mi[1], 8) : Number(mi[1]);
            const token = new IntegerToken(val, this.line, this.column, this.file);
            this.push_back(token);
            this.cursor += mi[0].length;
            this.column += mi[0].length;
            return true;
        }
        return false;
    } //}

    private eatSpaces() //{
    {
        const m = this.text.substr(this.cursor).match(Tokenizor.cleanspaces);
        if(m) {
            this.cursor += m[0].length;
        }
    } //}

    private takesomespaces() //{
    {
        const c = this.cursor;
        this.eatSpaces();
        if(c == this.cursor) {
            throw new Error('need space');
        }
    } //}

    private eatComment() //{
    {
        const m = this.text.substr(this.cursor);

        if(m.startsWith('//')) {
            const c1 = m.match(/^.*(\r|\n){1,2}/);
            this.cursor += c1[0].length;
            this.line += 1;
            this.column = 1;
        } else if (m.startsWith('/*')) {
            let s = 2;
            for(let n=s;n<m.length - 1;n++) {
                if(m[n] == '*' && m[n+1] == '/') {
                    s = n + 2;
                    break;
                } else if (m[n] == '\r' || m[n] == '\n') {
                    if((m[n+1] == '\r' || m[n+1] == '\n') && m[n] != m[n+1]) {
                        n++;
                    }
                    this.line++;
                    this.column = 1;
                }
            }
            if(s == 2) {
                throw new Error('incompleted block comment');
            }
            this.cursor += s;
        }
    } //}
}

