# 智能指针与所有权

## 概括要点

- unique_ptr 独占资源、禁止复制、支持移动；C++11 尚无 std::make_unique。
- shared_ptr 共享所有权，最后一个强所有者释放时销毁对象；控制块记录引用计数与删除器等信息。
- shared_ptr 的强引用环会阻止对象释放；weak_ptr 观察共享对象而不增加强引用计数。
- 使用 weak_ptr::lock() 一次性尝试获取临时所有权，并检查返回值是否为空。
- 默认优先值对象与独占所有权；明确需要共享生命周期时再选择 shared_ptr。

## unique_ptr {#source-97}

C++11：

```cpp
unique_ptr<Player> p(new Player());
```

所有权唯一。

不能：

```cpp
unique_ptr<Player> p2 = p;
```

因为不能复制。

可以移动：

```cpp
unique_ptr<Player> p2 = std::move(p);
```

移动后：

```cpp
p == nullptr
```

现代代码中动态独占资源优先考虑 unique_ptr。

注意：

```cpp
make_unique
```

是 C++14 才加入的，不属于 C++11。


## shared_ptr {#source-98}

```cpp
shared_ptr<Player> p1(new Player());

shared_ptr<Player> p2 = p1;
```

通过引用计数共享所有权。

大体：

```text
p1 ──┐
     ├── Player
p2 ──┘

use_count = 2
```

其中：

```cpp
p1.use_count()
```

可以查看强引用数。

最后一个 shared_ptr 消失：

```text
对象销毁
```


## shared_ptr 控制块 {#source-99}

典型实现：

```text
shared_ptr
    │
    ├── object pointer
    │
    └── control block
         ├── strong count
         ├── weak count
         └── deleter...
```

这个知识点经常面试。


## shared_ptr 循环引用 {#source-100}

经典问题：

```cpp
class B;

class A {
public:
	shared_ptr<B> b;
};

class B {
public:
	shared_ptr<A> a;
};
```

如果：

```text
A → B
↑   ↓
└───┘
```

双方引用计数永远不会到 0。

造成内存泄漏。


## weak_ptr {#source-101}

解决循环引用：

```cpp
class B {
public:
	weak_ptr<A> a;
};
```

weak_ptr：

```text
观察对象
不增加 strong reference count
```

使用对象前：

```cpp
shared_ptr<A> p = weak.lock();

if (p) {
	// object still exists
}
```


## 智能指针优先级 {#source-102}

通常：

```text
默认：
unique_ptr

确实需要共享所有权：
shared_ptr

观察 shared_ptr 对象：
weak_ptr
```

不要一上来所有东西都 shared_ptr。
