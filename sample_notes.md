# Operating Systems & Concurrency Notes

## 1. Processes vs Threads
- **Process**: An executing program instance with its own isolated virtual address space, file descriptors, and security context.
- **Thread**: Smallest unit of CPU execution within a process. Threads in the same process share code, data, and open files.
- Switching between processes incurs higher overhead than context switching between threads within the same address space.

## 2. Race Conditions & Critical Sections
- **Critical Section**: A code segment accessing shared mutable state.
- **Mutual Exclusion**: Ensures only one thread executes a critical section at any moment.
- **Mutex**: A synchronization lock with ownership semantics.
- **Semaphore**: A synchronization primitive maintaining an integer counter.
