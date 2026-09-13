# C++11 之后的新特性：机制与用法

# C++14

## 1. Generic Lambda：泛型 Lambda

### 机制

Lambda 参数可以使用 `auto`，编译器会为 Lambda 的调用运算符生成模板。

```cpp
auto add = [](auto a, auto b) {
	return a + b;
};
```

其效果近似于：

```cpp
struct Add {
	template <typename T, typename U>
	auto operator()(T a, U b) const {
		return a + b;
	}
};
```

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

用于 STL 算法：

```cpp
std::sort(v.begin(), v.end(), [](const auto& lhs, const auto& rhs) {
	return lhs.score < rhs.score;
});
```

---

## 2. Lambda Init-Capture：初始化捕获

### 机制

Lambda 捕获列表中可以直接声明并初始化捕获成员。

```cpp
auto f = [x = 10]() {
	return x;
};
```

### 用法

移动捕获 `std::unique_ptr`：

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

对捕获值进行预处理：

```cpp
int x = 10;

auto f = [value = x * 2]() {
	return value;
};
```

---

## 3. 普通函数返回类型推导

### 机制

普通函数可以只写 `auto`，由 `return` 表达式推导返回类型。

```cpp
auto add(int a, int b) {
	return a + b;
}
```

所有参与推导的 `return` 必须得到兼容的同一类型。

### 用法

```cpp
auto square(double x) {
	return x * x;
}
```

模板函数：

```cpp
template <typename T, typename U>
auto add(T a, U b) {
	return a + b;
}
```

---

## 4. `decltype(auto)`

### 机制

`decltype(auto)` 使用 `decltype` 的规则推导类型，可以保留引用和 cv 限定。

```cpp
int value = 10;

int& getValue() {
	return value;
}

auto a = getValue();
decltype(auto) b = getValue();
```

此时：

```cpp
a      // int
b      // int&
```

### 用法

用于透明包装函数：

```cpp
#include <utility>

template <typename F, typename... Args>
decltype(auto) call(F&& f, Args&&... args) {
	return std::forward<F>(f)(std::forward<Args>(args)...);
}
```

保留下层函数的引用返回值：

```cpp
int x = 10;

int& get() {
	return x;
}

decltype(auto) ref = get();
ref = 100;
```

---

## 5. Variable Template：变量模板

### 机制

变量本身可以成为模板。

```cpp
template <typename T>
constexpr T pi = T(3.1415926535897932385L);
```

### 用法

```cpp
float pf = pi<float>;
double pd = pi<double>;
long double pld = pi<long double>;
```

类型 traits 常见写法：

```cpp
template <typename T>
constexpr bool is_pointer_v = std::is_pointer<T>::value;

static_assert(is_pointer_v<int*>);
static_assert(!is_pointer_v<int>);
```

---

## 6. Relaxed `constexpr`

### 机制

`constexpr` 函数可以包含局部变量、循环、条件分支等普通语句。

### 用法

```cpp
constexpr int factorial(int n) {
	int result = 1;

	for (int i = 2; i <= n; ++i) {
		result *= i;
	}

	return result;
}

static_assert(factorial(5) == 120);
```

编译期数组计算：

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

---

## 7. Binary Literal 与数字分隔符

### 机制

支持二进制字面量和单引号数字分隔符。

### 用法

```cpp
int mask = 0b1010'1100;
long long population = 8'000'000'000LL;
double pi = 3.141'592'653'5;
```

---

## 8. `std::make_unique`

### 机制

标准库提供 `std::make_unique` 创建 `std::unique_ptr`。

### 用法

```cpp
#include <memory>

auto p = std::make_unique<int>(42);
auto obj = std::make_unique<MyClass>(arg1, arg2);
auto arr = std::make_unique<int[]>(100);
```

---

# C++17

## 1. Structured Binding：结构化绑定

### 机制

可以把数组、`std::pair`、`std::tuple` 或满足 tuple-like 规则的对象拆成多个名字。

```cpp
auto [x, y] = pair;
```

### 用法

`std::pair`：

```cpp
std::pair<int, std::string> p{1, "Alice"};

auto [id, name] = p;
```

引用绑定：

```cpp
auto& [id, name] = p;
name = "Bob";
```

遍历 `std::map`：

```cpp
std::map<std::string, int> score;

for (const auto& [name, value] : score) {
	std::cout << name << ": " << value << '\n';
}
```

结构体：

```cpp
struct Point {
	int x;
	int y;
};

Point p{10, 20};
auto [x, y] = p;
```

---

## 2. `if` / `switch` 初始化语句

### 机制

`if` 与 `switch` 条件前可以先定义局部变量。

```cpp
if (init; condition) {
	// ...
}
```

### 用法

```cpp
if (auto it = mp.find(key); it != mp.end()) {
	std::cout << it->second << '\n';
}
```

锁的作用域控制：

```cpp
if (std::lock_guard<std::mutex> lock(mtx); ready) {
	useResource();
}
```

`switch`：

```cpp
switch (int code = getCode(); code) {
	case 0:
		break;
	case 1:
		break;
}
```

---

## 3. `if constexpr`

### 机制

`if constexpr` 在编译期选择分支。未选择的分支在模板实例化时不会参与普通语义实例化。

### 用法

```cpp
#include <type_traits>
#include <iostream>

template <typename T>
void print(T value) {
	if constexpr (std::is_pointer_v<T>) {
		std::cout << *value << '\n';
	} else {
		std::cout << value << '\n';
	}
}
```

模板递归终止：

```cpp
template <typename T, typename... Args>
void printAll(T&& first, Args&&... rest) {
	std::cout << first;

	if constexpr (sizeof...(rest) > 0) {
		std::cout << ' ';
		printAll(std::forward<Args>(rest)...);
	}
}
```

