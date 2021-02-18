import assert from 'assert';


export interface ICharacter {
    name: string;
    priority?: number;
    associative?: TerminalAssocitive;
}

export enum TerminalAssocitive {Left, Right}
export interface ITerminalCharacter extends ICharacter {
    end?: boolean;
}

export interface INotTermianlCharacter extends ICharacter {}


export interface ITokenizer {
    current(): ITerminalCharacter;
    next():    void;
    unnext():  void;
}


export type ReduceCallback = (head: INotTermianlCharacter, body: ICharacter[]) => void;
const EndSymbol = 'end';
//                                                     state          rule           lookahead
type PushdownStateMapping = {[StateCharPair: string]: [number | null, number | null, PushdownStateMapping | null]};
type PushdownState = Set<string>;
export class ParserGenerator {
    private rules: [INotTermianlCharacter, ICharacter[], ReduceCallback][] = [];
    private nonterms: Set<string> = new Set<string>();
    private terms: Map<string, {priority: number, associative: TerminalAssocitive}> = new Map();

    constructor() {
        this.terms.set(EndSymbol, {priority: null, associative: TerminalAssocitive.Left});
    }
    addRule(nonTerm: INotTermianlCharacter, chars: ICharacter[], callback?: ReduceCallback) //{
    {
        this.rules.push([nonTerm, chars, callback]);
        this.nonterms.add(nonTerm.name);
        if(this.terms.has(nonTerm.name)) {
            this.terms.delete(nonTerm.name);
        }
        chars.forEach(char => {
            if(!this.nonterms.has(char.name)) {
                if(this.terms.has(char.name)) {
                    const vs = this.terms.get(char.name);
                    assert.equal(vs.priority,    char.priority);
                    assert.equal(vs.associative, char.associative);
                }

                this.terms.set(char.name, {
                    priority:    char.priority, 
                    associative: char.associative
                });
            }
        });
    } //}

    private StateCharNext2StateRule: PushdownStateMapping = {};
    compile() //{
    {
        const symbols: string[] = [];
        for(const term of this.terms.keys()) symbols.push(term);
        const termsymbols = symbols.slice();
        for(const nonterm of this.nonterms.keys()) symbols.push(nonterm);

        const unseeStates: PushdownState[] = [new Set()];

        let stateID: number = 0;
        const stateidMap: Map<string, number> = new Map();
        const tryAssignStateId = (state: PushdownState): number => {
            const str = this.stateset2str(state);
            /** dump stateset assignment
            if(!stateidMap.has(str)) {
                console.log(stateID + 1, str);
            }
            */
            return stateidMap.has(str) ? stateidMap.get(str) : (stateidMap.set(str, ++stateID), stateID);
        }
        const lookedstate = new Set<number>();
        tryAssignStateId(unseeStates[0]);

        while(unseeStates.length > 0) {
            const state = unseeStates.shift();
            const current_stateid = tryAssignStateId(state);
            lookedstate.add(current_stateid);

            for(const term of symbols) {
                const newstateset = this.statesetGoto(state, term);
                const sset = this.array2stateset(newstateset);
                const newstateid = tryAssignStateId(sset);
                if(!lookedstate.has(newstateid)) {
                    unseeStates.push(sset);
                }

                if(newstateset.length == 0) {
                    this.StateCharNext2StateRule[this.stateChar2str(current_stateid, term)] = null;
                } else {
                    const full: number[] = [];

                    for(const rulest of newstateset) {
                        const rule = this.rules[rulest[0]];
                        const pos = rulest[1];
                        if(rule[1].length == pos) {
                            full.push(rulest[0]);
                        }
                    }

                    if(full.length > 0) {
                        let heighest: number = full[0];
                        let prh = this.rulePriority(heighest);

                        for(let vv of full) {
                            const pv = this.rulePriority(vv);
                            if(prh == null || pv > prh) {
                                heighest = vv;
                                prh = pv;
                            }
                        }

                        if(prh != null) {
                            const mapping: PushdownStateMapping = {};
                            this.StateCharNext2StateRule[this.stateChar2str(current_stateid, term)] = [null, null, mapping];

                            for(const tlook of termsymbols) {
                                // lookahead
                                const p = this.termProperty(tlook);
                                if(p.priority == null || 
                                   p.priority > prh || 
                                   (p.priority == prh && p.associative != TerminalAssocitive.Right)) 
                                {
                                    // reduce
                                    mapping[tlook] = [null, heighest, null];
                                } else {
                                    // shift
                                    mapping[tlook] = [newstateid, null, null];
                                }
                            }
                        } else {
                            // reduce
                            this.StateCharNext2StateRule[this.stateChar2str(current_stateid, term)] = [null, heighest, null];
                        }
                    } else {
                        // shift
                        this.StateCharNext2StateRule[this.stateChar2str(current_stateid, term)] = [newstateid, null, null];
                    }
                }
            }
        }
    } //}
    private statesetGoto(oldstate: PushdownState, ichar: string): [number, number][] //{
    {
        const newstateset: [number, number][] = [];

        for(const iis of oldstate.keys()) {
            const ppa = this.str2rulePos(iis);
            const rule = this.rules[ppa[0]];
            assert.notEqual(rule, null, 'unexpected rule');
            const pos = ppa[1];

            if(rule[1].length > pos && rule[1][pos].name == ichar) {
                newstateset.push([ppa[0], pos + 1]);
            }
        }

        for(let ir in this.rules) {
            const rule = this.rules[ir];
            if(rule[1][0].name == ichar) {
                newstateset.push([parseInt(ir), 1]);
            }
        }

        return newstateset;
    } //}

