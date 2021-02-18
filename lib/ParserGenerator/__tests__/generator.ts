import { ParserGenerator, ITokenizer, ITerminalCharacter, INotTermianlCharacter, ICharacter, TerminalAssocitive } from '../generator';


class DummyTokenizer implements ITokenizer {
    private tokens: ITerminalCharacter[];
    private iv = 0;
    constructor(tokens: ITerminalCharacter[]) {
        this.tokens = tokens;
    }

    current(): ITerminalCharacter {
        return this.iv == this.tokens.length ? {name: 'end', end: true} : this.tokens[this.iv];
    }
    next(): void {
        if(this.iv == this.tokens.length) {
            throw new Error('end of token stream');
        }

        this.iv++;
    }
    unnext(): void {
        this.iv--;

        if(this.iv < 0) {
            throw new Error('bad unnext');
        }
    }
}

function printReduce(nt: INotTermianlCharacter, ts: ICharacter[]) {
    let print = '';
    for(let i in ts) {
        const t = ts[i];
        print += t.name;
        if(parseInt(i) != ts.length - 1) print += ', ';
    }

    print += ' => ';
    print += nt.name;
    console.log(print);
}

describe('compile', () => {
    test('basic expression', () => {
        const parser = new ParserGenerator();
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '+', priority: 2}, {name: 'Expr'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '-', priority: 2}, {name: 'Expr'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '*', priority: 1}, {name: 'Expr'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '/', priority: 1}, {name: 'Expr'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: '('}, {name: 'Expr'}, {name: ')'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: 'Id'}], printReduce);
        parser.compile();

        parser.parse(new DummyTokenizer([
            {name: '('}, 
            {name: '('}, 
            {name: 'Id'}, 
            {name: '+'},
            {name: 'Id'},
            {name: ')'}, 
            {name: '*'},
            {name: 'Id'},
            {name: ')'}, 
        ]));
    });

    test('C declaration', () => {
        const parser = new ParserGenerator();
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '+', priority: 2}, {name: 'Expr'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '-', priority: 2}, {name: 'Expr'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '*', priority: 1}, {name: 'Expr'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '/', priority: 1}, {name: 'Expr'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: ',', priority: 3}, {name: 'Expr'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: '('}, {name: 'Expr'}, {name: ')'}], printReduce);
        parser.addRule({name: 'Expr'}, [{name: 'Id'}], printReduce);
        parser.compile();

        parser.parse(new DummyTokenizer(['Id', '+', 'Id', ',', 'Id', '*', '(', 'Id', '+', 'Id', ')'].map(n => {return {name: n}})));
    });
});

