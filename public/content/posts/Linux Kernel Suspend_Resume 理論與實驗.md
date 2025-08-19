# 1. 理論

## 1.1 System Sleep States

Linux 核心提供了四種系統睡眠狀態，其中也包含了「休眠 (hibernation)」。本文將逐一介紹這些狀態：

### 1.1.1 Suspend-to-Idle

- 這是一種純由軟體實現的輕量級系統休眠模式，也被稱為 S2I 或 S2Idle。相較於「執行期閒置 (runtime idle)」，S2Idle 透過凍結使用者空間 (userspace) 來達成更佳的節能效果。具體而言，系統會暫停計時功能 (timekeeping)、將所有 I/O 裝置切換至低功耗狀態，從而讓處理器能長時間停留在最深的閒置狀態。
- 系統透過「帶內中斷 (in-band interrupt)」從此狀態喚醒。因此，理論上任何能在工作狀態下發出中斷訊號的裝置，都能被設定為 S2Idle 的喚醒來源。
- 此狀態適用於不支援「待命 (Standby)」或「內存暫停 (Suspend-to-RAM)」的平台。
- 總結來說，S2Idle 的喚醒速度最快，但節能效果也最有限。

### 1.1.2 Standby

- 此狀態提供中等程度的節能效果，且能迅速恢復至工作狀態。由於運行狀態不會遺失，系統可以從休眠前的中斷點繼續執行。
- 除了執行與 S2Idle 相同的操作（凍結使用者空間、暫停計時功能、將 I/O 裝置設為低功耗）外，進入此狀態時，未使用的 CPU 核心會被離線，所有低階系統功能也會被暫停。因此，相較於 S2Idle，Standby 模式更為省電，但喚醒延遲也相對較長。
- 能夠支援此模式的裝置種類比 S2Idle 來得少。

### 1.1.3 Suspend-to-RAM

- 此狀態能提供優異的節能效果，因為除了記憶體之外，系統內所有元件都會進入低功耗狀態。唯一的例外是記憶體，它會進入「自我刷新模式 (self-refresh mode)」以保存其內容。所有在「待命 (Standby)」模式下執行的步驟，在此模式中也會被執行。
- 在基於 ACPI 的系統上，進入此模式的最後一步，是由核心將系統控制權移交給平台韌體（如 BIOS）。接著，韌體會關閉那些不受核心直接控制的低階裝置電源。透過上述步驟，裝置與 CPU 的完整狀態便得以儲存並保留在記憶體中。
- 在基於 ACPI 的系統中，喚醒過程僅需韌體中一小段「啟動程式碼 (boot-strapping code)」即可完成。因此，支援此模式的硬體要求更高，相容的裝置種類也比 S2Idle 和 Standby 更少。

### 1.1.4 休眠 (Hibernation)

此狀態（也稱為「硬碟暫停」或 STD）能提供最大程度的節能效果，即使在平台不具備低階系統休眠支援的情況下也能使用。然而，它需要在底層 CPU 架構中，預先存在一段用於恢復系統的低階程式碼。休眠模式與前述幾種系統暫停的變體有著顯著不同。它需要經過三個系統狀態變更才能進入休眠，並需要兩個狀態變更才能恢復。

過程如下：

1. 首先，當休眠被觸發時，核心會停止所有系統活動，並建立一個準備寫入「持久性儲存裝置 (persistent storage)」的記憶體快取映像檔。接著，系統會進入一個可以儲存快照的狀態，在映像檔被寫出後，系統最終會進入目標低功耗狀態。在此狀態下，包含記憶體在內的幾乎所有硬體元件都會被斷電，只保留一小部分喚醒裝置的電力。
2. 一旦快取映像檔寫入完成，系統可以選擇進入一個特殊的低功耗狀態（如 ACPI S4），或者直接完全關機。完全關機意味著最低的電力消耗，並讓此機制適用於任何系統。然而，進入特殊的低功G功耗狀態能提供額外的喚醒方式（例如，按下鍵盤或掀開筆記型電腦的上蓋）。
3. 喚醒後，控制權會移交給平台韌體，韌體會執行「開機載入程式 (boot loader)」來啟動一個全新的核心實例（根據系統配置，控制權也可能直接移交給開機載入程式，但無論如何都會啟動一個全新的核心）。這個新的核心實例（稱為「恢復核心」, restore kernel），會到持久性儲存裝置中尋找休眠映像檔。如果找到，便將其載入記憶體。
4. 隨後，系統中的所有活動會再次停止，「恢復核心」會用映像檔的內容覆寫自己，然後跳轉到儲存在映像檔中原始核心（稱為「映像檔核心」, image kernel）裡的一個特殊「跳板區域 (trampoline area)」。這一步驟正是需要特定CPU架構低階程式碼的地方。最後，由「映像檔核心」將系統恢復到休眠前的狀態，並允許使用者空間的程式再次運行。

當核心配置選項 `CONFIG_HIBERNATION` 被設定時，系統即支援休眠功能。然而，此選項必須在對應的 CPU 架構已包含系統恢復所需的低階程式碼時，才能被啟用。

## 1.2 System Suspend Code Flows


### 1.2.1 `suspend-to-idle` 的暫停執行流程

