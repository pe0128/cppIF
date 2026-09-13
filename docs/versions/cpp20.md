# C++20

## Concepts {#feature-1}

### 语法与行为

Concept 是对模板参数施加的编译期约束。

```cpp
template <typename T>
concept Addable = requires(T a, T b) {
	a + b;
};
```

### 使用场景与差异

用于限制模板候选并描述所需操作。约束决定候选是否可用，不替代函数体全部语义检查；只检查 a + b 存在不保证结果能转换为 T。与 enable_if 相比，requires 子句直接表达约束；缩写形式中的两个 auto 参数可分别推导不同类型。

### 用法

直接约束模板参数

```cpp
template <Addable T>
T add(T a, T b) {
	return a + b;
}
```

`requires` 子句

```cpp
template <typename T>
requires Addable<T>
T add(T a, T b) {
	return a + b;
}
```

缩写函数模板

```cpp
auto add(Addable auto a, Addable auto b) {
	return a + b;
}
```

标准 Concept

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


## `requires` Expression {#feature-2}

### 语法与行为

`requires` 表达式可以检查类型、表达式、返回类型和编译期条件是否合法。

### 使用场景与差异

用于定义 concept 中的类型、简单表达式、复合表达式和嵌套要求。花括号表达式后的箭头约束其结果类型，要求本身不执行运行时计算。它与声明上的 requires 子句不同，后者使用约束条件控制候选。

### 用法

检查成员函数存在

```cpp
template <typename T>
concept HasSize = requires(T value) {
	value.size();
};
```

检查返回类型

```cpp
#include <concepts>

template <typename T>
concept HasSize = requires(T value) {
	{ value.size() } -> std::convertible_to<std::size_t>;
};
```

检查类型成员

```cpp
template <typename T>
concept HasValueType = requires {
	typename T::value_type;
};
```

复合检查

```cpp
template <typename T>
concept Container = requires(T c) {
	typename T::value_type;
	{ c.begin() };
	{ c.end() };
	{ c.size() } -> std::convertible_to<std::size_t>;
};
```


## Ranges {#feature-3}

### 语法与行为

Ranges 将“迭代器对”提升为可组合的范围对象，并提供惰性的 view 管道。

### 使用场景与差异

用于直接对范围对象排序、查找或反转。ranges 算法使用概念约束，部分接口接受投影。传入整个范围代替显式迭代器对，但算法仍要求范围提供所需访问能力，不能对任意 range 调用 sort。

### 用法

范围算法

```cpp
#include <algorithm>
#include <ranges>
#include <vector>

std::vector<int> v{5, 2, 4, 1, 3};
std::ranges::sort(v);
```

无需显式写 `begin()`、`end()`

```cpp
std::ranges::reverse(v);
```


## Range Views {#feature-4}

### 语法与行为

View 满足规定的范围和移动复杂度要求。过滤和变换视图可保存对原范围的引用或相应拥有对象，并在迭代时执行操作。

### 使用场景与差异

用于惰性过滤、变换和切片，通常在迭代时才调用谓词或变换函数。许多 view 引用原数据，也存在拥有数据的 view，不能把 view 与非拥有完全等同。原范围失效可使视图失效；管道不会自动生成独立容器。

### 用法

过滤

```cpp
#include <ranges>
#include <vector>

std::vector<int> v{1, 2, 3, 4, 5, 6};

auto even = v | std::views::filter([](int x) {
	return x % 2 == 0;
});
```

转换

```cpp
auto square = v | std::views::transform([](int x) {
	return x * x;
});
```

组合

```cpp
auto result = v
	| std::views::filter([](int x) {
		return x % 2 == 0;
	})
	| std::views::transform([](int x) {
		return x * x;
	});
```

截取

```cpp
auto firstThree = v | std::views::take(3);
auto afterTwo = v | std::views::drop(2);
```

整数序列

```cpp
for (int i : std::views::iota(0, 10)) {
	std::cout << i << '\n';
}
```


