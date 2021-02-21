import { AST, ASTCatogory } from "../ast";

const PointerSize = 8;
export enum TypeCategory  {Void, Integer, Float, Struct, Union, Enum, Typedef, Pointer, Array, Function}
export enum StorageClassSpecifier {Typedef, Extern, Static, Auto, Register}
export enum TypeQualifier {Const = 1, Volatile = 2, Restrict = 4}

export class TypeInfoAST extends AST {
    readonly qualifiers: TypeQualifier[];
    readonly type: TypeCategory;
    storageSpecifier: StorageClassSpecifier;
    protected _size: number;
    get size(): number {
        if(this._size == null) throw new Error('bad type');
        return this._size;
    }

    constructor(type: TypeCategory) {
        super(ASTCatogory.TypeInfo);
        this.qualifiers = [];
        this.type = type;
    }
}

export class PointerType extends TypeInfoAST {
    next: TypeInfoAST;

    constructor() {
        super(TypeCategory.Pointer);
        this._size = PointerSize;
    }
}

export class ArrayType extends TypeInfoAST {
    readonly len: number;
    next: TypeInfoAST;

    constructor(len: number = null) {
        super(TypeCategory.Array);
        this._size = PointerSize;
        this.len = len;
    }
}

export class FunctionType extends TypeInfoAST {
    ReturnType: TypeInfoAST;
    ArgumentsType: TypeInfoAST[];

    constructor() {
        super(TypeCategory.Function);
        this._size = PointerSize;
        this.ArgumentsType = [];
    }
}

export class VoidType extends TypeInfoAST {
    constructor() {
        super(TypeCategory.Void);
        this._size = 0;
    }
}

interface StructOrUnionMember {
    id:   string;
    type: TypeInfoAST;
}
export class StructType extends TypeInfoAST {
    members: StructOrUnionMember[];

    constructor(members: StructOrUnionMember[]) {
        super(TypeCategory.Struct);

        this.members = members;
        this._size = 0;
        for(const m of this.members) {
            this._size += m.type.size;
        }
    }
}

export class UnionType extends TypeInfoAST //{
{
    members: StructOrUnionMember[];

    constructor(members: StructOrUnionMember[]) {
        super(TypeCategory.Union);

        this.members = members;
        this._size = 0;
        for(const m of this.members) {
            if(m.type.size > this._size) {
                this._size = m.type.size;
            }
        }
    }
} //}

export class EnumType extends TypeInfoAST {
    constructor() {
        super(TypeCategory.Enum);

        this._size = PointerSize;
    }
}

export class IntegerType extends TypeInfoAST {
    signed: boolean;
    set len(l: number) {this._size = l;}

    constructor(size: number) {
        super(TypeCategory.Integer);
        this._size = size;
    }
}

export class CharType extends IntegerType {
    constructor() {
        super(1);
    }
}

export class IntType extends IntegerType {
    constructor() {
        super(1);
    }
}

export class FloatType extends TypeInfoAST {
    constructor(size: number = 4) {
        super(TypeCategory.Float);
        this._size = size;
    }

}

export class DoubleType extends FloatType {
    constructor() {
        super(8);
    }
}

export class TypedefType extends TypeInfoAST {
    readonly next: TypeInfoAST;

    constructor(next: TypeInfoAST) {
        super(TypeCategory.Typedef);

        this.next = next;
    }
}

