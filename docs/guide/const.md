# const、constexpr 与只读语义

## const 变量与指针 {#source-6}

const T 声明只读对象。const T* 限制通过指针修改对象，指针本身可以改指向；T* const 限制指针改指向，但允许修改非 const 的目标对象；const T* const 同时施加两种限制。只读参数接口使用 const T* 或 const T&，不能借此推断其他别名也不能修改目标。

```cpp
int a = 1;
int b = 2;
const int* readOnly = &a;
readOnly = &b;
int* const fixed = &a;
*fixed = 3;
const int* const both = &a;
```

## const 成员函数 {#source-7}

成员函数参数列表后的 const 限定隐式对象参数。函数内 this 的类型是指向 const 类对象的指针，不能通过它修改非 mutable 数据成员，也不能直接调用同一对象的非 const 成员函数。查询接口可使用此限定；指针成员所指的外部对象不自动变成只读。

```cpp
class Player {
private:
	int hp;

public:
	int getHP() const {
		return hp;
	}
};
```

## const 函数重载 {#source-8}

成员函数可以按有无 const 限定重载。const 对象只能调用匹配的 const 版本；非 const 对象在两个版本都可用时优先选择非 const 版本。容器访问器常分别返回 T& 和 const T&，从而控制调用者能否修改元素。

```cpp
class Data {
public:
	int& get() {
		return value;
	}

	const int& get() const {
		return value;
	}

private:
	int value;
};
```

## auto 的 const、引用丢失问题 {#source-76}

auto 按值推导去掉引用和顶层 const，auto& 保留引用绑定，const auto& 建立只读引用。底层 const 不会因按值复制指针而消失，例如从 const int* 推导仍得到 const int*。需要修改原对象时应显式保留引用。

```cpp
const int x = 10;

auto a = x;
```

```cpp
int x = 10;
int& ref = x;

auto a = ref;
```

```cpp
auto& a = ref;
```

## constexpr {#source-110}

C++11 constexpr 函数可在满足常量表达式规则时用于编译期求值，也可用运行时实参调用。此版本函数体限制较严，普通计算通常通过单条 return 表达式完成。constexpr 变量则必须由常量表达式初始化。

```cpp
constexpr int square(int x) {
	return x * x;
}
```

```cpp
constexpr int x = square(10);
```

## const 和 constexpr {#source-111}

const 限制通过该对象的修改，不要求初始化在编译期完成；constexpr 对象还要求常量表达式初始化。const int x = getValue() 可以运行时求值，constexpr int x = 10 * 20 可以用于需要编译期常量的上下文。

```cpp
const int x = getValue();
```

```cpp
constexpr int x = 10 * 20;
```

## mutable {#source-159}

mutable 数据成员允许在 const 对象或 const 成员函数中修改该成员。可用于缓存、访问计数或互斥锁等状态；它不自动提供线程安全，也不能使其他非 mutable 成员可写。

```cpp
class A {
private:
	mutable int cache;

public:
	void func() const {
		cache = 10;
	}
};
```


## const_cast {#const-cast}

const_cast 增加或移除指针、引用所指类型的 const 和 volatile 限定，不改变原对象是否可修改。原对象若声明为 const，去除限定后写入仍是未定义行为。它可用于对接只读却未使用 const 参数的旧接口，前提是接口不会修改真正的 const 对象。

```cpp
int value = 10;
const int* view = &value;
int* writable = const_cast<int*>(view);
*writable = 20;
```
