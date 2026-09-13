# 值类别、移动语义与完美转发

## 概括要点

- 表达式分为 lvalue、xvalue、prvalue；有名字的右值引用变量作为表达式时仍是左值。
- std::move 是值类别转换，实际资源转移由移动构造或移动赋值完成；转换本身不保证一定发生移动。
- 移动构造创建新对象；移动赋值先处理目标已有资源，再接管来源资源，必须考虑自移动。
- 标准库对象被移动后通常有效但状态未指定；自定义类型的移动后状态由其实现和契约决定。
- Rule of Five 加入两个移动操作；Rule of Zero 把资源交给标准 RAII 类型管理。
- 推导上下文中的无 cv 限定 T&& 可以是转发引用；引用折叠与 std::forward 一起保留调用者的值类别。

## 左值和右值 {#source-85}

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


## 右值引用 {#source-86}

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


## 移动语义 {#source-87}

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


## 移动构造函数 {#source-88}

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


## 移动赋值 {#source-89}

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


## std::move {#source-91}

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


## 被 move 后的对象还能不能用？ {#source-92}

可以继续：

```text
析构
重新赋值
调用满足其当前状态前提的操作
```

除非另有说明，标准库类型的移动后对象通常处于以下状态；自定义类型需要由自身实现和契约保证：

```text
valid but unspecified state
```

也就是：

```text
有效
但具体值不确定
```

不要依赖 move 后原有内容。


## 一个重要问题：右值引用变量本身是左值 {#source-93}

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


## std::forward 与完美转发 {#source-94}

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


## 万能引用 / 转发引用 {#source-95}

```cpp
template<typename T>
void func(T&& x);
```

当 T 是需要推导的、无 cv 限定的函数模板类型参数时，这里的 T&& 是转发引用。const T&& 不是转发引用。

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


## 引用折叠 {#source-96}

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
