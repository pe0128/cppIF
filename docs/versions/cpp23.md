# C++23

## Explicit Object Parameter显式对象参数、Deducing `this` {#feature-1}

### 语法与行为

成员函数可以把隐式的对象参数写成显式参数

```cpp
struct X {
	void foo(this X& self);
};
```

对象参数也可以使用模板推导。

### 使用场景与差异

用于合并按 const 和值类别区分的成员接口、实现无需模板基类的静态接口或递归 lambda。显式对象参数必须位于参数列表首位；函数内通过参数名访问对象，没有隐式 this，也不能再添加传统成员 cv 或引用限定。返回成员引用仍需保证原对象存活。

### 用法

统一 `const`、非 `const` getter

```cpp
struct Player {
	int hp = 100;

	auto&& getHp(this auto&& self) {
		return std::forward_like<decltype(self)>(self.hp);
	}
};
```

调用仍然使用成员函数语法

```cpp
Player p;
p.getHp();
```

CRTP 风格接口

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

递归 Lambda

```cpp
auto factorial = [](this auto self, int n) -> int {
	if (n <= 1) {
		return 1;
	}

	return n * self(n - 1);
};
```


## `if consteval` {#feature-2}

### 语法与行为

在常量求值上下文与运行时求值上下文之间选择执行分支。

### 使用场景与差异

用于在常量求值和运行时选择不同实现。它检查当前求值是否属于常量求值上下文，不要求所处函数本身是 consteval；与 if constexpr 不同，选择依据不是普通模板常量条件。立即分支可以用于调用 consteval 函数。

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

带 `else`

```cpp
constexpr int f(int x) {
	if consteval {
		return compileTimePath(x);
	} else {
		return runtimePath(x);
	}
}
```


## `static operator()` {#feature-3}

### 语法与行为

调用运算符可以声明为静态成员函数。

### 使用场景与差异

用于不依赖实例状态的函数对象接口。静态调用运算符没有 this，可通过对象调用语法或类型限定调用；相比非静态 operator()，不能直接读取非静态成员。

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

也可以通过类型调用

```cpp
int result = Add::operator()(1, 2);
```


## `static operator[]` {#feature-4}

### 语法与行为

下标运算符可以声明为静态成员函数。

### 使用场景与差异

用于不依赖实例数据的索引接口。静态下标运算符没有 this，不需要通过对象状态求值；参数和结果类型仍需由声明指定。对象形式 `table[index]` 与显式调用 `Table::operator[](index)` 都按相应规则处理。

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


## 多参数 `operator[]` {#feature-5}

### 语法与行为

下标运算符可以接受多个参数。

### 使用场景与差异

用于矩阵和多维视图，以 m[row, col] 直接传递多个索引。它与嵌套的 m[row][col] 是不同接口，前者只调用一次多参数下标运算符；索引边界仍需由实现检查或约定。

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


## `auto(x)` 与 `auto{x}` {#feature-6}

### 语法与行为

可以使用 `auto` 形式显式创建由表达式推导出的值类型对象。

### 使用场景与差异

用于在表达式位置创建推导出的值对象。auto(ref) 和 auto{ref} 都只有一个初始化表达式，按值推导，不保留顶层引用；与显式引用转换不同，它会形成独立值，复制和移动是否可行取决于类型。

### 用法

```cpp
int x = 10;
int& ref = x;

auto copy1 = auto(ref);
auto copy2 = auto{ref};
```

模板中创建值副本

```cpp
template <typename T>
auto decayCopy(T&& value) {
	return auto(std::forward<T>(value));
}
```


## Simpler Implicit Move {#feature-7}

### 语法与行为

返回局部变量等场景中的隐式移动规则得到简化，满足条件时局部对象会按可移动表达式处理。

### 使用场景与差异

C++23 将满足隐式移动条件的返回操作数按将亡值处理，简化原来的重载选择规则，并影响某些引用返回场景。返回局部 unique_ptr 在早期标准就能隐式移动，不是该示例首次在 C++23 合法。return std::move(local) 还可能阻止 NRVO。

### 用法

```cpp
std::unique_ptr<int> makeValue() {
	auto ptr = std::make_unique<int>(42);
	return ptr;
}
```

