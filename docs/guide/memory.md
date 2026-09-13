# 内存、生命周期、RAII 与异常

## RAII {#source-22}

RAII 资源获取即初始化，将资源交给对象持有，并在析构函数中释放。作用域退出和异常栈展开都会销毁已构造的自动对象。文件、锁和动态内存都可按此方式管理。示例使用 C++11 的 = delete 禁止复制，避免同一个 FILE* 被重复关闭；C++98 可将复制操作声明为 private 且不定义。

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

```cpp
void func() {
	File file("a.txt");
}
```

## new、delete {#source-27}

new T 创建单个对象，delete 释放该对象；new T[n] 创建数组，必须使用 delete[]。malloc 获得的内存则交给 free。配对错误会导致未定义行为；delete 空指针是允许的。

```cpp
int* p = new int(10);

delete p;
```

```cpp
int* arr = new int[100];

delete[] arr;
```

## new 和 malloc 区别 {#source-28}

new 表达式取得存储并初始化对象，delete 表达式调用析构并释放存储。malloc 和 free 仅管理原始存储，不调用 C++ 构造函数或析构函数。普通抛异常形式的 new 分配失败时抛出 std::bad_alloc，malloc 失败时返回空指针。

```cpp
A* p = static_cast<A*>(malloc(sizeof(A)));
```

```cpp
A* p = new A();
```

## 栈和堆 {#source-29}

局部普通变量通常具有自动存储期，new 创建的对象具有动态存储期。示例中 a 和指针变量 p 离开作用域后结束生命周期，但 new int 创建的对象需要 delete。标准还区分静态存储期和 C++11 的线程存储期；“栈”和“堆”是常见实现术语。

```cpp
void func() {
	int a = 10;
	int* p = new int(20);

	delete p;
}
```

## 异常 {#source-52}

throw 抛出异常，try 指定受保护代码，catch 按类型处理异常。以 const std::exception& 捕获可避免复制和基类切片。异常向外传播时销毁沿途已构造的自动对象；手工分配的裸资源需要 RAII 所有者负责清理。

```cpp
try {
	throw runtime_error("error");
}
catch (const exception& e) {
	cout << e.what() << endl;
}
```

## 悬空指针 {#source-152}

对象销毁后，原来指向该对象的指针可能仍保存旧地址，但不能再通过它访问对象。delete 后将当前指针设为空可改变该变量的后续状态，不会修复其他指向同一对象的别名。示例第一次解引用发生在释放后，是错误用法。

```cpp
int* p = new int(10);

delete p;

cout << *p;
```

```cpp
delete p;
p = nullptr;
```

## 野指针 {#source-153}

未初始化的局部指针不包含可用目标地址，读取并解引用它不能视为合法访问。声明时可初始化为空指针，但 nullptr 同样不能解引用，需要先绑定有效对象。示例首段为错误代码。

```cpp
int* p;

*p = 10;
```

```cpp
int* p = nullptr;
```

## 内存泄漏 {#source-154}

动态对象未被释放且最后一个可用于释放它的句柄丢失时，会造成资源泄漏。示例函数返回时只销毁局部指针变量，new[] 创建的数组仍未释放。可用容器或拥有资源的智能指针把释放动作绑定到对象析构。

```cpp
void func() {
	int* p = new int[1000];
}
```

## double delete {#source-155}

对同一非空动态对象执行两次 delete 会导致未定义行为。多指针别名不表示多个独立所有者，需要明确只有一个释放责任方，或使用共享所有权类型协调销毁。示例为错误代码。

```cpp
int* p = new int;

delete p;
delete p;
```

## undefined behavior {#source-156}

未定义行为表示标准不对该次程序行为施加要求，不能预测一定崩溃、固定输出或继续正常执行。以下空指针解引用、数组越界和释放后访问均为错误代码；优化器可以依据合法程序不会发生这些情况进行优化。

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
