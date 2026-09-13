# STL 容器与复杂度

## 概括要点

- STL 用容器存储元素，通过迭代器连接算法；先依据访问、插入删除、顺序与所有权需求选择容器。
- vector 连续存储，随机访问 O(1)，尾插摊还 O(1)；扩容会使旧指针、引用与迭代器失效。
- size 是元素数量，capacity 是已分配容量；reserve 不改变 size，resize 改变元素数量。
- list 在已知位置插入删除 O(1)，寻找位置仍需时间；deque 支持随机访问和双端操作。
- map / set 有序；unordered_map / unordered_set 基于哈希，查询平均 O(1)、最坏 O(n)。multi 版本允许重复键。
- stack、queue、priority_queue 是适配器；array 大小固定；emplace 在目标位置构造，但不保证总比 push 更快。

## STL 总体结构 {#source-56}

STL 可以记成：

```text
Containers
Iterators
Algorithms
Function Objects
Allocators
```

核心思想：

```text
Container ← Iterator → Algorithm
```

算法不关心具体容器，只操作迭代器。


## vector {#source-57}

最常用。

```cpp
vector<int> nums;

nums.push_back(10);
nums.push_back(20);

cout << nums[0];
```

内部通常：

```text
连续内存
```

因此支持：

```cpp
nums[i]
```

O(1)。


## vector 的 size 和 capacity {#source-58}

```cpp
cout << v.size();
cout << v.capacity();
```

`size`：

```text
当前元素数量
```

`capacity`：

```text
当前已经分配、无需重新申请内存即可容纳的元素数量
```


## vector 扩容 {#source-59}

假设：

```text
capacity = 4
```

然后继续 push_back。

空间不够时通常：

```text
申请更大的连续内存
移动/拷贝旧元素
释放旧内存
```

增长比例属于实现细节。

常见：

```text
1.5 倍
2 倍
```

不能说 C++ 标准规定必须 2 倍。


## 为什么 vector push_back 平均 O(1)？ {#source-60}

普通 push：

```text
O(1)
```

扩容：

```text
O(n)
```

但扩容不是每次发生。

因此摊还复杂度：

```text
amortized O(1)
```


## reserve 和 resize {#source-61}

```cpp
v.reserve(100);
```

改变：

```text
capacity
```

不改变 size。

```cpp
v.resize(100);
```

改变：

```text
size
```

增大 size 时构造新增元素，缩小时销毁被移除的元素。

极高频区别。


## vector 迭代器失效 {#source-62}

发生扩容时：

```text
所有指向原存储区域的
pointer
reference
iterator
```

都会失效。

例如：

```cpp
vector<int> v;

v.push_back(1);

int* p = &v[0];

v.push_back(2);
v.push_back(3);
v.push_back(4);

cout << *p;
```

如果期间发生扩容，`p` 已经悬空。


## list {#source-63}

```cpp
list<int> l;

l.push_back(10);
l.push_front(20);
```

通常是双向链表。

特点：

```text
已知迭代器位置时插入删除 O(1)
随机访问 O(n)
没有 operator[]
节点分散
迭代器稳定性较好
```


## deque {#source-64}

双端队列：

```cpp
deque<int> d;

d.push_back(1);
d.push_front(2);
```

特点：

```text
两端插入删除高效
支持随机访问
不是一整块连续内存
```

通常通过分段连续内存实现。


## vector / list / deque 对比 {#source-65}

| 容器 | 随机访问 | 中间插入 | 尾插 | 内存 |
|---|---:|---:|---:|---|
| vector | O(1) | O(n) | 摊还 O(1) | 连续 |
| list | O(n) | O(1)，需已知位置 | O(1) | 节点 |
| deque | O(1) | O(n) | O(1) | 分段 |

实际工程中默认优先考虑：

```cpp
vector
```

因为缓存局部性很好。

不要因为 list 理论插入 O(1) 就默认认为它更快。


## map {#source-66}

```cpp
map<string, int> scores;

scores["Alice"] = 100;
scores["Bob"] = 90;
```

C++98 `map` 通常通过红黑树实现。

标准只规定复杂度和行为，不强制必须红黑树。

常见复杂度：

```text
find    O(log n)
insert  O(log n)
erase   O(log n)
```

而且 key 有序。


## set {#source-67}

```cpp
set<int> s;

s.insert(3);
s.insert(1);
s.insert(3);
```

最终：

```text
1
3
```

特点：

```text
唯一元素
自动排序
通常平衡搜索树
```


## multimap / multiset {#source-68}

允许重复 key：

```cpp
multiset<int> s;

s.insert(1);
s.insert(1);
```


## stack / queue / priority_queue {#source-69}

stack：

```cpp
stack<int> s;

s.push(1);
s.push(2);

s.pop();
```

LIFO。

queue：

```cpp
queue<int> q;

q.push(1);
q.push(2);

q.pop();
```

FIFO。

priority_queue：

```cpp
priority_queue<int> q;

q.push(1);
q.push(10);
q.push(5);

cout << q.top();
```

输出：

```text
10
```

通常底层：

```text
vector + heap
```


## std::array {#source-112}

C++11：

```cpp
array<int, 3> arr = {1, 2, 3};
```

相比 C 数组：

```cpp
int arr[3];
```

提供 STL 接口：

```cpp
arr.begin();
arr.end();
arr.size();
```

但大小仍然编译期固定。


## unordered_map {#source-114}

C++11：

```cpp
unordered_map<string, int> m;

m["Alice"] = 100;
```

通常基于哈希表。

平均：

```text
find    O(1)
insert  O(1)
erase   O(1)
```

最坏：

```text
O(n)
```


## map vs unordered_map {#source-115}

这是极高频八股。

| | map | unordered_map |
|---|---|---|
| 典型实现 | 红黑树 | 哈希表 |
| 是否排序 | 是 | 否 |
| 查询 | O(log n) | 平均 O(1) |
| 最坏查询 | O(log n) | O(n) |
| 范围查询 | 很方便 | 不适合 |
| 内存 | 树节点 | bucket + node |

需要：

```text
有序
lower_bound
范围查询
稳定 O(log n)
```

选 map。

主要追求普通 key-value 快速查询：

```text
unordered_map
```

通常更合适。


## 哈希冲突 {#source-116}

两个 key：

```text
hash(key1) % bucket_count
==
hash(key2) % bucket_count
```

落入同一个 bucket。

这叫：

```text
hash collision
```

常见解决：

```text
链地址法
开放寻址法
```

`std::unordered_map` 的具体内部实现由标准库决定。


## emplace {#source-117}

以前：

```cpp
v.push_back(Player(100, 50));
```

C++11：

```cpp
v.emplace_back(100, 50);
```

让容器直接使用参数构造元素。

可以减少某些临时对象/移动。

但现代编译器优化很强，不能简单背成：

```text
emplace_back 永远比 push_back 快
```

它主要表达：

> 直接在目标位置构造对象。
