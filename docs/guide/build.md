# 作用域、声明与编译链接

## 作用域 {#source-14}

名称查找根据声明所在作用域进行。内层同名声明可以隐藏外层声明，示例中最内层输出的 x 为 30。命名空间和类形成各自的作用域；局部变量通常限定在声明所在的块中。

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

## namespace {#source-15}

namespace 将声明放入命名空间，通过 Namespace::name 限定访问。using 声明引入指定名称，using namespace 指令影响非限定名称查找。公共头文件中的全局 using namespace 会影响包含它的翻译单元，可能造成名称冲突。

```cpp
namespace Game {
	class Player {
	};
}
```

```cpp
Game::Player player;
```

## extern {#source-139}

extern int g_value; 声明外部对象而不在此处定义存储。其他翻译单元需要提供对应定义，链接时解析同一符号。带初始化器的 extern 声明可以是定义，不能仅凭 extern 判断是否分配存储。

```cpp
int g_value = 10;
```

```cpp
extern int g_value;
```

## 声明与定义 {#source-140}

声明介绍实体的名称和类型，定义还提供函数体、类内容或对象定义等实体信息。一个实体可有多个兼容声明，但定义受 ODR 约束。函数调用只看到声明可以通过编译，最终仍需可链接的定义。

```cpp
extern int x;
```

```cpp
int x = 10;
```

```cpp
void func();
```

```cpp
void func() {
}
```

## 头文件为什么需要 include guard？ {#source-141}

include guard 通过条件预处理防止同一翻译单元重复处理头文件内容。它不解决多个翻译单元中的非 inline 外部定义冲突。#pragma once 是广泛实现的替代方式，但不是 C++98 的标准预处理指令。

```cpp
#ifndef PLAYER_H
#define PLAYER_H

class Player {
};

#endif
```

```cpp
#pragma once
```

## 编译流程 {#source-142}

预处理展开头文件和宏并处理条件编译；编译分析 C++ 语义并生成中间表示或汇编；汇编形成目标文件；链接解析外部符号并组合目标文件与库。工具链可合并某些阶段，但阶段负责的问题仍不同。

## 编译错误 vs 链接错误 {#source-143}

类型不匹配和语法错误通常在编译阶段诊断。函数只有声明但没有可用定义时，调用代码可能通过编译，再在链接阶段报告 unresolved external symbol 或 undefined reference。示例分别展示两种错误。

```cpp
int x = "hello";
```

```cpp
void func();

int main() {
	func();
}
```

## 静态库 vs 动态库 {#source-144}

静态库通常在链接时将所需目标代码整合进程序，更新库后一般需要重新链接。动态库在加载或运行期间参与符号解析，需要部署兼容版本。Windows 的 .lib 既可能是静态库，也可能是动态库的导入库，不能只看扩展名判断。
