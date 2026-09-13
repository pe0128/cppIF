# 函数、重载与 inline

## 概括要点

- 重载是同一作用域中同名、参数列表不同；重写针对基类虚函数；隐藏发生于派生类的同名声明。
- 普通函数不能仅靠返回类型区分重载；默认实参在调用点按静态类型解析，与虚函数动态派发分开。
- inline 不保证调用展开；其重要作用是允许满足 ODR 条件的相同定义出现在多个翻译单元。
- 宏是预处理替换，可能重复求值；函数提供类型检查与作用域规则。
- 运算符重载应保持直观语义；前置 ++ 通常返回引用，后置 ++ 用 int 占位参数区分并返回旧值。

## inline {#source-12}

```cpp
inline int add(int a, int b) {
	return a + b;
}
```

传统意义：

> 建议编译器将函数代码展开到调用处。

例如：

```cpp
int x = add(1, 2);
```

可能优化成：

```cpp
int x = 1 + 2;
```

但 `inline` 只是建议。

现代 C++ 中它还有非常重要的 ODR 语义作用：

> 允许满足 ODR 条件的相同 inline 函数定义出现在多个翻译单元中；不能随意提供不同实现。

因此类内定义的成员函数隐式 inline。

```cpp
class A {
public:
	int get() {
		return 10;
	}
};
```


## 宏 vs inline {#source-13}

宏：

```cpp
#define MAX(a, b) ((a) > (b) ? (a) : (b))
```

缺点：

```text
无类型检查
可能重复求值
调试困难
作用域控制差
```

inline 函数：

```cpp
inline int maxValue(int a, int b) {
	return a > b ? a : b;
}
```

一般更加安全。


## 函数重载、重写、隐藏 {#source-42}

三个特别容易混。

重载 overload：

```cpp
void func(int x);
void func(double x);
```

同一作用域，同名，参数不同。

重写 override：

```cpp
class Base {
public:
	virtual void func();
};

class Derived : public Base {
public:
	void func();
};
```

派生类覆盖虚函数。

隐藏 name hiding：

```cpp
class Base {
public:
	void func(int);
};

class Derived : public Base {
public:
	void func(double);
};
```

`Derived::func` 会隐藏 Base 中同名函数。

可以：

```cpp
using Base::func;
```

重新引入。


## 运算符重载 {#source-46}

```cpp
class Vec2 {
public:
	float x;
	float y;

	Vec2 operator+(const Vec2& other) const {
		Vec2 result;

		result.x = x + other.x;
		result.y = y + other.y;

		return result;
	}
};
```

于是：

```cpp
Vec2 c = a + b;
```


## 前置 ++ 和后置 ++ {#source-47}

经典题：

```cpp
class Counter {
public:
	Counter& operator++() {
		++value;
		return *this;
	}

	Counter operator++(int) {
		Counter temp(*this);
		++value;
		return temp;
	}

private:
	int value;
};
```

区别通过：

```cpp
operator++()
operator++(int)
```

这个假的 `int` 参数只是用于区分后置版本。


## 普通函数能根据返回值重载吗？ {#source-148}

不能。

```cpp
int func();
double func();
```

非法。

因为：

```cpp
func();
```

仅根据调用表达式无法决定调用哪个。

重载主要由：

```text
函数名 + 参数列表
```

进行解析。


## 默认参数属于哪里？ {#source-149}

```cpp
void func(int x = 10);
```

默认实参在：

```text
调用点
```

由编译器决定。

因此 virtual 函数的：

```text
virtual dispatch
```

与默认参数的：

```text
静态解析
```

不是同一套机制。

这是一个经典坑。
