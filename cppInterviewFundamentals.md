# C++98 / C++11 常见知识点、特性与面试八股

这份文档可以直接作为「C++98/03 + C++11 核心知识地图 + 面试八股速查」。重点区分传统 C++ 已有内容与 C++11 新增特性。

---

# 一、先建立 C++98 → C++11 的总体框架

C++98 已经具备现代 C++ 的基本骨架：

```text
C++98
├── 基本语法
├── 指针 / 引用
├── const / static / inline
├── struct / class
├── 封装 / 继承 / 多态
├── 构造 / 析构 / 拷贝
├── 运算符重载
├── 模板
├── 异常
├── RTTI
├── STL
│   ├── vector
│   ├── list
│   ├── deque
│   ├── map/set
│   ├── stack/queue
│   ├── iterator
│   └── algorithm
└── RAII
```

C++11 的主要目标可以概括成：

```text
让 C++ 更安全
让 C++ 更高效
让模板更强
让并发进入标准库
让代码更容易写
```

于是加入：

```text
C++11
├── auto / decltype
├── nullptr
├── 范围 for
├── initializer_list
├── lambda
├── 右值引用 &&
├── move
├── perfect forwarding
├── unique_ptr / shared_ptr / weak_ptr
├── constexpr
├── enum class
├── override / final
├── =default / =delete
├── 可变参数模板
├── type_traits
├── tuple / array
├── unordered_map / unordered_set
├── emplace
└── thread / mutex / atomic / condition_variable
```

下面正式展开。

---

# 二、C++98 基础语言部分

## 1. 指针

指针保存的是地址。

```cpp
int a = 10;
int* p = &a;

cout << *p << endl;
```

这里：

```text
a	对象
&a	a 的地址
p	保存 a 地址的指针
*p	p 指向的对象
```

修改：

```cpp
*p = 20;
```

等价于：

```cpp
a = 20;
```

### 指针可以为空

```cpp
int* p = NULL;
```

C++11 应写：

```cpp
int* p = nullptr;
```

---

# 三、引用

引用可以理解成对象的别名。

```cpp
int a = 10;
int& ref = a;

ref = 20;

cout << a << endl;
```

输出：

```text
20
```

引用必须初始化：

```cpp
int& ref = a;
```

不能：

```cpp
int& ref;	// 错误
```

---

# 四、经典八股：指针和引用的区别

这是极高频问题。

| 指针 | 引用 |
|---|---|
| 保存地址 | 是对象别名 |
| 可以为空 | 正常引用不能为空 |
| 可以改变指向 | 初始化后绑定关系不能改变 |
| 需要 `*p` 解引用 | 直接像对象一样使用 |
| `sizeof(p)` 是地址大小 | `sizeof(ref)` 通常是对象大小 |
| 可以有多级指针 | 不存在普通意义上的引用的引用 |

例如：

```cpp
int a = 10;
int b = 20;

int* p = &a;
p = &b;
```

指针改成指向 `b`。

而：

```cpp
int& r = a;
r = b;
```

这里不是让 `r` 引用 `b`。

实际上是：

```cpp
a = b;
```

---

# 五、值传递、指针传递、引用传递

值传递：

```cpp
void add(int x) {
	x++;
}
```

不会修改外部对象。

引用传递：

```cpp
void add(int& x) {
	x++;
}
```

会修改。

指针传递：

```cpp
void add(int* x) {
	(*x)++;
}
```

调用：

```cpp
int a = 10;

add(a);
add(&a);
```

现代 C++ 通常优先：

```cpp
void func(const T& obj);
```

对于大对象避免复制。

---

# 六、const

`const` 是 C++ 极其重要的知识点。

## 1. const 变量

```cpp
const int x = 10;
```

不能修改：

```cpp
x = 20;	// error
```

## 2. const 与指针

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

---

# 七、const 成员函数

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

> 这个函数承诺不会修改对象状态。

底层可以近似理解成：

```cpp
const Player* this;
```

因此不能：

```cpp
int getHP() const {
	hp = 100;	// error
	return hp;
}
```

---

# 八、const 函数重载

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

---

# 九、static

static 是高频中的高频。

## 1. 函数内部 static

```cpp
void func() {
	static int count = 0;

	count++;

	cout << count << endl;
}
```

调用：

```cpp
func();
func();
func();
```

输出：

```text
1
2
3
```

它拥有：

```text
局部作用域
静态存储期
```

程序开始到结束期间一直存在。

---

# 十、static 类成员

```cpp
class Player {
public:
	static int count;
};

int Player::count = 0;
```

这个成员属于：

```text
整个类
```

所有对象共享。

```cpp
Player a;
Player b;

Player::count = 10;
```

---

# 十一、static 成员函数

```cpp
class Player {
public:
	static void printCount() {
		cout << count << endl;
	}

	static int count;
};
```

调用：

```cpp
Player::printCount();
```

static 成员函数没有普通对象的：

```cpp
this
```

因此不能直接访问非 static 成员。

---

# 十二、inline

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

> 允许函数定义出现在多个翻译单元中。

因此类内定义的成员函数隐式 inline。

```cpp
class A {
public:
	int get() {
		return 10;
	}
};
```

---

# 十三、宏 vs inline

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

---

# 十四、作用域

C++ 常见作用域：

```text
全局作用域
命名空间作用域
类作用域
函数作用域
代码块作用域
```

例如：

```cpp
int x = 10;

void func() {
	int x = 20;

	{
		int x = 30;
		cout << x;
	}
}
```

输出：

```text
30
```

最近作用域优先。

---

# 十五、namespace

```cpp
namespace Game {
	class Player {
	};
}
```

使用：

```cpp
Game::Player player;
```

或者：

```cpp
using namespace Game;
```

头文件一般不推荐：

```cpp
using namespace std;
```

因为会污染使用这个头文件的所有翻译单元。

---

# 十六、struct 与 class

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

---

# 十七、封装

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

---

# 十八、构造函数

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

---

# 十九、构造初始化列表

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

这里 `hp` 已经先被构造，然后赋值。

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

