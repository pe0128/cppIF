# C++17

## Structured Binding结构化绑定 {#feature-1}

### 语法与行为

可以把数组、`std::pair`、`std::tuple` 或满足 tuple-like 规则的对象拆成多个名字。

```cpp
auto [x, y] = pair;
```

### 使用场景与差异

用于遍历映射键值对、接收多值返回或读取聚合成员。auto 形式建立隐藏对象副本，auto& 绑定已有对象；对 map 元素即使用引用绑定，键仍为 const。绑定成员需满足数组、tuple 协议或可访问数据成员的分解规则。

### 用法

`std::pair`

```cpp
std::pair<int, std::string> p{1, "Alice"};

auto [id, name] = p;
```

引用绑定

```cpp
auto& [id, name] = p;
name = "Bob";
```

遍历 `std::map`

```cpp
std::map<std::string, int> score;

for (const auto& [name, value] : score) {
	std::cout << name << ": " << value << '\n';
}
```

结构体

```cpp
struct Point {
	int x;
	int y;
};

Point p{10, 20};
auto [x, y] = p;
```


## `if`、`switch` 初始化语句 {#feature-2}

### 语法与行为

`if` 与 `switch` 条件前可以先定义局部变量。

```cpp
if (init; condition) {
	// ...
}
```

### 使用场景与差异

用于把查找迭代器、状态码或锁限定在整个条件语句中。初始化变量在条件和两个分支内可见，语句结束后销毁；与进入 if 之前单独声明相比，不会继续泄露名称到后续语句。

### 用法

```cpp
if (auto it = mp.find(key); it != mp.end()) {
	std::cout << it->second << '\n';
}
```

锁的作用域控制

```cpp
if (std::lock_guard<std::mutex> lock(mtx); ready) {
	useResource();
}
```

`switch`

```cpp
switch (int code = getCode(); code) {
	case 0:
		break;
	case 1:
		break;
}
```


## `if constexpr` {#feature-3}

### 语法与行为

`if constexpr` 在编译期选择分支。未选择的分支在模板实例化时不会参与普通语义实例化。

### 使用场景与差异

用于按模板类型选择不同实现。未选分支在模板实例化时可被丢弃，但仍需通过语法分析，非依赖于模板参数的错误也不能任意隐藏；普通非模板代码的未选分支仍会进行语义检查。

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

模板递归终止

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


## Fold Expression折叠表达式 {#feature-4}

### 语法与行为

可以把参数包直接用运算符折叠。

常见形式

```cpp
(args + ...)
(... + args)
(init + ... + args)
(args + ... + init)
```

### 使用场景与差异

用于参数包求和、逐项输出或组合谓词。左右折叠影响非结合运算的括号位置。无初始值的空包仅在规定的运算符上有结果，如逻辑与为 true、逻辑或为 false；加法空包需要提供初始值。

### 用法

求和

```cpp
template <typename... Args>
auto sum(Args... args) {
	return (args + ...);
}
```

逻辑与

```cpp
template <typename... Args>
bool all(Args... args) {
	return (args && ...);
}
```

依次输出

```cpp
template <typename... Args>
void print(Args&&... args) {
	(std::cout << ... << args);
}
```

带初始值

```cpp
template <typename... Args>
auto sumWithZero(Args... args) {
	return (0 + ... + args);
}
```


## Class Template Argument Deduction类模板实参推导 CTAD {#feature-5}

### 语法与行为

构造类模板对象时，可以由构造参数推导模板参数。

### 使用场景与差异

用于从构造实参推导类模板参数，避免重复写出参数列表。C++17 主要根据构造函数和推导指引推导，不能假定任意聚合类都自动支持；某些聚合推导规则在 C++20 才加入。

### 用法

```cpp
std::pair p(1, 2.5);
```

等价于

```cpp
std::pair<int, double> p(1, 2.5);
```

```cpp
std::vector v{1, 2, 3, 4};
std::tuple t{1, 2.0, "hello"};
```

自定义模板

```cpp
template <typename T>
struct Box {
	Box(T value) : value(value) {}
	T value;
};

Box box(42);
```


## Deduction Guide推导指引 {#feature-6}

### 语法与行为

可以显式规定 CTAD 应如何从构造参数推导模板参数。

### 使用场景与差异

用于在参数类型与最终存储类型不完全相同时控制 CTAD，例如把字符串字面量存成 string。推导指引只决定模板参数，不是构造函数，实际对象仍需有能够接受实参的构造函数。

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

此时 `w` 的类型为

```cpp
Wrapper<std::string>
```


## Inline Variable内联变量 {#feature-7}

### 语法与行为

变量可以声明为 `inline`，允许同一个变量定义出现在多个翻译单元中。

### 使用场景与差异

