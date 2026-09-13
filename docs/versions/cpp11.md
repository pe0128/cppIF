# C++11

## 类型推导和空指针

auto 从初始化表达式推导变量类型，decltype 按表达式规则取得类型。nullptr 的类型为 std::nullptr_t，用于表示空指针，不是普通整数实参。

```cpp
int value = 10;
auto copy = value;
decltype((value)) reference = value;
int* pointer = nullptr;
```

copy 为 int，reference 为 int&。按值 auto 对顶层 const 和引用的处理见[const 与类型推导](/guide/const#source-76)。

## 范围遍历和列表初始化

花括号可调用列表初始化接口，范围 for 通过元素声明选择复制或引用访问。`auto&` 可修改原元素，`const auto&` 用于只读访问。

```cpp
#include <vector>

std::vector<int> values{1, 2, 3};

void doubleValues() {
	for (auto& value : values) {
		value *= 2;
	}
}
```

列表初始化会检查规定的窄化转换。initializer_list 重载与圆括号构造可能选择不同语义，示例见[初始化规则](/guide/types#source-80)。

## 移动构造和智能指针

右值引用参数可参与移动操作，std::move 进行值类别转换。unique_ptr 独占动态资源并禁止复制，移动后所有权交给目标。

```cpp
#include <memory>
#include <utility>

std::unique_ptr<int> source(new int(42));
std::unique_ptr<int> target = std::move(source);
```

这里 source 变为空指针，target 持有原整数。make_unique 从 C++14 开始提供；shared_ptr 和 weak_ptr 的用途见[智能指针](/guide/smart-pointers)。

## lambda 捕获

lambda 保存捕获状态并提供调用运算符。C++11 的参数类型需要明确声明，C++14 才支持 auto 参数和初始化捕获。

```cpp
int threshold = 10;
auto above = [threshold](int value) {
	return value > threshold;
};
```

值捕获保存 threshold 的副本；改为引用捕获时需要确保原变量在闭包调用期间仍存活。调用协议见[lambda](/guide/callables)。

## constexpr 和编译期检查

constexpr 函数满足常量表达式规则时可用于编译期求值，也允许使用运行时参数。C++11 的 static_assert 需要消息参数。

```cpp
constexpr int square(int value) {
	return value * value;
}

static_assert(square(4) == 16, "square result");
```

C++11 的 constexpr 函数体限制比 C++14 严格；具体差异见 [C++14 constexpr](/versions/cpp14#feature-6)。

## 成员函数声明

override 检查派生类成员是否重写基类虚函数，final 阻止后续重写或继承。`= default` 请求默认特殊成员实现，`= delete` 禁止选定操作。

```cpp
struct Base {
	virtual ~Base() = default;
	virtual void update() = 0;
};

struct Derived final : Base {
	Derived() = default;
	Derived(const Derived&) = delete;
	Derived& operator=(const Derived&) = delete;
	void update() override {}
};
```

复制、移动和默认生成之间的关系见[类与特殊成员](/guide/objects)和[移动语义](/guide/move#source-90)。

## 标准容器扩展

array 提供固定大小连续存储，tuple 保存固定数量的异构元素，unordered_map 和 unordered_set 使用哈希组织元素。emplace 将参数转发到元素构造函数。

```cpp
#include <array>
#include <string>
#include <unordered_map>

std::array<int, 3> values{{1, 2, 3}};
std::unordered_map<std::string, int> scores;
```

哈希容器不保证按键排序，平均查询 O(1)，最坏 O(n)；有序关联容器的对比见[容器](/guide/containers#source-115)。

## 线程和同步

thread 启动线程，mutex 保护共享状态，lock_guard 在作用域退出时解锁。atomic 提供规定类型上的原子操作，不能把多个原子操作自动当成一个事务。

```cpp
#include <mutex>
#include <thread>

std::mutex mutex;
int counter = 0;

void increment() {
	std::lock_guard<std::mutex> lock(mutex);
	++counter;
}

int main() {
	std::thread worker(increment);
	worker.join();
}
```

销毁仍可连接的 thread 会调用 terminate，条件变量等待还需重新检查共享条件；接口见[线程与同步](/guide/concurrency)。
