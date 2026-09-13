# 内存、生命周期、RAII 与异常

## 概括要点

- RAII 把资源释放绑定到对象析构，可覆盖正常返回和异常展开；所有权应明确，避免多个对象重复释放同一资源。
- new / delete、new[] / delete[]、malloc / free 必须正确配对；malloc 不调用构造函数，free 不调用析构函数。
- 区分自动、静态、动态和线程存储期；局部指针的生命周期与其指向的动态对象并不相同。
- 悬空指针、未初始化指针、内存泄漏和重复释放有不同成因；置空一个指针不会修复其他别名。
- 未定义行为不等于必然崩溃；越界、释放后使用等代码的结果没有标准保证。
- 使用 try / throw / catch 处理异常，通常以 const std::exception& 捕获，依靠 RAII 清理已构造的局部对象。

## RAII {#source-22}

以下示例使用 C++11 的 = delete 禁止复制，避免重复关闭文件；C++98 可将复制操作声明为 private 且不实现。

这是 C++ 核心思想之一。

RAII：

```text
Resource Acquisition Is Initialization
资源获取即初始化
```

把资源生命周期绑定到对象生命周期。

例如：

```cpp
class File {
private:
	FILE* file;

public:
	File(const File&) = delete;
	File& operator=(const File&) = delete;

	explicit File(const char* path) {
		file = fopen(path, "r");
	}

	~File() {
		if (file)
			fclose(file);
	}
};
```

于是：

```cpp
void func() {
	File file("a.txt");
}
```

离开作用域时自动释放。

现代 C++ 的：

```text
vector
string
unique_ptr
shared_ptr
lock_guard
fstream
```

都大量利用 RAII。


## new / delete {#source-27}

```cpp
int* p = new int(10);

delete p;
```

数组：

```cpp
int* arr = new int[100];

delete[] arr;
```

必须配对：

```text
new      → delete
new[]    → delete[]
```


## new 和 malloc 区别 {#source-28}

极高频八股。

`malloc`：

```cpp
A* p = static_cast<A*>(malloc(sizeof(A)));
```

只分配原始内存。

不会调用构造函数。

`new`：

```cpp
A* p = new A();
```

会：

```text
1. 分配内存
2. 调用构造函数
```

delete：

```text
1. 调用析构函数
2. 释放内存
```

free：

```text
只释放内存
```

此外：

```text
malloc 失败返回 NULL
普通 new 失败默认抛 std::bad_alloc
```


## 栈和堆 {#source-29}

典型：

```cpp
void func() {
	int a = 10;
	int* p = new int(20);

	delete p;
}
```

这里一般：

```text
a            自动存储期对象
p            自动存储期指针对象
new int      动态存储期对象
```

传统八股会说“栈和堆”，但标准 C++ 更准确地讨论：

```text
automatic storage duration
dynamic storage duration
static storage duration
thread storage duration（C++11）
```


## 异常 {#source-52}

```cpp
try {
	throw runtime_error("error");
}
catch (const exception& e) {
	cout << e.what() << endl;
}
```

基本结构：

```text
try
throw
catch
```

通常推荐：

```cpp
catch (const std::exception& e)
```

通过 const 引用接收。


## 悬空指针 {#source-152}

```cpp
int* p = new int(10);

delete p;

cout << *p;
```

delete 后：

```text
p 仍保存旧地址
```

但该对象已不存在。

p 是：

```text
dangling pointer
```

可以：

```cpp
delete p;
p = nullptr;
```

降低误用风险。


## 野指针 {#source-153}

```cpp
int* p;

*p = 10;
```

p 未初始化。

这种指针常称：

```text
wild pointer
```

应该：

```cpp
int* p = nullptr;
```


## 内存泄漏 {#source-154}

```cpp
void func() {
	int* p = new int[1000];
}
```

函数结束：

```text
p 消失
```

动态分配的内存还存在。

已经找不到地址。

这就是：

```text
memory leak
```

现代 C++ 用 RAII 和智能指针解决大量此类问题。


## double delete {#source-155}

```cpp
int* p = new int;

delete p;
delete p;
```

未定义行为。


## undefined behavior {#source-156}

UB 是 C++ 面试核心概念。

例如：

```cpp
int* p = nullptr;
cout << *p;
```

```cpp
int a[3];
cout << a[10];
```

```cpp
int* p = new int;
delete p;
cout << *p;
```

这些都可能是：

```text
Undefined Behavior
```

意思不是：

```text
一定崩溃
```

而是：

> C++ 标准不规定程序应该发生什么。

它可能：

```text
崩溃
正常运行
输出乱码
被优化器产生意外结果
```
