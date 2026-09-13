# 类、构造析构与拷贝

## 概括要点

- struct 与 class 的主要区别是默认成员访问和默认继承权限；封装通过接口维护对象不变量，friend 提供特定访问权限。
- 初始化列表直接初始化成员；成员按声明顺序初始化，析构按构造完成的逆序进行。
- 拷贝构造创建新对象，拷贝赋值修改已有对象；拥有原始资源的类必须避免浅拷贝造成重复释放。
- Rule of Three 要一起考虑析构、拷贝构造和拷贝赋值；C++11 的移动操作与 Rule of Five 见移动语义章。
- = default 请求默认实现，= delete 禁止操作；委托构造复用初始化，继承构造引入基类构造函数。
- this 表示当前对象；explicit 限制意外隐式转换。

## struct 与 class {#source-16}

核心区别只有默认访问权限和默认继承权限。

```cpp
struct A {
	int x;
};
```

默认：

```cpp
public
```

而：

```cpp
class A {
	int x;
};
```

默认：

```cpp
private
```

继承同理。

```cpp
struct B : A
```

默认 public 继承。

```cpp
class B : A
```

默认 private 继承。

底层能力没有本质区别。


## 封装 {#source-17}

```cpp
class Player {
private:
	int hp;

public:
	void setHP(int value) {
		if (value >= 0)
			hp = value;
	}

	int getHP() const {
		return hp;
	}
};
```

核心思想：

```text
隐藏实现
暴露接口
维护对象不变量
降低模块耦合
```


## 构造函数 {#source-18}

```cpp
class Player {
public:
	Player() {
		cout << "constructed" << endl;
	}
};
```

对象创建：

```cpp
Player p;
```

自动调用。


## 构造初始化列表 {#source-19}

强烈推荐。

```cpp
class Player {
private:
	int hp;
	int mp;

public:
	Player(int h, int m)
		: hp(h), mp(m) {
	}
};
```

区别在于：

```cpp
Player(int h) {
	hp = h;
}
```

进入构造函数体前，成员已经经过初始化阶段。此处内置类型 hp 的默认初始化没有赋予确定值，随后才在函数体中赋值；类类型成员则可能先调用默认构造。

初始化列表：

```cpp
Player(int h)
	: hp(h) {
}
```

直接初始化。

对于：

```text
const 成员
引用成员
没有默认构造函数的成员
```

在 C++98 中通常需要通过构造初始化列表初始化；C++11 也可以为适用的成员提供类内默认成员初始化器。


## 成员初始化顺序 {#source-20}

极高频坑。

```cpp
class A {
	int x;
	int y;

public:
	A()
		: y(10), x(y) {
	}
};
```

初始化顺序看：

```cpp
int x;
int y;
```

声明顺序。

不是初始化列表顺序。

实际：

```text
先 x
再 y
```

所以这种代码有问题。


## 析构函数 {#source-21}

```cpp
class Player {
public:
	~Player() {
		cout << "destroyed" << endl;
	}
};
```

对象生命周期结束自动调用。

典型用途：

```text
释放动态内存
关闭文件
释放锁
释放 socket
释放 GPU/系统资源
```


## 拷贝构造函数 {#source-23}

```cpp
class A {
public:
	A() {}

	A(const A& other) {
		cout << "copy" << endl;
	}
};
```

典型触发：

```cpp
A a;
A b = a;
```

或者：

```cpp
void func(A x);

func(a);
```

可能发生拷贝。


## 拷贝赋值 {#source-24}

```cpp
class A {
public:
	A& operator=(const A& other) {
		if (this == &other)
			return *this;

		return *this;
	}
};
```

区别：

```cpp
A b = a;
```

这是初始化，调用拷贝构造。

```cpp
A b;
b = a;
```

这是赋值，调用 `operator=`。


## 浅拷贝与深拷贝 {#source-25}

例如：

```cpp
class Array {
public:
	int* data;

	Array() {
		data = new int[10]();
	}

	~Array() {
		delete[] data;
	}
};
```

默认拷贝：

```cpp
Array a;
Array b = a;
```

会产生：

```text
a.data ──┐
         ├── 同一块内存
b.data ──┘
```

最后：

```text
a 析构 delete[]
b 析构又 delete[]
```

导致 double free。

因此需要深拷贝。

```cpp
Array(const Array& other) {
	data = new int[10]();

	for (int i = 0; i < 10; ++i)
		data[i] = other.data[i];
}
```


深拷贝构造只解决新对象的复制，还需实现安全的拷贝赋值或明确禁止它；完整资源管理优先采用标准容器。

## Rule of Three {#source-26}

C++98 重要八股。

如果一个类需要自己定义：

```text
析构函数
拷贝构造函数
拷贝赋值运算符
```

通常三个都应该考虑实现。

即：

```text
Rule of Three
```

原因通常是：

> 类管理了资源。

C++11 扩展成 Rule of Five，后面讲。


## friend {#source-45}

```cpp
class A {
private:
	int x;

	friend void print(const A& a);
};
```

friend 函数可以访问 private。

```cpp
void print(const A& a) {
	cout << a.x << endl;
}
```

友元破坏一定封装性，应谨慎使用。


## = default {#source-106}

```cpp
class A {
public:
	A() = default;
};
```

明确要求编译器生成默认实现。

例如：

```cpp
A(const A&) = default;
```


## = delete {#source-107}

```cpp
class A {
public:
	A(const A&) = delete;
	A& operator=(const A&) = delete;
};
```

禁止拷贝。

这是 C++11 更清晰的不可复制类写法。

C++98 常用：

```cpp
class A {
private:
	A(const A&);
	A& operator=(const A&);
};
```

声明 private 且不实现。


## 委托构造 {#source-108}

C++11：

```cpp
class Player {
public:
	Player()
		: Player(100, 50) {
	}

	Player(int hp, int mp)
		: hp(hp), mp(mp) {
	}

private:
	int hp;
	int mp;
};
```

减少重复初始化逻辑。


## 继承构造函数 {#source-109}

C++11：

```cpp
class Base {
public:
	Base(int x) {
	}
};

class Derived : public Base {
public:
	using Base::Base;
};
```

于是：

```cpp
Derived d(10);
```


## this 指针 {#source-150}

```cpp
class A {
	int x;

public:
	void set(int x) {
		this->x = x;
	}
};
```

普通成员函数隐含一个：

```text
this
```

大体理解：

```cpp
// 非 const 成员函数中 this 的类型是 A*
```

在 const 成员函数中类似：

```cpp
// const 成员函数中 this 的类型是 const A*
```


this 是指针表达式，不能对 this 本身赋值；不要把上述类型说明当成名为 this 的局部变量声明。

## explicit {#source-158}

```cpp
class Number {
public:
	Number(int x) {
	}
};
```

那么：

```cpp
Number n = 10;
```

允许通过隐式转换构造。

加入：

```cpp
explicit Number(int x) {
}
```

那么：

```cpp
Number n = 10;
```

不允许。

需要：

```cpp
Number n(10);
```

用来避免意外隐式类型转换。

这是 C++98 就有的关键字。
