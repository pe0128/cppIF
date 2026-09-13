# sizeof、对象布局与内存对齐

## 概括要点

- sizeof 返回类型或对象所占字节数；指针大小依赖目标平台，不能把常见的 8 字节当成标准保证。
- 完整空类对象的大小至少为 1，常见实现取 1；空基类子对象可能通过优化不占额外空间。
- 内存对齐可在成员间和对象尾部引入填充，成员顺序会影响结构体总大小。
- 含虚函数的对象通常需要存储虚表指针，但具体布局、填充与 ABI 都属于实现细节。

## sizeof {#source-133}

```cpp
sizeof(int)
sizeof(A)
sizeof(pointer)
```

返回对象/类型占用字节数。

例如 64 位机器常见：

```cpp
sizeof(int*) == 8
```

但不要把它当语言标准保证。


## 空类为什么 sizeof == 1？ {#source-134}

```cpp
class Empty {
};

cout << sizeof(Empty);
```

通常：

```text
1
```

因为不同对象必须拥有不同地址。

```cpp
Empty a;
Empty b;
```

要求：

```text
&a != &b
```

所以至少需要某种占位空间。


## 内存对齐 {#source-135}

例如：

```cpp
struct A {
	char a;
	int b;
	char c;
};
```

直觉数据：

```text
1 + 4 + 1 = 6
```

实际常见：

```text
12
```

布局可能：

```text
a       1 byte
padding 3 bytes
b       4 bytes
c       1 byte
padding 3 bytes
```

原因：

```text
alignment
```

便于 CPU 高效访问。


## 如何减少结构体 padding？ {#source-136}

调整成员顺序。

比如：

```cpp
struct A {
	char a;
	char c;
	int b;
};
```

常见：

```text
1 + 1 + 2 padding + 4 = 8
```

比之前 12 小。


## sizeof 含 virtual 的类 {#source-137}

例如：

```cpp
class A {
public:
	virtual void func();
};
```

在主流 ABI 中对象通常还需要：

```text
vptr
```

所以 sizeof 通常至少包含一个指针大小。

但仍然要强调：

> vptr 是实现机制，不属于标准规定的对象布局。
