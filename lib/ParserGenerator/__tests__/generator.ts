import { ParserGenerator, ITokenizer, ITerminalCharacter, INotTermianlCharacter, ICharacter } from '../generator';


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
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '+'}, {name: 'Expr'}], {callback: printReduce, priority: 2});
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '-'}, {name: 'Expr'}], {callback: printReduce, priority: 2});
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '*'}, {name: 'Expr'}], {callback: printReduce, priority: 1});
        parser.addRule({name: 'Expr'}, [{name: 'Expr'}, {name: '/'}, {name: 'Expr'}], {callback: printReduce, priority: 1});
        parser.addRule({name: 'Expr'}, [{name: '('}, {name: 'Expr'}, {name: ')'}],    {callback: printReduce});
        parser.addRule({name: 'Expr'}, [{name: 'Id'}], {callback: printReduce});
        parser.addStartSymbol('Expr');
        parser.compile();

        parser.parse(new DummyTokenizer([
            {name: '('}, 
            {name: '('}, 
            {name: 'Id'}, 
            {name: '+'},
            {name: 'Id'},
            {name: '*'},
            {name: 'Id'},
            {name: ')'}, 
            {name: '*'},
            {name: 'Id'},
            {name: ')'}, 
        ]));
    });
});

