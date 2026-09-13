# 类、构造析构与拷贝

## struct 与 class {#source-16}

struct 默认成员访问和默认继承权限为 public，class 默认为 private。两者都能定义构造函数、虚函数、模板成员和访问控制。公开数据记录可使用 struct，封装内部状态的类型可使用 class；具体权限仍可显式指定。

```cpp
struct A {
	int x;
};
```

```cpp
class A {
	int x;
};
```

## 封装 {#source-17}

private 隐藏数据成员，public 成员函数提供访问入口。设置函数可以验证输入，再更新对象状态，例如拒绝负生命值。调用者通过接口操作对象，不直接依赖私有成员的布局。

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

## 构造函数 {#source-18}

构造函数与类同名且没有返回类型，在对象初始化时执行。构造函数用于建立成员初值和取得资源；一个类可按参数列表提供多个构造函数。构造期间抛异常时，已完成构造的成员和基类会被销毁。

```cpp
class Player {
public:
	Player() {
		cout << "constructed" << endl;
	}
};
```

```cpp
Player p;
```

## 构造初始化列表 {#source-19}

构造初始化列表位于参数列表之后和函数体之前，直接初始化基类与成员。函数体内的赋值发生在成员初始化阶段之后。const 成员、引用成员和不能默认构造的成员需要获得有效初值；C++11 还可为适用的成员提供类内默认成员初始化器。

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

```cpp
Player(int h)
	: hp(h) {
}
```

## 成员初始化顺序 {#source-20}

非静态数据成员按类内声明顺序初始化，与构造初始化列表的书写顺序无关。示例中 x 先于 y 初始化，x(y) 会读取尚未初始化的 y，因而代码存在错误。成员依赖应与声明顺序一致，析构顺序与构造完成顺序相反。

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

## 析构函数 {#source-21}

析构函数写作 ~ClassName()，用于释放对象拥有的资源。自动对象离开作用域时会析构，动态对象需要正确的 delete 或所有权管理器触发析构；单纯丢失原始指针不会调用动态对象的析构函数。

```cpp
class Player {
public:
	~Player() {
		cout << "destroyed" << endl;
	}
};
```

## 拷贝构造函数 {#source-23}

拷贝构造函数通常接受 const T&，用于由已有对象初始化新对象。A b = a 是初始化，会选择拷贝构造；传递按值类参数也可能发生拷贝。自行声明拷贝构造后，若仍需无参创建对象，要显式提供默认构造函数。

```cpp
class A {
public:
	A() {}

	A(const A& other) {
		cout << "copy" << endl;
	}
};
```

```cpp
A a;
A b = a;
```

## 拷贝赋值 {#source-24}

拷贝赋值运算符 T& operator=(const T&) 修改已经存在的对象，通常返回 *this。管理资源时需正确处理旧资源、自赋值和异常。示例仅展示签名与自赋值检测；实际拥有数据的类还需复制其状态。

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

```cpp
A b = a;
```

```cpp
A b;
b = a;
```

## 浅拷贝与深拷贝 {#source-25}

默认成员复制会复制原始指针的地址，两个对象因此可能指向同一资源。若两个析构函数都释放该资源，会发生重复释放。深拷贝为目标分配独立存储并复制元素，同时还需要处理拷贝赋值；只实现拷贝构造不能解决赋值时的所有权问题。

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

```cpp
Array a;
Array b = a;
```

```cpp
Array(const Array& other) {
	data = new int[10]();

	for (int i = 0; i < 10; ++i)
		data[i] = other.data[i];
}
```

## Rule of Three {#source-26}

Rule of Three 三法则用于检查手工拥有资源的类。自行定义析构、拷贝构造或拷贝赋值之一时，需要核对另两项是否会造成浅拷贝或重复释放，可以实现相应操作，也可以禁止复制。使用标准资源管理成员时可依赖它们已有的复制和析构行为。

## friend {#source-45}

friend 声明允许指定函数或类访问当前类的非公有成员。友元函数仍是非成员函数，没有当前类的 this。友元关系不自动传递或继承，常用于需要访问内部表示的对称运算符或协作类型。

```cpp
class A {
private:
	int x;

	friend void print(const A& a);
};
```

```cpp
void print(const A& a) {
	cout << a.x << endl;
}
```

## = default {#source-106}

= default 请求编译器生成特殊成员函数的默认实现，生成结果仍可能因成员或基类限制而被删除。显式提供默认构造可用于已经声明其他构造函数、但仍需支持无参初始化的类。

```cpp
class A {
public:
	A() = default;
};
```

```cpp
A(const A&) = default;
```

## = delete {#source-107}

= delete 将函数定义为不可调用，仍会参与重载解析，选中后使程序不合法。可用于禁止复制或某些参数转换。C++98 的常见替代方式是把复制操作声明为 private 且不提供定义。

```cpp
class A {
public:
	A(const A&) = delete;
	A& operator=(const A&) = delete;
};
```

```cpp
class A {
private:
	A(const A&);
	A& operator=(const A&);
};
```

## 委托构造 {#source-108}

委托构造函数在初始化列表中调用同类的另一构造函数。委托列表只能包含该目标构造，目标完成后再执行委托构造函数体。它用于多个入口共享同一成员初始化过程。

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

## 继承构造函数 {#source-109}

using Base::Base 把基类构造函数引入派生类的构造候选。派生类自己的成员仍按相应规则初始化，不能假定基类构造参数会初始化新增成员。它适合无需逐个编写转发构造的派生类型。

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

## this 指针 {#source-150}

非静态成员函数中的 this 指向当前对象；非 const 成员函数中为 Class*，const 成员函数中为 const Class*。this 本身不是可重新赋值的局部指针变量。可使用 this-&gt;member 消除参数与成员同名时的歧义。

```cpp
class A {
	int x;

public:
	void set(int x) {
		this->x = x;
	}
};
```

## explicit {#source-158}

explicit 构造函数限制隐式转换和相应的复制初始化。Number(int) 允许 Number n = 10，经 explicit 限定后应使用 Number n(10) 等直接初始化形式。它可用于避免单参数构造函数被意外当作类型转换。

```cpp
class Number {
public:
	Number(int x) {
	}
};
```

```cpp
explicit Number(int x) {
}
```

```cpp
Number n(10);
```
