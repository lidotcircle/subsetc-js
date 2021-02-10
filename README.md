
---
Development Plan

implement a compiler for subset of C language.


### Features

+ `int`, `unsigned`, `char`, `double`, `pointer`, `array`, `void`
+ `struct`, `enum`
+ **static**
+ **const**
+ **typedef**
+ control flows, `while`, `for`, `if`, `else`, `else if`
+ comments


### Keywords

|---|---|---|---|
| `enum`     | `break`    | `char`   | `const`   |
| `continue` | `double`   | `else`   | `if`      |
| `return`   | `sizeof`   | `struct` | `typedef` |
| `union`    | `unsigned` | `while`  |


### Grammar

``` c
/** TODO */
Expr  := ( Expr ) | FCall | AExpr | iD | String | iNTEGER | DefExpr | RefExpr | IdxExpr | DotExpr | PointExpr | CondExpr
String := sTRING | sTRING String
FCall := Expr lBRACE [Expr [cOMMA Expr] *] ? rBRACE
AExpr := AExpr_B | AExpr_U_PRE | AExpr_U_POST
AExpr_B := Expr { +, -, *, /, &, |, ^, <<, >>, &&, ||, <, <=, >, >=, ==, !=, =, +=, -=, %=, /=, &=, ^=, |=, <<=, >>= } Expr
AExpr_U_PRE  := { ++, --, !, ~ } Expr 
AExpr_U_POST := Expr { ++, -- }
DefExpr := * Expr
RefExpr := & Expr
IdxExpr := Expr [ Expr ]
DotExpr := Expr . iD
PointExpr := Expr -> iD
CondExpr := Expr ? Expr : Expr
```