不需要手动写

```cpp
return std::move(ptr);
```


```cpp
int&& returnReference(int&& value) {
	return value;	// C++23 按隐式移动规则作为将亡值
}
```

此函数不延长实参生命周期，调用者不能保留已经销毁对象的引用。规则见 [P2266R3](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2022/p2266r3.html)。

## `std::expected` {#feature-8}

### 语法与行为

`std::expected<T, E>` 保存成功值 `T` 或错误值 `E`。

### 使用场景与差异

用于同时返回结果和结构化错误信息。expected 只有值或错误其中一种状态，读取 error() 前需确认失败，value() 在失败时抛 bad_expected_access。与 optional 相比保留错误值；使用 stoi 时还需检查已消费长度，否则可能接受带尾随非数字字符的输入。

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

读取

```cpp
auto result = parseInt("123");

if (result) {
	std::cout << *result << '\n';
} else {
	std::cout << result.error() << '\n';
}
```

`value_or`

```cpp
int value = result.value_or(0);
```


## `std::optional` Monadic Operations {#feature-9}

### 语法与行为

`std::optional` 增加函数式链式操作

```cpp
and_then
transform
or_else
```

### 使用场景与差异

用于组合可能缺值的计算。transform 将存在的值映射为新值，and_then 的回调返回 optional 并传播空状态，or_else 仅在空时提供另一个 optional；这些操作不会无条件执行全部回调。

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

错误恢复

```cpp
auto result = value.or_else([] {
	return std::optional<int>{0};
});
```


## `std::expected` Monadic Operations {#feature-10}

### 语法与行为

`std::expected` 支持链式组合成功路径与错误路径。

### 使用场景与差异

用于串联带错误类型的操作。and_then 组合成功路径并要求返回 expected，transform 映射值，or_else 处理错误；transform_error 可以映射错误类型。链中值类型和错误类型需满足各接口要求。

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


## `std::mdspan` {#feature-11}

### 语法与行为

`std::mdspan` 是多维连续或非连续数据的非拥有视图，可以把线性存储映射成多维索引。

### 使用场景与差异

用于将已有线性存储映射为多维访问。mdspan 不分配或释放元素，布局策略决定索引到偏移的映射，可描述有间隔的数据；传入存储必须覆盖所需跨度。默认不提供所有越界访问的运行时检查。

### 用法

```cpp
#include <mdspan>
#include <vector>

std::vector<float> data(3 * 4);

std::mdspan<float, std::extents<std::size_t, 3, 4>> matrix(data.data());

matrix[1, 2] = 42.0f;
```

动态维度

```cpp
std::mdspan<
	float,
	std::dextents<std::size_t, 2>
> matrix(data.data(), rows, cols);
```


## `std::print`、`std::println` {#feature-12}

### 语法与行为

基于格式字符串直接输出，无需先构造 `std::string`。

### 使用场景与差异

用于直接向标准输出或指定 C 流输出格式化内容。println 在输出末尾追加换行，print 不自动换行；二者使用与 format 相关的格式规则，适合无需先保存格式化 string 的输出。

### 用法

```cpp
#include <print>

std::print("name = {}, score = {}\n", "Alice", 100);
std::println("x = {}", 42);
```

格式控制

```cpp
std::println("pi = {:.3f}", 3.1415926);
```


## `std::ranges::to` {#feature-13}

### 语法与行为

把 range 的结果直接转换为目标容器。

### 使用场景与差异

用于把惰性管道结果物化为独立容器。转换会遍历并构造目标元素，需支付存储和构造成本；与 view 不同，结果容器拥有其元素。目标元素是否可复制或移动仍需满足构造要求。

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

转换成其他容器

```cpp
auto set = values | std::ranges::to<std::set>();
```


## `std::views::zip` {#feature-14}

### 语法与行为

把多个 range 按位置组合成 tuple-like 元素序列。

### 使用场景与差异

用于同时遍历多组同位置数据，长度取各范围中最短者。得到的 tuple-like 元素可保留引用，通过适当绑定可以修改原范围；zip 不检查各范围长度是否业务上应相同。

### 用法

