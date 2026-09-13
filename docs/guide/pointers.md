# 指针、引用与参数传递

## 概括要点

- 指针保存地址，可以改指向或为空；引用是别名，必须初始化，绑定后不能改绑。
- 值传递复制参数；引用和指针可用于修改调用者对象。只读大对象通常用 const T&，小标量常直接传值。
- C++11 使用 nullptr 表示空指针，避免整数 0 / NULL 参与重载解析造成混淆。
- 指针与引用都不自动延长任意被指向对象的寿命，使用前必须确认对象仍然存活。

## 指针基础 {#source-2}

### 1. 指针

指针保存的是地址。

```cpp
int a = 10;
int* p = &a;

cout << *p << endl;
```

这里：

```text
a	对象
&a	a 的地址
p	保存 a 地址的指针
*p	p 指向的对象
```

修改：

```cpp
*p = 20;
```

等价于：

```cpp
a = 20;
```

#### 指针可以为空

```cpp
int* p = NULL;
```

C++11 应写：

```cpp
int* p = nullptr;
```


## 引用 {#source-3}

引用可以理解成对象的别名。

```cpp
int a = 10;
int& ref = a;

ref = 20;

cout << a << endl;
```

输出：

```text
20
```

引用必须初始化：

```cpp
int& ref = a;
```

不能：

```cpp
int& ref;	// 错误
```


## 经典八股：指针和引用的区别 {#source-4}

这是极高频问题。

| 指针 | 引用 |
|---|---|
| 保存地址 | 是对象别名 |
| 可以为空 | 正常引用不能为空 |
| 可以改变指向 | 初始化后绑定关系不能改变 |
| 需要 `*p` 解引用 | 直接像对象一样使用 |
| `sizeof(p)` 是地址大小 | `sizeof(ref)` 是所引用类型的大小 |
| 可以有多级指针 | 不存在普通意义上的引用的引用 |

例如：

```cpp
int a = 10;
int b = 20;

int* p = &a;
p = &b;
```

指针改成指向 `b`。

而：

```cpp
int& r = a;
r = b;
```

这里不是让 `r` 引用 `b`。

实际上是：

```cpp
a = b;
```


## 值传递、指针传递、引用传递 {#source-5}

值传递：

```cpp
void addValue(int x) {
	x++;
}
```

不会修改外部对象。

引用传递：

```cpp
void addReference(int& x) {
	x++;
}
```

会修改。

指针传递：

```cpp
void addPointer(int* x) {
	(*x)++;
}
```

调用：

```cpp
int a = 10;

addValue(a);
addReference(a);
addPointer(&a);
```

现代 C++ 通常优先：

```cpp
void func(const T& obj);
```

对于大对象避免复制。


## nullptr {#source-78}

C++98：

```cpp
void func(int);
void func(char*);

func(NULL);
```

可能发生歧义，因为 NULL 常被实现成整数 `0`。

C++11：

```cpp
func(nullptr);
```

`nullptr` 有自己的类型：

```cpp
std::nullptr_t
```

能安全表示空指针。


## nullptr、NULL、0 {#source-157}

C++98 常写：

```cpp
int* p = 0;
```

或者：

```cpp
int* p = NULL;
```

C++11 后：

```cpp
int* p = nullptr;
```

优先使用 nullptr。

因为它具有明确的空指针类型语义。
