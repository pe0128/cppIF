# 迭代器与算法

## 概括要点

- 迭代器为算法提供独立于具体容器的访问方式，常使用左闭右开区间 [first, last)。
- 五类经典迭代器为输入、输出、前向、双向与随机访问；算法对迭代器能力有要求。
- std::sort 需要随机访问迭代器；list 应使用自己的 sort 成员函数。
- 修改容器之前先判断迭代器失效规则，尤其注意 vector 扩容和删除操作。

## 迭代器 {#source-70}

```cpp
vector<int>::iterator it;

for (it = v.begin(); it != v.end(); ++it) {
	cout << *it << endl;
}
```

迭代器提供：

```text
容器与算法之间的统一接口
```


## 五类经典迭代器 {#source-71}

传统分类：

```text
Input Iterator
Output Iterator
Forward Iterator
Bidirectional Iterator
Random Access Iterator
```

例如：

```text
vector      Random Access
deque       Random Access
list        Bidirectional
map/set     Bidirectional
```

所以：

```cpp
sort(v.begin(), v.end());
```

可以。

但是：

```cpp
sort(list.begin(), list.end());
```

不行。

因为 `std::sort` 要求随机访问迭代器。

`list` 自己提供：

```cpp
list.sort();
```


## STL algorithm {#source-72}

```cpp
sort(v.begin(), v.end());

find(v.begin(), v.end(), 10);

reverse(v.begin(), v.end());
```

经典思想：

```text
algorithm 操作 iterator range
```

通常采用：

```text
[first, last)
```

左闭右开区间。
