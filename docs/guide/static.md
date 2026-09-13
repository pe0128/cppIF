# static 与共享状态

## 概括要点

- 局部 static 具有局部作用域、静态存储期，跨函数调用保留状态。
- C++11 保证局部静态变量的初始化在并发进入时只完成一次；后续读写仍需同步。
- 静态数据成员属于类，由对象共享；C++98/11 的普通静态数据成员通常需要类外定义。
- 静态成员函数没有 this；访问非静态成员需要显式提供对象。
- 命名空间作用域的 static 可赋予变量或函数内部链接，限制在当前翻译单元使用。

## 局部 static {#source-9}

static 是高频中的高频。

### 1. 函数内部 static

```cpp
void func() {
	static int count = 0;

	count++;

	cout << count << endl;
}
```

调用：

```cpp
func();
func();
func();
```

输出：

```text
1
2
3
```

它拥有：

```text
局部作用域
静态存储期
```

存储具有静态存储期；需要动态初始化时，在控制流首次经过声明处完成初始化。C++11 保证此初始化的线程安全，但不保证后续读写线程安全。


## static 类成员 {#source-10}

```cpp
class Player {
public:
	static int count;
};

int Player::count = 0;
```

这个成员属于：

```text
整个类
```

所有对象共享。

```cpp
Player a;
Player b;

Player::count = 10;
```


## static 成员函数 {#source-11}

```cpp
class Player {
public:
	static void printCount() {
		cout << count << endl;
	}

	static int count;
};
```

调用：

```cpp
Player::printCount();
```

static 成员函数没有普通对象的：

```cpp
this
```

因此不能直接访问非 static 成员。


## static 成员函数为什么没有 this？ {#source-151}

因为调用：

```cpp
A::func();
```

根本不需要具体 A 对象。

因此没有对象地址可以作为：

```cpp
this
```

传进去。