```cpp
std::vector<int> ids{1, 2, 3};
std::vector<std::string> names{"A", "B", "C"};

for (auto&& [id, name] : std::views::zip(ids, names)) {
	std::cout << id << ' ' << name << '\n';
}
```


## `std::views::zip_transform` {#feature-15}

### 语法与行为

对多个 range 同位置元素执行变换。

### 使用场景与差异

用于同时读取多个范围并惰性计算逐位置结果，例如向量逐项求和。遍历长度由最短范围决定，变换函数在访问结果时调用，不预先存储全部结果。

### 用法

```cpp
auto sums = std::views::zip_transform(
	std::plus{},
	left,
	right
);
```

遍历

```cpp
for (auto value : sums) {
	std::cout << value << '\n';
}
```


## `std::views::adjacent` {#feature-16}

### 语法与行为

按固定窗口大小查看相邻元素。

### 使用场景与差异

用于固定大小相邻窗口，例如成对边或相邻采样。`adjacent<N>` 以编译期 N 确定 tuple-like 元素数量，长度不足 N 时没有完整窗口；与 slide 不同，窗口以固定数量元素的组合表现。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 4};

for (auto [a, b] : values | std::views::adjacent<2>) {
	std::cout << a << ' ' << b << '\n';
}
```


## `std::views::adjacent_transform` {#feature-17}

### 语法与行为

对相邻窗口直接执行变换。

### 使用场景与差异

用于按相邻固定窗口计算差分或局部值。`adjacent_transform<N>` 直接把窗口中的 N 个元素交给函数，输出变换结果，省去手动解包 `adjacent<N>` 后再调用的写法。

### 用法

```cpp
auto diff = values | std::views::adjacent_transform<2>([](int a, int b) {
	return b - a;
});
```


## `std::views::pairwise` {#feature-18}

### 语法与行为

`pairwise` 是 `adjacent<2>` 的便捷形式。

### 使用场景与差异

用于相邻元素两两比较，是 `adjacent<2>` 的等价便捷入口。它产生重叠的相邻对，与按不重叠两元素分块的 chunk(2) 不同。

### 用法

```cpp
for (auto [a, b] : values | std::views::pairwise) {
	std::cout << a << " -> " << b << '\n';
}
```


## `std::views::enumerate` {#feature-19}

### 语法与行为

遍历 range 时同时生成索引。

### 使用场景与差异

用于遍历时取得从零开始的索引和元素。枚举索引反映当前范围的遍历位置，若先过滤再 enumerate，索引对应过滤后的序列，而非原容器下标。

### 用法

```cpp
std::vector<std::string> names{"A", "B", "C"};

for (auto [index, name] : std::views::enumerate(names)) {
	std::cout << index << ": " << name << '\n';
}
```


## `std::views::cartesian_product` {#feature-20}

### 语法与行为

生成多个 range 的笛卡尔积。

### 使用场景与差异

用于枚举多个候选集合的全部组合，例如参数网格。结果数量通常是各范围长度的乘积，可能很大；惰性视图避免提前保存全部组合，但遍历成本仍随组合数增长。

### 用法

```cpp
std::vector<int> xs{1, 2};
std::vector<char> ys{'A', 'B'};

for (auto [x, y] : std::views::cartesian_product(xs, ys)) {
	std::cout << x << ' ' << y << '\n';
}
```


## `std::views::chunk` {#feature-21}

### 语法与行为

把 range 按固定大小切成连续块。

### 使用场景与差异

用于批处理，把范围分成不重叠连续块。最后一块可短于指定大小，块大小必须大于零；与 slide 的重叠窗口不同，chunk 的下一块从上一块之后开始。

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


## `std::views::slide` {#feature-22}

### 语法与行为

生成固定长度的滑动窗口。

### 使用场景与差异

用于移动平均或定长模式检查，生成重叠的完整窗口。窗口大小必须大于零，范围比窗口短时没有结果；与 `adjacent<N>` 相比，窗口大小可在运行时指定。

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


## `std::views::chunk_by` {#feature-23}

### 语法与行为

根据相邻元素谓词把 range 划分为若干连续组。

### 使用场景与差异

用于按相邻元素关系分段，例如连续编号或已排序值的分组。谓词比较相邻元素，失败时开始下一组，不是把所有满足全局等价关系的元素聚集到同一组。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 10, 11, 20};

auto groups = values | std::views::chunk_by([](int a, int b) {
	return b == a + 1;
});
```