---

## 4. Fold Expression：折叠表达式

### 机制

可以把参数包直接用运算符折叠。

常见形式：

```cpp
(args + ...)
(... + args)
(init + ... + args)
(args + ... + init)
```

### 用法

求和：

```cpp
template <typename... Args>
auto sum(Args... args) {
	return (args + ...);
}
```

逻辑与：

```cpp
template <typename... Args>
bool all(Args... args) {
	return (args && ...);
}
```

依次输出：

```cpp
template <typename... Args>
void print(Args&&... args) {
	(std::cout << ... << args);
}
```

带初始值：

```cpp
template <typename... Args>
auto sumWithZero(Args... args) {
	return (0 + ... + args);
}
```

---

## 5. Class Template Argument Deduction：类模板实参推导 CTAD

### 机制

构造类模板对象时，可以由构造参数推导模板参数。

### 用法

```cpp
std::pair p(1, 2.5);
```

等价于：

```cpp
std::pair<int, double> p(1, 2.5);
```

```cpp
std::vector v{1, 2, 3, 4};
std::tuple t{1, 2.0, "hello"};
```

自定义模板：

```cpp
template <typename T>
struct Box {
	Box(T value) : value(value) {}
	T value;
};

Box box(42);
```

---

## 6. Deduction Guide：推导指引

### 机制

可以显式规定 CTAD 应如何从构造参数推导模板参数。

### 用法

```cpp
#include <string>

template <typename T>
struct Wrapper {
	Wrapper(T value) : value(value) {}
	T value;
};

Wrapper(const char*) -> Wrapper<std::string>;

Wrapper w("hello");
```

此时 `w` 的类型为：

```cpp
Wrapper<std::string>
```

---

## 7. Inline Variable：内联变量

### 机制

变量可以声明为 `inline`，允许同一个变量定义出现在多个翻译单元中。

### 用法

头文件中直接定义静态成员：

```cpp
class Config {
public:
	inline static int maxConnections = 100;
};
```

命名空间变量：

```cpp
inline constexpr double pi = 3.141592653589793;
```

---

## 8. `constexpr` Lambda

### 机制

满足条件的 Lambda 可以在常量表达式中执行。

### 用法

```cpp
constexpr auto square = [](int x) {
	return x * x;
};

static_assert(square(5) == 25);
```

---

## 9. `auto` 非类型模板参数

### 机制

非类型模板参数可以使用 `auto`，由传入值推导参数类型。

### 用法

```cpp
template <auto N>
struct Constant {
	static constexpr auto value = N;
};

Constant<10> a;
Constant<'A'> b;
Constant<true> c;
```

---

## 10. Guaranteed Copy Elision：保证复制消除

### 机制

某些 prvalue 初始化场景中，标准保证对象直接在目标位置构造。

### 用法

```cpp
class X {
public:
	X() = default;
	X(const X&) = delete;
	X(X&&) = delete;
};

X makeX() {
	return X{};
}

int main() {
	X x = makeX();
}
```

即使复制构造和移动构造被删除，这段代码仍可成立。

直接初始化：

```cpp
X x = X{};
```

---

## 11. Nested Namespace 简写

### 机制

嵌套命名空间可以一次声明。

### 用法

```cpp
namespace game::physics::collision {
	void update();
}
```

等价于旧写法：

```cpp
namespace game {
	namespace physics {
		namespace collision {
			void update();
		}
	}
}
```

---

## 12. `std::optional`

### 机制

`std::optional<T>` 表示“可能存在一个 `T`，也可能为空”。

### 用法

```cpp
#include <optional>
#include <string>

std::optional<int> findUserId(const std::string& name) {
	if (name == "Alice") {
		return 42;
	}

	return std::nullopt;
}
```

读取：

```cpp
auto result = findUserId("Alice");

if (result) {
	std::cout << *result << '\n';
}
```

```cpp
int id = result.value();
int id2 = result.value_or(-1);
```

原地构造：

```cpp
std::optional<std::string> name;
name.emplace("Alice");
name.reset();
```

---

## 13. `std::variant`

### 机制

`std::variant<Ts...>` 在同一时刻保存候选类型中的一种，是带类型信息的 tagged union。

### 用法

```cpp
#include <variant>
#include <string>

std::variant<int, double, std::string> value;

value = 42;
value = 3.14;
value = std::string("hello");
```

按类型读取：

```cpp
if (std::holds_alternative<std::string>(value)) {
	std::cout << std::get<std::string>(value) << '\n';
}
```

访问：

```cpp
std::visit([](const auto& x) {
	std::cout << x << '\n';
}, value);
```

重载访问器：

```cpp
template <typename... Ts>
struct Overloaded : Ts... {
	using Ts::operator()...;
};

template <typename... Ts>
Overloaded(Ts...) -> Overloaded<Ts...>;

std::visit(Overloaded{
	[](int x) {
		std::cout << "int: " << x << '\n';
	},
	[](double x) {
		std::cout << "double: " << x << '\n';
	},
	[](const std::string& x) {
		std::cout << "string: " << x << '\n';
	}
}, value);
```

---

## 14. `std::any`

### 机制

`std::any` 可以保存任意满足要求的单一值，并在运行时通过类型检查取出。

### 用法

```cpp
#include <any>
#include <string>

std::any value = 42;
value = std::string("hello");
```

读取：

```cpp
try {
	auto s = std::any_cast<std::string>(value);
} catch (const std::bad_any_cast&) {
	// 类型不匹配
}
```

指针形式：

```cpp
if (auto p = std::any_cast<std::string>(&value)) {
	std::cout << *p << '\n';
}
```

---

## 15. `std::string_view`

### 机制

