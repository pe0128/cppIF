# 值类别、移动语义与完美转发

## 左值和右值 {#source-85}

C++11 表达式分为 lvalue 左值、xvalue 将亡值和 prvalue 纯右值。左值和将亡值具有对象身份，将亡值和纯右值统称右值。变量表达式 x 是左值，整数常量 10 是纯右值，std::move(x) 通常是将亡值；能否取地址不是完整分类规则。

## 右值引用 {#source-86}

T&& 声明右值引用，可绑定匹配的右值。普通 T& 不能绑定右值，const T& 可以在相应规则下绑定临时对象。右值引用常用于移动构造和移动赋值的参数；引用本身不会自动转移资源。

```cpp
int&& r = 10;
```

```cpp
int& r = 10;
```

```cpp
const int& r = 10;
```

## 移动语义 {#source-87}

移动操作可以将来源对象拥有的资源交给目标对象，从而避免复制资源内容。对资源句柄类，移动常转移指针并清空来源。返回值初始化可能直接消除复制或移动；仅写 std::move 不保证一定选择移动操作。

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

## 移动构造函数 {#source-88}

移动构造函数 T(T&&) 从来源初始化新对象。示例复制指针值到目标并将来源指针置空，防止两个析构函数释放同一数组。不会抛异常的移动构造可声明 noexcept，以影响容器迁移元素时的选择。

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

## 移动赋值 {#source-89}

移动赋值 T& operator=(T&&) 修改已存在对象，需先处理目标原有资源再接管来源资源。自移动时不能先释放资源再读取已失效状态，示例通过 this 与来源地址比较处理。

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

## Rule of Five {#source-90}

Rule of Five 五法则检查析构、拷贝构造、拷贝赋值、移动构造和移动赋值之间的所有权配合。自行声明其中部分操作会影响其他操作的隐式生成。Rule of Zero 零法则把资源交给 vector、string 或智能指针成员，由成员负责这些操作。

## std::move {#source-91}

std::move 在 &lt;utility&gt; 中声明，将表达式转换为可参与移动重载选择的值类别，不执行资源迁移。const 对象经 std::move 后仍保留 const，常无法绑定 T&& 移动重载而选择复制。对仍需保留原内容的对象不应假定移动后内容不变。

```cpp
Buffer a;

Buffer b = std::move(a);
```

## 被 move 后的对象还能不能用？ {#source-92}

标准库对象移动后通常保持有效但状态未指定，除非对应类型另有保证。可析构、重新赋值或执行满足当前状态前提的操作；例如不能假定被移动的 vector 仍非空并直接调用 front()。自定义类型需要由自身实现和契约规定移动后状态。

## 一个重要问题右值引用变量本身是左值 {#source-93}

声明类型为 T&& 的命名变量，在用名字形成表达式时仍是左值。因此函数体内直接传递 x 会选择左值匹配；确实转移资源时使用 std::move(x)，保留调用者原始值类别时使用 std::forward。

```cpp
void func(int&& x) {
	// x 的类型是 int&&
	// 但是表达式 x 本身是左值
}
```

## std::forward 与完美转发 {#source-94}

`std::forward<T>`(value) 依据推导得到的 T 恢复传入实参的值类别。T 推导为左值引用时结果为左值，否则可作为右值继续传递。它用于包装函数，将参数交给下一层接口而不无条件移动左值。

```cpp
template<typename T>
void wrapper(T&& value) {
	func(std::forward<T>(value));
}
```

## 万能引用、转发引用 {#source-95}

函数模板中需要推导的无 cv 限定类型参数 T，对应 T&& 形参可成为转发引用，同时接受左值和右值。固定类型 string&& 以及 const T&& 不是此类转发引用。类模板已确定的 T 所形成的 T&& 也不因该写法自动成为转发引用。

```cpp
template<typename T>
void func(T&& x);
```

```cpp
void func(string&& s);
```

## 引用折叠 {#source-96}

模板替换和类型别名形成引用组合时应用引用折叠。T& 与任一引用组合得到左值引用，只有右值引用与右值引用组合得到右值引用。左值传入 T&& 转发引用时，T 推导为 U&，折叠后形参为 U&。
