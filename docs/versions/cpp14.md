# C++14

## Generic Lambda泛型 Lambda {#feature-1}

### 语法与行为

Lambda 参数可以使用 `auto`，编译器会为 Lambda 的调用运算符生成模板。

```cpp
auto add = [](auto a, auto b) {
	return a + b;
};
```

其效果近似于

```cpp
struct Add {
	template <typename T, typename U>
	auto operator()(T a, U b) const {
		return a + b;
	}
};
```

### 使用场景与差异

用于元素类型不同但操作相同的算法回调。C++11 lambda 需要明确写出参数类型，C++14 的每个 auto 参数分别推导类型，两个 auto 不要求得到同一类型。

### 用法

```cpp
#include <iostream>
#include <string>

int main() {
	auto add = [](auto a, auto b) {
		return a + b;
	};

	std::cout << add(1, 2) << '\n';
	std::cout << add(1.5, 2.5) << '\n';
	std::cout << add(std::string("Hello "), std::string("C++")) << '\n';
}
```

用于 STL 算法

```cpp
std::sort(v.begin(), v.end(), [](const auto& lhs, const auto& rhs) {
	return lhs.score < rhs.score;
});
```


## Lambda Init-Capture初始化捕获 {#feature-2}

### 语法与行为

Lambda 捕获列表中可以直接声明并初始化捕获成员。

```cpp
auto f = [x = 10]() {
	return x;
};
```

### 使用场景与差异

用于把独占资源移入异步任务或预先计算捕获值。初始化捕获为闭包建立新成员，移动捕获 unique_ptr 后闭包通常不可复制；C++11 的普通值捕获不能直接表达同样的资源转移。

### 用法

移动捕获 `std::unique_ptr`

```cpp
#include <memory>
#include <iostream>

int main() {
	auto ptr = std::make_unique<int>(42);

	auto f = [p = std::move(ptr)]() {
		std::cout << *p << '\n';
	};

	f();
}
```

对捕获值进行预处理

```cpp
int x = 10;

auto f = [value = x * 2]() {
	return value;
};
```


## 普通函数返回类型推导 {#feature-3}

### 语法与行为

普通函数可以只写 `auto`，由 `return` 表达式推导返回类型。

```cpp
auto add(int a, int b) {
	return a + b;
}
```

所有参与推导的 `return` 必须得到相同类型。

### 使用场景与差异

用于返回类型依赖模板参数且函数定义可见的函数。参与推导的 return 必须推导出相同类型，并非仅需可相互转换；调用方通常需要看到定义后才能使用推导结果。按值 auto 不保留返回表达式的引用类型。

### 用法

```cpp
auto square(double x) {
	return x * x;
}
```

模板函数

```cpp
template <typename T, typename U>
auto add(T a, U b) {
	return a + b;
}
```


## `decltype(auto)` {#feature-4}

### 语法与行为

`decltype(auto)` 使用 `decltype` 的规则推导类型，可以保留引用和 cv 限定。

```cpp
int value = 10;

int& getValue() {
	return value;
}

auto a = getValue();
decltype(auto) b = getValue();
```

此时

```cpp
a      // int
b      // int&
```

### 使用场景与差异

用于保持被包装函数的引用返回值。decltype(auto) x = name 按未加括号名字的声明类型推导，而 decltype(auto) x = (name) 按表达式值类别推导；返回局部对象的引用仍会悬空，保留引用不延长其生命周期。

### 用法

用于透明包装函数

```cpp
#include <utility>

template <typename F, typename... Args>
decltype(auto) call(F&& f, Args&&... args) {
	return std::forward<F>(f)(std::forward<Args>(args)...);
}
```

保留下层函数的引用返回值

```cpp
int x = 10;

int& get() {
	return x;
}

decltype(auto) ref = get();
ref = 100;
```


## Variable Template变量模板 {#feature-5}

### 语法与行为

变量本身可以成为模板。

```cpp
template <typename T>
constexpr T pi = T(3.1415926535897932385L);
```

### 使用场景与差异

用于按类型提供常量或类型查询结果。变量模板从 C++14 开始支持，但标准库的许多 _v 辅助变量从 C++17 才提供；此处 is_pointer_v 是自定义变量模板。C++14 的 static_assert 需要消息参数。

### 用法

```cpp
float pf = pi<float>;
double pd = pi<double>;
long double pld = pi<long double>;
```

类型 traits 常见写法

```cpp
template <typename T>
constexpr bool is_pointer_v = std::is_pointer<T>::value;

static_assert(is_pointer_v<int*>, "pointer required");
static_assert(!is_pointer_v<int>, "int is not a pointer");
```


## Relaxed `constexpr` {#feature-6}

### 语法与行为

`constexpr` 函数可以包含局部变量、循环、条件分支等普通语句。

### 使用场景与差异

用于编译期循环计算、查表或校验。与 C++11 通常依靠单个 return 表达式的写法不同，C++14 可以声明初始化后的局部变量并执行循环，仍需满足常量表达式限制。

### 用法

```cpp
constexpr int factorial(int n) {
	int result = 1;

	for (int i = 2; i <= n; ++i) {
		result *= i;
	}

	return result;
}

static_assert(factorial(5) == 120, "factorial result");
```

编译期数组计算

```cpp
constexpr int sumTo(int n) {
	int sum = 0;

	for (int i = 1; i <= n; ++i) {
		sum += i;
	}

	return sum;
}

constexpr int x = sumTo(100);
```


## Binary Literal 与数字分隔符 {#feature-7}

### 语法与行为

支持二进制字面量和单引号数字分隔符。

### 使用场景与差异

二进制字面量用于位掩码，数字分隔符用于按位组或数量级分组。单引号不改变数值，只能出现在允许的数字序列位置，不能任意插入前缀或后缀。

### 用法

```cpp
int mask = 0b1010'1100;
long long population = 8'000'000'000LL;
double pi = 3.141'592'653'5;
```


## `std::make_unique` {#feature-8}

### 语法与行为

标准库提供 `std::make_unique` 创建 `std::unique_ptr`。

### 使用场景与差异

用于创建动态独占对象和未知边界数组。参数转发到对象构造函数，数组形式按给定数量创建元素；与直接构造 unique_ptr 相比不需要显式写 new。自定义删除器仍需使用对应的 unique_ptr 构造方式。

### 用法

```cpp
#include <memory>

auto p = std::make_unique<int>(42);
auto obj = std::make_unique<MyClass>(arg1, arg2);
auto arr = std::make_unique<int[]>(100);
```