必须用初始化列表。

---

# 二十、成员初始化顺序

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

---

# 二十一、析构函数

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

---

# 二十二、RAII

这是 C++ 核心思想之一。

RAII：

```text
Resource Acquisition Is Initialization
资源获取即初始化
```

把资源生命周期绑定到对象生命周期。

例如：

```cpp
class File {
private:
	FILE* file;

public:
	File(const char* path) {
		file = fopen(path, "r");
	}

	~File() {
		if (file)
			fclose(file);
	}
};
```

于是：

```cpp
void func() {
	File file("a.txt");
}
```

离开作用域时自动释放。

现代 C++ 的：

```text
vector
string
unique_ptr
shared_ptr
lock_guard
fstream
```

都大量利用 RAII。

---

# 二十三、拷贝构造函数

```cpp
class A {
public:
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

---

# 二十四、拷贝赋值

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

---

# 二十五、浅拷贝与深拷贝

例如：

```cpp
class Array {
public:
	int* data;

	Array() {
		data = new int[10];
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
	data = new int[10];

	for (int i = 0; i < 10; ++i)
		data[i] = other.data[i];
}
```

---

# 二十六、Rule of Three

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

---

# 二十七、new / delete

```cpp
int* p = new int(10);

delete p;
```

数组：

```cpp
int* arr = new int[100];

delete[] arr;
```

必须配对：

```text
new      → delete
new[]    → delete[]
```

---

# 二十八、new 和 malloc 区别

极高频八股。

`malloc`：

```cpp
A* p = static_cast<A*>(malloc(sizeof(A)));
```

只分配原始内存。

不会调用构造函数。

`new`：

```cpp
A* p = new A();
```

会：

```text
1. 分配内存
2. 调用构造函数
```

delete：

```text
1. 调用析构函数
2. 释放内存
```

free：

```text
只释放内存
```

此外：

```text
malloc 失败返回 NULL
普通 new 失败默认抛 std::bad_alloc
```

---

# 二十九、栈和堆

典型：

```cpp
void func() {
	int a = 10;
	int* p = new int(20);

	delete p;
}
```

这里一般：

```text
a            自动存储期对象
p            自动存储期指针对象
new int      动态存储期对象
```

传统八股会说“栈和堆”，但标准 C++ 更准确地讨论：

```text
automatic storage duration
dynamic storage duration
static storage duration
thread storage duration（C++11）
```

---

# 三十、继承

```cpp
class Animal {
public:
	void eat() {
	}
};

class Dog : public Animal {
};
```

Dog 拥有 Animal 的 public/protected 接口。

---

# 三十一、访问权限

```text
public
protected
private
```

`public`：

所有地方可访问。

`protected`：

本类 + 子类可访问。

`private`：

本类及友元可访问。

---

# 三十二、public / protected / private 继承

最常见：

```cpp
class Dog : public Animal
```

public 继承表达：

```text
Dog is an Animal
```

即：

```text
is-a
```

private 继承更接近：

```text
implemented-in-terms-of
```

实际工程中组合往往比 private 继承更清晰。

---

# 三十三、虚函数

```cpp
class Animal {
public:
	virtual void speak() {
		cout << "Animal" << endl;
	}
};

class Dog : public Animal {
public:
	void speak() {
		cout << "Dog" << endl;
	}
};
```

然后：

```cpp
Animal* p = new Dog();

p->speak();
```

输出：

```text
Dog
```

这就是运行时多态。

---

# 三十四、静态绑定和动态绑定

非 virtual：

```cpp
p->func();
```

通常编译期确定调用对象。

称：

```text
静态绑定
```

virtual：

```cpp
p->virtualFunc();
```

根据运行时真实对象类型决定。

称：

```text
动态绑定
```

---

# 三十五、虚函数表

常见实现：

```text
对象
┌─────────────┐
│ vptr        │
├─────────────┤
│ data...     │
└─────────────┘
      │
      ↓
virtual table
┌──────────────┐
│ Animal::foo  │
│ Dog::bar     │
└──────────────┘
```

对象中的：

```text
vptr
```

指向：

```text
vtable
```

调用 virtual 函数时通过表找到实际函数。

需要注意：

> C++ 标准并没有规定必须通过 vptr/vtable 实现，这是主流编译器的典型实现方式。

---

# 三十六、为什么析构函数经常需要 virtual？

看：

```cpp
class Animal {
public:
	~Animal() {
		cout << "Animal" << endl;
	}
};

class Dog : public Animal {
public:
	~Dog() {
		cout << "Dog" << endl;
	}
};
```

然后：

```cpp
Animal* p = new Dog();
delete p;
```

如果基类析构函数不是 virtual，通过基类指针删除派生对象会产生未定义行为。

正确：

```cpp
class Animal {
public:
	virtual ~Animal() {
	}
};
```

面试直接回答：

> 只要一个类可能通过基类指针被多态删除，其析构函数就应该是 virtual。

---

# 三十七、纯虚函数

```cpp
class Shape {
public:
	virtual double area() const = 0;
};
```

含有纯虚函数的类属于抽象类。

不能：

```cpp
Shape s;
```

可以：

```cpp
Shape* s = new Circle();
```

---

# 三十八、虚析构函数可以是纯虚函数吗？

可以。

```cpp
class Base {
public:
	virtual ~Base() = 0;
};

Base::~Base() {
}
```

即使纯虚析构函数，也必须提供定义，因为派生类析构时仍会调用基类析构函数。

这是经典面试题。

---

# 三十九、构造函数能不能是 virtual？

不能。

因为构造对象时：

```text
对象自身类型已经由 new / 声明确定
```

对象尚未完整构造，也不存在通过虚机制决定“该调用哪种构造函数”的合理语义。

---

# 四十、析构函数为什么能是 virtual？

因为我们经常：

```cpp
Base* p = new Derived();

delete p;
```

此时运行时需要知道真正对象是：

```text
Derived
```

从而先执行：

```text
Derived::~Derived()
Base::~Base()
```

---

# 四十一、构造/析构期间调用虚函数

非常经典。

```cpp
class Base {
public:
	Base() {
		func();
	}