用于在头文件中定义跨翻译单元共享的变量。具有外部链接的 inline 变量在满足 ODR 条件时是同一个实体并具有相同地址；命名空间 static 变量则在不同翻译单元各自独立。多个定义不能随意不同。

### 用法

头文件中直接定义静态成员

```cpp
class Config {
public:
	inline static int maxConnections = 100;
};
```

命名空间变量

```cpp
inline constexpr double pi = 3.141592653589793;
```


## `constexpr` Lambda {#feature-8}

### 语法与行为

满足条件的 Lambda 可以在常量表达式中执行。

### 使用场景与差异

用于把短计算函数作为常量表达式中的可调用对象。闭包和调用必须满足常量求值规则；将变量声明为 constexpr 不代表每次调用都发生在编译期，运行时参数仍可触发运行时调用。

### 用法

```cpp
constexpr auto square = [](int x) {
	return x * x;
};

static_assert(square(5) == 25);
```


## `auto` 非类型模板参数 {#feature-9}

### 语法与行为

非类型模板参数可以使用 `auto`，由传入值推导参数类型。

### 使用场景与差异

用于让常量模板根据传入值同时记录类型和值。`Constant<10>` 与 `Constant<10L>` 的模板实参类型不同；参数取值仍受该标准版本允许的非类型模板参数规则限制。

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


## Guaranteed Copy Elision保证复制消除 {#feature-10}

### 语法与行为

某些 prvalue 初始化场景中，标准保证对象直接在目标位置构造。

### 使用场景与差异

用于返回不可复制且不可移动的值类型。C++17 在同类型纯右值初始化等规定场景直接构造结果对象；return local 的 NRVO 仍是可选优化，不能套用相同保证。析构函数仍必须满足可访问、未删除等要求。

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

直接初始化

```cpp
X x = X{};
```


## Nested Namespace 简写 {#feature-11}

### 语法与行为

嵌套命名空间可以一次声明。

### 使用场景与差异

用于声明多层命名空间，减少重复的嵌套块。namespace a::b 与显式嵌套命名空间声明具有相应的作用域效果，不是给命名空间创建别名。

### 用法

```cpp
namespace game::physics::collision {
	void update();
}
```

等价于旧写法

```cpp
namespace game {
	namespace physics {
		namespace collision {
			void update();
		}
	}
}
```


## `std::optional` {#feature-12}

### 语法与行为

`std::optional<T>` 表示“可能存在一个 `T`，也可能为空”。

### 使用场景与差异

用于表达查询可能没有结果，而不需要提供错误原因。value() 在空值时抛 bad_optional_access，解引用前应先确认有值；value_or 返回值并在空时使用备选值。与 expected 不同，它不保存独立错误类型。

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

读取

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

原地构造

```cpp
std::optional<std::string> name;
name.emplace("Alice");
name.reset();
```


## `std::variant` {#feature-13}

### 语法与行为

`std::variant<Ts...>` 在同一时刻保存候选类型中的一种，是带类型信息的 tagged union。

### 使用场景与差异

用于候选类型集合在编译期已知的消息或状态值。get 的类型不匹配时抛 bad_variant_access，get_if 可返回空指针；visit 访问器需要处理全部候选类型。某些抛异常的类型切换可能使 variant 进入 valueless_by_exception 状态。

### 用法

```cpp
#include <variant>
#include <string>

std::variant<int, double, std::string> value;

value = 42;
value = 3.14;
value = std::string("hello");
```

按类型读取

```cpp
if (std::holds_alternative<std::string>(value)) {
	std::cout << std::get<std::string>(value) << '\n';
}
```

访问

```cpp
std::visit([](const auto& x) {
	std::cout << x << '\n';
}, value);
```

重载访问器

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


## `std::any` {#feature-14}

### 语法与行为

`std::any` 可以保存任意满足要求的单一值，并在运行时通过类型检查取出。

### 使用场景与差异

用于运行时扩展的异构值槽。保存的类型需要满足可复制构造等要求，any_cast 要求匹配真实保存类型；指针形式失败返回空指针，值或引用形式失败抛 bad_any_cast。与 variant 不同，候选类型不写在包装器类型中。

### 用法

```cpp
#include <any>
#include <string>

std::any value = 42;
value = std::string("hello");
```

读取

```cpp
try {
	auto s = std::any_cast<std::string>(value);
} catch (const std::bad_any_cast&) {
	// 类型不匹配
}
```

指针形式

```cpp
if (auto p = std::any_cast<std::string>(&value)) {
	std::cout << *p << '\n';
}
```


## `std::string_view` {#feature-15}

### 语法与行为

`std::string_view` 保存字符序列的指针和长度，不拥有字符数据。

### 使用场景与差异

用于只读字符串参数和不复制字符的切片。string_view 不拥有存储，原字符串销毁或重分配后视图可能悬空；其数据也不保证在视图末尾有空字符，不能直接当作任意 C 字符串使用。

