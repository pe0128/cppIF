# 仿函数、lambda 与函数包装

## 概括要点

- 仿函数是实现 operator() 的对象，可以携带状态并参与模板优化。
- lambda 生成闭包对象；捕获列表决定按值保存数据还是引用外部对象。
- 引用捕获需要保证被引用对象活得足够久；值捕获默认通过 const 调用运算符访问副本。
- std::function 用类型擦除包装可调用对象，可能增加开销；std::bind 绑定参数，简单场景常可用 lambda 表达。

## 仿函数 {#source-73}

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


## 为什么 STL 经常使用仿函数而不是函数指针？ {#source-74}

仿函数可以：

```text
拥有状态
被模板内联
提供类型信息
编译器优化空间更大
```

C++11 lambda 本质上也会生成类似匿名函数对象。


## lambda {#source-82}

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


## lambda 捕获 {#source-83}

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


## lambda 底层是什么？ {#source-84}

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


## std::function {#source-122}

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


## std::bind {#source-123}

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
