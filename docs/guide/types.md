# 类型推导、初始化与类型转换

## 概括要点

- C++11 的 auto 用初始化表达式推导类型；decltype 依据表达式规则获取类型，decltype(x) 与 decltype((x)) 可能不同。
- 范围 for 可按值、引用或 const 引用遍历；初始化列表支持花括号初始化并检查窄化转换。
- enum class 提供有作用域的枚举类型；tuple 把多个不同类型的值组合为一个对象。
- static_cast 表达常规显式转换，dynamic_cast 支持多态类型的运行时检查，reinterpret_cast 用于受约束的底层转换。
- RTTI 包括 dynamic_cast 和 typeid；C 风格转换隐藏意图，宜使用明确的命名转换。
- 涉及 const 的推导规则和 const_cast 详见 const 专章。

## auto 类型推导 {#source-75}

```cpp
vector<int>::iterator it = v.begin();
```

可以：

```cpp
auto it = v.begin();
```

编译器推导类型。

注意：

```cpp
auto x = expression;
```

必须有初始化表达式。


## decltype {#source-77}

```cpp
int x = 10;

decltype(x) y = 20;
```

`y` 类型是：

```cpp
int
```

非常重要的特殊规则：

```cpp
decltype(x)
```

与：

```cpp
decltype((x))
```

可能不同。

如果 x 是普通变量：

```cpp
decltype(x)      // int
decltype((x))    // int&
```

因为 `(x)` 是左值表达式。


## C++98 auto 和 C++11 auto {#source-160}

有一个历史知识点。

C++98 的 `auto` 原本是：

```text
storage-class specifier
```

几乎没人使用。

C++11 重新赋予它类型推导语义：

```cpp
auto x = 10;
```

所以现代提到 `auto` 几乎都指 C++11 类型推导。


## 范围 for {#source-79}

```cpp
vector<int> v;

for (int x : v) {
	cout << x << endl;
}
```

修改：

```cpp
for (int& x : v) {
	x++;
}
```

只读而且避免复制：

```cpp
for (const auto& x : v) {
	cout << x << endl;
}
```

这是非常常见的现代写法。


## 初始化列表 {#source-80}

C++11：

```cpp
vector<int> v = {1, 2, 3, 4};
```

对象：

```cpp
class Vec2 {
public:
	Vec2(float x, float y)
		: x(x), y(y) {
	}

private:
	float x;
	float y;
};

Vec2 v{1.0f, 2.0f};
```

统一初始化：

```cpp
T object{...};
```


## 窄化转换检查 {#source-81}

```cpp
int x = 3.14;
```

允许，有警告可能。

但：

```cpp
int x{3.14};
```

编译错误。

因为 `{}` 初始化禁止很多隐式 narrowing conversion。


## enum class {#source-103}

传统：

```cpp
enum Color {
	Red,
	Green
};
```

枚举成员进入外围作用域。

C++11：

```cpp
enum class Color {
	Red,
	Green
};
```

使用：

```cpp
Color::Red
```

类型更安全。

不会随意隐式转换成 int。


## tuple {#source-113}

```cpp
tuple<int, string, double> t(1, "Alice", 3.14);

cout << get<0>(t);
cout << get<1>(t);
```

可以一次存多个不同类型。


## RTTI {#source-53}

C++ 提供运行时类型信息：

```text
dynamic_cast
typeid
```

例如：

```cpp
Base* p = new Derived();

Derived* d = dynamic_cast<Derived*>(p);

if (d) {
	cout << "Derived" << endl;
}
```

要求基类是多态类型，通常至少有一个 virtual 函数。


## 四种 cast {#source-54}

C++ 八股必考。

#### static_cast

正常类型转换：

```cpp
double x = 10.5;
int y = static_cast<int>(x);
```

以及部分继承体系转换。

#### dynamic_cast

运行时安全检查：

```cpp
Derived* d = dynamic_cast<Derived*>(base);
```

失败：

```text
指针 → nullptr
引用 → std::bad_cast
```

#### const_cast

去除或增加 cv 限定，示例与修改限制统一见 [const_cast](/guide/const#const-cast)。

#### reinterpret_cast

底层位/地址解释：

```cpp
// 若实现提供 std::uintptr_t（<cstdint>），它可容纳转换后的指针值。
std::uintptr_t address = reinterpret_cast<std::uintptr_t>(p);
```

非常危险，一般用于底层系统编程。


## C 风格 cast 为什么不推荐？ {#source-55}

```cpp
int x = (int)value;
```

这种转换可能同时执行：

```text
static_cast
const_cast
reinterpret_cast
```

阅读代码时无法一眼判断转换意图。

C++ cast 更明确。



## auto 的 const 与引用规则

相关规则和示例统一见 [const 章](/guide/const#source-76)。