## `std::views::join_with` {#feature-24}

### 语法与行为

连接嵌套 range，并在子 range 之间插入分隔 range 或分隔元素。

### 使用场景与差异

用于把多个字符片段或子范围连接起来，并在片段间插入分隔元素或分隔范围。返回惰性视图，原片段与分隔数据需满足相应生命周期要求；它不会直接生成拥有字符的 string。

### 用法

```cpp
std::vector<std::string> words{"hello", "world", "cpp"};

auto chars = words | std::views::join_with(' ');

for (char c : chars) {
	std::cout << c;
}
```


## `std::views::repeat` {#feature-25}

### 语法与行为

生成重复值的 view。

### 使用场景与差异

用于生成重复常量的范围。指定次数时有限，不给次数时可无限；遍历无限范围前需使用 take 等方式限制消费。它与预先构造多个独立可修改元素的容器不同。

### 用法

```cpp
auto values = std::views::repeat(42, 5);

for (int x : values) {
	std::cout << x << '\n';
}
```


## `std::generator` {#feature-26}

### 语法与行为

标准库提供基于协程的惰性序列生成器。

### 使用场景与差异

用于同步惰性生成序列，co_yield 在消费方迭代时逐项提供值。generator 不是异步调度器，通常为单遍输入范围；此处 int 斐波那契示例只消费前十项，继续无限消费会在数值超过 int 范围时发生有符号溢出。

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

遍历

```cpp
int count = 0;

for (int value : fibonacci()) {
	std::cout << value << '\n';

	if (++count == 10) {
		break;
	}
}
```


## `std::move_only_function` {#feature-27}

### 语法与行为

类似 `std::function`，但允许保存只可移动、不可复制的可调用对象。

### 使用场景与差异

用于保存拥有 unique_ptr 等不可复制状态的任务。move_only_function 本身不可复制，支持相应 cv、引用和 noexcept 函数签名；与 function 不同，调用空的 move_only_function 不应假定会抛 bad_function_call，需要先确认非空。

### 用法

```cpp
#include <functional>
#include <memory>

std::move_only_function<void()> task = [ptr = std::make_unique<int>(42)] {
	std::cout << *ptr << '\n';
};

task();
```


## `std::forward_like` {#feature-28}

### 语法与行为

把参考类型的 const 属性和引用类别用于另一个表达式，同时保留目标本身的相关限定。

### 使用场景与差异

用于按外围对象的 const 属性和引用类别转发成员。forward_like 合并 const 并选择左值或右值引用，不是任意复制全部 cv 属性，不能把 volatile 传播当作其保证；std::forward 则依据参数自身的推导类型转发。

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

效果会随对象类别变化

```cpp
Wrapper w{42};
const Wrapper cw{42};

w.get();
cw.get();
std::move(w).get();
```


const 合并与引用类别规则见 [P2445R1](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2022/p2445r1.pdf)。

## `std::to_underlying` {#feature-29}

### 语法与行为

把 scoped enum 或普通枚举转换为底层整数类型。

### 使用场景与差异

用于与协议字段或底层位操作接口交互，返回枚举实际底层类型。它与强制转换为 int 不同，不会忽略枚举指定的 unsigned char 等底层类型；转换本身不校验枚举值是否对应已命名枚举项。

### 用法

```cpp
#include <utility>

enum class State : unsigned char {
	Idle = 1,
	Run = 2
};

auto value = std::to_underlying(State::Run);
```


## `std::byteswap` {#feature-30}

### 语法与行为

翻转整数对象的字节顺序。

### 使用场景与差异

用于网络序或文件格式中的整数字节顺序转换。byteswap 反转字节而不是每个字节内的位，类型需满足相应整数及无填充位要求。endian 只查询平台顺序，不执行转换。

### 用法

```cpp
#include <bit>
#include <cstdint>

std::uint32_t x = 0x11223344;
auto y = std::byteswap(x);
```

`y` 对应

