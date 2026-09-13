# STL 容器与复杂度

## STL 总体结构 {#source-56}

STL 包括容器、迭代器、算法、函数对象和分配器。容器管理元素存储，迭代器提供遍历接口，算法通过迭代器区间访问元素。分配器控制存储分配，函数对象可提供比较和变换操作。

## vector {#source-57}

`std::vector<T>` 管理连续存储的元素，支持常数时间随机访问；此描述不包括 `vector<bool>` 的特殊代理表示。operator[] 不执行越界检查，at() 越界时抛异常。vector 可用于按索引访问和顺序遍历的数据。

```cpp
vector<int> nums;

nums.push_back(10);
nums.push_back(20);

cout << nums[0];
```

## vector 的 size 和 capacity {#source-58}

size() 返回已构造元素数量，capacity() 返回当前分配空间可容纳的元素数量。capacity 大于 size 的部分不是可通过下标访问的已存在元素。使用 v[i] 时必须满足 i &lt; v.size()。

```cpp
cout << v.size();
cout << v.capacity();
```

## vector 扩容 {#source-59}

vector 需要更大容量时重新分配连续存储，移动或复制旧元素并释放旧存储。增长倍率由实现决定，标准不要求固定为两倍。预先知道数量时可调用 reserve 降低重新分配次数；移动是否可抛异常会影响元素迁移策略。

## 为什么 vector push_back 平均 O(1)？ {#source-60}

vector 单次尾插在无需扩容时为常数时间，扩容时需要处理已有元素，单次成本可达 O(n)。连续多次尾插的总迁移成本按摊还分析得到每次 O(1)，这不代表每次尾插耗时相同。

## reserve 和 resize {#source-61}

reserve(n) 在需要时增加容量，不改变 size。resize(n) 改变元素数量，增大时构造元素，缩小时销毁尾部元素。reserve 用于预留存储，resize 用于实际创建或移除元素；缩小 size 不必缩小 capacity。

```cpp
v.reserve(100);
```

```cpp
v.resize(100);
```

## vector 迭代器失效 {#source-62}

vector 重新分配会使旧元素的全部指针、引用和迭代器失效。未扩容的尾插仍使旧 end() 失效；中间插入或删除还会使操作位置及其后的迭代器失效。示例若在 push_back 中扩容，最后解引用 p 将访问失效地址。

```cpp
vector<int> v;

v.push_back(1);

int* p = &v[0];

v.push_back(2);
v.push_back(3);
v.push_back(4);

cout << *p;
```

## list {#source-63}

`std::list<T>` 通常使用双向链表。在已知迭代器位置插入或删除单个元素为 O(1)，寻找第 n 个位置仍需线性遍历，不支持 operator[]。插入不使已有元素迭代器失效，删除主要使被删除元素的迭代器失效。

```cpp
list<int> l;

l.push_back(10);
l.push_front(20);
```

## deque {#source-64}

`std::deque<T>` 支持常数时间随机访问和双端插入删除，通常使用分段存储，不能把所有元素当成一整块连续数组。它可用于从两端增长的队列；迭代器失效规则与 vector 和 list 不同。

```cpp
deque<int> d;

d.push_back(1);
d.push_front(2);
```

## vector、list和deque 对比 {#source-65}

vector 随机访问 O(1)，中间插入 O(n)，尾插摊还 O(1)；list 不支持常数时间随机访问，已知位置插入 O(1)；deque 随机访问 O(1)，双端操作高效。连续遍历时 vector 的缓存局部性较好，list 的位置查找和节点分配成本需单独计算。

## map {#source-66}

`std::map<Key, T>` 按比较器维护唯一键值对，查找和按键插入通常为 O(log n)。常见实现使用红黑树，但标准未规定树种类。operator[] 在键不存在时插入默认值；只查询而不插入可使用 find。

```cpp
map<string, int> scores;

scores["Alice"] = 100;
scores["Bob"] = 90;
```

## set {#source-67}

`std::set<T>` 按比较器维护唯一元素，重复插入等价键不会增加元素。元素不能通过普通迭代器直接修改为破坏排序的值。set 可用于去重和有序遍历，唯一性由比较器等价关系决定。

```cpp
set<int> s;

s.insert(3);
s.insert(1);
s.insert(3);
```

## multimap、multiset {#source-68}

multimap 和 multiset 允许等价键重复出现。equal_range(key) 可以取得全部等价键对应的区间，适用于一对多映射或需要保留重复元素的有序集合。

```cpp
multiset<int> s;

s.insert(1);
s.insert(1);
```

## stack、queue和priority_queue {#source-69}

stack 提供后进先出访问，queue 提供先进先出访问，priority_queue 按比较器提供优先级最高元素。默认 `priority_queue<int>` 的 top() 是最大值。pop() 移除元素但不返回值，取值应先调用 top() 或 front()。

```cpp
stack<int> s;

s.push(1);
s.push(2);

s.pop();
```

```cpp
queue<int> q;

q.push(1);
q.push(2);

q.pop();
```

```cpp
priority_queue<int> q;

q.push(1);
q.push(10);
q.push(5);

cout << q.top();
```

## std::array {#source-112}

`std::array<T, N>` 提供大小在编译期确定的连续元素存储，具有 size、begin 和 end 等容器接口。它按值复制全部元素，不像函数参数中的普通数组那样自动退化为指针。N 不在运行时改变。

```cpp
array<int, 3> arr = {1, 2, 3};
```

## unordered_map {#source-114}

unordered_map 基于哈希组织唯一键值对，平均查找、插入和按键删除为 O(1)，最坏可达 O(n)。遍历顺序不按键排序，rehash 可能使迭代器失效。自定义键需要配套满足一致性要求的哈希和相等比较。

```cpp
unordered_map<string, int> m;

m["Alice"] = 100;
```

## map vs unordered_map {#source-115}

map 按比较器有序，查找为 O(log n)，适合 lower_bound 和有序区间操作；unordered_map 无键顺序保证，平均查询为 O(1)，最坏 O(n)。内存占用和常数成本受键类型、哈希质量、节点和桶结构影响。

## 哈希冲突 {#source-116}

不同键映射到同一桶时发生哈希冲突。哈希表可通过链地址等结构保存这些元素，再使用相等比较确定匹配项。负载因子和哈希分布会影响查找成本；相等的键必须产生相同哈希值。

## emplace {#source-117}

emplace_back(args...) 将参数转发给元素构造函数，在容器存储中构造元素；push_back(value) 接收已形成的值并复制或移动它。emplace 可以省去某些临时对象，但构造函数重载、扩容和异常保证仍会影响行为和成本。

```cpp
v.push_back(Player(100, 50));
```

```cpp
v.emplace_back(100, 50);
```