![suspend-to-idle (2)](https://hackmd.io/_uploads/HknHuVzvxg.png)


為了將系統從工作狀態轉換到 `suspend-to-idle` 睡眠狀態，系統會執行以下步驟：

1. **調用全系統的暫停通知回呼 (suspend notifiers)**
    - 核心的各個子系統可以註冊回呼函式，這些函式會在系統即將進入暫停狀態以及從暫停狀態恢復完成後被調用。
    - 這使得它們能夠為系統狀態的變更做準備，並在返回工作狀態後進行清理工作。
2. **凍結任務 (Freezing tasks)**
    - 凍結任務的主要目的，是為了避免使用者空間的程式透過直接暴露的 [Memory-mapped I/O (MMIO)](https://en.wikipedia.org/wiki/Memory-mapped_I/O_and_port-mapped_I/O) 區域或 [I/O 暫存器](https://en.wikipedia.org/wiki/Hardware_register)，在無人監管下存取硬體；同時也防止在下個轉換步驟進行中時，使用者空間的程式再次進入核心（這可能引發各種問題）。
    - 所有使用者空間的任務都會被攔截，如同收到信號一般，並被置於「不可中斷睡眠 (uninterruptible sleep)」狀態，直到後續的系統恢復流程結束。
    - 因特定原因而選擇在系統暫停期間被凍結的核心執行緒 (kernel threads) 會隨後被凍結，但它們不會被攔截。相反地，它們被設計為能定期檢查自身是否需要被凍結，並在需要時自行進入不可中斷睡眠狀態。【請注意：核心執行緒可以使用鎖定機制以及核心空間中其他的並行控制方法，來與系統的暫停和恢復進行同步，這種方式遠比凍結任務來得更精確，因此不建議核心執行緒使用凍結的方式。】
3. **暫停裝置並重新設定 [IRQ](https://en.wikipedia.org/wiki/Interrupt_request)**
    - 裝置的暫停過程分為四個階段，分別是 `prepare`（準備）、`suspend`（暫停）、`late suspend`（延後暫停）和 `noirq suspend`（無中斷暫停）。（關於各階段的具體內容，請參考《裝置電源管理基礎》）。
    - 每個裝置都會經歷這四個階段，但通常在物理層面上只會在其中不超過兩個階段被存取。
    - 在 `late suspend` 階段，每個裝置的「執行期電源管理 (Runtime PM)」 API 會被停用；在進入 `noirq suspend` 階段前，高階的「動作型 (action)」中斷處理常式會被禁止調用。
    - 此後，中斷信號雖仍會被處理，但系統僅會向中斷控制器發出確認信號，而不會執行任何在工作狀態下會被觸發的、針對特定裝置的動作（這些動作會被推遲到後續的系統恢復流程中執行，如下文所述）。
    - 與系統喚醒裝置相關的 IRQ 會被「布署 (armed)」，以便當其中之一發出事件信號時，能啟動系統的恢復流程。
4. **凍結排程器時脈 (scheduler tick) 並暫停計時功能 (timekeeping)**
    - 當所有裝置都已暫停後，CPU 會進入閒置循環，並被置於可用的最深度閒置狀態。在此過程中，每個 CPU 都會「凍結」自身的排程器時脈，以確保與該時脈相關的計時器事件在 CPU 被其他中斷源喚醒前不會發生。
    - 最後一個進入閒置狀態的 CPU 同時會停止系統的計時功能，這將（連同其他作用）阻止高精度計時器觸發事件，直到第一個被喚醒的 CPU 重新啟動計時功能為止。這使得所有 CPU 能一次性地在深度閒置狀態下停留相對較長的時間。
    - 從此刻起，CPU 只能被非計時器的硬體中斷喚醒。當中斷發生時，CPU 會返回閒置狀態，除非喚醒它的中斷來自一個已被布署用於系統喚醒的 IRQ，在這種情況下，系統恢復流程便會啟動。

### 1.2.2 `suspend-to-idle` 的恢復執行流程

為了將系統從 `suspend-to-idle` 睡眠狀態轉換回工作狀態，系統會執行以下步驟：

1. **恢復計時功能並解凍排程器時脈**
    - 當其中一個 CPU 被（非計時器的硬體中斷）喚醒時，它會離開在暫停流程最後一步進入的閒置狀態，重新啟動計時功能（除非已被其他更早喚醒的 CPU 啟動），並且該 CPU 上的排程器時脈會被解凍。
    - 如果喚醒該 CPU 的中斷是已被布署用於系統喚醒的，則系統恢復流程開始。
2. **恢復裝置並還原 IRQ 的工作狀態設定**
    - 裝置的恢復過程分為四個階段，分別是 `noirq resume`（無中斷恢復）、`early resume`（早期恢復）、`resume`（恢復）和 `complete`（完成）。（關於各階段的具體內容，請參考《裝置電源管理基礎》）。
    - 每個裝置都會經歷這四個階段，但通常在物理層面上只會在其中不超過兩個階段被存取。
    - 在 `noirq resume` 階段後，IRQ 的工作狀態設定會被還原；在 `early resume` 階段，對於所有支援 Runtime PM 的裝置驅動程式，其 Runtime PM API 會被重新啟用。
3. **解凍任務 (Thawing tasks)**
    - 在先前暫停流程步驟 2 中被凍結的任務會被「解凍」，這意味著它們會從當時進入的不可中斷睡眠狀態中被喚醒，並且使用者空間的任務被允許退出核心。
4. **調用全系統的恢復通知回呼 (resume notifiers)**
    - 此步驟與暫停流程的步驟 1 相對應，調用的是同一組回呼函式，但會傳遞一個不同的「通知類型」參數值給它們。

### 1.2.3 平台相依 (Platform-dependent) 的暫停執行流程

為了將系統從工作狀態轉換到平台相依的暫停狀態，系統會執行以下步驟：

1. **調用全系統的暫停通知回呼**
    - 此步驟與上述 `suspend-to-idle` 暫停流程的步驟 1 相同。
2. **凍結任務**
    - 此步驟與上述 `suspend-to-idle` 暫停流程的步驟 2 相同。
3. **暫停裝置並重新設定 IRQ**
    - 此步驟與上述 `suspend-to-idle` 暫停流程的步驟 3 相對應，但為系統喚醒而布署 IRQ 的操作通常對平台沒有任何影響。
    - 有些平台，當其內部所有 CPU 都處於足夠深的閒置狀態，且所有 I/O 裝置都已置於低功耗狀態時，其自身也能進入一個非常深的低功耗狀態。在這些平台上，`suspend-to-idle` 機制可以非常有效地降低系統功耗。
    - 然而，在其他平台上，要達到同等的功耗降低效果，則需要以平台特定的方式（在平台驅動程式提供的掛鉤 (hooks) 中實現）來關閉如中斷控制器等低階元件。
    - 這通常會阻止「帶內 (in-band)」硬體中斷喚醒系統，系統喚醒必須透過一種特殊的、平台相依的方式來完成。因此，系統喚醒源的設定通常在系統喚醒裝置被暫停時就已開始，並在稍後由平台暫停掛鉤最終完成。
4. **停用非啟動 CPU (non-boot CPUs)**
    - 在某些平台上，前述的暫停掛鉤必須在單一 CPU 的系統配置下運行（特別是，硬體不能被任何與平台暫停掛鉤並行運行的程式碼存取，因為這些掛鉤可能、且經常會陷入 (trap into) 平台韌體以完成暫停轉換）。
    - 為此，系統會使用「CPU 熱插拔 (CPU hotplug)」框架，將除了一個 CPU（即啟動 CPU）之外的所有 CPU 離線（通常，被離線的 CPU 會進入深度閒置狀態）。
    - 這意味著所有任務都會從這些 CPU 上被遷移走，所有 IRQ 也會被重新路由到唯一保持在線的那個 CPU 上。
5. **暫停核心系統元件**
    - 此步驟為核心系統元件接下來可能發生的斷電做準備，並暫停計時功能。
6. **平台特定的電源移除**
    - 此步驟預期會移除系統中所有元件的電源，除了記憶體控制器和 RAM（為了保存其內容）以及一些指定的系統喚醒裝置。
    - 在許多情況下，控制權會被移交給平台韌體，由韌體根據需要完成最終的暫停轉換。

### 1.2.4 平台相依的恢復執行流程

為了將系統從平台相依的暫停狀態轉換回工作狀態，系統會執行以下步驟：

1. **平台特定的系統喚醒**
    - 平台被某個指定的系統喚醒裝置發出的信號喚醒（該信號不一定是帶內硬體中斷），控制權被交還給核心（在核心重獲控制權之前，平台韌體可能需要還原平台的工作組態）。
2. **恢復核心系統元件**
    - 核心系統元件在暫停期間的設定被還原，計時功能被恢復。
3. **重新啟用非啟動 CPU**
    - 在先前暫停流程步驟 4 中被停用的 CPU 會被重新上線，它們在暫停期間的設定也會被還原。
4. **恢復裝置並還原 IRQ 的工作狀態設定**
    - 此步驟與上述 `suspend-to-idle` 恢復流程的步驟 2 相同。
5. **解凍任務**
    - 此步驟與上述 `suspend-to-idle` 恢復流程的步驟 3 相同。
6. **調用全系統的恢復通知回呼**
    - 此步驟與上述 `suspend-to-idle` 恢復流程的步驟 4 相同。

# 2. 實驗
## 2.1 開發環境
```shell
$ gcc --version
gcc (Ubuntu 14.2.0-19ubuntu2) 14.2.0
Copyright (C) 2024 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```


```shell
$ lscpu
Architecture:             x86_64
  CPU op-mode(s):         32-bit, 64-bit
  Address sizes:          39 bits physical, 48 bits virtual
  Byte Order:             Little Endian
CPU(s):                   20
  On-line CPU(s) list:    0-19
Vendor ID:                GenuineIntel
  Model name:             12th Gen Intel(R) Core(TM) i7-12700H
    CPU family:           6
    Model:                154
    Thread(s) per core:   2
    Core(s) per socket:   14
    Socket(s):            1
    Stepping:             3
    CPU(s) scaling MHz:   19%
    CPU max MHz:          4700.0000
    CPU min MHz:          400.0000
    BogoMIPS:             5376.00
    Flags:                fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge m
                          ca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 s
                          s ht tm pbe syscall nx pdpe1gb rdtscp lm constant_tsc 
                          art arch_perfmon pebs bts rep_good nopl xtopology nons
                          top_tsc cpuid aperfmperf tsc_known_freq pni pclmulqdq 
                          dtes64 monitor ds_cpl vmx smx est tm2 ssse3 sdbg fma c
                          x16 xtpr pdcm pcid sse4_1 sse4_2 x2apic movbe popcnt t
                          sc_deadline_timer aes xsave avx f16c rdrand lahf_lm ab
                          m 3dnowprefetch cpuid_fault epb ssbd ibrs ibpb stibp i
                          brs_enhanced tpr_shadow flexpriority ept vpid ept_ad f
                          sgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid rd
                          seed adx smap clflushopt clwb intel_pt sha_ni xsaveopt
                           xsavec xgetbv1 xsaves split_lock_detect user_shstk av
                          x_vnni dtherm ida arat pln pts hwp hwp_notify hwp_act_
                          window hwp_epp hwp_pkg_req hfi vnmi umip pku ospke wai
                          tpkg gfni vaes vpclmulqdq rdpid movdiri movdir64b fsrm
                           md_clear serialize arch_lbr ibt flush_l1d arch_capabi
                          lities
Virtualization features:  
  Virtualization:         VT-x
Caches (sum of all):      
  L1d:                    544 KiB (14 instances)
  L1i:                    704 KiB (14 instances)
  L2:                     11.5 MiB (8 instances)
  L3:                     24 MiB (1 instance)
NUMA:                     
  NUMA node(s):           1
  NUMA node0 CPU(s):      0-19
Vulnerabilities:          
  Gather data sampling:   Not affected
  Ghostwrite:             Not affected
  Itlb multihit:          Not affected
  L1tf:                   Not affected
  Mds:                    Not affected
  Meltdown:               Not affected
  Mmio stale data:        Not affected
  Reg file data sampling: Mitigation; Clear Register File
  Retbleed:               Not affected
  Spec rstack overflow:   Not affected
  Spec store bypass:      Mitigation; Speculative Store Bypass disabled via prct
                          l
  Spectre v1:             Mitigation; usercopy/swapgs barriers and __user pointe
                          r sanitization
  Spectre v2:             Mitigation; Enhanced / Automatic IBRS; IBPB conditiona
                          l; PBRSB-eIBRS SW sequence; BHI BHI_DIS_S
  Srbds:                  Not affected
  Tsx async abort:        Not affected

```

## 2.2 工具介紹

### pm-graph
它是一套針對 Linux 作業系統的電源管理（Power Management）測試與分析視覺化工具，包含 suspend/resume 與系統開機流程，主要有兩個工具：```sleepgraph``` 與 ```bootgraph```。它會根據 ```ftrace``` 記錄或 ```dmesg log```，製作 suspend/resume 的時間軸圖（Timeline）。
 


### Perfetto
它是一個針對 Client-side (客戶端) 或嵌入式系統的 Tracing （追蹤）和 Profiling（效能分析）， 由 Google 開發的系統效能分析與視覺化開源工具。


## 2.3 安裝與設定
python 安裝步驟

```shell
sudo apt-get install python3 python3-requests linux-tools-common
```
安裝步驟

```shell
git clone http://github.com/intel/pm-graph.git
cd pm-graph
sudo make install
```

Kernel 編譯選項（所有核心都需要）：
```shell
CONFIG_DEVMEM=y
CONFIG_PM_DEBUG=y
CONFIG_PM_SLEEP_DEBUG=y
CONFIG_FTRACE=y
CONFIG_FUNCTION_TRACER=y
CONFIG_FUNCTION_GRAPH_TRACER=y
CONFIG_KPROBES=y
CONFIG_KPROBES_ON_FTRACE=y
```



## 2.4 使用方式

要了解 ```sleepgraph``` 的使用方式，可以在終端機輸入以下指令：

```shell
sudo sleepgraph -h
```

程式就會輸出相關的使用指令。

```shell
SleepGraph v5.13
Usage: sudo sleepgraph <options> <commands>

Description:
  This tool is designed to assist kernel and OS developers in optimizing
  their linux stack's suspend/resume time. Using a kernel image built
  with a few extra options enabled, the tool will execute a suspend and
  capture dmesg and ftrace data until resume is complete. This data is
  transformed into a device timeline and an optional callgraph to give
  a detailed view of which devices/subsystems are taking the most
  time in suspend/resume.

  If no specific command is given, the default behavior is to initiate
  a suspend/resume and capture the dmesg/ftrace output as an html timeline.

  Generates output files in subdirectory: suspend-yymmdd-HHMMSS
   HTML output:                    <hostname>_<mode>.html
   raw dmesg output:               <hostname>_<mode>_dmesg.txt
   raw ftrace output:              <hostname>_<mode>_ftrace.txt

Options:
   -h           Print this help text
   -v           Print the current tool version
   -config fn   Pull arguments and config options from file fn
   -verbose     Print extra information during execution and analysis
   -m mode      Mode to initiate for suspend (default: mem)
   -o name      Overrides the output subdirectory name when running a new test
                default: suspend-{date}-{time}
   -rtcwake t   Wakeup t seconds after suspend, set t to "off" to disable (default: 15)
   -addlogs     Add the dmesg and ftrace logs to the html output
   -noturbostat Dont use turbostat in freeze mode (default: disabled)
   -srgap       Add a visible gap in the timeline between sus/res (default: disabled)
   -skiphtml    Run the test and capture the trace logs, but skip the timeline (default: disabled)
   -result fn   Export a results table to a text file for parsing.
   -wifi        If a wifi connection is available, check that it reconnects after resume.
   -wifitrace   Trace kernel execution through wifi reconnect.
   -netfix      Use netfix to reset the network in the event it fails to resume.
   -debugtiming Add timestamp to each printed line
  [testprep]
   -sync        Sync the filesystems before starting the test
   -rs on/off   Enable/disable runtime suspend for all devices, restore all after test
   -display m   Change the display mode to m for the test (on/off/standby/suspend)
  [advanced]
   -gzip        Gzip the trace and dmesg logs to save space
   -cmd {s}     Run the timeline over a custom command, e.g. "sync -d"
   -proc        Add usermode process info into the timeline (default: disabled)
   -dev         Add kernel function calls and threads to the timeline (default: disabled)
   -x2          Run two suspend/resumes back to back (default: disabled)
   -x2delay t   Include t ms delay between multiple test runs (default: 0 ms)
   -predelay t  Include t ms delay before 1st suspend (default: 0 ms)
   -postdelay t Include t ms delay after last resume (default: 0 ms)
   -mindev ms   Discard all device blocks shorter than ms milliseconds (e.g. 0.001 for us)
   -multi n d   Execute <n> consecutive tests at <d> seconds intervals. If <n> is followed
                by a "d", "h", or "m" execute for <n> days, hours, or mins instead.
                The outputs will be created in a new subdirectory with a summary page.
   -maxfail n   Abort a -multi run after n consecutive fails (default is 0 = never abort)
  [debug]
   -f           Use ftrace to create device callgraphs (default: disabled)
   -ftop        Use ftrace on the top level call: "pm_suspend" (default: disabled)
   -maxdepth N  limit the callgraph data to N call levels (default: 0=all)
   -expandcg    pre-expand the callgraph data in the html output (default: disabled)
   -fadd file   Add functions to be graphed in the timeline from a list in a text file
   -filter "d1,d2,..." Filter out all but this comma-delimited list of device names
   -mincg  ms   Discard all callgraphs shorter than ms milliseconds (e.g. 0.001 for us)
   -cgphase P   Only show callgraph data for phase P (e.g. suspend_late)
   -cgtest N    Only show callgraph data for test N (e.g. 0 or 1 in an x2 run)
   -timeprec N  Number of significant digits in timestamps (0:S, [3:ms], 6:us)
   -cgfilter S  Filter the callgraph output in the timeline
   -cgskip file Callgraph functions to skip, off to disable (default: cgskip.txt)
   -bufsize N   Set trace buffer size to N kilo-bytes (default: all of free memory)
   -devdump     Print out all the raw device data for each phase
   -cgdump      Print out all the raw callgraph data

Other commands:
   -modes       List available suspend modes
   -status      Test to see if the system is enabled to run this tool
   -fpdt        Print out the contents of the ACPI Firmware Performance Data Table
   -wificheck   Print out wifi connection info
   -x<mode>     Test xset by toggling the given mode (on/off/standby/suspend)
   -sysinfo     Print out system info extracted from BIOS
   -devinfo     Print out the pm settings of all devices which support runtime suspend
   -cmdinfo     Print out all the platform info collected before and after suspend/resume
   -flist       Print the list of functions currently being captured in ftrace
   -flistall    Print all functions capable of being captured in ftrace
   -summary dir Create a summary of tests in this dir [-genhtml builds missing html]
  [redo]
   -ftrace ftracefile  Create HTML output using ftrace input (used with -dmesg)
   -dmesg dmesgfile    Create HTML output using dmesg (used with -ftrace)
```

## 2.5 第一次測試 pm-graph
在根目錄底下創建一個新目錄 sleep_analysis，並移動路徑到 sleep_analysis，先測試系統狀態 `Suspend-to-Idle`，執行以下指令：
```shell
sudo sleepgraph -m mem-s2idle
```



結果如下：
```shell
Checking this system (AI)...
    have root access: YES
    is sysfs mounted: YES
    is "mem-s2idle" a valid power mode: YES
    is ftrace supported: YES
    are kprobes supported: YES
    timeline data source: FTRACE (all trace events found)
    is rtcwake supported: YES
    optional commands this tool may use for info:
        turbostat: FOUND
        mcelog: MISSING
        lspci: FOUND
        lsusb: FOUND
        netfix: FOUND
os-version              : Ubuntu 25.04
baseboard-manufacturer  : ASUSTeK COMPUTER INC.
baseboard-product-name  : FX707ZU4
baseboard-serial-number : C4S33M200RR
baseboard-version       : 1.0
bios-release-date       : 10/14/2024
bios-vendor             : American Megatrends International, LLC.
bios-version            : FX707ZU4.329
chassis-manufacturer    : ASUSTeK COMPUTER INC.
chassis-serial-number   : R3NRKD022289137
chassis-version         : 1.0
processor-version       : 12th Gen Intel(R) Core(TM) i7-12700H
system-manufacturer     : ASUSTeK COMPUTER INC.
system-product-name     : ASUS TUF Gaming F17 FX707ZU4_FX707ZU4
system-serial-number    : R3NRKD022289137
system-version          : 1.0
cpucount                : 20
memtotal                : 31955264 kB
memfree                 : 26509904 kB
INITIALIZING FTRACE
INITIALIZING KPROBES
SUSPEND START
will issue an rtcwake in 15 seconds
RESUME COMPLETE
CAPTURING DMESG
CAPTURING TRACE
PROCESSING: suspend-250726-143745/AI_freeze.html
DONE:       suspend-250726-143745/AI_freeze.html


```

會在執行的目錄底下產生一個目錄，裡面是使用 ```sleepgraph``` 做測試的報告。
```shell
lab@AI:~/sleep_analysis/suspend-250726-143745$ ll
total 1388
drwxr-xr-x 2 lab lab   4096 Jul 26 14:38 ./
drwxrwxr-x 3 lab lab   4096 Jul 26 14:37 ../
-rw-r--r-- 1 lab lab  23832 Jul 26 14:38 AI_freeze_dmesg.txt
-rw-r--r-- 1 lab lab 796599 Jul 26 14:38 AI_freeze_ftrace.txt
-rw-r--r-- 1 lab lab 589162 Jul 26 14:38 AI_freeze.html
```
用瀏覽器打開 html 報告後，會出現下面的裝置時間軸圖。
![image](https://hackmd.io/_uploads/Bk0t_lfwxx.png)

可以看到裝置 nvidia @ 0000:01:00.0 {nvidia} 的 Suspend 時間最久：
- Suspend 耗時：372.625 ms
- Resume 耗時：721.259 ms

![image](https://hackmd.io/_uploads/HkaetxzPge.png)

另外，裝置 pcieport @ 0000:00:01.0 {pcieport} 的 Resume noirq 時間則最久：

- 耗時：1116.212 ms



## 2.6 第一次測試 Perfetto
按照[Perfetto 官網](https://perfetto.dev/docs/getting-started/system-tracing)的步驟，執行以下指令從 GitHub 下載 ```tracebox``` 二進位檔：
```shell
curl -LO https://get.perfetto.dev/tracebox
chmod +x tracebox
```



接下來，我們試著捕捉一個 Trace （追蹤），首先新建一個 .cfg 設定檔， 並命名為 suspend_resume。
```shell
buffers {
  size_kb: 100024
  fill_policy: RING_BUFFER
}

data_sources {
  config {
    name: "linux.ftrace"
    target_buffer: 0
    ftrace_config {
        ftrace_events: "sched_switch"
        ftrace_events: "sched_waking"
        ftrace_events: "sched_wakeup_new"

        ftrace_events: "sched_process_exec"
        ftrace_events: "sched_process_exit"
        ftrace_events: "sched_process_fork"
        ftrace_events: "sched_process_free"
        ftrace_events: "sched_process_hang"
        ftrace_events: "sched_process_wait"

        ftrace_events: "irq_handler_entry"
        ftrace_events: "irq_handler_exit"
        ftrace_events: "suspend_resume"
    }
  }
}

duration_ms: 30000
```

並執行以下指令：
```shell
sudo ./tracebox -o trace_file.perfetto-trace --txt -c suspend_resume.cfg
```

接著移動路徑到 sleep_analysis，先測試系統狀態 `Suspend-to-Idle`，執行以下指令：
```shell
sudo sleepgraph -m mem-s2idle
```

到瀏覽器上的 [ui.perfetto.dev](https://ui.perfetto.dev/) 並打看 trace_file.perfetto-trace 檔案，結果如下。
![image](https://hackmd.io/_uploads/ryLwEWGPlg.png)

因為測量範圍過大，因此無法精確知道更清楚的細節。但是進一步放大，可以發現，在 `suspend_enter` 階段耗時 1,915 ms，是整個流程裡面耗時最久的。

![image](https://hackmd.io/_uploads/r1HbSZzwle.png)


# 3. LKML Patch
本次要探討的 Patch 都和系統休眠有關，由電源管理模組的維護者 [Rafael J. Wysocki](https://www.linkedin.com/in/rafael-wysocki-092a4b90/?originalSubdomain=pl) 提交：

1. [PM: sleep: Resume children after resuming the parent](https://github.com/torvalds/linux/commit/0cbef962ce1ff344ecfe32d1c874978f1f7d410a)，2025.4.22
2. [PM: sleep: Suspend async parents after suspending children](https://github.com/torvalds/linux/commit/aa7a9275ab814705b60ba8274277d91da6ab6122)，2025.4.22
3. [PM: sleep: Make suspend of devices more asynchronous](https://github.com/torvalds/linux/commit/443046d1ad66607f324c604b9fbdf11266fa8aad)，2025.4.22
4. [PM: sleep: Make async resume handle consumers like children](https://github.com/torvalds/linux/commit/ed18738fff025df2a424d3b21e895992e6cb230a)，2025.7.3
5. [PM: sleep: Make async suspend handle suppliers like parents](https://github.com/torvalds/linux/commit/06799631d52261162d356623d14381d9f30223dc)，2025.7.3


## 3.1 Resume children after resuming the parent

裝置的休眠與喚醒處理（特別是喚醒），會產生不必要的額外開銷。這是因為有些裝置在等待其他裝置完成處理時，就已經開始了新的非同步工作項目。

為了在喚醒路徑中減少這個問題，維護者觀察到：在喚醒父裝置後，才開始非同步喚醒其子裝置，很可能比提前開始喚醒產生**更少**的排程和記憶體管理方面的「雜訊」，同時也**不會**大幅增加喚醒所需的時間。

因此，程式碼被修改為：

在裝置喚醒的每個階段，當父裝置的處理完成後，才開始其子裝置的非同步喚醒。

只有在沒有父裝置的情況下，才會提前開始非同步喚醒。

在開始非同步喚醒某個裝置之前，會先檢查該裝置是否可以被非同步喚醒，以防它必須等待另一個已經在非同步喚醒中的裝置。

除了使裝置的非同步喚醒對運算資源相對較少的系統更友善之外，這項變更也是為休眠路徑中的類似變更奠定基礎。

在經過測試的系統上，這項改動本身並不會以可測量的方式影響整個系統的喚醒時間。

以下來閱讀與解析於 drivers/base/power/main.c 這次維護者所提交的程式碼。

![image](https://hackmd.io/_uploads/HyMCMIsweg.png)

在核心驅動程式電源管理模組中，引入了一個新的互斥鎖 `async_wip_mtx` 以防止存取非同步任務狀態時的競爭條件。同時，在 `__dpm_async` 函式開頭新增了一項前置條件檢查，該檢查會確認 `dev->power.work_in_progress` 旗標，以避免在同一裝置已有任務在執行時，重複排程多餘的電源管理操作，從而提升系統穩定性並防止不必要的工作。


![image](https://hackmd.io/_uploads/Sk5gXUsvgg.png)

新增 `dpm_async_fn` 作為一個執行緒安全 (Thread-Safe) 的封裝函式 (Wrapper)。它利用 `guard(mutex)` 巨集以 RAII 的風格自動管理互斥鎖 `async_wip_mtx`，確保在安全的情況下呼叫內部的核心邏輯 `__dpm_async`。

新增 `dpm_async_with_cleanup`，一個帶有錯誤清理機制的穩固封裝函式 (Robust Wrapper)。它不僅安全地呼叫 `__dpm_async`，更重要的是處理了失敗情境：如果任務排程失敗 (`__dpm_async` 回傳 `false`)，它會執行清理工作，將 `work_in_progress` 旗標重設為 `false`，以確保系統狀態的一致性，防止裝置卡在錯誤的狀態。

新增 `dpm_async_resume_children` 作為一個高階的協同運作函式 (High-Level Orchestrator)。它使用核心的 `device_for_each_child` 輔助函式來遍歷指定裝置的所有子裝置。其關鍵設計在於，它傳遞了我們剛才定義的穩固封裝函式 `dpm_async_with_cleanup` 作為回呼 (Callback)，從而確保對每一個子裝置的非同步喚醒操作都是安全且帶有錯誤清理機制的。


![image](https://hackmd.io/_uploads/BJVz7IoPgl.png)

在 `aynce_resume_noirq` 改成是優先處理「根裝置 (root devices)」，以便它們的子裝置可以盡快開始喚醒。本來的寫法是優先觸發 "非同步" 裝置的喚醒，現在則是優先開始處理 "非同步的根" 裝置。
其新增了一個輔助函式 `dpm_root_device` 來判斷根裝置。同時，引入了新的回呼函式    `async_resume_noirq`，用於實現一種級聯式 (cascading) 的喚醒機制：即父裝置完成處理後，立即觸發其所有子裝置的非同步喚醒流程，從而最大化系統資源利用率並縮短整體喚醒時間。

![image](https://hackmd.io/_uploads/r1ClI_ovgg.png)

在 `device_resume_early` 函式中新增了對 `dpm_async_resume_children` 的呼叫，從而建立了級聯喚醒機制。這項重構使得父裝置在完成自身處理後，能立即、並行地觸發其子裝置的喚醒流程，顯著提升了 `early resume` 階段的效率與並行度。

![image](https://hackmd.io/_uploads/B1A9XUsvee.png)

修改了核心的 `async_resume` 回呼函式，以實現級聯式 (cascading) 的並行喚醒策略。函式中新增了一個條件判斷，當確認處理的裝置是根裝置 (root device) 時，便會立即呼叫 `dpm_async_resume_children`，以 `async_resume` 自身作為新的回呼，從而遞迴地觸發其整個子樹的非同步喚醒流程。這個改動是實現『根裝置優先』優化策略的關鍵步驟，旨在最大化並行處理，縮短系統總體喚醒時間。


## 3.2 Suspend async parents after suspending children
為了與先前影響喚醒路徑的變更類似，此項變更旨在優化休眠路徑。

device_suspend() 函數被修改為：在處理完裝置本身後，才開始其父裝置的非同步休眠。

dpm_suspend() 函數被修改為：會優先處理「非同步」的葉子裝置（leaf devices，即沒有子裝置的裝置）。這樣一來，它們就不必等待它們不依賴的「同步」裝置。

這項改動的結果非常顯著：在維護者的辦公室測試的 Dell XPS13 9360 上，此項變更將裝置休眠的總時間減少了約 100 毫秒（超過 20%）。

以下來閱讀於 drivers/base/power/main.c 這次維護者所提交的程式碼。

![image](https://hackmd.io/_uploads/r1OQ9ujwex.png)

新增了一個輔助判斷函式 (predicate function) `dpm_leaf_device`，用於高效地判斷一個裝置是否為裝置樹中的葉節點 (leaf node)。該函式透過 `lockdep_assert_held()`` 來強制執行鎖定協議，確保呼叫者已持有 `dpm_list_mtx`。其核心邏輯使用 `device_find_any_child()`` 來快速檢查是否存在任何子裝置，而非遍歷全部，以提升效能。同時，它遵循了核心的引用計數 (reference counting) 機制，在找到子裝置後會呼叫 `put_device()` 來釋放其引用，防止資源洩漏。

![image](https://hackmd.io/_uploads/B15NqdsDge.png)

此函式 `dpm_async_suspend_parent` 的主要功能是將非同步暫停操作沿著裝置樹向上傳播 (propagate up)，為指定裝置的父裝置安排相同的暫停任務。其關鍵設計在於一個防禦性的前置條件檢查，用以預防在複雜的非同步情境下可能發生的 `use-after-free` 競爭條件。透過在存取父裝置前，先呼叫 `device_pm_initialized()`` 來驗證子裝置自身的狀態，該函式確保了即使在暫停期間發生並行的裝置移除事件，它也不會存取到已被釋放的父裝置記憶體，從而顯著提升了電源管理子系統的穩固性 (robustness)。

![image](https://hackmd.io/_uploads/SkjF5dsvgl.png)
![image](https://hackmd.io/_uploads/r17n5uswxl.png)


`dpm_suspend` 是系統範圍內裝置暫停流程的核心進入點。它採用了「葉節點優先 (leaf-first)」的核心策略來處理裝置間的依賴關係，透過反向遍歷裝置列表，並優先為所有葉節點啟動非同步暫停。隨後，主迴圈以混合模式處理剩餘裝置，對需要同步處理的裝置執行阻塞式呼叫，並跳過已在非同步流程中的裝置。整個流程的關鍵在於最後的 `async_synchronize_full()` 呼叫，它作為一個同步屏障，會等待所有非同步任務完成，以確保在函式返回前，所有裝置均已成功進入暫停狀態。這個設計有效地利用了非同步處理來最大化並行度，同時透過嚴格的順序和同步機制保證了系統狀態的穩定性。




## 3.3 Make suspend of devices more asynchronous
為了與先前所做的變更保持一致，這次將非同步休眠的優化應用到更細緻的階段。

device_suspend_late() 和 device_suspend_noirq() 這兩個函數被修改，使其在處理完裝置本身後，才開始其父裝置的非同步休眠。

dpm_suspend_late() 和 dpm_noirq_suspend_devices() 函數也做出相應調整，會優先處理「非同步」的葉子裝置（沒有子裝置的裝置）。這樣能讓它們不必等待不相關的裝置，從而避免不必要的延遲。

這項變更在某些系統上確實能測量到休眠總時間的縮短，但效果並不明顯。

## 3.4 Make async resume handle consumers like children
這則提交的目標是避免在裝置供應鏈中，不必要的非同步喚醒處理。避免為有供應商（suppliers）的裝置提前開始非同步喚醒。在喚醒裝置本身之後，立刻開始其「消費者」（consumers）的非同步喚醒處理。

**供應商與消費者：**

- 供應商 (Supplier)： 提供服務或資源給其他裝置的裝置，例如一個匯流排控制器（bus controller）是其上所有 USB 裝置的供應商。
- 消費者 (Consumer)： 依賴其他裝置提供服務或資源的裝置，例如一個 USB 隨身碟就是 USB 匯流排控制器的消費者。

**優化邏輯：**

- 舊方法： 可能會提前為消費者裝置啟動非同步喚醒，但此時其供應商可能還未喚醒，導致消費者必須等待，從而產生無謂的排程與開銷。
- 新方法： 只有在供應商（例如父裝置或服務提供者）被喚醒後，才開始喚醒其消費者（例如子裝置或服務依賴者）。這種順序與裝置的物理依賴關係更為一致，能夠減少不必要的等待和資源浪費，使整個喚醒流程更有效率。

以下來閱讀與解析於 drivers/base/power/main.c 這次維護者所提交的程式碼。

![image](https://hackmd.io/_uploads/Bk2EWR2Dge.png)

`dpm_async_resume_subordinate` 是一個高階的抽象封裝函式 (Abstraction Wrapper)，旨在統一處理並喚醒所有依賴於指定裝置的「下屬 (subordinate)」裝置。此函式擴展了傳統僅考慮父子階層的依賴模型，將其職責分為兩個關鍵部分：
1. 處理階層式子裝置：
首先，它呼叫 `dpm_async_resume_children`，處理裝置樹中傳統的父子依賴關係，確保所有直屬子裝置被加入非同步喚醒佇列。
2. 處理功能性消費者裝置：
接著，它遍歷該裝置的 `device_link` 消費者列表 (consumers)，為每一個處於活動狀態的消費者裝置安排非同步喚醒。這解決了非階層式的功能性依賴問題，確保了例如感測器（消費者）不會在其所需的電源控制器（供應商）準備就緒前被喚醒。

透過將這兩種不同類型的依賴關係封裝在一個語義清晰的函式中，`dpm_async_resume_subordinate` 顯著提升了電源管理子系統的穩固性 (robustness)。它能有效防止因喚醒順序錯亂而導致的競爭條件，並為上層呼叫者提供了一個更簡潔、更抽象的 API，提升了整體程式碼的可讀性與可維護性。

![image](https://hackmd.io/_uploads/H188Z0hwxx.png)

此修改透過強化 `dpm_root_device` 函式的邏輯，重新定義了電源管理中的「根裝置」。舊有的定義僅考慮裝置樹的階層關係，而新的定義則更加嚴謹，要求一個真正的「根裝置」必須同時滿足「無父裝置」與「無功能性供應商 (no suppliers)」 兩個條件。這一改動確保了只有完全沒有依賴的裝置才能作為喚醒流程的起點，從而使整個依賴圖 (dependency graph) 的處理順序更加準確與穩固。此外，為了保證執行緒安全地存取 `device_links` 列表，函式中新增了 `lockdep_assert_held()`，強制呼叫者必須持有指定的鎖，以此來強化整體的鎖定協議。


## 3.5 Make async suspend handle suppliers like parents
這則提交的目標是優化裝置供應鏈中的非同步休眠處理。避免為有消費者（consumers）的裝置提前開始非同步休眠。在休眠裝置本身之後，立刻開始其「供應商」（suppliers）的非同步休眠處理。

**優化順序：**

- 舊方法： 可能會提前休眠供應商，而此時消費者裝置可能還在使用供應商提供的服務。這會導致狀態不一致或錯誤。
- 新方法： 只有在消費者（例如子裝置）被休眠後，才開始休眠其供應商（例如父裝置）。這確保了服務的依賴關係被正確處理，避免了在休眠過程中因依賴性錯誤而產生的延遲或問題。


以下來閱讀與解析於 drivers/base/power/main.c 這次維護者所提交的程式碼。

![image](https://hackmd.io/_uploads/rkXyB02Pgg.png)

### 函式總體目標
此函式的主要目標是，在一個裝置 (dev) 自身完成暫停後，接續地、安全地觸發所有它所依賴的「上級」裝置的暫停流程。這裡的「上級」包含了階層上的父裝置和功能上的供應商裝置。

### 逐行程式碼解析

```clike
static void dpm_async_suspend_superior(struct device *dev, async_func_t func)
```


語法解析：定義一個名為 `dpm_async_suspend_superior` 的靜態函式 (`static` 表示此函式僅在此檔案內可見)，它不回傳任何值 (void)。它接收兩個參數：一個指向裝置結構的指標 `dev`，以及一個函式指標 `func` (代表要執行的非同步任務)。

功能目的：作為向上傳播暫停流程的進入點。

```clike
struct device_link *link;
int idx;
```

語法解析：宣告兩個區域變數。`link` 用於在稍後的迴圈中指向 `device_link` 結構；`idx` 用於儲存鎖定操作回傳的索引值。
功能目的：為後續的迴圈迭代和鎖定操作做準備。

```clike
if (!dpm_async_suspend_parent(dev, func))
    return;
```

語法解析：呼叫 `dpm_async_suspend_parent` 函式。
功能目的：這是處理向上依賴的第一步：處理階層上的父裝置。它會為 dev 的父裝置安排非同步暫停。

根據我們之前的分析，`dpm_async_suspend_parent` 函式應為 `void` 型別，所以 `if (!...)` 的判斷在邏輯上是不成立的，這很可能是開發中版本的程式碼筆誤。其真實意圖應為 `dpm_async_suspend_parent(dev, func);`，即無條件先處理父裝置。

```clike
idx = device_links_read_lock();
```

語法解析：呼叫 `device_links_read_lock()` 函式。
功能目的：獲取一個讀取鎖 (read lock)。因為 `device_link` 鏈接串列可能會被系統的其他部分同時修改，為了能安全地遍歷這個鏈接串列，必須先上鎖。這個鎖回傳一個整數 `idx` 作為「票根」，解鎖時需要用到。

```clike
list_for_each_entry_rcu(link, &dev->links.suppliers, c_node)
```

語法解析：這是一個 Linux 核心中常用的巨集，用來安全地遍歷一個 RCU (Read-Copy-Update) 保護的鏈結串列。
功能目的：遍歷 `dev` 的所有「供應商」。供應商是指那些 `dev` 在功能上所依賴的裝置。這是處理向上依賴的第二步。

```clike
if (READ_ONCE(link->status) != DL_STATE_DORMANT)
```

語法解析：檢查 `device_link` 的狀態。`READ_ONCE` 是一個記憶體屏障巨集，確保讀取的是最新的值，避免因編譯器優化導致的讀取錯誤。`DL_STATE_DORMANT` 代表該連結處於「休眠」或非活動狀態。
功能目的：確認這個功能性依賴是有效的。如果依賴連結是活動的，才需要處理它的供應商。

```clike
dpm_async_with_cleanup(link->supplier, func);
```

語法解析：如果上述 if 條件成立，則呼叫 `dpm_async_with_cleanup` 函式。
功能目的：為這個有效的供應商裝置 (link->supplier)，安排同一個非同步暫停任務 (func)。這是整個函式最終要執行的核心動作之一。

```clike
device_links_read_unlock(idx);
```

語法解析：呼叫 `device_links_read_unlock()` 函式，並傳入之前上鎖時得到的「票根」`idx`。
功能目的：釋放讀取鎖，讓其他需要修改 `device_link` 列表的程式可以繼續執行。上鎖和解鎖成對出現，是保證系統穩定的基本要求。


# 4. Merge LKML Patch and Measure Performance

## 4.1 簡介

以下來檢視這五個提交的每一個 Patch：
[[PATCH v3 0/5] PM: sleep: Improvements of async suspend and resume of devices](https://lore.kernel.org/linux-pm/10629535.nUPlyArG6x@rjwysocki.net/)
[[PATCH v3 1/5] PM: sleep: Resume children after resuming the parent](https://lore.kernel.org/linux-pm/22630663.EfDdHjke4D@rjwysocki.net/)
[[PATCH v3 2/5] PM: sleep: Suspend async parents after suspending children](https://lore.kernel.org/linux-pm/3541233.QJadu78ljV@rjwysocki.net/)
[[PATCH v3 3/5] PM: sleep: Make suspend of devices more asynchronous](https://lore.kernel.org/linux-pm/1924195.CQOukoFCf9@rjwysocki.net/)
[[PATCH v3 4/5] PM: sleep: Make async suspend handle suppliers like parents](https://lore.kernel.org/linux-pm/2651185.Lt9SDvczpP@rjwysocki.net/)
[[PATCH v3 5/5] PM: sleep: Make async resume handle consumers like children](https://lore.kernel.org/linux-pm/2229735.Mh6RI2rZIc@rjwysocki.net/)


在 [[PATCH v3 0/5] PM: sleep: Improvements of async suspend and resume of devices](https://lore.kernel.org/linux-pm/10629535.nUPlyArG6x@rjwysocki.net/) 作者總結了這次提交的效能分析結果：

首先，`Baseline` 是 `linux-pm.git/testing` 分支，`Parent/child` 是分支使用 Patches [1-3/5]，`Device links` 是分支使用 Patch [1-5/5]。

`s/r` 指的是 `regular` suspend/resume；`noRPM` 指的是 `late` suspend 和 `early` resume；`noIRQ` 指的是 `noirq` 階段的 suspend/resume。

以下表格中的數字是 suspend 和 resume 在每一個階段的時間以毫秒為單位。

<style>
/* --- Modern Dark Theme Palette & Layout --- /
.perf-table-container {
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
background-color: #1A1A1B;
padding: 16px;
border-radius: 8px;
}
.perf-table {
width: 100%;
border-collapse: collapse;
color: #D7DADC; / Light gray text for readability /
}
.perf-table th, .perf-table td {
text-align: center;
padding: 12px 10px;
border-bottom: 1px solid #343638; / Subtle row separators /
}
.perf-table thead th {
font-size: 0.9em;
font-weight: 600;
color: #B0B3B8;
border-bottom-width: 2px;
border-bottom-color: #4d4d4d;
text-transform: uppercase;
letter-spacing: 0.5px;
}
.perf-table tbody tr:hover {
background-color: #2a2a2c; / Interactive hover effect /
}
.perf-table td:first-child, .perf-table th:first-child {
text-align: left;
padding-left: 15px;
}
.run-number {
font-size: 1.2em;
font-weight: bold;
color: #fff;
}
/ --- Data Visualization Classes --- /
.metric {
font-size: 1.1em;
font-weight: 500;
}
.improvement {
color: #2ECC71; / Green for improvement /
font-weight: 600;
}
.neutral {
color: #95A5A6; / Gray for neutral or minor changes */
}
.percentage {
display: block;
font-size: 0.8em;
color: #7f8c8d;
margin-top: 2px;
}
</style>

<div class="perf-table-container">
<table class="perf-table">
<thead>
<tr>
<th rowspan="2">測試回合</th>
<th rowspan="2">階段 (Phase)</th>
<th colspan="2">基準 (Baseline)</th>
<th colspan="2">父子裝置優先 (Parent/child)</th>
<th colspan="2">裝置連結優先 (Device links)</th>
</tr>
<tr>
<th>Suspend</th>
<th>Resume</th>
<th>Suspend</th>
<th>Resume</th>
<th>Suspend</th>
<th>Resume</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="3"><span class="run-number">1</span></td>
<td>s/r</td>
<td><span class="metric">427</span></td>
<td><span class="metric">449</span></td>
<td><span class="metric improvement">298 ▼<span class="percentage">-30.2%</span></span></td>
<td><span class="metric neutral">450</span></td>
<td><span class="metric improvement">294 ▼<span class="percentage">-31.1%</span></span></td>
<td><span class="metric neutral">442</span></td>
</tr>
<tr>
<td>noRPM</td>
<td>13</td>
<td>1</td>
<td>13</td>
<td>1</td>
<td>13</td>
<td>1</td>
</tr>
<tr>
<td>noIRQ</td>
<td>31</td>
<td>25</td>
<td>28</td>
<td>24</td>
<td>28</td>
<td>26</td>
</tr>
<tr>
<td rowspan="3"><span class="run-number">2</span></td>
<td>s/r</td>
<td><span class="metric">408</span></td>
<td><span class="metric">442</span></td>
<td><span class="metric improvement">298 ▼<span class="percentage">-27.0%</span></span></td>
<td><span class="metric neutral">443</span></td>
<td><span class="metric improvement">301 ▼<span class="percentage">-26.2%</span></span></td>
<td><span class="metric neutral">447</span></td>
</tr>
<tr>
<td>noRPM</td>
<td>13</td>
<td>1</td>
<td>13</td>
<td>1</td>
<td>13</td>
<td>1</td>
</tr>
<tr>
<td>noIRQ</td>
<td>32</td>
<td>25</td>
<td>30</td>
<td>25</td>
<td>28</td>
<td>25</td>
</tr>
<tr>
<td rowspan="3"><span class="run-number">3</span></td>
<td>s/r</td>
<td><span class="metric">408</span></td>
<td><span class="metric">444</span></td>
<td><span class="metric improvement">310 ▼<span class="percentage">-24.0%</span></span></td>
<td><span class="metric neutral">450</span></td>
<td><span class="metric improvement">298 ▼<span class="percentage">-27.0%</span></span></td>
<td><span class="metric neutral">439</span></td>
</tr>
<tr>
<td>noRPM</td>
<td>13</td>
<td>1</td>
<td>13</td>
<td>1</td>
<td>13</td>
<td>1</td>
</tr>
<tr>
<td>noIRQ</td>
<td>31</td>
<td>24</td>
<td>31</td>
<td>26</td>
<td>31</td>
<td>24</td>
</tr>
</tbody>
</table>
</div>



## 4.2 實驗步驟

經過查詢得知這次提交是在 [6.16-rc3 LKML Patch](https://www.spinics.net/lists/kernel/msg5734763.html?) 裡面。

首先我們要建立對照組和實驗組，對照組是第一個 Patch 之前的分支，實驗組則是加入這五個 Patch 之後的分支。


### 建立對照組

```shell
lab@AI:~/Downloads$ git clone https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git
Cloning into 'linux'...
remote: Enumerating objects: 11031512, done.
remote: Counting objects: 100% (2117/2117), done.
remote: Compressing objects: 100% (1186/1186), done.
remote: Total 11031512 (delta 1399), reused 1263 (delta 930), pack-reused 11029395 (from 1)
Receiving objects: 100% (11031512/11031512), 3.05 GiB | 8.95 MiB/s, done.
Resolving deltas: 100% (9063034/9063034), done.
Updating files: 100% (90497/90497), done.
```


```shell
lab@AI:~/Downloads/linux$ git checkout -b v6.16-baseline 0cbef962ce1f~1
Updating files: 100% (14188/14188), done.
Previous HEAD position was 86731a2a651e Linux 6.16-rc3
Switched to a new branch 'v6.16-baseline'

# 複製您目前的系統設定檔
cp /boot/config-$(uname -r) .config

# 使用 sed 指令強制關閉憑證選項
sed -i 's/CONFIG_SYSTEM_TRUSTED_KEYS/#CONFIG_SYSTEM_TRUSTED_KEYS/g' .config

# 使用不會提問的 olddefconfig 來自動完成設定
make olddefconfig

# 開始編譯
make -j$(nproc)

# 安裝模組與核心
sudo make modules_install
sudo make install
```

確認目前的系統核心版本以及，程式庫裡面是否有那五個 Patch

```shell
lab@AI:~/Downloads/linux$ git checkout v6.16-baseline
Already on 'v6.16-baseline'
lab@AI:~/Downloads/linux$ git log --oneline | grep 0cbef96
lab@AI:~/Downloads/linux$ git log --oneline | grep aa7a927
lab@AI:~/Downloads/linux$ git log --oneline | grep 443046d
lab@AI:~/Downloads/linux$ git log --oneline | grep ed18738
lab@AI:~/Downloads/linux$ git log --oneline | grep 0679963
dfa106799639 [ARM] pxa: cleanup the coding style of pxa_gpio_set_type()
lab@AI:~/Downloads/linux$ 
```



### 建立實驗組

```shell
cd ~/Downloads/linux
git checkout master

# 以第五個補丁的 commit 為基礎，建立我們最終的實驗分支
git checkout -b v6.16-patched-all-5 06799631d522

# 1. 建立並修正設定檔
cp /boot/config-$(uname -r) .config
sed -i 's/CONFIG_SYSTEM_TRUSTED_KEYS/#CONFIG_SYSTEM_TRUSTED_KEYS/g' .config
make olddefconfig

# 2. 編譯 (請密切注意這裡是否會報錯)
make -j$(nproc)

# 3. 如果編譯成功，才執行安裝
sudo make modules_install
sudo make install
```








## 4.3 實驗結果


### 對照組

我們重複本文第一次 Perfetto 和 pm-graph 的實驗方法，觀察 `suspend_enter` 階段的耗時是 14 ms 352 us 。
![image](https://hackmd.io/_uploads/SJZRmmrulg.png)




### 實驗組


我們重複本文第一次 Perfetto 和 pm-graph 的實驗方法，觀察 `suspend_enter` 階段的耗時是 13 ms 444 us 。
![image](https://hackmd.io/_uploads/r1JPWtBOel.png)


# 參考資料
[1] [System Sleep States — The Linux Kernel  documentation](https://docs.kernel.org/admin-guide/pm/sleep-states.html)
[2] [System Suspend Code Flows — The Linux Kernel  documentation](https://docs.kernel.org/admin-guide/pm/suspend-flows.html)
[3] [Linux Suspend/Resume 實驗（一）](https://hackmd.io/@Guanchun0803/SuspendResume#)
[4] [Linux Commit History: rafaeljw](https://github.com/torvalds/linux/commits/master/?author=rafaeljw)

