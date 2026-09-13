# 指针、引用与参数传递

## 指针基础 {#source-2}

T* 声明指向 T 的指针，&object 取得对象地址，*p 访问被指向对象。指针可重新赋值，也可表示空值；解引用前需要确认地址有效且对象仍然存活。指针用于可选对象参数、数组访问和动态对象的间接访问。

```cpp
int a = 10;
int* p = &a;

cout << *p << endl;
```

```cpp
*p = 20;
```

## 引用 {#source-3}

T& 声明左值引用，定义时必须绑定对象。引用初始化后不能改绑，r = b 是向被引用对象赋值。引用用于函数参数和返回已有对象的别名，不能返回已销毁局部对象的引用。

```cpp
int a = 10;
int& ref = a;

ref = 20;

cout << a << endl;
```

## 指针和引用的区别 {#source-4}

指针可以为空并改变指向，引用必须在初始化时绑定对象。sizeof(p) 返回指针类型的大小，sizeof(r) 返回所引用类型的大小。需要表达“可能没有对象”时可使用指针；需要修改调用者提供的必选对象时可使用引用。

```cpp
int a = 10;
int b = 20;

int* p = &a;
p = &b;
```

```cpp
int& r = a;
r = b;
```

## 值传递、指针传递、引用传递 {#source-5}

值参数形成独立的参数对象，修改参数本身不修改调用者变量；引用参数直接绑定调用者对象；指针参数复制地址，通过解引用访问原对象。小标量可按值传递，只读大对象可使用 const T& 避免复制。指针参数需要约定空指针是否可接受。

```cpp
void addValue(int x) {
	x++;
}
```

```cpp
void addReference(int& x) {
	x++;
}
```

```cpp
void addPointer(int* x) {
	(*x)++;
}
```

```cpp
int a = 10;

addValue(a);
addReference(a);
addPointer(&a);
```

## nullptr {#source-78}

nullptr 是 C++11 的空指针字面量，类型为 std::nullptr_t，可以转换为空对象指针或成员指针。与整数形式的 NULL 不同，它不会被整数参数重载当作普通整数接收。示例第二个调用选择指针重载。

```cpp
void func(int);
void func(char*);

func(NULL);
```

```cpp
func(nullptr);
```

## nullptr、NULL、0 {#source-157}

C++98 可使用整数常量 0 或 NULL 表示空指针。NULL 的具体定义由实现决定，参与重载时可能表现为整数。C++11 的 nullptr 具有专门的空指针类型语义，可用于区分整数实参与空指针实参。

```cpp
int* p = 0;
```

```cpp
int* p = NULL;
```

```cpp
int* p = nullptr;
```
