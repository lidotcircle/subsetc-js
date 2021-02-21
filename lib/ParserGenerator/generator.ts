import assert from 'assert';


export interface ICharacter {
    name: string;
    optional?: boolean;
}

export interface ITerminalCharacter extends ICharacter {
    end?: boolean;
}

export interface INotTermianlCharacter extends ICharacter {}


export interface ITokenizer {
    current(): ITerminalCharacter;
    next():    void;
    unnext():  void;
}


export enum RuleAssocitive {Left, Right}
export type ReduceCallback = (head: INotTermianlCharacter, body: ICharacter[]) => void;
interface RuleOptions {
    callback?: ReduceCallback;
    priority?: number;
    associative?: RuleAssocitive;
    uid?: string;
}

const EndSymbol = 'ParserEnd';
//                                                     state          rule           lookahead
type PushdownStateMapping = {[StateCharPair: string]: [number | null, number | null, PushdownStateMapping | null]};
type PushdownState = [number, number][];
export class ParserGenerator {
    private rules: [INotTermianlCharacter, ICharacter[], RuleOptions][] = [];
    private nonterms: Set<string> = new Set<string>();
    private terms: Set<string> = new Set<string>();
    private CompulsoryPriority: {[key: string]: Set<string>} = {};
    private uid2rules: {[key: string]: Set<number>} = {};
    private nonterm2rules: {[key: string]: Set<number>} = {};
    private startSymbols: string[] = [];

    constructor() {
        this.terms.add(EndSymbol);
    }

    addStartSymbol(...symbols: string[]): void {
        symbols.forEach(sym => this.startSymbols.push(sym));
    }

    addRule(nonTerm: INotTermianlCharacter, chars: ICharacter[], options?: RuleOptions) //{
    {
        const __options: RuleOptions = {
            associative: RuleAssocitive.Left,
        };
        Object.assign(__options, options);
        if(__options.uid) {
            assert.equal(this.uid2rules[options.uid], null);
        }
        this.extraOptionalRules(chars).forEach(body => this.__addRule(nonTerm, body, __options));
    } //}
    private __addRule(nonTerm: INotTermianlCharacter, chars: ICharacter[], options: RuleOptions) //{
    {
        assert.equal(chars.length > 0, true);
        this.rules.push([nonTerm, chars, options]);
        this.nonterms.add(nonTerm.name);
        this.nonterm2rules[nonTerm.name] = this.nonterm2rules[nonTerm.name] || new Set();
        this.nonterm2rules[nonTerm.name].add(this.rules.length - 1);
        if(options.uid) {
            this.uid2rules[options.uid] = this.nonterm2rules[options.uid] || new Set();
            this.uid2rules[options.uid].add(this.rules.length - 1);
        }

        if(this.terms.has(nonTerm.name)) {
            this.terms.delete(nonTerm.name);
        }
        chars.forEach(char => {
            if(!this.nonterms.has(char.name)) {
                this.terms.add(char.name);
            }
        });
    } //}
    private extraOptionalRules(chars: ICharacter[]) //{
    {
        assert.equal(chars.length > 0, true);
        const ans: ICharacter[][] = [];
        ans[0] = [chars[0]];
        if(chars[0].optional) ans[1] = [];

        for(let i=1;i<chars.length;i++) {
            const char = chars[i];
            const l = ans.length;

            if(char.optional) {
                for(let i=0;i<l;i++) {
                    ans.push(ans[i].slice());
                }
            }

            for(let i=0;i<l;i++) {
                ans[i].push(char);
            }
        }

        return ans;
    } //}

    addExtraPriority(lowerRuleuid: string, higherRuleuid: string) //{
    {
        assert.notEqual(this.uid2rules[lowerRuleuid], null);
        assert.notEqual(this.uid2rules[higherRuleuid], null);
        this.CompulsoryPriority[lowerRuleuid] = this.CompulsoryPriority[lowerRuleuid] || new Set<string>();
        this.CompulsoryPriority[lowerRuleuid].add(higherRuleuid);
    } //}

