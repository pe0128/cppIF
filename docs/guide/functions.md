# 函数、重载与 inline

## inline {#source-12}

inline 函数允许满足 ODR 单一定义规则的相同定义出现在多个翻译单元中，定义必须满足相同记号序列和名称查找等要求。类内定义的成员函数在此处讨论的 C++98 和 C++11 中隐式 inline。编译器是否展开调用由优化决定，不能由 inline 关键字保证。

```cpp
inline int add(int a, int b) {
	return a + b;
}
```

```cpp
class A {
public:
	int get() {
		return 10;
	}
};
```

## 宏 vs inline {#source-13}

函数式宏进行预处理记号替换，不执行函数参数的类型检查；同一个参数在宏体中出现多次时，带副作用的实参可能被多次求值。inline 函数按函数调用规则处理参数，用于需要类型检查和作用域控制的短函数。

```cpp
#define MAX(a, b) ((a) > (b) ? (a) : (b))
```

```cpp
inline int maxValue(int a, int b) {
	return a > b ? a : b;
}
```

## 函数重载、重写、隐藏 {#source-42}

重载是在同一作用域声明同名但参数列表不同的函数；重写是派生类为基类虚函数提供匹配实现；隐藏是派生类的同名声明遮蔽基类同名成员。using Base::func 可以把被隐藏的基类重载集重新引入派生类作用域。

```cpp
void func(int x);
void func(double x);
```

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

```cpp
using Base::func;
```

## 运算符重载 {#source-46}

operator+ 等重载为自定义类型提供运算符调用。至少一个操作数需要是类或枚举类型，不能改变运算符优先级和结合性。示例返回新的 Vec2，不修改两个操作数，适用于向量等值类型。

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

```cpp
Vec2 c = a + b;
```

## 前置 ++ 和后置 ++ {#source-47}

前置 operator++() 通常修改对象并返回自身引用；后置 operator++(int) 的 int 形参用于区分签名，通常返回修改前的值副本。实现后置版本时可先保存旧值，再递增当前对象。

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

## 普通函数能根据返回值重载吗？ {#source-148}

普通函数不能只靠返回类型形成重载。int func() 和 double func() 的参数列表相同，这种声明不合法；调用表达式的预期结果类型不能用于选择这种重载。

```cpp
int func();
double func();
```

## 默认参数属于哪里？ {#source-149}

默认实参在调用点根据可见声明和静态类型确定。虚函数实现则由动态派发决定，因此经基类指针调用虚函数时，可能使用基类声明的默认实参执行派生类实现。

```cpp
void func(int x = 10);
```