`std::string_view` 保存字符序列的指针和长度，不拥有字符数据。

### 用法

```cpp
#include <string_view>

void print(std::string_view text) {
	std::cout << text << '\n';
}
```

可接收：

```cpp
print("hello");

std::string s = "world";
print(s);
```

切片：

```cpp
std::string_view text = "Hello World";
auto hello = text.substr(0, 5);
```

使用时必须保证被查看的字符数据仍然存活。

---

## 16. `std::filesystem`

### 机制

标准库加入文件系统路径、目录遍历、文件属性和文件操作接口。

### 用法

```cpp
#include <filesystem>

namespace fs = std::filesystem;

fs::path p = "assets/images/player.png";

std::cout << p.filename() << '\n';
std::cout << p.extension() << '\n';
std::cout << p.parent_path() << '\n';
```

判断与创建：

```cpp
if (!fs::exists("output")) {
	fs::create_directories("output");
}
```

遍历目录：

```cpp
for (const auto& entry : fs::directory_iterator("assets")) {
	std::cout << entry.path() << '\n';
}
```

递归遍历：

```cpp
for (const auto& entry : fs::recursive_directory_iterator("assets")) {
	std::cout << entry.path() << '\n';
}
```

---

## 17. `std::invoke`

### 机制

统一调用普通函数、函数对象、成员函数指针和成员变量指针。

### 用法

```cpp
#include <functional>

int add(int a, int b) {
	return a + b;
}

int result = std::invoke(add, 1, 2);
```

成员函数：

```cpp
struct Player {
	void jump(int height) {
		std::cout << height << '\n';
	}
};

Player p;
std::invoke(&Player::jump, p, 10);
```

成员变量：

```cpp
struct Player {
	int hp = 100;
};

Player p;
std::cout << std::invoke(&Player::hp, p) << '\n';
```

---

## 18. `std::apply`

### 机制

把 tuple-like 对象中的元素展开为函数参数。

### 用法

```cpp
#include <tuple>

int add(int a, int b, int c) {
	return a + b + c;
}

std::tuple args{1, 2, 3};
int result = std::apply(add, args);
```

Lambda：

```cpp
std::apply([](auto&&... xs) {
	((std::cout << xs << ' '), ...);
}, args);
```

---

## 19. `std::byte`

### 机制

`std::byte` 表示原始字节数据，避免把字节误当作字符或整数进行算术运算。

### 用法

```cpp
#include <cstddef>

std::byte b{0x2A};
```

位运算：

```cpp
std::byte flags{0b0000'0011};
flags |= std::byte{0b0000'0100};
```

转换：

```cpp
int value = std::to_integer<int>(b);
```

---

## 20. Parallel Algorithms：并行 STL 算法

### 机制

标准算法可以接受执行策略。

### 用法

```cpp
#include <algorithm>
#include <execution>
#include <vector>

std::vector<int> v(1'000'000);

std::sort(std::execution::par, v.begin(), v.end());
```

常见策略：

```cpp
std::execution::seq
std::execution::par
std::execution::par_unseq
```

---

## 21. Polymorphic Memory Resource：`std::pmr`

### 机制

容器的分配策略可以在运行时通过 `std::pmr::memory_resource` 指定。

### 用法

```cpp
#include <memory_resource>
#include <vector>

std::byte buffer[4096];
std::pmr::monotonic_buffer_resource resource(buffer, sizeof(buffer));

std::pmr::vector<int> v(&resource);

for (int i = 0; i < 100; ++i) {
	v.push_back(i);
}
```

---

# C++20

## 1. Concepts

### 机制

Concept 是对模板参数施加的编译期约束。

```cpp
template <typename T>
concept Addable = requires(T a, T b) {
	a + b;
};
```

### 用法

直接约束模板参数：

```cpp
template <Addable T>
T add(T a, T b) {
	return a + b;
}
```

`requires` 子句：

```cpp
template <typename T>
requires Addable<T>
T add(T a, T b) {
	return a + b;
}
```

缩写函数模板：

```cpp
auto add(Addable auto a, Addable auto b) {
	return a + b;
}
```

标准 Concept：

```cpp
#include <concepts>

template <std::integral T>
T gcd(T a, T b) {
	while (b != 0) {
		T t = a % b;
		a = b;
		b = t;
	}

	return a;
}
```

---

## 2. `requires` Expression

### 机制

`requires` 表达式可以检查类型、表达式、返回类型和编译期条件是否合法。

### 用法

检查成员函数存在：

```cpp
template <typename T>
concept HasSize = requires(T value) {
	value.size();
};
```

检查返回类型：

```cpp
#include <concepts>

template <typename T>
concept HasSize = requires(T value) {
	{ value.size() } -> std::convertible_to<std::size_t>;
};
```

检查类型成员：

```cpp
template <typename T>
concept HasValueType = requires {
	typename T::value_type;
};
```

复合检查：

```cpp
template <typename T>
concept Container = requires(T c) {
	typename T::value_type;
	{ c.begin() };
	{ c.end() };
	{ c.size() } -> std::convertible_to<std::size_t>;
};
```

---

## 3. Ranges

### 机制

Ranges 将“迭代器对”提升为可组合的范围对象，并提供惰性的 view 管道。

### 用法

范围算法：

```cpp
#include <algorithm>
#include <ranges>
#include <vector>

std::vector<int> v{5, 2, 4, 1, 3};
std::ranges::sort(v);
```

无需显式写 `begin()` / `end()`：

```cpp
std::ranges::reverse(v);
```

---

## 4. Range Views

### 机制

View 通常不拥有元素，只保存对原范围的轻量级变换描述，并在迭代时执行。

### 用法

过滤：