    private rulePriority(rulen: number): number | null //{
    {
        let ans = null;

        for(const item of this.rules[rulen][1]) {
            if(item.priority != null && (ans == null || item.priority > ans)) {
                ans = item.priority;
            }
        }

        return ans;
    } //}
    private leftAssociative(rulen: number): boolean //{
    {
        for(const item of this.rules[rulen][1].reverse()) {
            if(item.associative == TerminalAssocitive.Right) {
                return false;
            }
        }

        return true;
    } //}
    private termProperty(term: string): {priority: number; associative: TerminalAssocitive} //{
    {
        if(!this.terms.has(term)) {
            throw new Error('undefined terminal character');
        }

        return this.terms.get(term);
    } //}

    private stateChar2str(state: number, term: string) //{
    {
        return `${state}#${term}`;
    } //}
    private array2stateset(array: [number, number][]) //{
    {
        const ans = new Set<string>();
        for(const s of array) {
            ans.add(this.rulePosi2str(...s));
        }

        return ans;
    } //}
    private stateset2str(stateset: PushdownState): string //{
    {
        let ans = 'stateset';
        let s = [];
        for(const k of stateset.keys()) s.push(k);
        s.sort();
        for(const k of s) {
            ans += `${k}@`;
        }
        return ans;
    } //}
    private rulePosi2str(rule: number, pos: number) //{
    {
        return `${rule}:${pos}`;
    } //}
    private str2rulePos(rulepos: string): [number, number] //{
    {
        const _ans = rulepos.split(':');
        assert.equal(_ans.length, 2);
        const ans = [parseInt(_ans[0]), parseInt(_ans[1])];
        return ans as [number, number];
    } //}

    private isNonTerm(name: string): boolean //{
    {
        return this.nonterms.has(name);
    } //}

    parse(tokenizer: ITokenizer, stopSymbolName?: string): number //{
    {
        let ok: boolean = false;
        for(const key in this.StateCharNext2StateRule) {
            ok = true;
            break;
        }
        if(!ok) throw new Error('parse fail: not compiled');

        const statestack: number[] = [1];
        const symbolstack: ICharacter[] = [{name: '$'}];

        let consumed = 0;
        for(let token=tokenizer.current();
            !tokenizer.current().end;
            tokenizer.next(), token=tokenizer.current(), consumed++) 
        {
            this.pushNewCharacter(tokenizer, statestack, symbolstack, token);
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
            throw new Error(`parse error in ${character.name}`);
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
                throw new Error(`parse error in ${character.name}`);
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
        const newNT = {
            name: rule[0].name,
            priority: rule[0].priority,
            associative: rule[0].associative,
        };

        const n = rule[1].length - 1;
        assert.equal(n >= 0, true);
        assert.equal(statestack.length > n, true);
        assert.equal(symbolstack.length > n, true);
        statestack.splice(statestack.length - n, n);
        const symbols = symbolstack.splice(symbolstack.length - n, n);
        symbols.push(sym);

        rule[2](newNT, symbols);
        this.pushNewCharacter(tokenizer, statestack, symbolstack, newNT);
    } //}

    dump() {
        return JSON.stringify(this.StateCharNext2StateRule, null, 2);
    }
}