```text
0x44332211
```


## `std::stacktrace` {#feature-31}

### 语法与行为

获取当前调用栈快照。

### 使用场景与差异

用于诊断日志记录当前调用链。可获得的函数和文件信息依赖实现、符号信息和优化，不能保证包含源码中每个函数调用；不应用其内容作为稳定业务标识。

### 用法

```cpp
#include <stacktrace>
#include <iostream>

void logStack() {
	std::cout << std::stacktrace::current() << '\n';
}
```


## `std::unreachable` {#feature-32}

### 语法与行为

向编译器声明某条控制流路径不可到达。实际运行到该调用会触发未定义行为。

### 使用场景与差异

用于已由程序不变量证明无法到达的分支。运行到 unreachable 是未定义行为，不是报错或异常处理机制；外部输入可能形成无效枚举值时，应先验证或使用可执行错误路径。

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


## `std::flat_map`、`std::flat_set` {#feature-33}

### 语法与行为

提供基于有序底层容器的关联容器适配器，默认底层容器为 vector。

### 使用场景与差异

用于查找和顺序遍历较多、批量构建后较少修改的有序数据。flat_map 默认分开保存键和值，flat_set 默认保存有序元素，默认底层为 vector；底层容器可配置。查找通常 O(log n)，插入删除可能移动 O(n) 个元素，迭代器稳定性不同于节点树。

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

`std::flat_set`

```cpp
#include <flat_set>

std::flat_set<int> values{5, 1, 3, 2};
```


## `std::spanstream` {#feature-34}

### 语法与行为

允许 iostream 直接在用户提供的连续字符缓冲区上工作。

### 使用场景与差异

用于在调用者提供的固定连续字符存储上执行流式读写。写入超出容量会使流进入失败状态，不自动扩容；读取已写内容时可使用 out.span() 对应的有效区间，不必把整个未使用缓冲区当作输入。

### 用法

```cpp
#include <spanstream>
#include <array>

std::array<char, 128> buffer{};
std::ospanstream out(buffer);

out << 123 << ' ' << 456;
```

读取

```cpp
std::ispanstream in(out.span());

int a;
int b;
in >> a >> b;
```


## `std::out_ptr`、`std::inout_ptr` {#feature-35}

### 语法与行为

把智能指针适配到传统 C API 的 `T**` 输出参数。

### 使用场景与差异

用于将 C 接口的输出指针写回智能指针。out_ptr 适配只输出资源的参数，inout_ptr 适配可能处理原资源再写回的输入输出参数；必须核对 C 接口是否释放旧资源，以及删除器是否匹配其释放方式。

### 用法

假设 C API

```cpp
void create_resource(Resource** out);
void reset_resource(Resource** inout);
```

配合智能指针

```cpp
#include <memory>

std::unique_ptr<Resource, Deleter> resource;

create_resource(std::out_ptr(resource));
reset_resource(std::inout_ptr(resource));
```


## `std::start_lifetime_as` {#feature-36}

### 语法与行为

在适当的原始存储中显式开始对象生命周期，用于底层内存、序列化、共享内存等场景。

### 使用场景与差异

用于对齐且容量足够的原始存储中开始隐式生命周期类型对象的生命期，不调用普通构造函数。保存的对象表示需满足目标类型要求；数组形式需要至少 count 个对象所需存储。它不是任意二进制数据到任意类对象的反序列化接口。

### 用法

```cpp
#include <memory>
#include <cstddef>

alignas(int) std::byte storage[sizeof(int)]{};

int* p = std::start_lifetime_as<int>(storage);
*p = 42;
```

数组形式

```cpp
constexpr std::size_t count = 4;
alignas(int) std::byte arrayStorage[sizeof(int) * count]{};
int* elements = std::start_lifetime_as_array<int>(arrayStorage, count);
```


对象与存储前提见 [P2590R2](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2022/p2590r2.pdf)。

## `std::string::contains` {#feature-37}

### 语法与行为

字符串直接提供包含判断。

### 使用场景与差异

用于测试 string 是否含有字符或子串，返回 bool。与 find(...) != npos 相比直接表达存在性；匹配仍按字符序列进行，不自动进行大小写折叠或语言学匹配。

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