	virtual void func() {
		cout << "Base" << endl;
	}
};
```

即使实际对象最终是 Derived，在 Base 构造期间：

```cpp
func()
```

调用 Base 版本。

因为此时 Derived 部分尚未构造完成。

析构期间同理。

---

# 四十二、函数重载、重写、隐藏

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

---

# 四十三、对象切片

```cpp
class Base {
};

class Derived : public Base {
public:
	int extra;
};

Derived d;
Base b = d;
```

`Derived` 特有部分被丢弃。

这叫：

```text
object slicing
```

因此多态通常使用：

```cpp
Base*
Base&
```

而不是：

```cpp
Base
```

按值保存。

---

# 四十四、多继承与菱形继承

```text
    A
   / \
  B   C
   \ /
    D
```

普通继承：

```cpp
class B : public A {};
class C : public A {};
class D : public B, public C {};
```

D 内部会有：

```text
两个 A 子对象
```

造成歧义。

解决：

```cpp
class B : virtual public A {};
class C : virtual public A {};
```

叫：

```text
虚继承
```

D 中只保留一个共享 A 子对象。

注意这里的 `virtual inheritance` 和 `virtual function` 是两套不同机制。

---

# 四十五、friend

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

---

# 四十六、运算符重载

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

---

# 四十七、前置 ++ 和后置 ++

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

---

# 四十八、模板

函数模板：

```cpp
template<typename T>
T maxValue(T a, T b) {
	return a > b ? a : b;
}
```

调用：

```cpp
maxValue(10, 20);
maxValue(1.5, 2.5);
```

编译器根据类型实例化。

---

# 四十九、类模板

```cpp
template<typename T>
class Box {
private:
	T value;

public:
	Box(const T& v)
		: value(v) {
	}