    private StateCharNext2StateRule: PushdownStateMapping = {};
    compile() //{
    {
        const symbols: string[] = [];
        for(const term of this.terms.keys()) symbols.push(term);
        const termsymbols = symbols.slice();
        for(const nonterm of this.nonterms.keys()) symbols.push(nonterm);

        const unseeStates: PushdownState[] = [this.startState()];

        let stateID: number = 0;
        const stateidMap: Map<string, number> = new Map();
        const tryAssignStateId = (state: PushdownState): number => {
            const str = this.stateset2str(state);
            /*
            if(!stateidMap.has(str)) {
                console.log('assign ', state, stateID + 1);
            }
            */
            return stateidMap.has(str) ? stateidMap.get(str) : (stateidMap.set(str, ++stateID), stateID);
        }
        const addedstates = new Set<number>();
        addedstates.add(tryAssignStateId(unseeStates[0]));

        while(unseeStates.length > 0) {
            const state = unseeStates.shift();
            const current_stateid = tryAssignStateId(state);

            for(const chari of symbols) {
                this.doStateMove(state, chari, unseeStates, addedstates, tryAssignStateId);
            }
        }
    } //}
    private doStateMove(state: PushdownState, chari: string, //{
                        unseeStates: PushdownState[], addedstates: Set<number>, 
                        assignID: (st: PushdownState) => number)
    {
        const current_stateid = assignID(state);
        const newstateset = this.statesetGoto(state, chari);
        const newstateid = assignID(newstateset);
        const DoInShift = () => {
            if(!addedstates.has(newstateid)) {
                addedstates.add(newstateid);
                unseeStates.push(newstateset);
            }
        }

        // reject
        if(newstateset.length == 0) {
            this.StateCharNext2StateRule[this.stateChar2str(current_stateid, chari)] = null;
            return;
        }

        const full: number[] = [];
        for(const rulest of newstateset) {
            const rule = this.rules[rulest[0]];
            const pos = rulest[1];
            if(rule[1].length == pos) {
                full.push(rulest[0]);
            }
        }

        if(full.length > 0) { // it's possible to reduce
            let heighest: number = full[0];
            let prh = this.ruleOptions(heighest);

            for(let vv of full) {
                const pv = this.ruleOptions(vv);
                if(prh.priority == null || 
                    pv.priority > prh.priority || 
                    (pv.priority == prh.priority && pv.associative == RuleAssocitive.Left)) 
                {
                    heighest = vv;
                    prh = pv;
                }
            }

            {
                const hrule = this.ruleOptions(heighest);
                if(hrule.uid && this.CompulsoryPriority[hrule.uid]) {
                    const exempt_rules = new Set<number>();
                    for(const huid of this.CompulsoryPriority[hrule.uid]) {
                        for(const k of this.uid2rules[huid].keys()) {
                            exempt_rules.add(k);
                        }
                    }

                    let setexempt: boolean = false;
                    for(const r of full) {
                        if(exempt_rules.has(r)) {
                            assert.equal(setexempt, false, 'compile fail, invalid rule');
                            setexempt = true;
                            heighest = r;
                            prh = this.ruleOptions(heighest);
                        }
                    }
                }
            }

            let nreduce=0;
            for(let vv of full) {
                const pv = this.ruleOptions(vv);
                if(pv.priority == prh.priority && pv.associative == prh.associative) {
                    nreduce++;
                }
            }
            const ReduceCheck = () => {
                if(nreduce > 1) {
                    let msg = '\n';
                    for(let vv of full) {
                        const pv = this.ruleOptions(vv);
                        if(pv.priority == prh.priority && pv.associative == prh.associative) {
                            msg += '        ';
                            msg += ruleStr(this.rules[vv][0], this.rules[vv][1]);
                            msg += '\n';
                        }
                    }
                    const moremsg = JSON.stringify({
                        rules: this.strAllRules(), 
                        state: state, 
                        character: chari, 
                        newstate: newstateset
                    }, null, 2);
                    throw new Error(`conflict rule in reduce: n=${nreduce} from ${current_stateid} to ${newstateid} ${msg}
                                     \n${moremsg}`);
                }
            }

            if(prh.priority != null) {
                const mapping: PushdownStateMapping = {};
                this.StateCharNext2StateRule[this.stateChar2str(current_stateid, chari)] = [null, null, mapping];

                for(const tlook of this.terms.keys()) {
                    // lookahead
                    const aheadstate = this.statesetGoto(newstateset, tlook);
                    let moststrict: RuleOptions;
                    for(const st of aheadstate) {
                        // TODO
                        const op = this.rules[st[0]][2];
                        if(!moststrict || 
                            op.priority < moststrict.priority ||
                            (op.priority == moststrict.priority && op.associative == RuleAssocitive.Right))
                        {
                            moststrict = op;
                        }
                    }

                    if(moststrict == null || 
                        moststrict.priority > prh.priority || 
                        (moststrict.priority == prh.priority && moststrict.associative != RuleAssocitive.Right)) 
                    {
                        // reduce
                        ReduceCheck();
                        mapping[tlook] = [null, heighest, null];
                    } else {
                        // shift
                        DoInShift();
                        mapping[tlook] = [newstateid, null, null];
                    }
                }
            } else {
                // reduce
                ReduceCheck();
                this.StateCharNext2StateRule[this.stateChar2str(current_stateid, chari)] = [null, heighest, null];
            }
        } else {
            // shift
            DoInShift();
            this.StateCharNext2StateRule[this.stateChar2str(current_stateid, chari)] = [newstateid, null, null];
        }
    } //}
    private startState(): [number, number][] //{
    {
        const ans: [number, number][] = [];
        for(let i=0;i<this.rules.length;i++) {
            const rule = this.rules[i];
            if(this.startSymbols.indexOf(rule[0].name) >= 0) {
                ans.push([i, 0]);
            }
        }

        return ans;
    } //}

