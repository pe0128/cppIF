# 继承、虚函数与多态

## 概括要点

- public 继承表达 is-a，组合表达 has-a；只有确实需要可替代的类型关系时才使用继承。
- 虚函数通过对象的动态类型选择实现，模板提供编译期多态；vptr / vtable 是典型实现而非标准强制布局。
- 经基类指针删除派生对象需要虚析构函数；纯虚析构函数也必须提供定义。
- 构造函数不能是虚函数；构造和析构期间的虚调用不会派发到尚未构造或已销毁的派生部分。
- 按值保存基类会导致对象切片；菱形继承可通过虚继承共享一个基类子对象。
- override 让编译器验证重写，final 阻止继续重写或派生；动态派发开销可能被去虚化优化消除。

## 继承 {#source-30}

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


## 访问权限 {#source-31}

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


## public / protected / private 继承 {#source-32}

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


## 虚函数 {#source-33}

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
Dog dog;
Animal* p = &dog;

p->speak();
```

输出：

```text
Dog
```

这就是运行时多态。


## 静态绑定和动态绑定 {#source-34}

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


## 虚函数表 {#source-35}

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


## 为什么析构函数经常需要 virtual？ {#source-36}

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


## 纯虚函数 {#source-37}

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


## 虚析构函数可以是纯虚函数吗？ {#source-38}

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


## 构造函数能不能是 virtual？ {#source-39}

不能。

因为构造对象时：

```text
对象自身类型已经由 new / 声明确定
```

对象尚未完整构造，也不存在通过虚机制决定“该调用哪种构造函数”的合理语义。


## 析构函数为什么能是 virtual？ {#source-40}

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


## 构造/析构期间调用虚函数 {#source-41}

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


## 对象切片 {#source-43}

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


## 多继承与菱形继承 {#source-44}

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


## override {#source-104}

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


## final {#source-105}

禁止继续 override：

```cpp
virtual void update() final;
```

禁止继承类：

```cpp
class Player final {
};
```


## 动态绑定为什么有额外开销？ {#source-145}

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


## composition vs inheritance {#source-146}

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


## 虚函数和模板的多态区别 {#source-147}

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
