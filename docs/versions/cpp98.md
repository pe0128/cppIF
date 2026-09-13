# C++98

## 指针和引用

`T*` 声明指针，`T&` 声明引用。指针可以改指向，引用在初始化后保持绑定。引用赋值修改被引用对象，指针赋值修改保存的地址。

```cpp
int value = 10;
int other = 20;
int* pointer = &value;
int& reference = value;

pointer = &other;
reference = other;
```

代码执行后，pointer 指向 other，value 的值变为 20。可选对象参数可用指针表示，直接修改调用者对象可用引用参数；详见[参数传递](/guide/pointers#source-5)。

## const 限定

`const int*` 允许改变指针指向，但不能通过它修改整数。`int* const` 限制指针本身的赋值，目标整数仍可修改。

```cpp
int value = 10;
const int* view = &value;
int* const handle = &value;
*handle = 20;
```

const 成员函数可以与非 const 版本重载，用于为只读对象和可修改对象提供不同访问权限；规则见[const 笔记](/guide/const)。

## 构造、析构和资源所有权

构造函数初始化对象，析构函数释放对象拥有的资源。成员按声明顺序初始化，初始化列表的排列不会改变该顺序。直接持有资源的类需要处理复制后的所有权关系。

```cpp
#include <cstdio>

class File {
public:
	explicit File(const char* path)
		: handle(std::fopen(path, "r")) {
	}

	~File() {
		if (handle) {
			std::fclose(handle);
		}
	}

private:
	File(const File&);
	File& operator=(const File&);
	std::FILE* handle;
};
```

这里将复制操作声明为 private 且不定义，禁止普通调用者复制 File。C++11 可使用 `= delete` 表达相应限制。资源释放与异常展开的规则见[内存和生命周期](/guide/memory)。

## 虚函数接口

virtual 成员函数通过对象动态类型选择实现。经基类指针删除派生对象时，基类需提供相应的虚析构接口。

```cpp
struct Shape {
	virtual ~Shape() {}
	virtual double area() const = 0;
};

struct Square : Shape {
	explicit Square(double length) : side(length) {}
	double area() const {
		return side * side;
	}
	double side;
};
```

Shape 是抽象类，不能直接创建对象。Square 实现 area 后可通过 Shape 引用使用；构造期间的派发和对象切片见[继承与多态](/guide/polymorphism)。

## 模板和算法参数

函数模板根据实际类型实例化，使用的操作必须对该类型成立。函数对象可把自定义比较操作交给标准算法。

```cpp
#include <algorithm>
#include <vector>

struct Descending {
	bool operator()(int left, int right) const {
		return left > right;
	}
};

void sortValues(std::vector<int>& values) {
	std::sort(values.begin(), values.end(), Descending());
}
```

std::sort 要求随机访问迭代器，因此可以用于 vector，不能直接使用 list 的迭代器；后者提供自己的成员 sort。分类见[迭代器与算法](/guide/iterators)。

## 声明和链接

头文件可以声明外部对象，由一个源文件提供定义。不同翻译单元中的同名声明是否关联同一实体取决于链接规则。

```cpp
// config.h
extern int maxConnections;
```

```cpp
// config.cpp
int maxConnections = 100;
```

命名空间作用域的 static 对象具有内部链接，放在头文件中会让不同翻译单元各自拥有对象；详见[static](/guide/static)和[编译链接](/guide/build)。