    private save_state_go: Map<string, PushdownState> = new Map();
    private from_save_state_go(sstr: string) //{
    {
        const ans = [];
        this.save_state_go.get(sstr).forEach(val => ans.push(val.slice()));
        return ans;
    } //}
    private statesetGoto(oldstate: PushdownState, ichar: string): PushdownState //{
    {
        const sstr = this.stateset2str(oldstate) + '@' + ichar;
        if(this.save_state_go.has(sstr)) {
            return this.from_save_state_go(sstr);
        }

        const newstateset: [number, number][] = [];
        const validNonTerm: Set<string> = new Set();

        for(const ppa of oldstate) {
            const rule = this.rules[ppa[0]];
            assert.notEqual(rule, null, 'unexpected rule');
            const pos = ppa[1];

            if(rule[1].length > pos) {
                if(rule[1][pos].name == ichar) {
                    newstateset.push([ppa[0], pos + 1]);
                }
                if(this.isNonTerm(rule[1][pos].name)) {
                    validNonTerm.add(rule[1][pos].name);
                }
            }
        }

        let cont: boolean = true;
        while(cont) {
            const sizeo = validNonTerm.size;
            for(let i=0;i<this.rules.length;i++) {
                if(validNonTerm.has(this.rules[i][0].name) && 
                   this.isNonTerm(this.rules[i][1][0].name)) 
                {
                    validNonTerm.add(this.rules[i][1][0].name);
                }
            }
            cont = sizeo != validNonTerm.size;
        }

        for(let ir=0;ir<this.rules.length;ir++) {
            if(!validNonTerm.has(this.rules[ir][0].name)) {
                continue;
            }

            const rule = this.rules[ir];
            if(rule[1][0].name == ichar) {
                newstateset.push([ir, 1]);
            }
        }

        const ans = this.SortUniqueArray(newstateset);
        this.save_state_go.set(sstr, ans);
        return this.from_save_state_go(sstr);
    } //}
    private SortUniqueArray(array: [number, number][]): [number, number][] //{
    {
        array.sort((a, b) => {
            if(a[0] < b[0]) {
                return -1;
            } else if (a[0] > b[0]) {
                return  1;
            } else {
                if(a[1] < b[1]) {
                    return -1;
                } else if (a[1] > b[1]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });

        const ans: PushdownState = [];
        let prev;
        for(const s of array) {
            if(prev && s[0] == prev[0] && s[1] == prev[1]) {
                continue;
            }
            prev = s;
            ans.push(s);
        }
        return ans;
    } //}
    private isNonTerm(chari: string): boolean {return this.nonterms.has(chari);}

    private ruleOptions(rulen: number): RuleOptions //{
    {
        return this.rules[rulen][2];
    } //}

    private stateChar2str(state: number, term: string) //{
    {
        return `${state}#${term}`;
    } //}
    private stateset2str(stateset: PushdownState): string //{
    {
        let ans = 'stateset';
        for(const k of stateset) {
            ans += `@${this.rulePosi2str(k[0], k[1])}`;
        }
        return ans;
    } //}
    private rulePosi2str(rule: number, pos: number) //{
    {
        return `${rule}:${pos}`;
    } //}

    parse(tokenizer: ITokenizer, stopSymbolName?: string): number //{
    {
        let ok: boolean = false;
        for(const key in this.StateCharNext2StateRule) {
            ok = true;
            break;
        }
        if(!ok) throw new Error('parse error: not compiled');

        const statestack: number[] = [1];
        const symbolstack: ICharacter[] = [{name: '$'}];

        let consumed = 0;
        for(let token=tokenizer.current();
            !tokenizer.current().end;
            tokenizer.next(), token=tokenizer.current(), consumed++) 
        {
            this.pushNewCharacter(tokenizer, statestack, symbolstack, token);

            if(symbolstack.length == 2 && 
               stopSymbolName != null && 
               symbolstack[1].name == stopSymbolName) 
            {
                break;
            }
        }

        if(symbolstack.length != 2) {
            const stackdump = JSON.stringify({
                statestack: statestack, 
                symbolstack: symbolstack
            }, null, 2);
            throw new Error(`parse error: unexpected finish\n${stackdump}`);
        }
        return consumed;
    } //}
    private pushNewCharacter(tokenizer: ITokenizer, //{
                             statestack: number[], 
                             symbolstack: ICharacter[], character: ICharacter)
    {
        const state = statestack[statestack.length - 1];
        const nextstep = this.StateCharNext2StateRule[this.stateChar2str(state, character.name)];
        if(nextstep == null) {
            tokenizer.next();
            if(tokenizer.current().end) {
                symbolstack.push(character);
                return;
            }

            console.error(statestack, symbolstack, character);
            throw new Error(`parse error: in ${character.name}`);
        }

        if(nextstep[2] != null) {
            const nextmap = nextstep[2];
            tokenizer.next();
            const nt = tokenizer.current();
            tokenizer.unnext();
            const nextnextstep = nextmap[nt.end ? EndSymbol : nt.name];
            if(nextnextstep == null ||
               (nextnextstep[0] == null && nextnextstep[1] == null)) 
            {
                console.error(statestack, symbolstack);
                throw new Error(`parse error: in ${character.name}`);
            } else if (nextnextstep[1] != null) {
                this.reduceStackByRule(tokenizer, nextnextstep[1], statestack, symbolstack, character);
            } else {
                assert.notEqual(nextnextstep[0], null);
                statestack.push(nextnextstep[0]);
                symbolstack.push(character);
            }
        } else if (nextstep[1] != null) {
            this.reduceStackByRule(tokenizer, nextstep[1], statestack, symbolstack, character);
        } else {
            assert.notEqual(nextstep[0], null);
            statestack.push(nextstep[0]);
            symbolstack.push(character);
        }
    } //}
    private reduceStackByRule(tokenizer: ITokenizer, //{
                              rulen: number, statestack: number[], 
                              symbolstack: ICharacter[], sym: ICharacter)
    {
        const rule = this.rules[rulen];
        const newNT = {name: rule[0].name};

        const n = rule[1].length - 1;
        assert.equal(n >= 0, true);
        assert.equal(statestack.length > n, true);
        assert.equal(symbolstack.length > n, true);
        statestack.splice(statestack.length - n, n);
        const symbols = symbolstack.splice(symbolstack.length - n, n);
        symbols.push(sym);

        // printReduce(newNT, symbols);
        if(rule[2] && rule[2].callback) {
            rule[2].callback(newNT, symbols);
        }
        this.pushNewCharacter(tokenizer, statestack, symbolstack, newNT);
    } //}

    private strAllRules() //{
    {
        let ans = '';
        for(let i=0;i<this.rules.length;i++) {
            const rule = this.rules[i];
            ans += `${i}: ` + ruleStr(rule[0], rule[1]);
            ans += '\n';
        }

        return ans;
    } //}

    save() {
        return JSON.stringify(this.StateCharNext2StateRule, null, 2);
    }

    load(dt: string) {
        this.StateCharNext2StateRule = JSON.parse(dt);
    }
}

function ruleStr(nt: INotTermianlCharacter, ts: ICharacter[]): string //{
{
    let ans = `${nt.name} => `;
    for(let i in ts) {
        const t = ts[i];
        ans += t.name;
        if(parseInt(i) != ts.length - 1) ans += ' ';
    }

    return ans;
} //}
function printReduce(nt: INotTermianlCharacter, ts: ICharacter[]) //{
{
    let print = '[ ';
    for(let i in ts) {
        const t = ts[i];
        print += t.name;
        if(parseInt(i) != ts.length - 1) print += ' ';
    }

    print += ' ] => ';
    print += nt.name;
    console.log(print);
} //}