```cpp
#include <ranges>
#include <vector>

std::vector<int> v{1, 2, 3, 4, 5, 6};

auto even = v | std::views::filter([](int x) {
	return x % 2 == 0;
});
```

转换：

```cpp
auto square = v | std::views::transform([](int x) {
	return x * x;
});
```

组合：

```cpp
auto result = v
	| std::views::filter([](int x) {
		return x % 2 == 0;
	})
	| std::views::transform([](int x) {
		return x * x;
	});
```

截取：

```cpp
auto firstThree = v | std::views::take(3);
auto afterTwo = v | std::views::drop(2);
```

整数序列：

```cpp
for (int i : std::views::iota(0, 10)) {
	std::cout << i << '\n';
}
```

---

## 5. Coroutine：协程

### 机制

C++20 提供协程语言基础设施。函数中出现以下关键字之一时，函数可能成为协程：

```cpp
co_await
co_yield
co_return
```

协程可以挂起，并在以后恢复执行。协程状态被保存到协程帧中。

### 用法：`co_await`

```cpp
auto result = co_await asyncOperation();
```

`co_await` 的对象通过 awaiter 协议控制：

```cpp
struct Awaiter {
	bool await_ready();
	void await_suspend(std::coroutine_handle<> handle);
	T await_resume();
};
```

### 用法：`co_return`

```cpp
Task<int> calculate() {
	co_return 42;
}
```

### 用法：`co_yield`

```cpp
Generator<int> numbers() {
	for (int i = 0; i < 10; ++i) {
		co_yield i;
	}
}
```

### Promise 协议

协程返回类型需要通过 `promise_type` 与编译器交互：

```cpp
struct Task {
	struct promise_type {
		Task get_return_object();
		std::suspend_never initial_suspend();
		std::suspend_never final_suspend() noexcept;
		void return_void();
		void unhandled_exception();
	};
};
```

---

## 6. Modules

### 机制

Module 提供语言级模块边界，用于替代部分传统头文件文本包含模型。

### 用法

定义模块接口：

```cpp
export module math;

export int add(int a, int b) {
	return a + b;
}
```

导入：

```cpp
import math;

int main() {
	return add(1, 2);
}
```

只导出部分声明：

```cpp
export module game;

export class Player {
public:
	void update();
};

class InternalHelper {
};
```

导出块：

```cpp
export module math;

export {
	int add(int a, int b);
	int sub(int a, int b);
}
```

---

## 7. Three-Way Comparison：`<=>`

### 机制

`<=>` 一次比较可以表达小于、等于、大于关系，并可用于自动生成其他比较运算符。

### 用法

```cpp
#include <compare>

struct Point {
	int x;
	int y;

	auto operator<=>(const Point&) const = default;
};
```

之后可以直接：

```cpp
Point a{1, 2};
Point b{2, 3};

bool x = a < b;
bool y = a == b;
bool z = a >= b;
```

手动比较：

```cpp
auto result = a <=> b;

if (result < 0) {
	// a < b
}
```

比较类别包括：

```cpp
std::strong_ordering
std::weak_ordering
std::partial_ordering
```

---

## 8. Designated Initializer：指定成员初始化

### 机制

聚合类型可以按成员名初始化。

### 用法

```cpp
struct Player {
	int hp;
	int mp;
	float speed;
};

Player p{
	.hp = 100,
	.mp = 50,
	.speed = 3.5f
};
```

成员必须遵守声明顺序。

---

## 9. `consteval`

### 机制

`consteval` 声明立即函数。每次潜在求值调用都必须产生编译期结果。

### 用法

```cpp
consteval int square(int x) {
	return x * x;
}

constexpr int a = square(5);
```

```cpp
int x = 5;
// int y = square(x); // x 不是常量表达式时不成立
```

编译期校验：

```cpp
consteval int checked(int x) {
	if (x < 0) {
		throw "negative value";
	}

	return x;
}
```

---

## 10. `constinit`

### 机制

`constinit` 要求具有静态或线程存储期的变量进行静态初始化。

### 用法

```cpp
constinit int globalValue = 42;
```

变量本身仍然可以修改：

```cpp
constinit int counter = 0;

void update() {
	++counter;
}
```

与 `const` 联用：

```cpp
constinit const int maxCount = 100;
```

---

## 11. 扩展 `constexpr`

### 机制

C++20 继续放宽常量求值限制，使更多普通 C++ 代码可以在编译期执行。

### 用法

动态分配可以出现在常量求值过程中，只要生命周期满足常量求值规则：

```cpp
constexpr int sum() {
	int* p = new int[3]{1, 2, 3};
	int result = p[0] + p[1] + p[2];
	delete[] p;
	return result;
}

static_assert(sum() == 6);
```

`std::vector` 等标准容器也获得大量 `constexpr` 支持：

```cpp
constexpr int calc() {
	std::vector<int> v{1, 2, 3};
	return v[0] + v[1] + v[2];
}
```

---

## 12. Lambda 显式模板参数列表

### 机制

Lambda 可以显式声明自己的模板参数。

### 用法

```cpp
auto f = []<typename T>(T value) {
	return value;
};

f(10);
f(3.14);
```

多个模板参数：

```cpp
auto add = []<typename T, typename U>(T a, U b) {
	return a + b;
};
```

约束：

```cpp
auto square = []<std::integral T>(T x) {
	return x * x;
};
```

---

## 13. Lambda `[=, this]`

### 机制

可以明确表示按值捕获外部变量，同时捕获当前对象的 `this` 指针。

### 用法

```cpp
class Player {
public:
	void run() {
		int x = 10;

		auto f = [=, this]() {
			std::cout << x << '\n';
			std::cout << hp << '\n';
		};

		f();
	}

private:
	int hp = 100;
};
```

---

