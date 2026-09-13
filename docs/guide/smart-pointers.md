# 智能指针与所有权

## unique_ptr {#source-97}

unique_ptr 独占资源，不能复制，可以通过移动转移所有权。析构时调用对应删除器；管理数组需要匹配数组形式。C++11 可用 new 构造 unique_ptr，std::make_unique 从 C++14 开始提供。示例中的复制初始化 p2 = p 不合法，移动初始化可行。

```cpp
unique_ptr<Player> p(new Player());
```

```cpp
unique_ptr<Player> p2 = p;
```

```cpp
unique_ptr<Player> p2 = std::move(p);
```

## shared_ptr {#source-98}

shared_ptr 通过控制块共享所有权。复制 shared_ptr 增加强所有者数量，最后一个强所有者释放时销毁对象。不要从同一裸指针分别构造独立控制块；控制块计数的并发管理不使被指向对象自动线程安全。

```cpp
shared_ptr<Player> p1(new Player());

shared_ptr<Player> p2 = p1;
```

## shared_ptr 控制块 {#source-99}

shared_ptr 的控制块通常记录强引用计数、弱引用管理状态、删除器和分配器。对象在最后一个强所有者释放时销毁，控制块可因仍有 weak_ptr 而继续存在。make_shared 通常将对象和控制块放在同次分配中，具体布局由实现决定。

## shared_ptr 循环引用 {#source-100}

若 A 和 B 通过 shared_ptr 互相持有，即使外部所有者释放，两者仍各有一个强所有者，导致资源无法销毁。需要检查对象关系中哪一方只观察另一方，并在该边使用 weak_ptr。

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

## weak_ptr {#source-101}

weak_ptr 观察 shared_ptr 管理的对象，不增加强引用计数。lock() 尝试获得 shared_ptr；成功返回临时所有权，失败返回空指针。单独检查 expired() 后再使用裸指针不能代替 lock() 的所有权获取。

```cpp
class B {
public:
	weak_ptr<A> a;
};
```

```cpp
shared_ptr<A> p = weak.lock();

if (p) {
	// object still exists
}
```

## 智能指针优先级 {#source-102}

值对象把生命周期交给所在作用域或容器；unique_ptr 表达单一所有者；shared_ptr 表达多个独立所有者；weak_ptr 表达对共享对象的观察关系。类型选择取决于谁负责释放以及使用方是否需要延长资源生命期。
