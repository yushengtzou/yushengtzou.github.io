# 1. 前言

理論上來說，離散時間訊號的頻譜 (Spectrum) 可以使用離散時間傅立葉轉換 (Discrete-Time Fourier Transform, DTFT) 得到。但實際上電腦並不存在無限大的記憶體空間，因此我們會使用離散傅立葉轉換 (Discrete Fourier Transform, DFT) 方法，並使用一個稱為快速傅立葉轉換 (Fast Fourier Transform, FFT) 的計算高效演算法用程式計算而得。

## 1.1 DTFT 初探

離散時間訊號以 $x[n]$ 表示，$n$ 屬於整數，DTFT 配對定義如下：

**Forward DTFT:**

$$
X(e^{j\omega}) = \sum_{n=-\infty}^{\infty} x[n] e^{-j\omega n}
$$

**Inverse DTFT:**

$$
x[n] = \frac{1}{2\pi} \int_{-\pi}^{\pi} X(e^{j\omega}) e^{j\omega n} \, d\omega
$$


一般而言，離散時間訊號的 DTFT 頻譜是以 $2π$ 為週期的。在實務上，我們通常假設這個離散訊號是根據取樣定理，從一個頻帶限制在 $[−fs/2,fs/2]$ 的類比訊號取樣而來。經過正規化後，這個頻帶對應到數位角頻率 $[-π, π]$ 的區間。因此，雖然 DTFT 頻譜在整個頻率軸上都存在，但其所有的唯一資訊都集中在 $[-π, π]$ 這個基本週期內，我們通常也只分析這個區間。

## 1.2 DFT 初探

假設現在有一個 $N$-point 訊號，並定義 $W_N = e^{-j(\frac{2\pi}{N})}$，$W_N^n$ 是多項式 $W^n = 1$ 的根，則 DFT 配對定義如下：

**DFT (Discrete Fourier Transform)**

$$X[k] = \sum_{n=0}^{N-1} x[n]W_N^{kn}, \quad k = 0, 1, \dots, N-1$$

**IDFT (Inverse Discrete Fourier Transform)**

$$x[n] = \frac{1}{N} \sum_{k=0}^{N-1} X[k]W_N^{-kn}, \quad n = 0, 1, \dots, N-1$$

在這裡 $W_N^n$ 是多項式 $W^N = 1$ 的第 $n$ 個根。值得注意的是，使用上面的方程式做計算的話，在乘法的時間複雜度會是 $O(n^2)$，在加法的時間複雜度會是 $O(n(n-1)), i.e., O(n^2    )$。


# 2. 理論

Cooley-Tukey 演算法是 FFT 的其中一個重要的演算法，它最主要的原理有兩個：
1. $W_N^2 = W_{N/2}$ (例如：$W_8^2 = W_4$)。
2. 迭代地做分治法 (Divide and Conquer)

我們已經知道在這裡 $W_N^n$ 是多項式 $W^N = 1$ 的第 $n$ 個根，如果 $N = 8$：

<div style="text-align: center;">
<img src="https://hackmd.io/_uploads/S1fBqsTOle.png" width=50%>
</div>

## 2.1 FFT 演算法於時間域減退抽樣 (Decimation-in-time)


一般來說，

$$
X[k] = \sum_{n \,\text{even}} x[n] W_N^{nk} \;+\; \sum_{n \,\text{odd}} x[n] W_N^{nk}
$$

假設 $N = 8$，我們可以分解 $N$-point DFT 為兩個 $N/2$-point DFT。

![截圖 2025-08-16 下午3.31.02](https://hackmd.io/_uploads/B1X6726dex.png)

我們可以進一步分解 $N/2$-point DFT 為兩個 $N/4$-point DFT。

![截圖 2025-08-16 下午3.44.29](https://hackmd.io/_uploads/By3kD26_ee.png)

因此，$8$-point DFT 可以用四個 $2$-point DFT 得到。

![截圖 2025-08-16 下午3.45.21](https://hackmd.io/_uploads/rkRfDnadlg.png)

最後，每一個 $2$-point DFT 可以用以下的 single-flow graph 實作，而不需要用到乘法：

<div style="text-align: center;">
<img src="https://hackmd.io/_uploads/rkN5d3adgx.png" width="66%">
</div>

以下是 $8$-point DFT 於時間域減退抽樣得到的 single-graph。

![image](https://hackmd.io/_uploads/rJaIF2T_ex.png)

在 FFT 於時間域減退抽樣的每一個階段，有一個基本的結構叫做蝴蝶計算 (Butterfly computation)

$$
X_m[p] = X_{m-1}[p] + W_N^r X_{m-1}[q]
$$

$$
X_m[q] = X_{m-1}[p] - W_N^r X_{m-1}[q]
$$


以 flow graph 來表示蝴蝶計算 (Butterfly computation)，如下：

<div style="text-align: center;">
  <img src="https://hackmd.io/_uploads/S17_c2puex.png" width="66%">
</div>

它又可以簡化為如下：

<div style="text-align: center;">
<img src="https://hackmd.io/_uploads/Syf09haugl.png" width="66%">
</div>



## 2.2 FFT 演算法於頻率域減退抽樣 (Decimation-in-frequency)



# 3. 實驗

我們將使用 MATLAB 並使用 FFT 做影像訊號的初步實驗。

（待補）


# 參考文獻

[1] 陳祝嵩, 國立臺灣大學資訊工程學系, "112-2 數位訊號處理概論投影片", Course Slides, 2024.