## 14. Class-Type Non-Type Template Parameter

### 机制

满足 structural type 要求的类类型可以作为非类型模板参数。

### 用法

```cpp
struct FixedString {
	char data[6];

	constexpr FixedString(const char (&str)[6]) {
		for (int i = 0; i < 6; ++i) {
			data[i] = str[i];
		}
	}
};

template <FixedString Name>
struct Tag {
};

Tag<"hello"> tag;
```

---

## 15. `using enum`

### 机制

可以把某个枚举类型的枚举项引入当前作用域。

### 用法

```cpp
enum class Color {
	Red,
	Green,
	Blue
};

void print(Color color) {
	using enum Color;

	switch (color) {
		case Red:
			break;
		case Green:
			break;
		case Blue:
			break;
	}
}
```

---

## 16. Aggregate Parenthesized Initialization

### 机制

聚合类型可以使用圆括号初始化。

### 用法

```cpp
struct Point {
	int x;
	int y;
};

Point p(10, 20);
```

---

## 17. `std::span`

### 机制

`std::span<T>` 是连续内存区间的非拥有视图，保存指针和元素数量。

### 用法

```cpp
#include <span>

void process(std::span<const int> values) {
	for (int x : values) {
		std::cout << x << '\n';
	}
}
```

数组：

```cpp
int a[] = {1, 2, 3, 4};
process(a);
```

`std::vector`：

```cpp
std::vector<int> v{1, 2, 3};
process(v);
```

子视图：

```cpp
std::span<int> s = v;
auto first = s.first(2);
auto last = s.last(2);
auto middle = s.subspan(1, 2);
```

---

## 18. `std::jthread`

### 机制

`std::jthread` 在线程对象析构时自动请求停止并执行 `join()`。

### 用法

```cpp
#include <thread>

std::jthread worker([] {
	work();
});
```

配合 `std::stop_token`：

```cpp
std::jthread worker([](std::stop_token token) {
	while (!token.stop_requested()) {
		doWork();
	}
});

worker.request_stop();
```

---

## 19. `std::stop_token`

### 机制

提供协作式停止请求机制。

### 用法

```cpp
void worker(std::stop_token token) {
	while (!token.stop_requested()) {
		performOneStep();
	}
}
```

停止回调：

```cpp
std::stop_callback callback(token, [] {
	std::cout << "stop requested\n";
});
```

---

## 20. `std::latch`

### 机制

一次性倒计数同步原语。计数降到 0 后，所有等待线程可以继续。

### 用法

```cpp
#include <latch>
#include <thread>

std::latch done(3);

std::jthread a([&] {
	workA();
	done.count_down();
});

std::jthread b([&] {
	workB();
	done.count_down();
});

std::jthread c([&] {
	workC();
	done.count_down();
});

done.wait();
```

---

## 21. `std::barrier`

### 机制

可重复使用的阶段同步原语。所有参与线程到达同步点后进入下一阶段。

### 用法

```cpp
#include <barrier>

std::barrier syncPoint(3);

void worker() {
	phaseOne();
	syncPoint.arrive_and_wait();

	phaseTwo();
	syncPoint.arrive_and_wait();
}
```

完成函数：

```cpp
std::barrier syncPoint(3, [] {
	std::cout << "phase completed\n";
});
```

---

## 22. `std::counting_semaphore`

### 机制

信号量内部维护许可数量，线程可以获取和释放许可。

### 用法

```cpp
#include <semaphore>

std::counting_semaphore<3> sem(3);

void useResource() {
	sem.acquire();
	accessLimitedResource();
	sem.release();
}
```

二元信号量：

```cpp
std::binary_semaphore sem(0);
```

---

## 23. `std::atomic::wait` / `notify_one` / `notify_all`

### 机制

原子对象可以直接等待值发生变化，并由其他线程通知。

### 用法

```cpp
#include <atomic>

std::atomic<int> state{0};

void consumer() {
	state.wait(0);
	process();
}

void producer() {
	state.store(1);
	state.notify_one();
}
```

---

## 24. `std::atomic_ref`

### 机制

给现有普通对象提供原子访问视图，而无需把对象类型声明成 `std::atomic<T>`。

### 用法

```cpp
#include <atomic>

int value = 0;
std::atomic_ref<int> ref(value);

ref.fetch_add(1);
```

所有并发访问必须满足 `atomic_ref` 的原子访问要求。

---

## 25. `std::source_location`

### 机制

在调用点获取源文件、行号、列号和函数名。

### 用法

```cpp
#include <source_location>
#include <iostream>

void log(
	const char* message,
	const std::source_location& loc = std::source_location::current()
) {
	std::cout
		<< loc.file_name()
		<< ':'
		<< loc.line()
		<< " "
		<< message
		<< '\n';
}
```

调用：

```cpp
log("something happened");
```

---

## 26. `std::format`

### 机制

提供类型安全的格式化接口。

### 用法

```cpp
#include <format>
#include <string>

std::string text = std::format("{} + {} = {}", 1, 2, 3);
```

格式控制：

```cpp
std::format("{:.2f}", 3.1415926);
std::format("{:08x}", 255);
std::format("{:>10}", "hello");
```

---

## 27. `<bit>` 位操作

### 机制

标准库提供常见位操作函数。

### 用法

```cpp
#include <bit>

bool a = std::has_single_bit(8u);
auto b = std::bit_ceil(10u);
auto c = std::bit_floor(10u);
auto d = std::bit_width(10u);
auto e = std::popcount(0b101101u);
auto f = std::rotl(0b0001u, 1);
```

---

## 28. `std::endian`

### 机制

用于查询平台字节序。

### 用法

```cpp
#include <bit>

if constexpr (std::endian::native == std::endian::little) {
	// little endian
}
```

