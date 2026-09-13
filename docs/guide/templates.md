# 模板与编译期工具

## 概括要点

- 函数模板和类模板根据类型实例化；模板定义通常需要在实例化处可见，因此常写在头文件中。
- 类型模板参数中的 typename 与 class 等价；依赖类型名称通常需要 typename 消除歧义。
- C++11 参数包支持可变参数模板，using 支持类型别名及别名模板。
- type_traits 提供类型查询和变换；static_assert 在编译期检查条件。
- 转发引用与引用折叠统一放在移动语义章，constexpr 统一放在 const 章。

## 模板 {#source-48}

函数模板：

```cpp
template<typename T>
T maxValue(T a, T b) {
	return a > b ? a : b;
}
```

调用：

```cpp
maxValue(10, 20);
maxValue(1.5, 2.5);
```

编译器根据类型实例化。


## 类模板 {#source-49}

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

使用：

```cpp
Box<int> box(10);
```


## 模板为什么通常写在头文件里？ {#source-50}

因为模板只有在：

```text
实例化时
```

编译器才产生具体代码。

例如：

```cpp
Box<int>
```

编译器需要看到完整模板定义。

如果模板实现只写在另一个 `.cpp` 中，当前翻译单元可能看不到定义，最终出现链接问题。


## typename 和 class {#source-51}

模板参数：

```cpp
template<typename T>
```

与：

```cpp
template<class T>
```

这里基本等价。

但是 `typename` 还有一个重要用途。

例如：

```cpp
template<typename T>
void func() {
	typename T::value_type x;
}
```

告诉编译器：

```text
T::value_type 是一个类型
```


## 可变参数模板 {#source-118}

C++11：

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

调用：

```cpp
print(1, "hello", 3.14);
```

这里：

```cpp
typename... Args
```

是参数包。


## using 类型别名 {#source-119}

传统：

```cpp
typedef vector<int> IntVector;
```

C++11：

```cpp
using IntVector = vector<int>;
```

模板别名更明显：

```cpp
template<typename T>
using Vec = vector<T>;
```

然后：

```cpp
Vec<int> nums;
```


## type_traits {#source-120}

```cpp
#include <type_traits>

cout << is_integral<int>::value;
```

模板元编程常用：

```text
is_same
is_integral
is_pointer
is_reference
remove_reference
enable_if
```

例如：

```cpp
static_assert(
	is_integral<int>::value,
	"must be integer"
);
```


## static_assert {#source-121}

C++11：

```cpp
static_assert(sizeof(int) >= 4, "int too small");
```

编译阶段检查。

非常适合模板和底层代码。
