# const、constexpr 与只读语义

## 概括要点

- const T* 限制通过指针修改对象；T* const 限制指针改指向；两者可以叠加。
- const 成员函数通过只读的 this 访问对象，可与非 const 版本重载；mutable 成员是例外。
- auto 按值推导会去掉顶层 const 和引用；auto&、const auto& 可以表达所需的引用与只读约束。
- const 不保证编译期求值；constexpr 变量必须以常量表达式初始化，constexpr 函数也可以在运行期调用。
- const_cast 不会使一个原本为 const 的对象变得可写；通过转换后的访问路径修改它仍是未定义行为。

## const 变量与指针 {#source-6}

`const` 是 C++ 极其重要的知识点。

### 1. const 变量

```cpp
const int x = 10;
```

不能修改：

```cpp
x = 20;	// error
```

### 2. const 与指针

重点八股。

```cpp
const int* p;
```

意思：

> p 指向 const int。

不能：

```cpp
*p = 10;
```

但可以：

```cpp
p = &other;
```

```cpp
int* const p = &a;
```

意思：

> p 自己是常量指针。

可以：

```cpp
*p = 10;
```

不能：

```cpp
p = &b;
```

```cpp
const int* const p = &a;
```

两边都不能改。

口诀：

```text
const 在 * 左边：
指向的数据不能改

const 在 * 右边：
指针本身不能改
```


## const 成员函数 {#source-7}

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

这里：

```cpp
getHP() const
```

表示：

> 这个函数不能通过 this 修改非 mutable 数据成员；它并不保证所指向的外部对象也不可变。

底层可以近似理解成：

```cpp
// this 的类型是 const Player*（这里只解释类型，不是声明 this）
```

因此不能：

```cpp
int getHP() const {
	hp = 100;	// error
	return hp;
}
```


## const 函数重载 {#source-8}

可以这样：

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

const 对象调用 const 版本。

普通对象调用普通版本。


## mutable {#source-159}

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

即使 const 成员函数，也允许修改 mutable 成员。

典型用途：

```text
缓存
调试计数
同步对象
```

即不属于对象“逻辑状态”的数据。


## auto 的 const / 引用丢失问题 {#source-76}

```cpp
const int x = 10;

auto a = x;
```

`a` 通常是：

```cpp
int
```

顶层 const 被去掉。

```cpp
int x = 10;
int& ref = x;

auto a = ref;
```

`a` 也是：

```cpp
int
```

要保留引用：

```cpp
auto& a = ref;
```


## constexpr {#source-110}

```cpp
constexpr int square(int x) {
	return x * x;
}
```

可以在编译期：

```cpp
constexpr int x = square(10);
```

C++11 的 constexpr 函数限制比后续标准严格很多。

理解核心即可：

> 表达式满足条件时可以在编译阶段求值。


## const 和 constexpr {#source-111}

```cpp
const int x = getValue();
```

`x` 不允许修改，但 `getValue()` 可能运行时执行。

```cpp
constexpr int x = 10 * 20;
```

要求：

```text
能够成为编译期常量表达式
```

简单理解：

```text
const        只读语义
constexpr    编译期常量语义
```


## const_cast {#const-cast}

去掉或增加 const 属性：

```cpp
int value = 10;
const int* p = &value;
int* q = const_cast<int*>(p);
*q = 20;	// 合法：原对象 value 不是 const
```

但如果原对象本身真的是 const，再通过 q 修改它会导致未定义行为。

## const 成员的初始化

const 数据成员需要在初始化阶段获得值，不能在构造函数体内再赋值。构造初始化列表与 C++11 类内初始化方式见[类与初始化](/guide/objects#source-19)。