## Coroutine协程 {#feature-5}

### 语法与行为

C++20 提供协程语言基础设施。函数中出现以下关键字之一时，函数可能成为协程

```cpp
co_await
co_yield
co_return
```

协程可以挂起，并在以后恢复执行。协程状态被保存到协程帧中。

### 使用场景与差异

用于需要保存执行状态的异步操作或惰性序列。C++20 提供协程语法和协议，不自带此处的 Task 或 Generator 实现，也不自动创建线程或调度器；这些片段需要相应返回类型和运行时支持。协程帧中的引用参数不会自动延长被引用对象寿命。

### 用法`co_await`

```cpp
auto result = co_await asyncOperation();
```

`co_await` 的对象通过 awaiter 协议控制

```cpp
struct Awaiter {
	bool await_ready();
	void await_suspend(std::coroutine_handle<> handle);
	T await_resume();
};
```

### 用法`co_return`

```cpp
Task<int> calculate() {
	co_return 42;
}
```

### 用法`co_yield`

```cpp
Generator<int> numbers() {
	for (int i = 0; i < 10; ++i) {
		co_yield i;
	}
}
```

### Promise 协议

协程返回类型需要通过 `promise_type` 与编译器交互

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


## Modules {#feature-6}

### 语法与行为

Module 提供语言级模块边界，用于替代部分传统头文件文本包含模型。

### 使用场景与差异

用于将公开声明放入模块接口，并通过 import 引用。模块并非仅把 include 换一个关键字，构建系统需要处理模块依赖和接口产物。模块内未导出的声明不自动成为导入者的公开接口，宏通常也不作为命名模块接口导出。

### 用法

定义模块接口

```cpp
export module math;

export int add(int a, int b) {
	return a + b;
}
```

导入

```cpp
import math;

int main() {
	return add(1, 2);
}
```

只导出部分声明

```cpp
export module game;

export class Player {
public:
	void update();
};

class InternalHelper {
};
```

导出块

```cpp
export module math;

export {
	int add(int a, int b);
	int sub(int a, int b);
}
```


## Three-Way Comparison`<=>` {#feature-7}

### 语法与行为

`<=>` 一次比较可以表达小于、等于、大于关系，并可用于自动生成其他比较运算符。

### 使用场景与差异

用于按成员顺序比较值类型。默认化的 &lt;=&gt; 可关联生成相应比较行为，默认化声明在满足条件时还隐式声明 ==；手写 &lt;=&gt; 不自动得到任意相等实现。含浮点数的比较可能是 partial_ordering，NaN 可产生无序结果。

### 用法

```cpp
#include <compare>

struct Point {
	int x;
	int y;

	auto operator<=>(const Point&) const = default;
};
```

之后可以直接

```cpp
Point a{1, 2};
Point b{2, 3};

bool x = a < b;
bool y = a == b;
bool z = a >= b;
```

手动比较

```cpp
auto result = a <=> b;

if (result < 0) {
	// a < b
}
```

比较类别包括

```cpp
std::strong_ordering
std::weak_ordering
std::partial_ordering
```


## Designated Initializer指定成员初始化 {#feature-8}

### 语法与行为

聚合类型可以按成员名初始化。

### 使用场景与差异

用于初始化聚合记录并在代码中明确字段名。C++20 指定器需按成员声明顺序，不支持 C 语言全部指定初始化形式；不能混用指定和位置初始化，也不能任意指定数组下标或嵌套路径。

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


## `consteval` {#feature-9}

### 语法与行为

`consteval` 声明立即函数。在需要立即调用的上下文中，调用必须产生常量表达式结果。

### 使用场景与差异

用于要求调用结果在编译期确定的检查或编码函数。立即调用需要满足常量表达式规则；在另一立即函数上下文内部使用参数还受相应规则处理。constexpr 函数允许普通运行时调用，consteval 不能用作一般运行时计算接口。

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

编译期校验

