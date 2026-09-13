# 仿函数、lambda 与函数包装

## 仿函数 {#source-73}

函数对象通过 operator() 接受参数并执行操作。对象可以持有比较阈值等状态，类型可作为算法模板参数参与实例化。示例中的 Compare 使 sort 按降序排列。

```cpp
struct Compare {
	bool operator()(int a, int b) const {
		return a > b;
	}
};
```

```cpp
sort(v.begin(), v.end(), Compare());
```

## 为什么 STL 经常使用仿函数而不是函数指针？ {#source-74}

函数指针保存函数地址，不能直接携带每个实例独立的成员状态。函数对象可以把状态保存为成员，算法模板知道其具体类型时可优化调用；是否内联仍取决于编译器。需要有状态比较器时可使用函数对象。

## lambda {#source-82}

C++11 lambda 表达式由捕获列表、参数列表、可选返回类型和函数体组成，产生闭包对象。它可作为算法谓词或局部回调；C++11 参数类型需显式写出，auto 参数在 C++14 才可用。

```cpp
auto add = [](int a, int b) {
	return a + b;
};

cout << add(1, 2);
```

## lambda 捕获 {#source-83}

值捕获保存外部变量的副本，引用捕获引用原变量。[=] 和 [&] 指定默认捕获方式，也可混合指定例外。引用捕获的对象必须在闭包使用期间存活；mutable lambda 可修改值捕获副本，但不会因此修改原变量。

```cpp
int x = 10;

auto f = [x]() {
	cout << x;
};
```

```cpp
auto f = [&x]() {
	x++;
};
```

## lambda 底层是什么？ {#source-84}

每个 lambda 表达式产生独特的闭包类型，捕获值可表现为该类型的成员，调用通过 operator() 执行。没有 mutable 时，普通 lambda 的调用运算符为 const。示例中的匿名类仅用于展示成员和调用结构，不是编译器必须采用的源码形式。

```cpp
int x = 10;

auto f = [x](int y) {
	return x + y;
};
```

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

## std::function {#source-122}

`std::function<R(Args...)>` 使用类型擦除保存符合签名的可复制可调用目标。可保存普通函数、闭包和函数对象，可能发生动态分配或间接调用。空包装器被调用时抛 std::bad_function_call；只可移动目标可考虑 C++23 的 move_only_function。

```cpp
function<int(int, int)> func;

func = [](int a, int b) {
	return a + b;
};

cout << func(1, 2);
```

## std::bind {#source-123}

std::bind 将可调用对象和部分参数绑定，placeholders::_1 等占位符表示未来调用参数。绑定参数通常按值保存，需要引用语义时可用 std::ref。lambda 可以显式写出同一参数映射并控制捕获。

```cpp
int add(int a, int b) {
	return a + b;
}

auto f = bind(add, 10, placeholders::_1);

cout << f(5);
```
