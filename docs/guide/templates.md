# 模板与编译期工具

## 模板 {#source-48}

`template<typename T>` 声明类型模板参数，函数模板根据调用实参推导 T 并实例化。模板体中使用的操作必须对实际类型成立。可用于对多种数值或可比较类型执行同一算法。

```cpp
template<typename T>
T maxValue(T a, T b) {
	return a > b ? a : b;
}
```

```cpp
maxValue(10, 20);
maxValue(1.5, 2.5);
```

## 类模板 {#source-49}

类模板把成员类型或行为参数化，`Box<int>` 和 `Box<double>` 是不同的类型。实例化时需要满足成员定义涉及的类型要求。模板参数确定对象的具体布局和成员函数实例。

```cpp
template<typename T>
class Box {
private:
	T value;

public:
	Box(const T& v)
		: value(v) {
	}

	T get() const {
		return value;
	}
};
```

```cpp
Box<int> box(10);
```

## 模板为什么通常写在头文件里？ {#source-50}

隐式实例化通常需要在实例化位置看到模板定义，因此模板实现常放在头文件中。若实现放在单独源文件，可以对已知类型进行显式实例化，再供其他翻译单元链接；不能仅提供声明并期望任意类型自动获得实现。

## typename 和 class {#source-51}

在类型模板参数列表中，typename T 和 class T 都声明类型参数。模板体中，依赖模板参数的限定名称若代表类型，通常需要 typename，例如 typename T::value_type；它用于区分类型与值。

```cpp
template<typename T>
```

```cpp
template<class T>
```

```cpp
template<typename T>
void func() {
	typename T::value_type x;
}
```

## 可变参数模板 {#source-118}

typename... Args 声明类型参数包，args... 展开函数实参包。C++11 可以通过递归重载逐个处理参数，并提供终止重载；C++17 的折叠表达式则允许直接按运算符组合参数包。

```cpp
template<typename T>
void print(const T& value) {
	cout << value << endl;
}

template<typename T, typename... Args>
void print(const T& value, const Args&... args) {
	cout << value << endl;
	print(args...);
}
```

```cpp
print(1, "hello", 3.14);
```

## using 类型别名 {#source-119}

using Name = Type 声明类型别名，不创建新的独立类型。C++11 还支持别名模板，可以把模板参数代入目标类型；传统 typedef 不能直接声明别名模板。

```cpp
typedef vector<int> IntVector;
```

```cpp
using IntVector = vector<int>;
```

```cpp
template<typename T>
using Vec = vector<T>;
```

## type_traits {#source-120}

&lt;type_traits&gt; 提供 is_same、is_integral 等查询，以及 remove_reference 等类型变换。C++11 通过 ::value 读取布尔结果，通过 ::type 取得变换类型；enable_if 可控制某些模板候选是否可用。

```cpp
#include <type_traits>

cout << is_integral<int>::value;
```

## static_assert {#source-121}

C++11 static_assert(condition, message) 在编译期检查常量条件，不满足时诊断失败。消息参数在 C++17 前不能省略。它可验证模板参数、对象布局假设或编译期计算结果，与运行时 assert 的触发阶段不同。

```cpp
static_assert(sizeof(int) >= 4, "int too small");
```
