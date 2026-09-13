# 类型推导、初始化与类型转换

## RTTI {#source-53}

RTTI 运行时类型信息由 typeid 和特定 dynamic_cast 操作提供。对多态对象进行运行时向下转换时，源类型通常需含虚函数；指针转换失败返回空指针，引用转换失败抛出 std::bad_cast。它可用于需要检查实际派生类型的边界接口。

```cpp
Base* p = new Derived();

Derived* d = dynamic_cast<Derived*>(p);

if (d) {
	cout << "Derived" << endl;
}
```

## 四种 cast {#source-54}

static_cast 用于数值转换和允许的显式类型转换，不为所有向下转换提供运行时检查。dynamic_cast 可检查多态继承关系；reinterpret_cast 执行受约束的底层转换，不能绕过对象生命周期、对齐和别名规则。const_cast 的写入限制见[const 限定转换](/guide/const#const-cast)。

```cpp
double x = 10.5;
int y = static_cast<int>(x);
```

```cpp
Derived* d = dynamic_cast<Derived*>(base);
```

```cpp
// 若实现提供 std::uintptr_t（<cstdint>），它可容纳转换后的指针值。
std::uintptr_t address = reinterpret_cast<std::uintptr_t>(p);
```

## C 风格 cast 为什么不推荐？ {#source-55}

C 风格转换可能执行不同命名转换能够表达的操作，代码中不直接体现是否移除了 const 或进行了底层解释。命名转换把意图分开，便于检查对应的前提条件；static_cast 也不代表任意转换都安全。

```cpp
int x = (int)value;
```

## auto 类型推导 {#source-75}

C++11 的 auto 根据初始化表达式推导变量类型，声明时通常必须提供初始化式。它不会使变量成为动态类型，推导后类型固定。复杂迭代器类型可用 auto 声明，const 和引用规则见[类型推导限定](/guide/const#source-76)。

```cpp
vector<int>::iterator it = v.begin();
```

```cpp
auto it = v.begin();
```

## decltype {#source-77}

decltype 对未加括号的名字通常取得其声明类型；对其他表达式根据值类别推导。普通 int 变量 x 的 decltype(x) 是 int，而 decltype((x)) 是 int&。可用于依赖表达式的返回类型或类型别名，括号可能改变结果。

```cpp
int x = 10;

decltype(x) y = 20;
```

```cpp
decltype((x)) reference = x;
```

## 范围 for {#source-79}

范围 for 对范围逐元素迭代。for (int x : v) 复制元素，for (int& x : v) 可修改原元素，for (const auto& x : v) 避免复制且通过该引用只读。遍历过程中修改容器必须遵守迭代器失效规则。

```cpp
vector<int> v;

for (int x : v) {
	cout << x << endl;
}
```

```cpp
for (int& x : v) {
	x++;
}
```

```cpp
for (const auto& x : v) {
	cout << x << endl;
}
```

## 初始化列表 {#source-80}

C++11 花括号初始化可用于聚合对象、构造函数调用和 std::initializer_list 接口。构造函数重载中 initializer_list 可能优先匹配，例如 `vector<int>`{3, 2} 是两个元素，而 `vector<int>`(3, 2) 是三个值为 2 的元素。

```cpp
vector<int> v = {1, 2, 3, 4};
```

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

## 窄化转换检查 {#source-81}

列表初始化禁止规定的窄化转换，例如从 double 到 int 的转换。`int x = 3.14` 会进行截断转换，而 `int x{3.14}` 不合法。需要此转换时应先明确检查范围和精度，再显式转换。

```cpp
int x = 3.14;
```

```cpp
int x{3.14};
```

## enum class {#source-103}

enum class 的枚举项属于枚举作用域，使用 Color::Red 访问，不能像传统枚举一样隐式转换为 int。可显式指定底层整数类型，用于避免不同枚举类型之间的误用。

```cpp
enum Color {
	Red,
	Green
};
```

```cpp
enum class Color {
	Red,
	Green
};
```

```cpp
Color::Red
```

## tuple {#source-113}

`std::tuple<Ts...>` 保存固定数量、可具有不同类型的元素。C++11 使用 `std::get<I>` 按编译期索引访问，可用于组合返回多个值。字段具有稳定业务含义时，自定义结构体还能提供命名成员。

```cpp
tuple<int, string, double> t(1, "Alice", 3.14);

cout << get<0>(t);
cout << get<1>(t);
```

## C++98 auto 和 C++11 auto {#source-160}

C++98 的 auto 是存储类说明符，局部普通对象即使不写它也通常具有自动存储期。C++11 重新赋予 auto 类型推导含义，auto x = 10 推导 x 为 int；阅读旧代码时需要依据所用标准版本解释。

```cpp
auto x = 10;
```