### 用法

```cpp
#include <string_view>

void print(std::string_view text) {
	std::cout << text << '\n';
}
```

可接收

```cpp
print("hello");

std::string s = "world";
print(s);
```

切片

```cpp
std::string_view text = "Hello World";
auto hello = text.substr(0, 5);
```

使用时必须保证被查看的字符数据仍然存活。


## `std::filesystem` {#feature-16}

### 语法与行为

标准库加入文件系统路径、目录遍历、文件属性和文件操作接口。

### 使用场景与差异

用于路径拼接、资产目录枚举和文件属性查询。path 按平台路径规则解释内容；许多操作提供抛 filesystem_error 和接受 error_code 的形式。exists 与后续操作之间文件系统仍可能变化，检查存在不能保证后续调用一定成功。

### 用法

```cpp
#include <filesystem>

namespace fs = std::filesystem;

fs::path p = "assets/images/player.png";

std::cout << p.filename() << '\n';
std::cout << p.extension() << '\n';
std::cout << p.parent_path() << '\n';
```

判断与创建

```cpp
if (!fs::exists("output")) {
	fs::create_directories("output");
}
```

遍历目录

```cpp
for (const auto& entry : fs::directory_iterator("assets")) {
	std::cout << entry.path() << '\n';
}
```

递归遍历

```cpp
for (const auto& entry : fs::recursive_directory_iterator("assets")) {
	std::cout << entry.path() << '\n';
}
```


## `std::invoke` {#feature-17}

### 语法与行为

统一调用普通函数、函数对象、成员函数指针和成员变量指针。

### 使用场景与差异

用于编写同时接受普通可调用对象和成员指针的泛型调用器。成员函数指针需要对象实参，成员数据指针返回对应成员的访问结果；仅使用 f(args...) 的包装器不能直接处理所有成员指针形式。

### 用法

```cpp
#include <functional>

int add(int a, int b) {
	return a + b;
}

int result = std::invoke(add, 1, 2);
```

成员函数

```cpp
struct Player {
	void jump(int height) {
		std::cout << height << '\n';
	}
};

Player p;
std::invoke(&Player::jump, p, 10);
```

成员变量

```cpp
struct Player {
	int hp = 100;
};

Player p;
std::cout << std::invoke(&Player::hp, p) << '\n';
```


## `std::apply` {#feature-18}

### 语法与行为

把 tuple-like 对象中的元素展开为函数参数。

### 使用场景与差异

用于把已经保存的 pair、tuple 或 array 元素作为参数调用函数。它负责展开参数并按调用规则传递，std::invoke 则负责统一实际调用形式；二者职责不同。

### 用法

```cpp
#include <tuple>

int add(int a, int b, int c) {
	return a + b + c;
}

std::tuple args{1, 2, 3};
int result = std::apply(add, args);
```

Lambda

```cpp
std::apply([](auto&&... xs) {
	((std::cout << xs << ' '), ...);
}, args);
```


## `std::byte` {#feature-19}

### 语法与行为

`std::byte` 表示原始字节数据，避免把字节误当作字符或整数进行算术运算。

### 使用场景与差异

用于表达原始字节和位标志。byte 支持规定的位操作，不支持作为普通整数进行任意算术；需要数值时通过 to_integer 显式转换。它与 char 的字符语义和 unsigned char 的整数运算能力不同。

### 用法

```cpp
#include <cstddef>

std::byte b{0x2A};
```

位运算

```cpp
std::byte flags{0b0000'0011};
flags |= std::byte{0b0000'0100};
```

转换

```cpp
int value = std::to_integer<int>(b);
```


## Parallel Algorithms并行 STL 算法 {#feature-20}

### 语法与行为

标准算法可以接受执行策略。

### 使用场景与差异

用于允许实现并行执行的排序或批处理。par 不保证一定启动多个线程；par_unseq 还允许无顺序执行，对回调中的阻塞、锁和共享状态有额外限制。标准执行策略下用户函数抛出异常通常导致 terminate，不能照搬顺序调用的异常处理。

### 用法

```cpp
#include <algorithm>
#include <execution>
#include <vector>

std::vector<int> v(1'000'000);

std::sort(std::execution::par, v.begin(), v.end());
```

常见策略

```cpp
std::execution::seq
std::execution::par
std::execution::par_unseq
```


## Polymorphic Memory Resource`std::pmr` {#feature-21}

### 语法与行为

容器的分配策略可以在运行时通过 `std::pmr::memory_resource` 指定。

### 使用场景与差异

用于把一批容器分配集中到指定内存资源。monotonic_buffer_resource 逐步分配并批量释放，单个释放通常不回收空间；资源必须比使用它的容器活得更久。缓冲区不足时默认可向上游继续分配，不能假定完全不会申请堆内存。

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