---

## 29. Calendar / Time Zone Chrono 扩展

### 机制

`<chrono>` 增加日期、日历和时区类型。

### 用法

```cpp
#include <chrono>

using namespace std::chrono;

year_month_day date = 2026y / September / 13;
```

日期运算：

```cpp
year_month_day next = date + months{1};
```

转换到 `sys_days`：

```cpp
sys_days days = date;
```

时区：

```cpp
auto zone = locate_zone("Asia/Tokyo");
auto now = system_clock::now();
zoned_time localTime(zone, now);
```

---

## 30. `std::osyncstream`

### 机制

多个线程向同一输出流输出时，可以把一次逻辑输出缓冲后整体提交。

### 用法

```cpp
#include <syncstream>
#include <iostream>

void worker(int id) {
	std::osyncstream(std::cout)
		<< "worker "
		<< id
		<< " finished\n";
}
```

---

# C++23

## 1. Explicit Object Parameter：显式对象参数 / Deducing `this`

### 机制

成员函数可以把隐式的对象参数写成显式参数：

```cpp
struct X {
	void foo(this X& self);
};
```

对象参数也可以使用模板推导。

### 用法

统一 `const` / 非 `const` getter：

```cpp
struct Player {
	int hp = 100;

	auto&& getHp(this auto&& self) {
		return std::forward_like<decltype(self)>(self.hp);
	}
};
```

调用仍然使用成员函数语法：

```cpp
Player p;
p.getHp();
```

CRTP 风格接口：

```cpp
struct Base {
	void interface(this auto&& self) {
		self.implementation();
	}
};

struct Derived : Base {
	void implementation() {
		std::cout << "Derived\n";
	}
};
```

递归 Lambda：

```cpp
auto factorial = [](this auto self, int n) -> int {
	if (n <= 1) {
		return 1;
	}

	return n * self(n - 1);
};
```

---

## 2. `if consteval`

### 机制

检测当前代码路径是否处于立即常量求值环境。

### 用法

```cpp
constexpr int calculate(int x) {
	if consteval {
		return x * x;
	} else {
		return runtimeCalculate(x);
	}
}
```

带 `else`：

```cpp
constexpr int f(int x) {
	if consteval {
		return compileTimePath(x);
	} else {
		return runtimePath(x);
	}
}
```

---

## 3. `static operator()`

### 机制

调用运算符可以声明为静态成员函数。

### 用法

```cpp
struct Add {
	static int operator()(int a, int b) {
		return a + b;
	}
};

Add add;
int result = add(1, 2);
```

也可以通过类型调用：

```cpp
int result = Add::operator()(1, 2);
```

---

## 4. `static operator[]`

### 机制

下标运算符可以声明为静态成员函数。

### 用法

```cpp
struct Table {
	static int operator[](std::size_t index) {
		return static_cast<int>(index * 10);
	}
};

Table table;
int x = table[3];
```

---

## 5. 多参数 `operator[]`

### 机制

下标运算符可以接受多个参数。

### 用法

```cpp
class Matrix {
public:
	int& operator[](std::size_t row, std::size_t col) {
		return data[row * width + col];
	}

private:
	std::size_t width = 10;
	int data[100]{};
};

Matrix m;
m[2, 3] = 42;
```

---

## 6. `auto(x)` 与 `auto{x}`

### 机制

可以使用 `auto` 形式显式创建由表达式推导出的值类型对象。

### 用法

```cpp
int x = 10;
int& ref = x;

auto copy1 = auto(ref);
auto copy2 = auto{ref};
```

模板中创建值副本：

```cpp
template <typename T>
auto decayCopy(T&& value) {
	return auto(std::forward<T>(value));
}
```

---

## 7. Simpler Implicit Move

### 机制

返回局部变量等场景中的隐式移动规则得到简化，满足条件时局部对象会按可移动表达式处理。

### 用法

```cpp
std::unique_ptr<int> makeValue() {
	auto ptr = std::make_unique<int>(42);
	return ptr;
}
```

不需要手动写：

```cpp
return std::move(ptr);
```

---

## 8. `std::expected`

### 机制

`std::expected<T, E>` 保存成功值 `T` 或错误值 `E`。

### 用法

```cpp
#include <expected>
#include <string>

std::expected<int, std::string> parseInt(const std::string& text) {
	try {
		return std::stoi(text);
	} catch (...) {
		return std::unexpected("invalid integer");
	}
}
```

读取：

```cpp
auto result = parseInt("123");

if (result) {
	std::cout << *result << '\n';
} else {
	std::cout << result.error() << '\n';
}
```

`value_or`：

```cpp
int value = result.value_or(0);
```

---

## 9. `std::optional` Monadic Operations

### 机制

`std::optional` 增加函数式链式操作：

```cpp
and_then
transform
or_else
```

### 用法

```cpp
std::optional<int> value = 10;

auto result = value
	.transform([](int x) {
		return x * 2;
	})
	.and_then([](int x) -> std::optional<std::string> {
		if (x > 10) {
			return std::to_string(x);
		}

		return std::nullopt;
	});
```

错误恢复：

```cpp
auto result = value.or_else([] {
	return std::optional<int>{0};
});
```

---

## 10. `std::expected` Monadic Operations

### 机制

`std::expected` 支持链式组合成功路径与错误路径。

### 用法

```cpp
auto result = loadConfig()
	.and_then(validateConfig)
	.and_then(createGame)
	.transform([](Game game) {
		return game.run();
	})
	.or_else([](const Error& error) {
		logError(error);
		return std::expected<int, Error>{std::unexpected(error)};
	});
```

---

## 11. `std::mdspan`

### 机制