	T get() const {
		return value;
	}
};
```

使用：

```cpp
Box<int> box(10);
```

---

# 五十、模板为什么通常写在头文件里？

因为模板只有在：

```text
实例化时
```

编译器才产生具体代码。

例如：

```cpp
Box<int>
```

编译器需要看到完整模板定义。

如果模板实现只写在另一个 `.cpp` 中，当前翻译单元可能看不到定义，最终出现链接问题。

---

# 五十一、typename 和 class

模板参数：

```cpp
template<typename T>
```

与：

```cpp
template<class T>
```

这里基本等价。

但是 `typename` 还有一个重要用途。

例如：

```cpp
template<typename T>
void func() {
	typename T::value_type x;
}
```

告诉编译器：

```text
T::value_type 是一个类型
```

---

# 五十二、异常

```cpp
try {
	throw runtime_error("error");
}
catch (const exception& e) {
	cout << e.what() << endl;
}
```

基本结构：

```text
try
throw
catch
```

通常推荐：

```cpp
catch (const std::exception& e)
```

通过 const 引用接收。

---

# 五十三、RTTI

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

---

# 五十四、四种 cast

C++ 八股必考。

### static_cast

正常类型转换：

```cpp
double x = 10.5;
int y = static_cast<int>(x);
```

以及部分继承体系转换。

### dynamic_cast

运行时安全检查：

```cpp
Derived* d = dynamic_cast<Derived*>(base);
```

失败：

```text
指针 → nullptr
引用 → std::bad_cast
```

### const_cast

去掉或增加 const 属性：

```cpp
const int* p;
int* q = const_cast<int*>(p);
```

但如果原对象本身真的是 const，再通过 q 修改它会导致未定义行为。

### reinterpret_cast

底层位/地址解释：

```cpp
long address = reinterpret_cast<long>(p);
```

非常危险，一般用于底层系统编程。

---

# 五十五、C 风格 cast 为什么不推荐？

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

---

# 五十六、STL 总体结构

STL 可以记成：

```text
Containers
Iterators
Algorithms
Function Objects
Allocators
```

核心思想：

```text
Container ← Iterator → Algorithm
```

算法不关心具体容器，只操作迭代器。

---

# 五十七、vector

最常用。

```cpp
vector<int> nums;

nums.push_back(10);
nums.push_back(20);

cout << nums[0];
```

内部通常：

```text
连续内存
```

因此支持：

```cpp
nums[i]
```

O(1)。

---

# 五十八、vector 的 size 和 capacity

```cpp
cout << v.size();
cout << v.capacity();
```

`size`：

```text
当前元素数量
```

`capacity`：

```text
当前已经分配、无需重新申请内存即可容纳的元素数量
```

---

# 五十九、vector 扩容

假设：

```text
capacity = 4
```

然后继续 push_back。

空间不够时通常：

```text
申请更大的连续内存
移动/拷贝旧元素
释放旧内存
```

增长比例属于实现细节。

常见：

```text
1.5 倍
2 倍
```

不能说 C++ 标准规定必须 2 倍。

---

# 六十、为什么 vector push_back 平均 O(1)？

普通 push：

```text
O(1)
```

扩容：

```text
O(n)
```

但扩容不是每次发生。

因此摊还复杂度：

```text
amortized O(1)
```

---

# 六十一、reserve 和 resize

```cpp
v.reserve(100);
```

改变：

```text
capacity
```

通常不改变 size。

```cpp
v.resize(100);
```

改变：

```text
size
```

需要实际构造元素。

极高频区别。

---

# 六十二、vector 迭代器失效

发生扩容时：

```text
所有指向原存储区域的
pointer
reference
iterator
```

都会失效。

例如：

```cpp
vector<int> v;

v.push_back(1);

int* p = &v[0];

v.push_back(2);
v.push_back(3);
v.push_back(4);

cout << *p;
```

如果期间发生扩容，`p` 已经悬空。

---

# 六十三、list

```cpp
list<int> l;

l.push_back(10);
l.push_front(20);
```

通常是双向链表。

特点：

```text
插入删除 O(1)
随机访问 O(n)
没有 operator[]
节点分散
迭代器稳定性较好
```

---

# 六十四、deque

双端队列：

```cpp
deque<int> d;

d.push_back(1);
d.push_front(2);
```

特点：

```text
两端插入删除高效
支持随机访问
不是一整块连续内存
```

通常通过分段连续内存实现。

---

# 六十五、vector / list / deque 对比

| 容器 | 随机访问 | 中间插入 | 尾插 | 内存 |
|---|---:|---:|---:|---|
| vector | O(1) | O(n) | 摊还 O(1) | 连续 |
| list | O(n) | O(1) | O(1) | 节点 |
| deque | O(1) | O(n) | O(1) | 分段 |

实际工程中默认优先考虑：

```cpp
vector
```

因为缓存局部性很好。

不要因为 list 理论插入 O(1) 就默认认为它更快。

---

# 六十六、map

```cpp
map<string, int> scores;

scores["Alice"] = 100;
scores["Bob"] = 90;
```

C++98 `map` 通常通过红黑树实现。

标准只规定复杂度和行为，不强制必须红黑树。

常见复杂度：

```text
find    O(log n)
insert  O(log n)
erase   O(log n)
```

而且 key 有序。

---

# 六十七、set

```cpp
set<int> s;

s.insert(3);
s.insert(1);
s.insert(3);
```

最终：

```text
1
3
```

特点：

```text
唯一元素
自动排序
通常平衡搜索树
```

---

# 六十八、multimap / multiset

允许重复 key：

```cpp
multiset<int> s;

s.insert(1);
s.insert(1);
```

---

# 六十九、stack / queue / priority_queue

stack：

```cpp
stack<int> s;

s.push(1);
s.push(2);

s.pop();
```

LIFO。

queue：

```cpp
queue<int> q;

q.push(1);
q.push(2);

q.pop();
```

FIFO。

priority_queue：

```cpp
priority_queue<int> q;

q.push(1);
q.push(10);
q.push(5);

cout << q.top();
```

输出：

```text
10
```

通常底层：

```text
vector + heap
```

---

# 七十、迭代器

```cpp
vector<int>::iterator it;

for (it = v.begin(); it != v.end(); ++it) {
	cout << *it << endl;
}
```

迭代器提供：

```text
容器与算法之间的统一接口
```

---

# 七十一、五类经典迭代器

传统分类：

```text
Input Iterator
Output Iterator
Forward Iterator
Bidirectional Iterator
Random Access Iterator
```

例如：

```text
vector      Random Access
deque       Random Access
list        Bidirectional
map/set     Bidirectional
```

所以：

```cpp
sort(v.begin(), v.end());
```

可以。

但是：

```cpp
sort(list.begin(), list.end());
```

不行。

因为 `std::sort` 要求随机访问迭代器。

`list` 自己提供：

```cpp
list.sort();
```

---

# 七十二、STL algorithm

```cpp
sort(v.begin(), v.end());

find(v.begin(), v.end(), 10);

reverse(v.begin(), v.end());
```

经典思想：

```text
algorithm 操作 iterator range
```

通常采用：

```text
[first, last)
```

左闭右开区间。

---

# 七十三、仿函数

C++98 没有 lambda 时大量使用。

```cpp
struct Compare {
	bool operator()(int a, int b) const {
		return a > b;
	}
};
```

然后：

```cpp
sort(v.begin(), v.end(), Compare());
```

这种对象叫：

```text
function object
functor
```

---

# 七十四、为什么 STL 经常使用仿函数而不是函数指针？

仿函数可以：

```text
拥有状态
被模板内联
提供类型信息
编译器优化空间更大
```

C++11 lambda 本质上也会生成类似匿名函数对象。

---

# 七十五、C++11：auto

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

---

# 七十六、auto 的 const / 引用丢失问题

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

---

# 七十七、decltype

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

---

# 七十八、nullptr

C++98：

```cpp
void func(int);
void func(char*);

func(NULL);
```

可能发生歧义，因为 NULL 常被实现成整数 `0`。

C++11：

```cpp
func(nullptr);
```

`nullptr` 有自己的类型：

```cpp
std::nullptr_t
```

能安全表示空指针。

---

# 七十九、范围 for

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

---

# 八十、初始化列表

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

---

# 八十一、窄化转换检查

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

---

# 八十二、lambda

```cpp
auto add = [](int a, int b) {
	return a + b;
};

cout << add(1, 2);
```

基本形式：

```cpp
[capture](parameters) -> return_type {
	body
}
```

---

# 八十三、lambda 捕获

```cpp
int x = 10;

auto f = [x]() {
	cout << x;
};
```

值捕获。

引用捕获：

```cpp
auto f = [&x]() {
	x++;
};
```

全部值捕获：

```cpp
[=]
```

全部引用捕获：

```cpp
[&]
```

混合：

```cpp
[=, &x]
[&, x]
```

---

# 八十四、lambda 底层是什么？

编译器大体会生成匿名类。

例如：

```cpp
int x = 10;

auto f = [x](int y) {
	return x + y;
};
```

概念上类似：

```cpp
class Anonymous {
private:
	int x;

public:
	Anonymous(int x)
		: x(x) {
	}

	int operator()(int y) const {
		return x + y;
	}
};
```

所以 lambda 本质可以理解成：

> 编译器自动生成的函数对象。

---

# 八十五、左值和右值

这是理解 C++11 的关键。

简单理解：

左值：

```text
有稳定身份，可以取得其地址的对象表达式
```

例如：

```cpp
int x = 10;

x
```

右值典型：

```cpp
10
x + 1
string("hello")
```

现代 C++ 更严格地分：

```text
lvalue
xvalue
prvalue
```

但入门阶段先掌握：

```text
左值：有持续身份
右值：临时值/即将消亡对象
```

---

# 八十六、右值引用

C++11：

```cpp
int&& r = 10;
```

`&&` 可以绑定右值。

```cpp
int& r = 10;
```

不行。

但：

```cpp
const int& r = 10;
```

可以。

---

# 八十七、移动语义

这是 C++11 最核心的特性之一。

假设：

```cpp
class Buffer {
private:
	int* data;

public:
	Buffer()
		: data(new int[1000000]) {
	}