```cpp
consteval int checked(int x) {
	if (x < 0) {
		throw "negative value";
	}

	return x;
}
```


## `constinit` {#feature-10}

### 语法与行为

`constinit` 要求具有静态或线程存储期的变量进行静态初始化。

### 使用场景与差异

用于检测静态或线程存储期变量是否需要动态初始化。constinit 不意味着变量只读，后续仍可修改；const 控制修改权限，constexpr 同时要求常量表达式初始化并使对象为 const。

### 用法

```cpp
constinit int globalValue = 42;
```

变量本身仍然可以修改

```cpp
constinit int counter = 0;

void update() {
	++counter;
}
```

与 `const` 联用

```cpp
constinit const int maxCount = 100;
```


## 扩展 `constexpr` {#feature-11}

### 语法与行为

C++20 继续放宽常量求值限制，使更多普通 C++ 代码可以在编译期执行。

### 使用场景与差异

用于编译期容器操作和临时动态存储。常量求值中分配的存储需要在同一次求值结束前释放，不能把任意动态指针保存为长期 constexpr 结果。容器成员支持 constexpr 不等于任意运行时分配的容器都可永久存在于常量对象中。

### 用法

动态分配可以出现在常量求值过程中，只要生命周期满足常量求值规则

```cpp
constexpr int sum() {
	int* p = new int[3]{1, 2, 3};
	int result = p[0] + p[1] + p[2];
	delete[] p;
	return result;
}

static_assert(sum() == 6);
```

`std::vector` 等标准容器也获得大量 `constexpr` 支持

```cpp
constexpr int calc() {
	std::vector<int> v{1, 2, 3};
	return v[0] + v[1] + v[2];
}
```


## Lambda 显式模板参数列表 {#feature-12}

### 语法与行为

Lambda 可以显式声明自己的模板参数。

### 使用场景与差异

用于在 lambda 参数之间建立共享模板类型关系，或对模板参数施加约束。[]&lt;typename T&gt;(T a, T b) 要求两参数共同推导 T，而两个 auto 参数默认各自推导；也可显式使用参数包。

### 用法

```cpp
auto f = []<typename T>(T value) {
	return value;
};

f(10);
f(3.14);
```

多个模板参数

```cpp
auto add = []<typename T, typename U>(T a, U b) {
	return a + b;
};
```

约束

```cpp
auto square = []<std::integral T>(T x) {
	return x * x;
};
```


## Lambda `[=, this]` {#feature-13}

### 语法与行为

可以明确表示按值捕获外部变量，同时捕获当前对象的 `this` 指针。

### 使用场景与差异

用于在默认值捕获下明确访问当前对象。捕获 this 保存的是对象指针，不是整个对象的副本；对象销毁后闭包不能再用该指针访问成员。C++17 的 [*this] 才表达复制当前对象。

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


## Class-Type Non-Type Template Parameter {#feature-14}

### 语法与行为

满足 structural type 要求的类类型可以作为非类型模板参数。

### 使用场景与差异

用于把固定字符串或编译期配置对象作为模板实参。类类型需满足结构化类型条件，例如相应基类和非静态数据成员为 public、非 mutable，并由允许的结构化类型组成。并非任意类对象都可作为模板实参。

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


## `using enum` {#feature-15}

### 语法与行为

可以把某个枚举类型的枚举项引入当前作用域。

### 使用场景与差异

用于在局部 switch 等场景省略重复的枚举限定名。using enum 只引入枚举项名称，不改变枚举的强类型规则；引入名称可能与局部已有声明冲突。

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


## Aggregate Parenthesized Initialization {#feature-16}

### 语法与行为

聚合类型可以使用圆括号初始化。

### 使用场景与差异

用于通过圆括号构造聚合对象，尤其是泛型直接初始化接口。与花括号形式相比，圆括号聚合初始化允许某些窄化转换，临时对象绑定到引用成员的生命周期规则也不同；不能机械替换所有花括号。

### 用法

```cpp
struct Point {
	int x;
	int y;
};

Point p(10, 20);
```


