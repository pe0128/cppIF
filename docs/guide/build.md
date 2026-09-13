# 作用域、声明与编译链接

## 概括要点

- 作用域控制名称查找，命名空间组织符号；头文件避免全局 using namespace std。
- 声明介绍名称和类型，定义提供实体；extern 常用于声明在其他翻译单元定义的对象。
- include guard 防止同一翻译单元重复包含；它不能解决跨翻译单元违反 ODR 的定义问题。
- 构建通常经过预处理、编译、汇编、链接；类型错误多在编译期暴露，缺少定义多表现为链接错误。
- 静态库通常在链接时整合所需代码，动态库在加载或运行时参与，部署与版本兼容要求不同。

## 作用域 {#source-14}

C++ 常见作用域：

```text
全局作用域
命名空间作用域
类作用域
函数作用域
代码块作用域
```

例如：

```cpp
int x = 10;

void func() {
	int x = 20;

	{
		int x = 30;
		cout << x;
	}
}
```

输出：

```text
30
```

最近作用域优先。


## namespace {#source-15}

```cpp
namespace Game {
	class Player {
	};
}
```

使用：

```cpp
Game::Player player;
```

或者：

```cpp
using namespace Game;
```

头文件一般不推荐：

```cpp
using namespace std;
```

因为会污染使用这个头文件的所有翻译单元。


## extern {#source-139}

例如：

a.cpp：

```cpp
int g_value = 10;
```

b.cpp：

```cpp
extern int g_value;
```

表示：

```text
g_value 在别处定义
```

这里仅声明。


## 声明与定义 {#source-140}

声明：

```cpp
extern int x;
```

告诉编译器：

```text
存在这个东西
```

定义：

```cpp
int x = 10;
```

真正提供对象存储。

函数：

```cpp
void func();
```

声明。

```cpp
void func() {
}
```

定义。


## 头文件为什么需要 include guard？ {#source-141}

```cpp
#ifndef PLAYER_H
#define PLAYER_H

class Player {
};

#endif
```

防止一个翻译单元重复包含同一头文件导致重复定义。

也常见：

```cpp
#pragma once
```

但 `#pragma once` 并非早期 ISO C++ 标准规定的预处理指令，实际主流编译器广泛支持。


## 编译流程 {#source-142}

高频面试：

```text
源代码
 ↓
预处理
 ↓
编译
 ↓
汇编
 ↓
目标文件
 ↓
链接
 ↓
可执行文件
```

预处理：

```text
#include
#define
#if
```

编译：

```text
C++ → 汇编/中间形式
```

汇编：

```text
汇编 → object file
```

链接：

```text
解决外部符号
合并目标文件和库
```


## 编译错误 vs 链接错误 {#source-143}

编译错误：

```cpp
int x = "hello";
```

类型不正确。

链接错误：

```cpp
void func();

int main() {
	func();
}
```

如果没有 func 定义，可能：

```text
undefined reference
unresolved external symbol
```


## 静态库 vs 动态库 {#source-144}

静态库：

Windows：

```text
.lib
```

Linux：

```text
.a
```

通常链接时把所需代码整合进最终程序。

优点：

```text
部署简单
```

缺点：

```text
可执行文件较大
更新库通常需要重新链接
```

动态库：

Windows：

```text
.dll
```

Linux：

```text
.so
```

运行时加载。

优点：

```text
多个程序共享
更新灵活
```

缺点：

```text
部署和版本兼容更复杂
```
