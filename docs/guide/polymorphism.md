# 继承、虚函数与多态

## 继承 {#source-30}

class Derived : public Base 声明公有继承。派生对象包含基类子对象，可通过基类接口使用；基类 private 成员仍存在，但派生类不能直接访问。公有继承用于需要把派生对象当成基类对象处理的接口。

```cpp
class Animal {
public:
	void eat() {
	}
};

class Dog : public Animal {
};
```

## 访问权限 {#source-31}

public 成员在对象和类型可访问的前提下可由外部使用；protected 成员允许本类、友元和符合访问规则的派生类使用；private 成员仅供本类和友元使用。派生类通过基类对象访问 protected 成员还受对象表达式类型等规则限制。

## public、protected和private 继承 {#source-32}

public 继承保留基类 public 和 protected 成员的相应访问级别；protected 继承使它们在派生类中成为 protected；private 继承使它们成为 private。外部代码通常只能经可访问、无歧义的公有继承进行派生类到基类转换。

```cpp
class Dog : public Animal
```

## 虚函数 {#source-33}

virtual 成员函数支持运行时派发。通过基类指针或引用调用时，根据对象动态类型选取最终重写函数。示例中的 p 指向 Dog，p-&gt;speak() 调用 Dog::speak。使用明确限定名调用基类实现时会抑制虚派发。

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

```cpp
Dog dog;
Animal* p = &dog;

p->speak();
```

## 静态绑定和动态绑定 {#source-34}

普通非虚函数调用主要根据静态类型和名称查找结果确定目标。虚调用根据动态类型确定最终重写函数，但编译器若能证明动态类型，可消除间接调用。需要运行时替换实现时使用虚接口，类型在编译时已知的泛型操作可使用模板。

```cpp
p->func();
```

```cpp
p->virtualFunc();
```

## 虚函数表 {#source-35}

vptr 虚表指针和 vtable 虚函数表是常见实现机制。对象中的指针关联到虚函数入口表，虚调用通过表中的入口找到实现。标准规定派发行为而不规定必须使用虚表；多继承下的指针调整和表布局由 ABI 决定。

## 为什么析构函数经常需要 virtual？ {#source-36}

通过基类指针 delete 派生对象时，基类析构函数必须满足多态删除规则。在 C++98 和 C++11 的常见场景中，需要将基类析构函数声明为 virtual；否则删除派生对象会导致未定义行为。示例前两个片段展示错误用法，最后一个片段展示虚析构声明。

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

```cpp
Animal* p = new Dog();
delete p;
```

```cpp
class Animal {
public:
	virtual ~Animal() {
	}
};
```

## 纯虚函数 {#source-37}

virtual ReturnType function() = 0 声明纯虚函数。没有为所有纯虚函数提供最终非纯重写的类是抽象类，不能创建该类对象，但可以声明其指针和引用。抽象类用于定义需由派生类实现的接口。

```cpp
class Shape {
public:
	virtual double area() const = 0;
};
```

## 虚析构函数可以是纯虚函数吗？ {#source-38}

析构函数可以声明为纯虚函数，以使类成为抽象类。纯虚析构函数仍必须提供定义，因为派生对象销毁时会执行基类析构函数。定义通常写在类外。

```cpp
class Base {
public:
	virtual ~Base() = 0;
};

Base::~Base() {
}
```

## 构造函数能不能是 virtual？ {#source-39}

构造函数不能声明为 virtual。创建对象时，由声明或 new 表达式确定待构造类型，随后执行该类型的构造过程。需要按运行时条件创建不同派生对象时，可使用返回基类所有权句柄的工厂函数。

## 析构函数为什么能是 virtual？ {#source-40}

虚析构函数允许经基类指针启动正确的析构链。删除派生对象时，先执行派生类析构过程，再执行成员和基类的销毁。构造函数不参与虚派发，而析构函数可以是虚函数。

## 构造、析构期间调用虚函数 {#source-41}

构造和析构期间的虚调用以当前正在构造或析构的类为派发范围。Base 构造函数中调用 func() 时，Derived 部分尚未完成构造，因此不会调用 Derived 的重写。析构时已经销毁的派生部分也不参与派发。

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

## 对象切片 {#source-43}

用派生对象按值初始化基类对象时，只复制基类部分，派生部分不进入目标对象，这称为对象切片。需要保留动态类型行为时，接口可传递基类引用或指针，并保证被引用对象的生命周期。

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

## 多继承与菱形继承 {#source-44}

菱形继承中，若 B 和 C 都普通继承 A，D 同时继承 B 和 C 时会包含两个 A 子对象。B 和 C 对 A 使用虚继承时，最派生对象共享一个 A 子对象，由最派生类负责初始化该虚基类。虚继承与虚函数派发是不同机制。

```cpp
class B : public A {};
class C : public A {};
class D : public B, public C {};
```

```cpp
class B : virtual public A {};
class C : virtual public A {};
```

## override {#source-104}

override 放在派生类虚函数声明后，要求该函数确实重写基类虚函数。参数、cv 限定等不匹配导致无法重写时，编译器给出错误。它用于检查接口变更或签名拼写错误。

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

## final {#source-105}

虚成员函数后的 final 禁止派生类继续重写该函数；类名后的 final 禁止从该类派生。final 不影响普通调用方式，用于限制扩展点。

```cpp
virtual void update() final;
```

```cpp
class Player final {
};
```

## 动态绑定为什么有额外开销？ {#source-145}

典型虚调用先定位虚函数入口，再间接调用，可能增加间接寻址和影响内联。对象布局也可能需要额外指针。编译器在能证明目标实现时可去虚化，因此实际开销需要结合调用位置和优化结果判断。

## composition vs inheritance {#source-146}

公有继承表达可替代的基类接口关系，组合通过成员持有另一个对象。需要复用实现但不需要对外提供基类接口时，可使用组合；继承还会引入访问控制、对象切片和虚析构等要求。

```cpp
class Player {
private:
	Weapon weapon;
};
```

## 虚函数和模板的多态区别 {#source-147}

虚函数通过运行时动态类型选择实现，适合在统一接口下处理不同具体对象。模板在编译时按实际类型实例化，要求所用表达式对该类型有效。模板不自动产生虚调用，但若模板体调用虚接口，仍可发生动态派发。

```cpp
template<typename T>
void update(T& object) {
	object.update();
}
```