## `std::span` {#feature-17}

### 语法与行为

`std::span<T>` 是连续内存区间的非拥有视图，保存指针和元素数量。

### 使用场景与差异

用于统一接受数组、vector 等连续存储作为函数参数。span 不拥有元素，底层对象需存活；`span<const T>` 限制元素修改，const `span<T>` 只限制视图对象本身。切片和下标需要满足范围前提，不能假定 C++20 提供运行时边界检查。

### 用法

```cpp
#include <span>

void process(std::span<const int> values) {
	for (int x : values) {
		std::cout << x << '\n';
	}
}
```

数组

```cpp
int a[] = {1, 2, 3, 4};
process(a);
```

`std::vector`

```cpp
std::vector<int> v{1, 2, 3};
process(v);
```

子视图

```cpp
std::span<int> s = v;
auto first = s.first(2);
auto last = s.last(2);
auto middle = s.subspan(1, 2);
```


## `std::jthread` {#feature-18}

### 语法与行为

`std::jthread` 在线程对象析构时自动请求停止并执行 `join()`。

### 使用场景与差异

用于需要作用域退出时等待工作线程结束的对象。jthread 在仍可连接时析构会请求停止并 join；停止为协作式，工作函数若不检查停止状态仍可能使析构阻塞。与 thread 不同，它自动处理该连接状态。

### 用法

```cpp
#include <thread>

std::jthread worker([] {
	work();
});
```

配合 `std::stop_token`

```cpp
std::jthread worker([](std::stop_token token) {
	while (!token.stop_requested()) {
		doWork();
	}
});

worker.request_stop();
```


## `std::stop_token` {#feature-19}

### 语法与行为

提供协作式停止请求机制。

### 使用场景与差异

用于让长任务检查来自 stop_source 或 jthread 的停止请求。请求不会强制终止线程，任务需主动退出；stop_callback 可在请求到达时执行，注册时若已经请求停止也可能立即执行回调。

### 用法

```cpp
void worker(std::stop_token token) {
	while (!token.stop_requested()) {
		performOneStep();
	}
}
```

停止回调

```cpp
std::stop_callback callback(token, [] {
	std::cout << "stop requested\n";
});
```


## `std::latch` {#feature-20}

### 语法与行为

一次性倒计数同步原语。计数降到 0 后，所有等待线程可以继续。

### 使用场景与差异

用于等待固定数量初始化或批任务完成。latch 计数只向零减少，到零后不能重置；需要多轮同步时使用 barrier。每个成功完成的任务都要按约定递减，异常路径也需要处理完成通知。

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


## `std::barrier` {#feature-21}

### 语法与行为

可重复使用的阶段同步原语。所有参与线程到达同步点后进入下一阶段。

### 使用场景与差异

用于分阶段迭代算法，每轮等待所有参与者后继续。完成函数需满足不可抛异常调用要求，示例显式声明 noexcept；arrive_and_drop 可退出后续阶段。与 latch 不同，同一个 barrier 能重复使用。

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

完成函数

```cpp
std::barrier syncPoint(3, []() noexcept {
	std::cout << "phase completed\n";
});
```


## `std::counting_semaphore` {#feature-22}

### 语法与行为

信号量内部维护许可数量，线程可以获取和释放许可。

### 使用场景与差异

用于限制同时访问连接池等资源的任务数量，也可在线程间传递许可。信号量没有 mutex 的线程所有权规则，取得和释放可发生在不同线程；异常路径需要确保归还许可，否则许可会耗尽。

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

二元信号量

```cpp
std::binary_semaphore sem(0);
```


## `std::atomic::wait`、`notify_one`和`notify_all` {#feature-23}

### 语法与行为

原子对象可以直接等待值发生变化，并由其他线程通知。

### 使用场景与差异

用于等待原子状态发生变化。wait(old) 在观察值仍等于 old 时阻塞，notify 只发出唤醒通知，不替代 store；值从旧值变化再变回时可能出现 ABA 而无法观察中间状态。共享数据发布仍需正确的内存序。

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


