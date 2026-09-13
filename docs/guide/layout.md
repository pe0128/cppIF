# sizeof、对象布局与内存对齐

## sizeof {#source-133}

sizeof 返回类型或表达式类型所占字节数，结果类型为 std::size_t。普通 sizeof 表达式通常不求值其操作数。指针大小取决于平台 ABI，不能用某台机器上的 8 字节推断所有目标平台。

```cpp
sizeof(int)
sizeof(A)
sizeof(pointer)
```

## 空类为什么 sizeof == 1？ {#source-134}

完整空类对象的大小至少为 1，常见实现取 1，以便不同完整对象具有可区分的地址。空基类子对象可能采用空基类优化，不必额外增加对象大小；不能把完整空对象与空基类子对象混同。

```cpp
class Empty {
};

cout << sizeof(Empty);
```

## 内存对齐 {#source-135}

对象布局需要满足成员对齐要求，可在成员之间和对象尾部插入填充。char、int、char 的顺序在 int 为 4 字节且按 4 字节对齐的平台上常得到 12 字节结构体；实际大小应由目标 ABI 和 sizeof 确定。

```cpp
struct A {
	char a;
	int b;
	char c;
};
```

## 如何减少结构体 padding？ {#source-136}

调整成员声明顺序可以减少某些填充，例如把两个 char 放在 int 之前，常见布局可从 12 字节缩至 8 字节。修改布局会影响二进制兼容、序列化假设和初始化顺序，不能只依据成员大小之和计算对象大小。

```cpp
struct A {
	char a;
	char c;
	int b;
};
```

## sizeof 含 virtual 的类 {#source-137}

含虚函数的类在常见 ABI 中会存储虚表指针，因此即使没有显式数据成员也可能占据指针大小。多继承、虚继承和对齐会进一步影响布局。C++ 标准未规定必须有 vptr 或某个固定大小。

```cpp
class A {
public:
	virtual void func();
};
```
