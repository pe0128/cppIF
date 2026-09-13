# 迭代器与算法

## 迭代器 {#source-70}

迭代器通过解引用、递增和比较等操作遍历元素。begin() 指向首元素，end() 表示尾后位置，不能解引用。迭代器类型的能力和失效条件由容器及具体操作决定。

```cpp
vector<int>::iterator it;

for (it = v.begin(); it != v.end(); ++it) {
	cout << *it << endl;
}
```

## 五类经典迭代器 {#source-71}

经典迭代器分为输入、输出、前向、双向和随机访问类别。vector 和 deque 支持随机访问，list、map 和 set 提供双向迭代器。std::sort 要求随机访问迭代器，不能直接用于 list，后者提供 list::sort。

## STL algorithm {#source-72}

sort、find 和 reverse 等算法通常处理左闭右开的 [first, last) 区间。find 返回找到的迭代器或 last，使用结果前需检查是否等于 last。算法不会自动改变容器大小，具体操作需要满足对应迭代器要求。

```cpp
sort(v.begin(), v.end());

find(v.begin(), v.end(), 10);

reverse(v.begin(), v.end());
```
