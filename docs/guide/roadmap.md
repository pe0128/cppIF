# 知识地图与复习路线

## 概括要点

- C++98 奠定对象、模板、STL 与 RAII 的基础；C++11 补充移动语义、智能指针、类型推导和标准并发库。
- 按“对象 → 生命周期 → 所有权 → RAII → 拷贝与移动 → 智能指针”串联知识，再学习容器与并发。
- 先看各章概括要点，再读示例，最后使用本章的面试问题清单自测。

## 先建立 C++98 → C++11 的总体框架 {#source-1}

C++98 已经具备现代 C++ 的基本骨架：

```text
C++98
├── 基本语法
├── 指针 / 引用
├── const / static / inline
├── struct / class
├── 封装 / 继承 / 多态
├── 构造 / 析构 / 拷贝
├── 运算符重载
├── 模板
├── 异常
├── RTTI
├── STL
│   ├── vector
│   ├── list
│   ├── deque
│   ├── map/set
│   ├── stack/queue
│   ├── iterator
│   └── algorithm
└── RAII
```

C++11 的主要目标可以概括成：

```text
让 C++ 更安全
让 C++ 更高效
让模板更强
让并发进入标准库
让代码更容易写
```

于是加入：

```text
C++11
├── auto / decltype
├── nullptr
├── 范围 for
├── initializer_list
├── lambda
├── 右值引用 &&
├── move
├── perfect forwarding
├── unique_ptr / shared_ptr / weak_ptr
├── constexpr
├── enum class
├── override / final
├── =default / =delete
├── 可变参数模板
├── type_traits
├── tuple / array
├── unordered_map / unordered_set
├── emplace
└── thread / mutex / atomic / condition_variable
```

下面正式展开。


## C++11 最应该真正吃透的 10 个知识点 {#source-161}

如果目的是面试 + 实际开发，我会把优先级排成：

```text
1. RAII
2. const / 引用 / 指针
3. 生命周期
4. 构造、析构、拷贝
5. virtual 与多态
6. STL 容器和复杂度
7. 右值引用与移动语义
8. 智能指针
9. lambda / auto
10. 并发基础
```

其中真正决定 C++ 水平的核心链条其实是：

```text
对象
↓
生命周期
↓
资源所有权
↓
RAII
↓
拷贝语义
↓
移动语义
↓
智能指针
```

这条链一旦彻底理解，C++11 的很多特性会突然连成一体。


## 最核心的一组面试题 {#source-162}

下面这些建议做到看到问题立刻能回答：

```text
指针和引用区别？

new/delete 与 malloc/free 区别？

stack 与 heap 区别？

const int* 和 int* const 区别？

static 有哪些用法？

inline 的作用是什么？

struct 和 class 区别？

构造函数为什么不能 virtual？

析构函数为什么经常要 virtual？

virtual 函数怎么实现？

虚函数表在哪里？

什么是动态绑定？

重载、重写、隐藏区别？

什么是对象切片？

什么是菱形继承？

虚继承解决什么？

什么是浅拷贝和深拷贝？

什么是 Rule of Three？

什么是 Rule of Five？

什么是 Rule of Zero？

vector 的底层是什么？

vector 怎么扩容？

vector 扩容为什么会让 iterator 失效？

size 和 capacity 区别？

reserve 和 resize 区别？

vector、list、deque 区别？

map 和 unordered_map 区别？

红黑树为什么适合 map？

哈希冲突是什么？

priority_queue 底层是什么？

迭代器是什么？

为什么 STL algorithm 用 iterator？

auto 怎么推导？

decltype 是什么？

nullptr 为什么优于 NULL？

lambda 本质是什么？

左值和右值是什么？

右值引用解决什么问题？

std::move 做了什么？

move 后对象还能不能用？

什么是完美转发？

std::forward 干什么？

unique_ptr、shared_ptr、weak_ptr 区别？

shared_ptr 引用计数怎么实现？

shared_ptr 为什么会循环引用？

weak_ptr 怎么解决？

constexpr 与 const 区别？

override / final 有什么用？

=delete / =default 有什么用？

mutex 是什么？

lock_guard 为什么优于手动 lock/unlock？

atomic 是什么？

什么是 data race？

volatile 能不能解决多线程同步？

什么是 undefined behavior？

sizeof 空类为什么通常是 1？

什么是内存对齐？

编译和链接有什么区别？
```

这批基本覆盖 C++98 + C++11 面试最核心区域。

最后可以把整个知识体系压缩成这样：

```text
            C++
             │
     ┌───────┴────────┐
     │                │
 Language          Library
     │                │
     ├─ type           ├─ STL
     ├─ pointer        ├─ container
     ├─ reference      ├─ iterator
     ├─ const          ├─ algorithm
     ├─ class          ├─ smart pointer
     ├─ inheritance    └─ concurrency
     ├─ polymorphism
     ├─ template
     └─ lifetime
         │
         ↓
        Resource
         │
         ↓
        Ownership
         │
     ┌────┴─────┐
     │          │
    Copy       Move
     │          │
     └────┬─────┘
          ↓
         RAII
          │
          ↓
    Smart Pointer
```

如果只选一个最重要的思想来理解 C++98 → C++11 的演化，就是：

**C++98 已经建立了“对象生命周期管理资源”的 RAII 思想；C++11 又通过移动语义、智能指针和更强的模板系统，把“资源所有权”这件事系统化了。**
