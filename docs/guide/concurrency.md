# 线程、同步与原子操作

## 概括要点

- std::thread 启动线程；join 等待完成，detach 使其独立运行，必须另行保证被访问对象的生命周期。
- mutex 保护临界区；lock_guard 以 RAII 管理锁，unique_lock 支持更灵活的锁操作和条件变量等待。
- condition_variable 的等待需要谓词，唤醒后重新检查条件以应对虚假唤醒；共享条件也要同步访问。
- atomic 保证特定原子操作，但多个操作组成的业务逻辑不自动成为不可分割的事务。
- 未同步的冲突访问会形成数据竞争并导致未定义行为；volatile 不提供线程同步。

## std::thread 线程 {#source-124}

C++11 第一次把线程正式放进标准库。

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

```cpp
t.join();
```

当前线程等待 t 结束。

```cpp
t.detach();
```

线程独立运行。

detach 很容易出现生命周期问题，所以实际代码需要非常谨慎。


销毁仍处于 joinable 状态的 std::thread 会调用 std::terminate，因此必须妥善安排 join 或 detach。

## mutex {#source-126}

```cpp
mutex m;

void func() {
	m.lock();

	// critical section

	m.unlock();
}
```

问题：

如果中途抛异常：

```cpp
m.lock();

throw runtime_error("error");

m.unlock();
```

锁不会释放。

所以应该使用 RAII。


## lock_guard {#source-127}

```cpp
mutex m;

void func() {
	lock_guard<mutex> lock(m);

	// critical section
}
```

离开作用域自动：

```cpp
unlock()
```

这是 RAII 在并发中的典型应用。


## unique_lock {#source-128}

```cpp
unique_lock<mutex> lock(m);
```

相比 lock_guard 更灵活：

```text
可以手动 lock
可以 unlock
可以延迟加锁
可以与 condition_variable 配合
```

代价也稍复杂一些。


## condition_variable {#source-129}

典型生产者消费者：

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

另一线程：

```cpp
{
	lock_guard<mutex> lock(m);
	ready = true;
}

cv.notify_one();
```

wait 时会：

```text
释放 mutex
进入等待
被唤醒
重新取得 mutex
检查条件
```


## 为什么 wait 要传 predicate？ {#source-130}

```cpp
cv.wait(lock, [] {
	return ready;
});
```

因为存在：

```text
spurious wakeup
虚假唤醒
```

线程被唤醒并不必然意味着条件已经成立。

所以要重新检查：

```cpp
ready
```


## atomic {#source-131}

```cpp
atomic<int> counter(0);

counter++;
```

对于简单原子变量，可避免数据竞争。

注意：

> atomic 不等于“一段复杂代码整体线程安全”。

例如：

```cpp
if (counter > 0) {
	// other operations
}
```

多个操作组合起来仍可能存在竞态。


## data race {#source-132}

两个线程：

```text
不同线程对同一内存位置有冲突访问，至少一个为非原子访问
至少一个执行写操作
缺少正确同步
```

形成 data race。

C++ 内存模型下 data race 导致：

```text
undefined behavior
```

这是非常重要的并发八股。


## volatile {#source-138}

```cpp
volatile int flag;
```

主要告诉编译器：

> 对该对象的访问可能受到编译器无法预测的外部因素影响，不要把相关访问随意优化掉。

常见于：

```text
内存映射硬件寄存器
底层嵌入式代码
```

极重要：

> `volatile` 不能用于普通 C++ 多线程同步。

多线程应使用：

```text
atomic
mutex
```