	~Buffer() {
		delete[] data;
	}
};
```

复制一个 Buffer：

```text
申请新内存
复制 100 万个 int
```

很慢。

但如果来源是马上要销毁的临时对象：

```cpp
Buffer b = createBuffer();
```

可以直接：

```text
偷走 data 指针
```

这就是移动。

---

# 八十八、移动构造函数

```cpp
class Buffer {
private:
	int* data;

public:
	Buffer()
		: data(new int[100]) {
	}

	Buffer(Buffer&& other)
		: data(other.data) {
		other.data = nullptr;
	}

	~Buffer() {
		delete[] data;
	}
};
```

核心：

```text
拿走资源
让原对象进入有效但资源为空的状态
```

---

# 八十九、移动赋值

```cpp
Buffer& operator=(Buffer&& other) {
	if (this == &other)
		return *this;

	delete[] data;

	data = other.data;
	other.data = nullptr;

	return *this;
}
```

---

# 九十、Rule of Five

C++11：

如果管理资源，应考虑：

```text
析构函数
拷贝构造函数
拷贝赋值运算符
移动构造函数
移动赋值运算符
```

因此叫：

```text
Rule of Five
```

现代 C++ 更希望：

```text
Rule of Zero
```

也就是把资源交给：

```text
vector
string
unique_ptr
```

等 RAII 类型管理，自己一个都不用写。

---

# 九十一、std::move

```cpp
Buffer a;

Buffer b = std::move(a);
```

关键八股：

> `std::move` 本身并不移动任何东西。

它本质上主要是：

```text
把表达式转换成右值类别
```

从而允许调用：

```cpp
Buffer(Buffer&&)
```

实际资源转移由移动构造/移动赋值完成。

---

# 九十二、被 move 后的对象还能不能用？

可以继续：

```text
析构
重新赋值
调用满足其当前状态前提的操作
```

标准通常保证对象处于：

```text
valid but unspecified state
```

也就是：

```text
有效
但具体值不确定
```

不要依赖 move 后原有内容。

---

# 九十三、一个重要问题：右值引用变量本身是左值

```cpp
void func(int&& x) {
	// x 的类型是 int&&
	// 但是表达式 x 本身是左值
}
```

这是理解 perfect forwarding 的关键。

因为：

```text
变量一旦有名字，就拥有身份。
```

---

# 九十四、std::forward 与完美转发

```cpp
template<typename T>
void wrapper(T&& value) {
	func(std::forward<T>(value));
}
```

作用：

> 保留调用者原来的值类别。

如果传：

```cpp
int x;

wrapper(x);
```

继续作为左值。

如果：

```cpp
wrapper(10);
```

继续作为右值。

这叫：

```text
perfect forwarding
```

---

# 九十五、万能引用 / 转发引用

```cpp
template<typename T>
void func(T&& x);
```

当 T 需要类型推导时，这里的 `T&&` 是 forwarding reference。

可以绑定：

```text
左值
右值
```

注意普通：

```cpp
void func(string&& s);
```

只是右值引用，并不是 forwarding reference。

---

# 九十六、引用折叠

模板八股。

规则：

```text
&  + &  → &
&  + && → &
&& + &  → &
&& + && → &&
```

一句话：

> 只要出现一个 `&`，最终基本就是 `&`。

这支撑 perfect forwarding。

---

# 九十七、unique_ptr

C++11：

```cpp
unique_ptr<Player> p(new Player());
```

所有权唯一。

不能：

```cpp
unique_ptr<Player> p2 = p;
```

因为不能复制。

可以移动：

```cpp
unique_ptr<Player> p2 = std::move(p);
```

移动后：

```cpp
p == nullptr
```

现代代码中动态独占资源优先考虑 unique_ptr。

注意：

```cpp
make_unique
```

是 C++14 才加入的，不属于 C++11。

---

# 九十八、shared_ptr

```cpp
shared_ptr<Player> p1(new Player());

shared_ptr<Player> p2 = p1;
```

通过引用计数共享所有权。

大体：

```text
p1 ──┐
     ├── Player
p2 ──┘

use_count = 2
```

其中：

```cpp
p1.use_count()
```

可以查看强引用数。

最后一个 shared_ptr 消失：

```text
对象销毁
```

---

# 九十九、shared_ptr 控制块

典型实现：

```text
shared_ptr
    │
    ├── object pointer
    │
    └── control block
         ├── strong count
         ├── weak count
         └── deleter...
```

这个知识点经常面试。

---

# 一百、shared_ptr 循环引用

经典问题：

```cpp
class B;

class A {
public:
	shared_ptr<B> b;
};

class B {
public:
	shared_ptr<A> a;
};
```

如果：

```text
A → B
↑   ↓
└───┘
```

双方引用计数永远不会到 0。

造成内存泄漏。

---

# 一百零一、weak_ptr

解决循环引用：

```cpp
class B {
public:
	weak_ptr<A> a;
};
```

weak_ptr：

```text
观察对象
不增加 strong reference count
```

使用对象前：

```cpp
shared_ptr<A> p = weak.lock();

if (p) {
	// object still exists
}
```

---

# 一百零二、智能指针优先级

通常：

```text
默认：
unique_ptr

确实需要共享所有权：
shared_ptr

观察 shared_ptr 对象：
weak_ptr
```

不要一上来所有东西都 shared_ptr。

---

# 一百零三、enum class

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

---

# 一百零四、override

```cpp
class Base {
public:
	virtual void update(int x);
};

class Derived : public Base {
public:
	void update(int x) override;
};
```

如果签名写错：

```cpp
void update(double x) override;
```

直接编译失败。

因此强烈建议 C++11 后重写虚函数都写：

```cpp
override
```

---

# 一百零五、final

禁止继续 override：

```cpp
virtual void update() final;
```

禁止继承类：

```cpp
class Player final {
};
```

---

# 一百零六、= default

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

---

# 一百零七、= delete

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

---

# 一百零八、委托构造

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

---

# 一百零九、继承构造函数

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

---

# 一百一十、constexpr

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

---

# 一百一十一、const 和 constexpr

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

---

# 一百一十二、std::array

C++11：

```cpp
array<int, 3> arr = {1, 2, 3};
```

相比 C 数组：

```cpp
int arr[3];
```

提供 STL 接口：

```cpp
arr.begin();
arr.end();
arr.size();
```

但大小仍然编译期固定。

---

# 一百一十三、tuple

```cpp
tuple<int, string, double> t(1, "Alice", 3.14);

cout << get<0>(t);
cout << get<1>(t);
```

可以一次存多个不同类型。

---

# 一百一十四、unordered_map

C++11：

```cpp
unordered_map<string, int> m;

m["Alice"] = 100;
```

通常基于哈希表。

平均：

```text
find    O(1)
insert  O(1)
erase   O(1)
```

最坏：

```text
O(n)
```

---

# 一百一十五、map vs unordered_map

这是极高频八股。

| | map | unordered_map |
|---|---|---|
| 典型实现 | 红黑树 | 哈希表 |
| 是否排序 | 是 | 否 |
| 查询 | O(log n) | 平均 O(1) |
| 最坏查询 | O(log n) | O(n) |
| 范围查询 | 很方便 | 不适合 |
| 内存 | 树节点 | bucket + node |

需要：

```text
有序
lower_bound
范围查询
稳定 O(log n)
```

选 map。

主要追求普通 key-value 快速查询：

```text
unordered_map
```

通常更合适。

---

# 一百一十六、哈希冲突

两个 key：

```text
hash(key1) % bucket_count
==
hash(key2) % bucket_count
```

落入同一个 bucket。

这叫：

```text
hash collision
```

常见解决：

```text
链地址法
开放寻址法
```

`std::unordered_map` 的具体内部实现由标准库决定。

---

# 一百一十七、emplace

以前：

```cpp
v.push_back(Player(100, 50));
```

C++11：

```cpp
v.emplace_back(100, 50);
```

让容器直接使用参数构造元素。

可以减少某些临时对象/移动。

但现代编译器优化很强，不能简单背成：

```text
emplace_back 永远比 push_back 快
```

它主要表达：

> 直接在目标位置构造对象。

---

# 一百一十八、可变参数模板

C++11：

```cpp
template<typename T>
void print(const T& value) {
	cout << value << endl;
}

template<typename T, typename... Args>
void print(const T& value, const Args&... args) {
	cout << value << endl;
	print(args...);
}
```

调用：

```cpp
print(1, "hello", 3.14);
```

这里：

```cpp
typename... Args
```

是参数包。

---

# 一百一十九、using 类型别名

传统：

```cpp
typedef vector<int> IntVector;
```

C++11：

```cpp
using IntVector = vector<int>;
```

模板别名更明显：

```cpp
template<typename T>
using Vec = vector<T>;
```

然后：

```cpp
Vec<int> nums;
```

---

# 一百二十、type_traits

```cpp
#include <type_traits>

cout << is_integral<int>::value;
```

模板元编程常用：

```text
is_same
is_integral
is_pointer
is_reference
remove_reference
enable_if
```

例如：

```cpp
static_assert(
	is_integral<int>::value,
	"must be integer"
);
```

---

# 一百二十一、static_assert

C++11：

```cpp
static_assert(sizeof(int) >= 4, "int too small");
```

编译阶段检查。

非常适合模板和底层代码。

---

# 一百二十二、std::function

```cpp
function<int(int, int)> func;

func = [](int a, int b) {
	return a + b;
};

cout << func(1, 2);
```

它可以包装：

```text
普通函数
lambda
仿函数
std::bind 的结果
```

代价是比直接模板调用可能有额外类型擦除开销。

---

# 一百二十三、std::bind

```cpp
int add(int a, int b) {
	return a + b;
}

auto f = bind(add, 10, placeholders::_1);

cout << f(5);
```

等价效果：

```text
add(10, 5)
```

现代代码中很多场合 lambda 更清晰。

---

# 一百二十四、C++11 并发

C++11 第一次把线程正式放进标准库。

```cpp
#include <thread>

void work() {
	cout << "working" << endl;
}

int main() {
	thread t(work);

	t.join();
}
```

---

# 一百二十五、join 和 detach

```cpp
t.join();
```

当前线程等待 t 结束。

```cpp
t.detach();
```

线程独立运行。

detach 很容易出现生命周期问题，所以实际代码需要非常谨慎。

---

# 一百二十六、mutex

```cpp
mutex m;

void func() {
	m.lock();

	// critical section

	m.unlock();
}
```

问题：

如果中途抛异常：

```cpp
m.lock();

throw runtime_error("error");

m.unlock();
```

锁不会释放。

所以应该使用 RAII。

---

# 一百二十七、lock_guard

```cpp
mutex m;

void func() {
	lock_guard<mutex> lock(m);

	// critical section
}
```

离开作用域自动：

```cpp
unlock()
```

这是 RAII 在并发中的典型应用。

---

# 一百二十八、unique_lock

```cpp
unique_lock<mutex> lock(m);
```

相比 lock_guard 更灵活：

```text
可以手动 lock
可以 unlock
可以延迟加锁
可以与 condition_variable 配合
```

代价也稍复杂一些。

---

# 一百二十九、condition_variable

典型生产者消费者：

```cpp
mutex m;
condition_variable cv;
bool ready = false;

void worker() {
	unique_lock<mutex> lock(m);

	cv.wait(lock, [] {
		return ready;
	});

	cout << "work" << endl;
}
```

另一线程：

```cpp
{
	lock_guard<mutex> lock(m);
	ready = true;
}

cv.notify_one();
```

wait 时会：

```text
释放 mutex
进入等待
被唤醒
重新取得 mutex
检查条件
```

---

# 一百三十、为什么 wait 要传 predicate？

```cpp
cv.wait(lock, [] {
	return ready;
});
```

因为存在：

```text
spurious wakeup
虚假唤醒
```

线程被唤醒并不必然意味着条件已经成立。

所以要重新检查：

```cpp
ready
```

---

# 一百三十一、atomic

```cpp
atomic<int> counter(0);

counter++;
```

对于简单原子变量，可避免数据竞争。

注意：

> atomic 不等于“一段复杂代码整体线程安全”。

例如：

```cpp
if (counter > 0) {
	// other operations
}
```

多个操作组合起来仍可能存在竞态。

---

# 一百三十二、data race

两个线程：

```text
同时访问同一内存位置
至少一个执行写操作
缺少正确同步
```

形成 data race。

C++ 内存模型下 data race 通常意味着：

```text
undefined behavior
```

这是非常重要的并发八股。

---

# 一百三十三、sizeof

```cpp
sizeof(int)
sizeof(A)
sizeof(pointer)
```

返回对象/类型占用字节数。

例如 64 位机器常见：

```cpp
sizeof(int*) == 8
```

但不要把它当语言标准保证。

---

# 一百三十四、空类为什么 sizeof == 1？

```cpp
class Empty {
};

cout << sizeof(Empty);
```

通常：

```text
1
```

因为不同对象必须拥有不同地址。

```cpp
Empty a;
Empty b;
```

要求：

```text
&a != &b
```

所以至少需要某种占位空间。

---

# 一百三十五、内存对齐

例如：

```cpp
struct A {
	char a;
	int b;
	char c;
};
```

直觉数据：

```text
1 + 4 + 1 = 6
```

实际常见：

```text
12
```

布局可能：

```text
a       1 byte
padding 3 bytes
b       4 bytes
c       1 byte
padding 3 bytes
```

原因：

```text
alignment
```

便于 CPU 高效访问。

---

# 一百三十六、如何减少结构体 padding？

调整成员顺序。

比如：

```cpp
struct A {
	char a;
	char c;
	int b;
};
```

常见：

```text
1 + 1 + 2 padding + 4 = 8
```

比之前 12 小。

---

# 一百三十七、sizeof 含 virtual 的类

例如：

```cpp
class A {
public:
	virtual void func();
};
```

在主流 ABI 中对象通常还需要：

```text
vptr
```

所以 sizeof 通常至少包含一个指针大小。

但仍然要强调：

> vptr 是实现机制，不属于标准规定的对象布局。

---

# 一百三十八、volatile

```cpp
volatile int flag;
```

主要告诉编译器：

> 对该对象的访问可能受到编译器无法预测的外部因素影响，不要把相关访问随意优化掉。

常见于：

```text
内存映射硬件寄存器
底层嵌入式代码
```

极重要：

> `volatile` 不能用于普通 C++ 多线程同步。

多线程应使用：

```text
atomic
mutex
```

---

# 一百三十九、extern

例如：

a.cpp：

```cpp
int g_value = 10;
```

b.cpp：

```cpp
extern int g_value;
```

表示：

```text
g_value 在别处定义
```

这里仅声明。

---

# 一百四十、声明与定义

声明：

```cpp
extern int x;
```

告诉编译器：

```text
存在这个东西
```

定义：

```cpp
int x = 10;
```

真正提供对象存储。

函数：

```cpp
void func();
```

声明。

```cpp
void func() {
}
```

定义。

---

# 一百四十一、头文件为什么需要 include guard？

```cpp
#ifndef PLAYER_H
#define PLAYER_H

class Player {
};

#endif
```

防止一个翻译单元重复包含同一头文件导致重复定义。

也常见：

```cpp
#pragma once
```

但 `#pragma once` 并非早期 ISO C++ 标准规定的预处理指令，实际主流编译器广泛支持。

---

# 一百四十二、编译流程

高频面试：

```text
源代码
 ↓
预处理
 ↓
编译
 ↓
汇编
 ↓
目标文件
 ↓
链接
 ↓
可执行文件
```

预处理：

```text
#include
#define
#if
```

编译：

```text
C++ → 汇编/中间形式
```

汇编：

```text
汇编 → object file
```

链接：

```text
解决外部符号
合并目标文件和库
```

---

# 一百四十三、编译错误 vs 链接错误

编译错误：

```cpp
int x = "hello";
```

类型不正确。

链接错误：

```cpp
void func();

int main() {
	func();
}
```

如果没有 func 定义，可能：

```text
undefined reference
unresolved external symbol
```

---

# 一百四十四、静态库 vs 动态库

静态库：

Windows：

```text
.lib
```

Linux：

```text
.a
```

通常链接时把所需代码整合进最终程序。

优点：

```text
部署简单
```

缺点：

```text
可执行文件较大
更新库通常需要重新链接
```

动态库：

Windows：

```text
.dll
```

Linux：

```text
.so
```

运行时加载。

优点：

```text
多个程序共享
更新灵活
```

缺点：

```text
部署和版本兼容更复杂
```

---

# 一百四十五、动态绑定为什么有额外开销？

普通函数可能：

```text
直接 call 固定地址
```

virtual 调用典型流程：

```text
读取对象 vptr
→ 找 vtable
→ 找对应函数指针
→ 间接调用
```

多一次间接寻址。

此外可能影响编译器内联。

不过现代编译器可能进行：

```text
devirtualization
```

在能推断实际类型时直接优化掉虚调用。

---

# 一百四十六、composition vs inheritance

继承表达：

```text
is-a
```

例如：

```text
Dog is an Animal
```

组合表达：

```text
has-a
```

例如：

```cpp
class Player {
private:
	Weapon weapon;
};
```

Player：

```text
has a Weapon
```

工程上通常遵循：

> 优先组合，只有明确存在 is-a 关系时才考虑继承。

---

# 一百四十七、虚函数和模板的多态区别

virtual：

```text
runtime polymorphism
运行时多态
```

模板：

```text
compile-time polymorphism
编译期多态
```

例如：

```cpp
template<typename T>
void update(T& object) {
	object.update();
}
```

编译时根据 T 生成代码。

通常没有虚调用开销。

---

# 一百四十八、普通函数能根据返回值重载吗？

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

---

# 一百四十九、默认参数属于哪里？

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

---

# 一百五十、this 指针

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
A* const this
```

在 const 成员函数中类似：

```cpp
const A* const this
```

---

# 一百五十一、static 成员函数为什么没有 this？

因为调用：

```cpp
A::func();
```

根本不需要具体 A 对象。

因此没有对象地址可以作为：

```cpp
this
```

传进去。

---

# 一百五十二、悬空指针

```cpp
int* p = new int(10);

delete p;

cout << *p;
```

delete 后：

```text
p 仍保存旧地址
```

但该对象已不存在。

p 是：

```text
dangling pointer
```

可以：

```cpp
delete p;
p = nullptr;
```

降低误用风险。

---

# 一百五十三、野指针

```cpp
int* p;

*p = 10;
```

p 未初始化。

这种指针常称：

```text
wild pointer
```

应该：

```cpp
int* p = nullptr;
```

---

# 一百五十四、内存泄漏

```cpp
void func() {
	int* p = new int[1000];
}
```

函数结束：

```text
p 消失
```

动态分配的内存还存在。

已经找不到地址。

这就是：

```text
memory leak
```

现代 C++ 用 RAII 和智能指针解决大量此类问题。

---

# 一百五十五、double delete

```cpp
int* p = new int;

delete p;
delete p;
```

未定义行为。

---

# 一百五十六、undefined behavior

UB 是 C++ 面试核心概念。

例如：

```cpp
int* p = nullptr;
cout << *p;
```

```cpp
int a[3];
cout << a[10];
```

```cpp
int* p = new int;
delete p;
cout << *p;
```

这些都可能是：

```text
Undefined Behavior
```

意思不是：

```text
一定崩溃
```

而是：

> C++ 标准不规定程序应该发生什么。

它可能：

```text
崩溃
正常运行
输出乱码
被优化器产生意外结果
```

---

# 一百五十七、nullptr、NULL、0

C++98 常写：

```cpp
int* p = 0;
```

或者：

```cpp
int* p = NULL;
```

C++11 后：

```cpp
int* p = nullptr;
```

优先使用 nullptr。

因为它具有明确的空指针类型语义。

---

# 一百五十八、explicit

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

---

# 一百五十九、mutable

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

---

# 一百六十、C++98 auto 和 C++11 auto

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

---

# 一百六十一、C++11 最应该真正吃透的 10 个知识点

如果目的是面试 + 实际开发，我会把优先级排成：

```text
1. RAII
2. const / 引用 / 指针
3. 生命周期
4. 构造、析构、拷贝
5. virtual 与多态
6. STL 容器和复杂度
7. 右值引用与移动语义
8. 智能指针
9. lambda / auto
10. 并发基础
```

其中真正决定 C++ 水平的核心链条其实是：

```text
对象
↓
生命周期
↓
资源所有权
↓
RAII
↓
拷贝语义
↓
移动语义
↓
智能指针
```

这条链一旦彻底理解，C++11 的很多特性会突然连成一体。

---

# 一百六十二、最核心的一组面试题

下面这些建议做到看到问题立刻能回答：

```text
指针和引用区别？

new/delete 与 malloc/free 区别？

stack 与 heap 区别？

const int* 和 int* const 区别？

static 有哪些用法？

inline 的作用是什么？

struct 和 class 区别？

构造函数为什么不能 virtual？

析构函数为什么经常要 virtual？

virtual 函数怎么实现？

虚函数表在哪里？

什么是动态绑定？

重载、重写、隐藏区别？

什么是对象切片？

什么是菱形继承？

虚继承解决什么？

什么是浅拷贝和深拷贝？

什么是 Rule of Three？

什么是 Rule of Five？

什么是 Rule of Zero？

vector 的底层是什么？

vector 怎么扩容？

vector 扩容为什么会让 iterator 失效？

size 和 capacity 区别？

reserve 和 resize 区别？

vector、list、deque 区别？

map 和 unordered_map 区别？

红黑树为什么适合 map？

哈希冲突是什么？

priority_queue 底层是什么？

迭代器是什么？

为什么 STL algorithm 用 iterator？

auto 怎么推导？

decltype 是什么？

nullptr 为什么优于 NULL？

lambda 本质是什么？

左值和右值是什么？

右值引用解决什么问题？

std::move 做了什么？

move 后对象还能不能用？

什么是完美转发？

std::forward 干什么？

unique_ptr、shared_ptr、weak_ptr 区别？

shared_ptr 引用计数怎么实现？

shared_ptr 为什么会循环引用？

weak_ptr 怎么解决？

constexpr 与 const 区别？

override / final 有什么用？

=delete / =default 有什么用？

mutex 是什么？

lock_guard 为什么优于手动 lock/unlock？

atomic 是什么？

什么是 data race？

volatile 能不能解决多线程同步？

什么是 undefined behavior？

sizeof 空类为什么通常是 1？

什么是内存对齐？

编译和链接有什么区别？
```

这批基本覆盖 C++98 + C++11 面试最核心区域。

最后可以把整个知识体系压缩成这样：

```text
            C++
             │
     ┌───────┴────────┐
     │                │
 Language          Library
     │                │
     ├─ type           ├─ STL
     ├─ pointer        ├─ container
     ├─ reference      ├─ iterator
     ├─ const          ├─ algorithm
     ├─ class          ├─ smart pointer
     ├─ inheritance    └─ concurrency
     ├─ polymorphism
     ├─ template
     └─ lifetime
         │
         ↓
        Resource
         │
         ↓
        Ownership
         │
     ┌────┴─────┐
     │          │
    Copy       Move
     │          │
     └────┬─────┘
          ↓
         RAII
          │
          ↓
    Smart Pointer
```

如果只选一个最重要的思想来理解 C++98 → C++11 的演化，就是：

**C++98 已经建立了“对象生命周期管理资源”的 RAII 思想；C++11 又通过移动语义、智能指针和更强的模板系统，把“资源所有权”这件事系统化了。**
