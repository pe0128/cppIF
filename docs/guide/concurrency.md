# 线程、同步与原子操作

## std::thread 线程 {#source-124}

std::thread 构造时启动线程执行指定可调用对象，参数默认经过值保存；需要共享原对象可显式传引用包装。线程对象与线程执行本身具有不同生命周期。示例通过 join 等待 work 完成。

```cpp
#include <thread>

void work() {
	cout << "working" << endl;
}

int main() {
	thread t(work);

	t.join();
}
```

## join 和 detach {#source-125}

join 阻塞当前线程直到目标线程完成，detach 解除线程对象对执行线程的关联。销毁仍可连接的 std::thread 会调用 std::terminate。detach 后必须另外保证被访问数据的生命周期，不能依赖局部变量随创建函数返回后仍存活。

```cpp
t.join();
```

```cpp
t.detach();
```

## mutex {#source-126}

mutex 的 lock 获得互斥所有权，unlock 释放。手工配对时，异常或提前返回可能跳过 unlock。保护共享状态时应让所有访问方遵循同一同步规则，可由 lock_guard 或 unique_lock 管理锁的释放。

```cpp
mutex m;

void func() {
	m.lock();

	// critical section

	m.unlock();
}
```

```cpp
m.lock();

throw runtime_error("error");

m.unlock();
```

## lock_guard {#source-127}

`lock_guard<Mutex>` 构造时加锁，析构时解锁，不提供手工 unlock 接口。它用于整个块都需要持锁的临界区，异常展开时也会释放锁。锁对象应有名字，否则临时对象可能在语句末立即析构。

```cpp
mutex m;

void func() {
	lock_guard<mutex> lock(m);

	// critical section
}
```

## unique_lock {#source-128}

`unique_lock<Mutex>` 记录是否拥有锁，可延迟加锁、手工解锁、重新加锁和移动所有权。condition_variable 的等待接口使用 `unique_lock<mutex>`，以便等待时释放并重新取得互斥锁。

```cpp
unique_lock<mutex> lock(m);
```

## condition_variable {#source-129}

condition_variable 用于等待受互斥锁保护的共享条件。wait 以原子方式释放锁并阻塞，被唤醒后重新取得锁；带谓词形式重复检查条件。生产者在同步保护下更新条件，再通知等待线程。

```cpp
mutex m;
condition_variable cv;
bool ready = false;

void worker() {
	unique_lock<mutex> lock(m);

	cv.wait(lock, [] {
		return ready;
	});

	cout << "work" << endl;
}
```

```cpp
{
	lock_guard<mutex> lock(m);
	ready = true;
}

cv.notify_one();
```

## 为什么 wait 要传 predicate？ {#source-130}

条件变量允许虚假唤醒，通知到达时条件也可能已被另一线程改变。wait(lock, predicate) 等效于在条件为假时反复等待，不能把“收到通知”当作业务条件已经满足。谓词读取的共享状态仍需受同步保护。

```cpp
cv.wait(lock, [] {
	return ready;
});
```

## atomic {#source-131}

`std::atomic<T>` 为支持的类型提供原子读取、写入和读改写。counter++ 是单次原子读改写，但先检查 counter 再执行多个业务步骤不是一个整体原子事务。跨变量不变量可用互斥锁，或设计匹配的原子同步协议。

```cpp
atomic<int> counter(0);

counter++;
```

```cpp
if (counter > 0) {
	// other operations
}
```

## data race {#source-132}

不同线程对同一内存位置进行冲突访问、至少一个为非原子操作，且缺少所需的先行发生关系时会形成数据竞争。数据竞争导致未定义行为。使用互斥锁或正确的原子操作建立同步，而不能用运行时“看起来没同时发生”代替规则。

## volatile {#source-138}

volatile 限定对象的访问具有实现所定义的可观察要求，常用于硬件寄存器等底层接口。它不提供原子性，也不建立线程之间的同步关系。普通共享内存并发访问应使用 atomic 或 mutex，而不能用 volatile 替代。

```cpp
volatile int flag;
```