## `std::string_view::contains` {#feature-38}

### 语法与行为

`std::string_view` 同样提供包含判断。

### 使用场景与差异

用于不拥有字符数据的视图进行字符或子串存在性判断。contains 不复制字符，也不延长底层存储生命期，调用时视图必须仍有效。

### 用法

```cpp
std::string_view text = "hello world";

if (text.contains("world")) {
	// found
}
```


## `std::ranges::contains` {#feature-39}

### 语法与行为

Ranges 算法直接检查 range 是否包含目标值。

### 使用场景与差异

用于直接检查范围中是否存在等于目标值的元素，可用投影比较对象成员。它返回 bool，不返回元素位置；若随后还需操作找到的元素，可使用 find 避免再次搜索。

### 用法

```cpp
#include <algorithm>
#include <vector>

std::vector<int> values{1, 2, 3, 4};

bool found = std::ranges::contains(values, 3);
```

投影

```cpp
struct Player {
	int id;
	std::string name;
};

bool found = std::ranges::contains(players, 42, &Player::id);
```


## `std::ranges::find_last` {#feature-40}

### 语法与行为

从逻辑上查找最后一个满足条件或等于目标值的元素。

### 使用场景与差异

用于取得最后一个匹配位置。find_last 返回从最后匹配位置到末尾的子范围，找不到时为空，不能把返回值当作单个迭代器。读取前检查 empty()，再通过 begin() 取得匹配元素。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 2, 4};

auto result = std::ranges::find_last(values, 2);
```

相关接口

```cpp
std::ranges::find_last
std::ranges::find_last_if
std::ranges::find_last_if_not
```


## `std::ranges::fold_left`、`fold_right` {#feature-41}

### 语法与行为

Ranges 提供显式左折叠和右折叠算法。

### 使用场景与差异

用于按明确方向累积范围。fold_left 从左到右把累积值作为运算的相应参数，fold_right 按相反方向组合；减法或字符串组合等操作可能得到不同结果。与可重组求值的 reduce 不同，不能忽略折叠方向。

### 用法

```cpp
#include <algorithm>
#include <vector>

std::vector<int> values{1, 2, 3, 4};

auto sum = std::ranges::fold_left(values, 0, std::plus{});
```

字符串拼接等非交换操作可以区分左右折叠方向。


## `std::ranges::starts_with`、`ends_with` {#feature-42}

### 语法与行为

判断一个 range 是否以另一个 range 开头或结尾。

### 使用场景与差异

用于比较范围前缀和后缀，接受完整范围而不只限于字符串。长度不足时不能匹配较长模式；自定义元素可提供匹配谓词或投影，具体重载仍需满足范围能力要求。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 4};
std::vector<int> prefix{1, 2};
std::vector<int> suffix{3, 4};

bool a = std::ranges::starts_with(values, prefix);
bool b = std::ranges::ends_with(values, suffix);
```


## `std::ranges::iota` {#feature-43}

### 语法与行为

Ranges 算法版本的 `iota`，对整个 range 依次赋递增值。

### 使用场景与差异

用于给已有可写范围填充递增值，头文件为 &lt;numeric&gt;。算法修改现有元素，返回输出位置和后续值；views::iota 则生成可遍历的数值视图，不写入原容器。

### 用法

```cpp
#include <numeric>
#include <vector>

std::vector<int> values(5);
std::ranges::iota(values, 10);
```

结果

```text
10 11 12 13 14
```


## `std::ranges::shift_left`、`shift_right` {#feature-44}

### 语法与行为

在 range 内部移动元素位置。

### 使用场景与差异

用于在已有范围内部向左或向右移动元素，返回仍表示结果元素的子范围，不改变容器 size。移出后的区域不能假定保留原值；与 erase 不同，不自动销毁尾部元素或缩小容器。

### 用法

```cpp
std::vector<int> values{1, 2, 3, 4, 5};
std::ranges::shift_left(values, 2);
```

```cpp
std::ranges::shift_right(values, 2);
```

返回子范围和移位行为见 [P2440R1](https://www.open-std.org/JTC1/SC22/WG21/docs/papers/2021/p2440r1.html)。