`std::mdspan` 是多维连续或非连续数据的非拥有视图，可以把线性存储映射成多维索引。

### 用法

```cpp
#include <mdspan>
#include <vector>

std::vector<float> data(3 * 4);

std::mdspan<float, std::extents<std::size_t, 3, 4>> matrix(data.data());

matrix[1, 2] = 42.0f;
```

动态维度：

```cpp
std::mdspan<
	float,
	std::dextents<std::size_t, 2>
> matrix(data.data(), rows, cols);
```

---

## 12. `std::print` / `std::println`

### 机制

基于格式字符串直接输出，无需先构造 `std::string`。

### 用法

```cpp
#include <print>

std::print("name = {}, score = {}\n", "Alice", 100);
std::println("x = {}", 42);
```

格式控制：

```cpp
std::println("pi = {:.3f}", 3.1415926);
```

---

## 13. `std::ranges::to`

### 机制

把 range 的结果直接转换为目标容器。

### 用法

```cpp
#include <ranges>
#include <vector>

std::vector<int> values{1, 2, 3, 4, 5, 6};

auto result = values
	| std::views::filter([](int x) {
		return x % 2 == 0;
	})
	| std::ranges::to<std::vector>();
```

转换成其他容器：

```cpp
auto set = values | std::ranges::to<std::set>();
```

---

## 14. `std::views::zip`

### 机制

把多个 range 按位置组合成 tuple-like 元素序列。

### 用法

```cpp
std::vector<int> ids{1, 2, 3};
std::vector<std::string> names{"A", "B", "C"};

for (auto&& [id, name] : std::views::zip(ids, names)) {
	std::cout << id << ' ' << name << '\n';
}
```

---

## 15. `std::views::zip_transform`

### 机制

对多个 range 同位置元素执行变换。

### 用法

```cpp
auto sums = std::views::zip_transform(
	std::plus{},
	left,
	right
);
```

遍历：

```cpp
for (auto value : sums) {
	std::cout << value << '\n';
}
```

---

## 16. `std::views::adjacent`

### 机制

按固定窗口大小查看相邻元素。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 4};

for (auto [a, b] : values | std::views::adjacent<2>) {
	std::cout << a << ' ' << b << '\n';
}
```

---

## 17. `std::views::adjacent_transform`

### 机制

对相邻窗口直接执行变换。

### 用法

```cpp
auto diff = values | std::views::adjacent_transform<2>([](int a, int b) {
	return b - a;
});
```

---

## 18. `std::views::pairwise`

### 机制

`pairwise` 是 `adjacent<2>` 的便捷形式。

### 用法

```cpp
for (auto [a, b] : values | std::views::pairwise) {
	std::cout << a << " -> " << b << '\n';
}
```

---

## 19. `std::views::enumerate`

### 机制

遍历 range 时同时生成索引。

### 用法

```cpp
std::vector<std::string> names{"A", "B", "C"};

for (auto [index, name] : std::views::enumerate(names)) {
	std::cout << index << ": " << name << '\n';
}
```

---

## 20. `std::views::cartesian_product`

### 机制

生成多个 range 的笛卡尔积。

### 用法

```cpp
std::vector<int> xs{1, 2};
std::vector<char> ys{'A', 'B'};

for (auto [x, y] : std::views::cartesian_product(xs, ys)) {
	std::cout << x << ' ' << y << '\n';
}
```

---

## 21. `std::views::chunk`

### 机制

把 range 按固定大小切成连续块。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 4, 5, 6};

for (auto chunk : values | std::views::chunk(2)) {
	for (int x : chunk) {
		std::cout << x << ' ';
	}

	std::cout << '\n';
}
```

---

## 22. `std::views::slide`

### 机制

生成固定长度的滑动窗口。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 4, 5};

for (auto window : values | std::views::slide(3)) {
	for (int x : window) {
		std::cout << x << ' ';
	}

	std::cout << '\n';
}
```

---

## 23. `std::views::chunk_by`

### 机制

根据相邻元素谓词把 range 划分为若干连续组。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 10, 11, 20};

auto groups = values | std::views::chunk_by([](int a, int b) {
	return b == a + 1;
});
```

---

## 24. `std::views::join_with`

### 机制

连接嵌套 range，并在子 range 之间插入分隔 range 或分隔元素。

### 用法

```cpp
std::vector<std::string> words{"hello", "world", "cpp"};

auto chars = words | std::views::join_with(' ');

for (char c : chars) {
	std::cout << c;
}
```

---

## 25. `std::views::repeat`

### 机制

生成重复值的 view。

### 用法

```cpp
auto values = std::views::repeat(42, 5);

for (int x : values) {
	std::cout << x << '\n';
}
```

---

## 26. `std::generator`

### 机制

标准库提供基于协程的惰性序列生成器。

### 用法

```cpp
#include <generator>

std::generator<int> fibonacci() {
	int a = 0;
	int b = 1;

	while (true) {
		co_yield a;
		auto next = a + b;
		a = b;
		b = next;
	}
}
```

遍历：

```cpp
int count = 0;

for (int value : fibonacci()) {
	std::cout << value << '\n';

	if (++count == 10) {
		break;
	}
}
```

---

## 27. `std::move_only_function`

### 机制

类似 `std::function`，但允许保存只可移动、不可复制的可调用对象。

### 用法

```cpp
#include <functional>
#include <memory>

std::move_only_function<void()> task = [ptr = std::make_unique<int>(42)] {
	std::cout << *ptr << '\n';
};

task();
```

---

## 28. `std::forward_like`

### 机制

把某个类型的 cv/ref 属性应用到另一个表达式上。

### 用法

```cpp
#include <utility>

struct Wrapper {
	int value;

	auto&& get(this auto&& self) {
		return std::forward_like<decltype(self)>(self.value);
	}
};
```

