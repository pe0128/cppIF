# static 与共享状态

## 局部 static {#source-9}

局部 static 变量具有块作用域和静态存储期，在多次调用之间保留值。需要动态初始化时，首次执行到声明处才进行初始化；C++11 保证并发进入时此初始化只完成一次。后续修改不自动线程安全，可用于调用计数或一次创建的缓存。

```cpp
void func() {
	static int count = 0;

	count++;

	cout << count << endl;
}
```

## static 类成员 {#source-10}

static 数据成员属于类，不是每个对象各自拥有的非静态子对象。C++98 和 C++11 中，普通静态数据成员通常在类内声明、类外提供一次定义。它可记录所有实例共享的配置或计数；多线程读写需要同步。

```cpp
class Player {
public:
	static int count;
};

int Player::count = 0;
```

## static 成员函数 {#source-11}

static 成员函数通过 Class::function() 调用，无需提供类对象。它没有 this，不能直接读取非静态成员；可以通过显式传入的对象访问其成员。它适合操作类级状态或实现与类相关的工厂函数。

```cpp
class Player {
public:
	static void printCount() {
		cout << count << endl;
	}

	static int count;
};
```

```cpp
Player::printCount();
```

## static 成员函数为什么没有 this？ {#source-151}

静态成员函数调用不需要具体对象，因此没有 this 参数。若它需要读取非静态状态，必须通过传入的对象、指针或引用访问，不能直接使用成员名读取某个未指定实例。

```cpp
A::func();
```


## 命名空间作用域的 static

命名空间作用域的 static 变量和函数具有内部链接，名称只在当前翻译单元中关联到该实体。头文件中放置这样的定义会让不同翻译单元各自拥有对象，不能当作跨文件共享状态。

```cpp
static int count = 0;

static void increment() {
	++count;
}
```