## `std::atomic_ref` {#feature-24}

### 语法与行为

给现有普通对象提供原子访问视图，而无需把对象类型声明成 `std::atomic<T>`。

### 使用场景与差异

用于需要原子访问、但已有对象类型不能改成 atomic 的存储。对象必须满足 required_alignment 和类型要求，并比所有 atomic_ref 活得更久；持有相关 atomic_ref 期间，对该对象的访问需遵守通过 atomic_ref 进行访问等规则，不能混入普通读写。

### 用法

```cpp
#include <atomic>

alignas(std::atomic_ref<int>::required_alignment) int value = 0;
std::atomic_ref<int> ref(value);

ref.fetch_add(1);
```

所有并发访问必须满足 `atomic_ref` 的原子访问要求。


## `std::source_location` {#feature-25}

### 语法与行为

在调用点获取源文件、行号、列号和函数名。

### 使用场景与差异

用于日志和断言接口记录调用位置。默认参数中的 current() 在调用点形成位置信息；在函数体里直接调用则记录函数体位置。与宏传递 __FILE__ 和 __LINE__ 的方式相比，它可通过普通参数传递。

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

调用

```cpp
log("something happened");
```


## `std::format` {#feature-26}

### 语法与行为

提供类型安全的格式化接口。

### 使用场景与差异

用于生成带宽度、精度和类型格式控制的字符串。格式说明必须与参数类型兼容，自定义类型需提供 formatter。format 返回 string，直接输出可使用 C++23 的 print；编译期格式检查与运行时格式接口需区分。

### 用法

```cpp
#include <format>
#include <string>

std::string text = std::format("{} + {} = {}", 1, 2, 3);
```

格式控制

```cpp
std::format("{:.2f}", 3.1415926);
std::format("{:08x}", 255);
std::format("{:>10}", "hello");
```


## `<bit>` 位操作 {#feature-27}

### 语法与行为

标准库提供常见位操作函数。

### 使用场景与差异

用于位计数、旋转和向二次幂取整。多数接口要求无符号整数类型；bit_ceil 的结果必须能由返回类型表示，不能对超出范围的输入假定得到有效结果。与手写移位相比仍需遵守参数范围。

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


## `std::endian` {#feature-28}

### 语法与行为

用于查询平台字节序。

### 使用场景与差异

用于检查多字节标量类型的本机字节序。native 不保证在所有平台都等于 little 或 big，可能存在混合情况。查询字节序不会自动转换数据，需要转换整数时可结合 C++23 的 byteswap。

### 用法

```cpp
#include <bit>

if constexpr (std::endian::native == std::endian::little) {
	// little endian
}
```


## Calendar、Time Zone Chrono 扩展 {#feature-29}

### 语法与行为

`<chrono>` 增加日期、日历和时区类型。

### 使用场景与差异

用于日期运算和时区换算。year_month_day 可以表示无效日期，运算后应通过 ok() 等方式检查；时区操作依赖可用时区数据库，并可能失败。日期组合中的斜杠属于重载运算符语法，需要保留。

### 用法

```cpp
#include <chrono>

using namespace std::chrono;

year_month_day date = 2026y / September / 13;
```

日期运算

```cpp
year_month_day next = date + months{1};
```

转换到 `sys_days`

```cpp
sys_days days = date;
```

时区

```cpp
auto zone = locate_zone("Asia/Tokyo");
auto now = system_clock::now();
zoned_time localTime(zone, now);
```


## `std::osyncstream` {#feature-30}

### 语法与行为

多个线程向同一输出流输出时，可以把一次逻辑输出缓冲后整体提交。

### 使用场景与差异

用于将一条多部分日志作为缓冲批次提交。共享输出目标的写入需要都通过相应同步机制进行，混用直接 cout 写入不能获得同样的分组保证。同步输出不保护日志生成过程中访问的业务数据。

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