效果会随对象类别变化：

```cpp
Wrapper w{42};
const Wrapper cw{42};

w.get();
cw.get();
std::move(w).get();
```

---

## 29. `std::to_underlying`

### 机制

把 scoped enum 或普通枚举转换为底层整数类型。

### 用法

```cpp
#include <utility>

enum class State : unsigned char {
	Idle = 1,
	Run = 2
};

auto value = std::to_underlying(State::Run);
```

---

## 30. `std::byteswap`

### 机制

翻转整数对象的字节顺序。

### 用法

```cpp
#include <bit>
#include <cstdint>

std::uint32_t x = 0x11223344;
auto y = std::byteswap(x);
```

`y` 对应：

```text
0x44332211
```

---

## 31. `std::stacktrace`

### 机制

获取当前调用栈快照。

### 用法

```cpp
#include <stacktrace>
#include <iostream>

void logStack() {
	std::cout << std::stacktrace::current() << '\n';
}
```

---

## 32. `std::unreachable`

### 机制

向编译器声明某条控制流路径不可到达。实际运行到该调用会触发未定义行为。

### 用法

```cpp
#include <utility>

enum class State {
	Idle,
	Run
};

int toInt(State state) {
	switch (state) {
		case State::Idle:
			return 0;
		case State::Run:
			return 1;
	}

	std::unreachable();
}
```

---

## 33. `std::flat_map` / `std::flat_set`

### 机制

提供基于连续存储结构的有序关联容器接口。

### 用法

```cpp
#include <flat_map>

std::flat_map<int, std::string> users;

users.emplace(1, "Alice");
users.emplace(2, "Bob");

if (auto it = users.find(2); it != users.end()) {
	std::cout << it->second << '\n';
}
```

`std::flat_set`：

```cpp
#include <flat_set>

std::flat_set<int> values{5, 1, 3, 2};
```

---

## 34. `std::spanstream`

### 机制

允许 iostream 直接在用户提供的连续字符缓冲区上工作。

### 用法

```cpp
#include <spanstream>
#include <array>

std::array<char, 128> buffer{};
std::ospanstream out(buffer);

out << 123 << ' ' << 456;
```

读取：

```cpp
std::ispanstream in(std::span<const char>(buffer.data(), buffer.size()));

int a;
int b;
in >> a >> b;
```

---

## 35. `std::out_ptr` / `std::inout_ptr`

### 机制

把智能指针适配到传统 C API 的 `T**` 输出参数。

### 用法

假设 C API：

```cpp
void create_resource(Resource** out);
void reset_resource(Resource** inout);
```

配合智能指针：

```cpp
#include <memory>

std::unique_ptr<Resource, Deleter> resource;

create_resource(std::out_ptr(resource));
reset_resource(std::inout_ptr(resource));
```

---

## 36. `std::start_lifetime_as`

### 机制

在适当的原始存储中显式开始对象生命周期，用于底层内存、序列化、共享内存等场景。

### 用法

```cpp
#include <memory>
#include <cstddef>

alignas(int) std::byte storage[sizeof(int)];

int* p = std::start_lifetime_as<int>(storage);
*p = 42;
```

数组形式：

```cpp
int* p = std::start_lifetime_as_array<int>(storage, count);
```

---

## 37. `std::string::contains`

### 机制

字符串直接提供包含判断。

### 用法

```cpp
#include <string>

std::string text = "hello world";

if (text.contains("world")) {
	// found
}

if (text.contains('w')) {
	// found
}
```

---

## 38. `std::string_view::contains`

### 机制

`std::string_view` 同样提供包含判断。

### 用法

```cpp
std::string_view text = "hello world";

if (text.contains("world")) {
	// found
}
```

---

## 39. `std::ranges::contains`

### 机制

Ranges 算法直接检查 range 是否包含目标值。

### 用法

```cpp
#include <algorithm>
#include <vector>

std::vector<int> values{1, 2, 3, 4};

bool found = std::ranges::contains(values, 3);
```

投影：

```cpp
struct Player {
	int id;
	std::string name;
};

bool found = std::ranges::contains(players, 42, &Player::id);
```

---

## 40. `std::ranges::find_last`

### 机制

从逻辑上查找最后一个满足条件或等于目标值的元素。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 2, 4};

auto result = std::ranges::find_last(values, 2);
```

相关接口：

```cpp
std::ranges::find_last
std::ranges::find_last_if
std::ranges::find_last_if_not
```

---

## 41. `std::ranges::fold_left` / `fold_right`

### 机制

Ranges 提供显式左折叠和右折叠算法。

### 用法

```cpp
#include <algorithm>
#include <vector>

std::vector<int> values{1, 2, 3, 4};

auto sum = std::ranges::fold_left(values, 0, std::plus{});
```

字符串拼接等非交换操作可以区分左右折叠方向。

---

## 42. `std::ranges::starts_with` / `ends_with`

### 机制

判断一个 range 是否以另一个 range 开头或结尾。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 4};
std::vector<int> prefix{1, 2};
std::vector<int> suffix{3, 4};

bool a = std::ranges::starts_with(values, prefix);
bool b = std::ranges::ends_with(values, suffix);
```

---

## 43. `std::ranges::iota`

### 机制

Ranges 算法版本的 `iota`，对整个 range 依次赋递增值。

### 用法

```cpp
std::vector<int> values(5);
std::ranges::iota(values, 10);
```

结果：

```text
10 11 12 13 14
```

---

## 44. `std::ranges::shift_left` / `shift_right`

### 机制

在 range 内部移动元素位置。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 4, 5};
std::ranges::shift_left(values, 2);
```

```cpp
std::ranges::shift_right(values, 2);
```
