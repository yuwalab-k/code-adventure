INSERT OR REPLACE INTO problems (id, contest, problem_number, title, atcoder_url, difficulty, required_level, statement_md, constraints_md, constraints_note_md, statement_note_md, map_x, map_y, map_order, clear_reward_item_id, is_published, added_at, created_at, updated_at) VALUES ('typical90_a', '典型90問', '001', 'Yokan Party', 'https://atcoder.jp/contests/typical90/tasks/typical90_a', 4, 7, '左右の長さが $L$ cm のようかんがあります。  
$N$ 個の切れ目が付けられており、左から $i$ 番目の切れ目は左から $A_i$ cm の位置にあります。

あなたは $N$ 個の切れ目のうち $K$ 個を選び、ようかんを $K+1$ 個のピースに分割したいです。

このとき、以下の値を **スコア** とします。

> $K+1$ 個のピースのうち、最も短いものの長さ

スコアが最大となるように分割する場合に得られるスコアを求めてください。', '- $1 \leq K \leq N \leq 100000$
- $0 < A_1 < A_2 < \cdots < A_N < L \leq 10^9$
- 入力はすべて整数', '- `1 ≤ K ≤ N ≤ 100000`：切れ目は最大**10万個**。選ぶ数 K もそれ以下。
- `L ≤ 10^9`：ようかんの長さは最大**10億 cm**。
- ようかんが 10 億 cm もあるので、「1cm から順に全部試す」と 10 億回以上かかってしまう。コンピューターでも何時間もかかるので間に合わない。二分探索を使えば **約 30 回** で答えが見つかる。', '## どんな問題？

ようかんを **K か所** で切って、できたピースが**なるべく短くならない**ようにしたい。

たとえば 34cm のようかん、切れ目は 3 か所（8cm・13cm・26cm）、1 か所だけ切る。

| 切る場所 | できるピース | 短い方 |
|---------|------------|-------|
| 8cm | 8cm と 26cm | **8cm** |
| **13cm** | **13cm と 21cm** | **13cm** ← 最大！ |
| 26cm | 26cm と 8cm | **8cm** |

13cm で切るのがいちばんよく、答えは **13**。

---

## 全部の切り方を試せばいいんじゃないの？

切れ目が 3 か所しかないときは全部試せる。  
でもようかんの長さは最大 **10 億 cm** になることがある。

「1cm で切ったら？」「2cm で切ったら？」… と 10 億回試すと、  
コンピューターでも **何時間もかかってしまう**。

---

## 「できる？できない？」で考えると速くなる！

「**全部のピースを〇cm 以上にできる？**」という質問に変える。

- 「全部 10cm 以上にできる？」→ できる
- 「全部 13cm 以上にできる？」→ できる
- 「全部 14cm 以上にできる？」→ できない

**「できる」の最大が答え！**

この境目を探すには、1 から順に試さなくていい。  
「真ん中を試して、できたら上半分、できなければ下半分だけ調べる」をくり返すと、  
10 億回が **たった 30 回ほど** で終わる（**二分探索**）。

---

## 「〇cm 以上にできるか」をどう調べるの？

左から順に見ていって、**ちょうど〇cm 以上になったらすぐ切る**。  
それが K 回できたら「できる」、K 回できなかったら「できない」。', NULL, NULL, NULL, NULL, 1, '2026-05-20', '2026-07-09T04:39:46.638Z', '2026-07-09T04:39:46.638Z');
INSERT OR REPLACE INTO tags (id, name) VALUES ('二分探索', '二分探索');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_a', '二分探索');
INSERT OR REPLACE INTO tags (id, name) VALUES ('貪欲', '貪欲');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_a', '貪欲');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_a_sample_1', 'typical90_a', 1, '3 34
1
8 13 26', '13', '**この入力の意味：** 34cm のようかんに切れ目が **3か所**（8cm・13cm・26cm）あって、その中から **1か所** を選んで切る。

全部の切り方を比べると：

- 8cm で切る → ピースは **8cm** と 26cm → いちばん短いのは **8cm**
- **13cm で切る** → ピースは **13cm** と 21cm → いちばん短いのは **13cm** ← これが最大！
- 26cm で切る → ピースは **8cm** と 26cm → いちばん短いのは **8cm**

いちばん短いピースが最も長くなる切り方は 13cm → 答えは **13**。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_a_sample_2', 'typical90_a', 2, '7 45
2
7 11 16 20 28 34 38', '12', '**この入力の意味：** 45cm のようかんに切れ目が **7か所**（7・11・16・20・28・34・38cm）あって、その中から **2か所** 選んで3つに切る。

16cm と 28cm で切ると：

- 0〜16cm → **16cm**
- 16〜28cm → **12cm**
- 28〜45cm → **17cm**

いちばん短いのは **12cm** → 答えは **12**。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_a_sample_3', 'typical90_a', 3, '3 100
1
28 54 81', '46', '**この入力の意味：** 100cm のようかんに切れ目が **3か所**（28cm・54cm・81cm）あって、**1か所** 選んで2つに切る。

全部の切り方：

- 28cm で切る → **28cm** と 72cm → 最小 **28cm**
- **54cm で切る** → **46cm** と 46cm → 最小 **46cm** ← これが最大！
- 81cm で切る → 19cm と **81cm** → 最小 **19cm**

真ん中に近い 54cm で切ると両方が均等になる → 答えは **46**。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_a_sample_4', 'typical90_a', 4, '3 100
2
28 54 81', '26', '**この入力の意味：** 100cm のようかんに切れ目が **3か所**（28cm・54cm・81cm）あって、**2か所** 選んで3つに切る。

28cm と 54cm で切ると：

- 0〜28cm → **28cm**
- 28〜54cm → **26cm**
- 54〜100cm → **46cm**

いちばん短いのは **26cm** → 答えは **26**。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_a_sample_5', 'typical90_a', 5, '20 1000
4
51 69 102 127 233 295 350 388 417 466 469 523 553 587 720 739 801 855 926 954', '170', '**この入力の意味：** 1000cm のようかんに切れ目が **20か所** あって、その中から **4か所** 選んで5つに切る。

組み合わせがとても多いので全部試すのは大変。プログラムで最良の切り方を探す。

最もうまく切ったとき、いちばん短いピースは **170cm** → 答えは **170**。

---');
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_a_solution_python', 'typical90_a', 'python', 'N, L = map(int, input().split())  # 切れ目の数 N、ようかんの長さ L を読み込む
K = int(input())                  # 選ぶ切れ目の数 K を読み込む
A = list(map(int, input().split()))  # 各切れ目の位置をリストで読み込む

# 「全ピースを x cm 以上にできるか？」を判定する関数
def check(x):
    prev = 0  # 直前に切った位置（最初は左端 = 0）
    cnt = 0   # 実際に切った回数

    for a in A:
        # a - prev >= x : 今切るとこのピースが x 以上
        # L - a >= x   : 残り（右端まで）も x 以上
        if a - prev >= x and L - a >= x:
            cnt += 1  # 切る
            prev = a  # 切った位置を更新

    return cnt >= K  # K 回以上切れれば OK

low = 0      # low は「この値なら確実にできる」
high = L + 1 # high は「この値ではできない」

# 二分探索：low と high の差が 1 になるまで繰り返す
while high - low > 1:
    mid = (low + high) // 2  # 真ん中の値を試す（// は整数除算）

    if check(mid):
        low = mid   # mid でできた → もっと大きくできるかも
    else:
        high = mid  # mid ではできない → 小さくする

print(low)  # low が答え（最大スコア）', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_a_solution_cpp', 'typical90_a', 'cpp', '#include <bits/stdc++.h>
using namespace std;
using ll = long long;  // long long を ll と短く書けるようにする（大きな数に対応）

int main() {
    int N, K;
    ll L;

    cin >> N >> L;  // 切れ目の数 N と ようかんの長さ L を読み込む
    cin >> K;       // 選ぶ切れ目の数 K を読み込む

    vector<ll> A(N);  // 切れ目の位置を N 個分用意する

    for (int i = 0; i < N; i++) {
        cin >> A[i];  // 各切れ目の位置を読み込む
    }

    // 「全ピースを x cm 以上にできるか？」を判定する関数
    // できれば true、できなければ false を返す
    auto check = [&](ll x) {
        ll prev = 0;  // 直前に切った位置（最初は左端 = 0）
        int cnt = 0;  // 実際に切った回数

        for (int i = 0; i < N; i++) {
            // A[i] - prev >= x : 今切るとこのピースが x 以上になる
            // L - A[i] >= x   : 最後のピース（右端まで）も x 以上になる
            if (A[i] - prev >= x && L - A[i] >= x) {
                cnt++;        // 切る
                prev = A[i];  // 切った位置を更新
            }
        }

        return cnt >= K;  // K 回以上切れれば OK
    };

    ll low = 0;      // low は「この値なら確実にできる」（答えの候補）
    ll high = L + 1; // high は「この値ではできない」

    // 二分探索：low と high の差が 1 になるまで繰り返す
    while (high - low > 1) {
        ll mid = (low + high) / 2;  // 真ん中の値を試す

        if (check(mid)) {
            low = mid;   // mid でできた → もっと大きくできるかも
        } else {
            high = mid;  // mid ではできない → 小さくする
        }
    }

    cout << low << endl;  // low が答え（最大スコア）
}', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_a_solution_typescript', 'typical90_a', 'typescript', 'import * as readline from ''readline'';

// 標準入力を1行ずつ受け取る（AtCoder の Node.js 典型パターン）
const rl = readline.createInterface({ input: process.stdin });
const lines: string[] = [];
rl.on(''line'', (line) => lines.push(line.trim()));  // 1行読むたびに配列に追加
rl.on(''close'', () => {
  // 全行読み終わったら処理開始
  const [N, L] = lines[0].split('' '').map(Number);  // 1行目：N と L
  const K = Number(lines[1]);                       // 2行目：K
  const A = lines[2].split('' '').map(Number);        // 3行目：切れ目の位置リスト

  // 「全ピースを x cm 以上にできるか？」を判定する関数
  // number 型の x を受け取り、boolean（true/false）を返す
  const check = (x: number): boolean => {
    let prev = 0, cnt = 0;  // prev：直前に切った位置、cnt：切った回数
    for (const a of A) {
      // このピース(a - prev)が x 以上 かつ 残り(L - a)が x 以上なら切る
      if (a - prev >= x && L - a >= x) {
        cnt++;
        prev = a;
      }
    }
    return cnt >= K;  // K 回以上切れれば OK
  };

  let low = 0, high = L + 1;  // 二分探索の範囲を初期化
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);  // 整数で真ん中を計算
    if (check(mid)) low = mid;   // できた → low を上げる
    else high = mid;             // できない → high を下げる
  }
  console.log(low);  // 答えを出力
});', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_a_solution_ruby', 'typical90_a', 'ruby', 'N, L = gets.split.map(&:to_i)  # 1行目：N と L（文字列 → 整数に変換）
K = gets.to_i                  # 2行目：K
A = gets.split.map(&:to_i)     # 3行目：切れ目の位置リスト

# 「全ピースを x cm 以上にできるか？」を判定するラムダ（無名関数）
check = ->(x) {
  prev = 0  # 直前に切った位置
  cnt = 0   # 切った回数
  A.each do |a|
    # このピース(a - prev)が x 以上 かつ 残り(L - a)が x 以上なら切る
    if a - prev >= x && L - a >= x
      cnt += 1
      prev = a
    end
  end
  cnt >= K  # Ruby では最後の式が return 値になる
}

low = 0      # low：できる側の境界
high = L + 1 # high：できない側の境界
while high - low > 1
  mid = (low + high) / 2  # 真ん中を試す
  if check.call(mid)      # ラムダは .call() で呼び出す
    low = mid   # できた → low を上げる
  else
    high = mid  # できない → high を下げる
  end
end
puts low  # 答えを出力', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_a_solution_php', 'typical90_a', 'php', '<?php
// 1行目を読んで空白で分割し、整数に変換して N と L に代入
[$N, $L] = array_map(''intval'', explode('' '', trim(fgets(STDIN))));
$K = (int)trim(fgets(STDIN));                                    // 2行目：K
$A = array_map(''intval'', explode('' '', trim(fgets(STDIN))));      // 3行目：切れ目リスト

// 「全ピースを x cm 以上にできるか？」を判定する関数
// PHP は関数内から外の変数を直接使えないので $A, $L, $K を引数で渡す
function check($A, $L, $K, $x) {
    $prev = 0;  // 直前に切った位置
    $cnt = 0;   // 切った回数
    foreach ($A as $a) {
        // このピース($a - $prev)が x 以上 かつ 残り($L - $a)が x 以上なら切る
        if ($a - $prev >= $x && $L - $a >= $x) {
            $cnt++;
            $prev = $a;
        }
    }
    return $cnt >= $K;  // K 回以上切れれば true
}

$low = 0;       // できる側の境界
$high = $L + 1; // できない側の境界
while ($high - $low > 1) {
    $mid = intdiv($low + $high, 2);  // intdiv で整数除算（切り捨て）
    if (check($A, $L, $K, $mid)) $low = $mid;   // できた → low を上げる
    else $high = $mid;                           // できない → high を下げる
}
echo $low . "\n";  // 答えを出力', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_a_solution_rust', 'typical90_a', 'rust', 'use std::io::{self, BufRead};  // 標準入力を読むためにインポート

// 「全ピースを x cm 以上にできるか？」を判定する関数
// &[i64] はスライス（配列の参照）、-> bool は返り値の型
fn check(a: &[i64], l: i64, k: usize, x: i64) -> bool {
    let mut prev = 0i64;    // 直前に切った位置（i64 型で初期化）
    let mut cnt = 0usize;   // 切った回数（usize は配列添字などに使う符号なし整数）
    for &ai in a {          // a の各要素を ai として取り出す（& でコピー）
        // このピース(ai - prev)が x 以上 かつ 残り(l - ai)が x 以上なら切る
        if ai - prev >= x && l - ai >= x {
            cnt += 1;
            prev = ai;
        }
    }
    cnt >= k  // Rust では最後の式がセミコロンなしだと return 値になる
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();  // 標準入力を行単位で読む

    // 1行目：空白区切りで N と L を読み込む
    // unwrap() はエラーがないと仮定して値を取り出す（競プロでは通常 OK）
    let line1: Vec<i64> = lines.next().unwrap().unwrap()
        .split_whitespace().map(|s| s.parse().unwrap()).collect();
    let (_n, l) = (line1[0] as usize, line1[1]);  // N は使わないので _ を付ける

    // 2行目：K を読み込む
    let k: usize = lines.next().unwrap().unwrap().trim().parse().unwrap();

    // 3行目：切れ目の位置リストを読み込む
    let a: Vec<i64> = lines.next().unwrap().unwrap()
        .split_whitespace().map(|s| s.parse().unwrap()).collect();

    let mut low = 0i64;   // できる側の境界
    let mut high = l + 1; // できない側の境界
    while high - low > 1 {
        let mid = (low + high) / 2;  // 真ん中を試す
        // Rust の if は式なので、結果を直接代入できる
        if check(&a, l, k, mid) { low = mid; } else { high = mid; }
    }
    println!("{}", low);  // 答えを出力
}', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_a_solution_perl', 'typical90_a', 'perl', 'use strict;    # 変数宣言を強制（バグを防ぐ）
use warnings;  # 警告を有効化（バグを見つけやすくする）

# 1行目：空白で分割して N と L に代入
my ($N, $L) = split '' '', <STDIN>;
my $K = int(<STDIN>);        # 2行目：K（int で整数に変換）
my @A = split '' '', <STDIN>;  # 3行目：切れ目リスト（@ は配列の印）

# 「全ピースを x cm 以上にできるか？」を判定するサブルーチン
sub check {
    my ($x) = @_;           # 引数 x を受け取る（Perl の引数は @_ 経由）
    my ($prev, $cnt) = (0, 0);  # 直前に切った位置と切った回数を 0 で初期化
    for my $a (@A) {
        # このピース($a - $prev)が x 以上 かつ 残り($L - $a)が x 以上なら切る
        if ($a - $prev >= $x && $L - $a >= $x) {
            $cnt++;
            $prev = $a;
        }
    }
    return $cnt >= $K;  # K 回以上切れれば 1（true）を返す
}

my ($low, $high) = (0, $L + 1);  # 二分探索の範囲を初期化
while ($high - $low > 1) {
    my $mid = int(($low + $high) / 2);  # int で整数除算
    if (check($mid)) { $low = $mid; }   # できた → low を上げる
    else             { $high = $mid; }  # できない → high を下げる
}
print "$low\n";  # 答えを出力', NULL);
INSERT OR REPLACE INTO bad_solutions (id, problem_id, language, label, code) VALUES ('typical90_a_bad_solution_python', 'typical90_a', 'python', 'O(L×N) 線形探索 — 二分探索を使わず1からLまで全部試す', 'N, L = map(int, input().split())
K = int(input())
A = list(map(int, input().split()))

def can_cut(min_len):
    prev = 0
    cuts = 0
    for a in A:
        if a - prev >= min_len and L - a >= min_len:
            cuts += 1
            prev = a
    return cuts >= K

ans = 0
# L が最大10^9なのに1から全部試している → TLE
# 二分探索を使えば O(N log L) で済む
for x in range(1, L + 1):
    if can_cut(x):
        ans = x
print(ans)');
INSERT OR REPLACE INTO problems (id, contest, problem_number, title, atcoder_url, difficulty, required_level, statement_md, constraints_md, constraints_note_md, statement_note_md, map_x, map_y, map_order, clear_reward_item_id, is_published, added_at, created_at, updated_at) VALUES ('typical90_b', '典型90問', '002', 'Encyclopedia of Parentheses', 'https://atcoder.jp/contests/typical90/tasks/typical90_b', 3, 5, '長さ $N$ の正しいカッコ列をすべて、辞書順に出力してください。

ただし、正しいカッコ列は次のように定義されています：

- `()` は正しいカッコ列である
- $S$ が正しいカッコ列であるとき、`(` + $S$ + `)` は正しいカッコ列である
- $S$, $T$ が正しいカッコ列であるとき、$S$ + $T$ は正しいカッコ列である
- それ以外の文字列はすべて、正しいカッコ列でない

また、`(` の方が `)` よりも辞書順で早いものとします。', '- $1 \leq N \leq 20$
- $N$ は整数', '- `1 ≤ N ≤ 8`：N は最大 **8**。カッコ列の長さは最大 16文字。
- N が小さいので、全パターン試しても問題なく間に合う。
- N が 20 や 30 になると爆発的に増えるが、N ≤ 8 ならその心配はない。', '## どんな問題？

`(` と `)` だけを使って、ちゃんと対応しているカッコ列をすべて出す。

「ちゃんと対応している」とは：
- 左から読んで、いつでも `(` の数が `)` の数以上
- 最後に `(` と `)` の数がぴったり同じ

たとえば長さ 4（N=2）なら、答えは `(())` と `()()` の2つ。

---

## どうやって全部見つけるの？

1文字ずつ左から決めていく。

- `(` は、まだ N 個未満しか使っていなければ置ける
- `)` は、今まで置いた `(` より少ないなら置ける
- それ以外は行き止まりとして諦める

これを全パターン試すと、条件を満たすカッコ列だけが集まる。N が最大 8 と小さいので、全パターン試しても速い。

---

## なぜ全部試せるの？

N = 8 のとき最大でも 1430 通り程度しかない。コンピューターにはあっという間。', NULL, NULL, NULL, NULL, 1, '2026-05-20', '2026-07-09T04:39:46.638Z', '2026-07-09T04:39:46.638Z');
INSERT OR REPLACE INTO tags (id, name) VALUES ('再帰', '再帰');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_b', '再帰');
INSERT OR REPLACE INTO tags (id, name) VALUES ('バックトラッキング', 'バックトラッキング');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_b', 'バックトラッキング');
INSERT OR REPLACE INTO tags (id, name) VALUES ('全探索', '全探索');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_b', '全探索');
INSERT OR REPLACE INTO tags (id, name) VALUES ('括弧列', '括弧列');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_b', '括弧列');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_b_sample_1', 'typical90_b', 1, '2', '()', '**この入力の意味：** 長さ **2** の正しいカッコ列を全部出力する。

長さ2のカッコ列は `()` と `)(` の2種類しかない。

- `()` → `(` が先に来て `)` で閉じている → **正しい** ✓
- `)(` → `)` が先に来ている → **正しくない** ✗

答えは `()` の1つだけ。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_b_sample_2', 'typical90_b', 2, '3', '', '**この入力の意味：** 長さ **3** の正しいカッコ列を全部出力する。

正しいカッコ列は必ず `(` と `)` が同じ数だけ必要。長さが奇数のときは必ず片方が余るので、正しいカッコ列は **1つも存在しない**。何も出力しない。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_b_sample_3', 'typical90_b', 3, '4', '(())
()()', '**この入力の意味：** 長さ **4** の正しいカッコ列を全部出力する。

長さ4では `(` が2個・`)` が2個。正しい並べ方は2通り：

- `(())` → 外側のカッコが内側を包んでいる ✓
- `()()` → 2つのカッコが横に並んでいる ✓

辞書順では `(` < `)` なので `(())` が先。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_b_sample_4', 'typical90_b', 4, '10', '((((()))))
(((()())))
(((())()))
(((()))())
(((())))()
((()(())))
((()()()))
((()())())
((()()))()
((())(()))
((())()())
((())())()
((()))(())
((()))()()
(()((())))
(()(()()))
(()(())())
(()(()))()
(()()(()))
(()()()())
(()()())()
(()())(())
(()())()()
(())((()))
(())(()())
(())(())()
(())()(())
(())()()()
()(((())))
()((()()))
()((())())
()((()))()
()(()(()))
()(()()())
()(()())()
()(())(())
()(())()()
()()((()))
()()(()())
()()(())()
()()()(())
()()()()()', '**この入力の意味：** 長さ **10** の正しいカッコ列を全部出力する。

`(` が5個・`)` が5個の並べ方で正しいものをすべて列挙する。全部で **42通り** ある。

---');
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_b_solution_python', 'typical90_b', 'python', 'N = int(input())  # カッコ列の長さを読み込む

# s: 今まで作った文字列
# l: 置いた ''('' の数
# r: 置いた '')'' の数
def solve(s, l, r):
    if len(s) == N:      # 長さが N になったら出力
        print(s)
        return
    if l < N // 2:       # まだ ''('' を置ける（合計 N/2 個まで）
        solve(s + ''('', l + 1, r)
    if r < l:            # 閉じていない ''('' があるので '')'' を置ける
        solve(s + '')'', l, r + 1)

if N % 2 == 0:           # 奇数のときは正しいカッコ列が存在しない
    solve('''', 0, 0)', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_b_solution_cpp', 'typical90_b', 'cpp', '#include <bits/stdc++.h>
using namespace std;

int N;  // カッコ列の長さ（グローバル変数として共有）

// s: 今まで作った文字列
// l: 置いた ''('' の数
// r: 置いた '')'' の数
void solve(string s, int l, int r) {
    if ((int)s.size() == N) {  // 長さが N になったら出力
        cout << s << ''\n'';
        return;
    }
    if (l < N / 2)  // まだ ''('' を置ける（合計 N/2 個まで）
        solve(s + ''('', l + 1, r);
    if (r < l)      // 閉じていない ''('' があるので '')'' を置ける
        solve(s + '')'', l, r + 1);
}

int main() {
    cin >> N;
    if (N % 2 == 0)  // 奇数のときは正しいカッコ列が存在しない
        solve("", 0, 0);
}', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_b_solution_typescript', 'typical90_b', 'typescript', 'import * as readline from ''readline'';

const rl = readline.createInterface({ input: process.stdin });
rl.on(''line'', (line) => {
    const N = parseInt(line.trim());  // カッコ列の長さを読み込む
    const results: string[] = [];    // 結果を一旦配列にためる

    // s: 今まで作った文字列、l: ''('' の数、r: '')'' の数
    function solve(s: string, l: number, r: number): void {
        if (s.length === N) {   // 長さが N になったら結果に追加
            results.push(s);
            return;
        }
        if (l < N / 2)          // まだ ''('' を置ける
            solve(s + ''('', l + 1, r);
        if (r < l)              // 閉じていない ''('' があるので '')'' を置ける
            solve(s + '')'', l, r + 1);
    }

    if (N % 2 === 0)            // 奇数のときは何もしない
        solve('''', 0, 0);
    if (results.length > 0)
        console.log(results.join(''\n''));
    rl.close();
});', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_b_solution_ruby', 'typical90_b', 'ruby', 'N = gets.to_i  # カッコ列の長さを読み込む

# s: 今まで作った文字列、l: ''('' の数、r: '')'' の数、n: 目標の長さ
def solve(s, l, r, n)
  if s.length == n   # 長さが n になったら出力
    puts s
    return
  end
  solve(s + ''('', l + 1, r, n) if l < n / 2  # まだ ''('' を置ける
  solve(s + '')'', l, r + 1, n) if r < l       # 閉じていない ''('' がある
end

solve('''', 0, 0, N) if N % 2 == 0  # 奇数のときは何もしない', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_b_solution_php', 'typical90_b', 'php', '<?php
$N = (int)trim(fgets(STDIN));  // カッコ列の長さを読み込む

// s: 今まで作った文字列、l: ''('' の数、r: '')'' の数
function solve($s, $l, $r, $N) {
    if (strlen($s) == $N) {   // 長さが N になったら出力
        echo $s . "\n";
        return;
    }
    if ($l < $N / 2)          // まだ ''('' を置ける（合計 N/2 個まで）
        solve($s . ''('', $l + 1, $r, $N);
    if ($r < $l)              // 閉じていない ''('' があるので '')'' を置ける
        solve($s . '')'', $l, $r + 1, $N);
}

if ($N % 2 == 0)              // 奇数のときは正しいカッコ列が存在しない
    solve('''', 0, 0, $N);', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_b_solution_rust', 'typical90_b', 'rust', 'use std::io;

// s: 今まで作った文字列（String を借用して変更・戻しを繰り返す）
// l: 置いた ''('' の数、r: 置いた '')'' の数、n: 目標の長さ
fn solve(s: &mut String, l: usize, r: usize, n: usize) {
    if s.len() == n {          // 長さが n になったら出力
        println!("{}", s);
        return;
    }
    if l < n / 2 {             // まだ ''('' を置ける
        s.push(''('');           // 文字を追加
        solve(s, l + 1, r, n);
        s.pop();               // 再帰から戻ったら元に戻す（バックトラック）
    }
    if r < l {                 // 閉じていない ''('' があるので '')'' を置ける
        s.push('')'');
        solve(s, l, r + 1, n);
        s.pop();               // 同様にバックトラック
    }
}

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let n: usize = input.trim().parse().unwrap();  // N を読み込む
    if n % 2 == 0 {            // 奇数のときは何もしない
        let mut s = String::new();
        solve(&mut s, 0, 0, n);
    }
}', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_b_solution_perl', 'typical90_b', 'perl', 'use strict;
use warnings;

my $N = int(<STDIN>);  # カッコ列の長さを読み込む

# s: 今まで作った文字列、l: ''('' の数、r: '')'' の数
sub solve {
    my ($s, $l, $r) = @_;
    if (length($s) == $N) {  # 長さが N になったら出力
        print "$s\n";
        return;
    }
    solve($s . ''('', $l + 1, $r) if $l < $N / 2;  # まだ ''('' を置ける
    solve($s . '')'', $l, $r + 1) if $r < $l;       # 閉じていない ''('' がある
}

solve('''', 0, 0) if $N % 2 == 0;  # 奇数のときは何もしない', NULL);
INSERT OR REPLACE INTO bad_solutions (id, problem_id, language, label, code) VALUES ('typical90_b_bad_solution_python', 'typical90_b', 'python', 'O(2^(2N)×N) 全探索 — 全パターン生成して後から判定', 'from itertools import product
N = int(input())
for n in range(1, N + 1):
    # 2^(2n) 通りの文字列をすべて生成してから判定
    # n=8 のとき 2^16 = 65536 通り → ギリギリ間に合うが無駄が多い
    # 再帰で「最初から正しい括弧列だけ」を作れば余分な生成がない
    for bits in product(''()'', repeat=2*n):
        s = ''''.join(bits)
        d = 0
        ok = True
        for c in s:
            d += 1 if c == ''('' else -1
            if d < 0:  # 途中でマイナスになったら無効
                ok = False
                break
        if ok and d == 0:  # 最後に0になれば有効
            print(s)');
INSERT OR REPLACE INTO problems (id, contest, problem_number, title, atcoder_url, difficulty, required_level, statement_md, constraints_md, constraints_note_md, statement_note_md, map_x, map_y, map_order, clear_reward_item_id, is_published, added_at, created_at, updated_at) VALUES ('typical90_c', '典型90問', '003', 'Longest Circular Road', 'https://atcoder.jp/contests/typical90/tasks/typical90_c', 4, 7, '$N$ 個の都市があり、それぞれの都市に $1$ から $N$ までの番号が付けられています。
また、$N-1$ 本の道路があり、$i$ 本目 $(1 \leq i \leq N-1)$ の道路は都市 $A_i$ と都市 $B_i$ を双方向に結んでいます。
どの都市の間も、いくつかの道路を通って移動可能なものとなっています。

さて、あなたは整数 $u, v$ $(1 \leq u < v \leq N)$ を自由に選び、都市 $u$ と都市 $v$ を双方向に結ぶ道路を 1 本だけ新設することができます。そこで、以下で定められる値を **スコア** とします。

同じ道を 2 度通らずにある都市から同じ都市に戻ってくる経路における、通った道の本数（この値はただ 1 つに定まる）

スコアとして考えられる最大の値を出力してください。', '- $3 \leq N \leq 100000$
- $1 \leq A_i < B_i \leq N$ $(1 \leq i \leq N-1)$
- どの都市の間も、いくつかの道路を通って移動可能
- 与えられる入力は全て整数', '- `3 ≤ N ≤ 100000`：都市は最大 **10万個**。
- 全ペアを調べると 10万 × 10万 = **100億回** の計算が必要でコンピューターでも数十分かかってしまう。
- BFS を2回使う方法なら **10万回** の計算で終わる。', '## どんな問題？

都市と道路が木のようにつながっている（ループなし）。ここに道路を **1本だけ** 追加して、一周できるコースを作る。その一周の長さ（道路の本数）をできるだけ長くしたい。

たとえば 1-2-3 と一列につながっている場合、1と3をつなぐと **1→2→3→1** で3本の道を通って一周できる。

---

## どうやって解くの？

「一番遠い2都市の間に道を引く」のが最適。

一番遠い2都市間の距離（**木の直径**）に 1 を足した数が答え。

木の直径は「どこか1つの都市から一番遠い都市を探し、そこからまた一番遠い都市を探す」2回の探索で求まる。都市が10万個あっても速く終わる。', NULL, NULL, NULL, NULL, 1, '2026-05-21', '2026-07-09T04:39:46.638Z', '2026-07-09T04:39:46.638Z');
INSERT OR REPLACE INTO tags (id, name) VALUES ('木', '木');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_c', '木');
INSERT OR REPLACE INTO tags (id, name) VALUES ('木の直径', '木の直径');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_c', '木の直径');
INSERT OR REPLACE INTO tags (id, name) VALUES ('BFS', 'BFS');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_c', 'BFS');
INSERT OR REPLACE INTO tags (id, name) VALUES ('グラフ', 'グラフ');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_c', 'グラフ');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_c_sample_1', 'typical90_c', 1, '3
1 2
2 3', '3', '**この入力の意味：** 3つの都市（1・2・3番）が 1−2−3 と一列につながっている。ここに道路を1本追加する。

- 都市 1 と 都市 3 の間に追加 → **1 → 2 → 3 → 1** と一周できる。道の本数 **3本** ← これが最大！
- 都市 1 と 都市 2 の間に追加 → 同じ道が2本になるだけ。一周できるが道は **2本**（微妙）
- 都市 2 と 都市 3 の間に追加 → 同上、**2本**

いちばんスコアが高くなる選び方は 都市1 と 都市3 → 答えは **3**。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_c_sample_2', 'typical90_c', 2, '5
1 2
2 3
3 4
3 5', '4', '**この入力の意味：** 5つの都市、道路が 1−2−3−4 と 3−5。木の形。ここに道路を1本追加する。

- 都市 1 と 都市 4 の間 → 1→2→3→4→1、**4本** ← 最大！
- 都市 1 と 都市 5 の間 → 1→2→3→5→1、**4本** ← 同じ最大
- 都市 4 と 都市 5 の間 → 4→3→5→4、**3本**
- 都市 1 と 都市 3 の間 → 1→2→3→1、**3本**

答えは **4**。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_c_sample_3', 'typical90_c', 3, '10
1 2
1 3
2 4
4 5
4 6
3 7
7 8
8 9
8 10', '8', '**この入力の意味：** 10都市の木。

木の形を整理すると：
- 1番 → 2番 → 4番 → **5番**（端）
- 1番 → 2番 → 4番 → **6番**（端）
- 1番 → 3番 → 7番 → 8番 → **9番**（端）
- 1番 → 3番 → 7番 → 8番 → **10番**（端）

いちばん遠い2都市は **5番と9番**（または5番と10番、6番と9番、6番と10番）で、その間の道の本数は **7本**。

都市5と都市9の間に道路を新設 → **5→4→2→1→3→7→8→9→5** と一周。道の本数 **8本**。

答えは **8**。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_c_sample_4', 'typical90_c', 4, '31
1 2
1 3
2 4
2 5
3 6
3 7
4 8
4 9
5 10
5 11
6 12
6 13
7 14
7 15
8 16
8 17
9 18
9 19
10 20
10 21
11 22
11 23
12 24
12 25
13 26
13 27
14 28
14 29
15 30
15 31', '9', '**この入力の意味：** 31都市の完全二分木（全部で5段）。

```
              1
           /     \
         2         3
        / \       / \
       4   5     6   7
      /\ /\     /\ /\
     8 9 10 11 12 13 14 15
    /\/\/\/\/\/\/\/\/\/\/\/\/\
   16-31（葉）
```

いちばん遠い2都市は **16番と24番**（など葉と葉）で、木の上を通る道の本数は **8本**。

道路を新設すると一周で道は **9本**。

答えは **9**。

---');
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_c_solution_python', 'typical90_c', 'python', 'import sys
from collections import deque
input = sys.stdin.readline  # 高速入力に切り替え

def bfs(start, graph, n):
    dist = [-1] * (n + 1)   # 各都市までの距離。-1 は未訪問
    dist[start] = 0          # スタート地点は距離 0
    q = deque([start])       # BFS 用キュー
    farthest = start         # 最遠点（初期値はスタート地点）
    max_dist = 0             # 最遠距離

    while q:
        v = q.popleft()      # キューの先頭から都市を取り出す
        for u in graph[v]:   # 隣接する都市を全部調べる
            if dist[u] == -1:          # まだ訪れていない都市なら
                dist[u] = dist[v] + 1  # 距離を 1 増やして記録
                q.append(u)            # キューに追加
                if dist[u] > max_dist: # より遠い都市を見つけたら更新
                    max_dist = dist[u]
                    farthest = u

    return farthest, max_dist  # 最遠点とその距離を返す

N = int(input())                            # 都市の数
graph = [[] for _ in range(N + 1)]         # 隣接リスト（1-indexed）

for _ in range(N - 1):
    a, b = map(int, input().split())        # 道路の両端を読む
    graph[a].append(b)                      # a→b の道
    graph[b].append(a)                      # b→a の道（双方向）

# 1回目の BFS: 都市 1 から最も遠い都市を見つける
u, _ = bfs(1, graph, N)

# 2回目の BFS: 最遠点 u からさらに最も遠い都市を見つける（＝直径）
_, diameter = bfs(u, graph, N)

print(diameter + 1)  # 直径 + 1 がスコアの最大値', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_c_solution_cpp', 'typical90_c', 'cpp', '#include <bits/stdc++.h>
using namespace std;

// BFS で start から各都市への距離を求め、最遠点と距離を返す
pair<int,int> bfs(int start, vector<vector<int>>& graph, int n) {
    vector<int> dist(n + 1, -1);  // 距離配列（-1 は未訪問）
    dist[start] = 0;              // スタート地点の距離は 0
    queue<int> q;
    q.push(start);                // キューにスタート地点を追加
    int farthest = start;         // 最遠点
    int max_dist = 0;             // 最遠距離

    while (!q.empty()) {
        int v = q.front(); q.pop();           // キューの先頭を取り出す
        for (int u : graph[v]) {              // 隣接都市を調べる
            if (dist[u] == -1) {             // 未訪問なら
                dist[u] = dist[v] + 1;       // 距離を記録
                q.push(u);
                if (dist[u] > max_dist) {    // より遠ければ更新
                    max_dist = dist[u];
                    farthest = u;
                }
            }
        }
    }
    return {farthest, max_dist};  // 最遠点と距離を返す
}

int main() {
    ios::sync_with_stdio(false);  // 高速入力
    cin.tie(nullptr);

    int N;
    cin >> N;                     // 都市の数

    vector<vector<int>> graph(N + 1);  // 隣接リスト（1-indexed）

    for (int i = 0; i < N - 1; i++) {
        int a, b;
        cin >> a >> b;            // 道路の両端
        graph[a].push_back(b);   // 双方向に追加
        graph[b].push_back(a);
    }

    // 1回目の BFS: 都市 1 から最遠点 u を探す
    auto [u, d1] = bfs(1, graph, N);

    // 2回目の BFS: u から最遠点までの距離 = 木の直径
    auto [v, diameter] = bfs(u, graph, N);

    cout << diameter + 1 << "\n";  // 直径 + 1 が答え
}', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_c_solution_typescript', 'typical90_c', 'typescript', 'import * as readline from ''readline'';

const rl = readline.createInterface({ input: process.stdin });
const lines: string[] = [];
rl.on(''line'', (line) => lines.push(line.trim()));
rl.on(''close'', () => {
    const N = parseInt(lines[0]);                              // 都市の数
    const graph: number[][] = Array.from({length: N + 1}, () => []);  // 隣接リスト

    for (let i = 1; i < N; i++) {
        const [a, b] = lines[i].split('' '').map(Number);       // 道路の両端
        graph[a].push(b);                                      // 双方向に追加
        graph[b].push(a);
    }

    // BFS で start から最遠点と距離を返す
    function bfs(start: number): [number, number] {
        const dist = new Array(N + 1).fill(-1);  // 距離配列
        dist[start] = 0;
        const q: number[] = [start];             // キュー（配列で代用）
        let qi = 0;                              // キューの読み取り位置
        let farthest = start;
        let maxDist = 0;

        while (qi < q.length) {
            const v = q[qi++];                   // キューの先頭を取り出す
            for (const u of graph[v]) {          // 隣接都市を調べる
                if (dist[u] === -1) {            // 未訪問なら
                    dist[u] = dist[v] + 1;       // 距離を記録
                    q.push(u);
                    if (dist[u] > maxDist) {     // より遠ければ更新
                        maxDist = dist[u];
                        farthest = u;
                    }
                }
            }
        }
        return [farthest, maxDist];
    }

    const [u] = bfs(1);              // 1回目: 都市 1 から最遠点 u を探す
    const [, diameter] = bfs(u);     // 2回目: u から直径を求める
    console.log(diameter + 1);       // 直径 + 1 が答え
});', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_c_solution_ruby', 'typical90_c', 'ruby', 'N = gets.to_i                              # 都市の数
graph = Array.new(N + 1) { [] }           # 隣接リスト（1-indexed）

(N - 1).times do
    a, b = gets.split.map(&:to_i)         # 道路の両端
    graph[a] << b                          # 双方向に追加
    graph[b] << a
end

# BFS で start から最遠点と距離を返す
def bfs(start, graph, n)
    dist = Array.new(n + 1, -1)           # 距離配列（-1 は未訪問）
    dist[start] = 0                        # スタート地点は 0
    q = [start]                            # BFS キュー
    farthest = start
    max_dist = 0

    until q.empty?
        v = q.shift                        # キューの先頭を取り出す
        graph[v].each do |u|
            if dist[u] == -1               # 未訪問なら
                dist[u] = dist[v] + 1      # 距離を記録
                q << u
                if dist[u] > max_dist      # より遠ければ更新
                    max_dist = dist[u]
                    farthest = u
                end
            end
        end
    end
    [farthest, max_dist]
end

u, _ = bfs(1, graph, N)           # 1回目: 都市 1 から最遠点 u を探す
_, diameter = bfs(u, graph, N)    # 2回目: u から直径を求める
puts diameter + 1                  # 直径 + 1 が答え', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_c_solution_php', 'typical90_c', 'php', '<?php
$N = (int)trim(fgets(STDIN));             // 都市の数
$graph = array_fill(0, $N + 1, []);       // 隣接リスト（1-indexed）

for ($i = 0; $i < $N - 1; $i++) {
    [$a, $b] = array_map(''intval'', explode('' '', trim(fgets(STDIN))));  // 道路の両端
    $graph[$a][] = $b;                    // 双方向に追加
    $graph[$b][] = $a;
}

// BFS で start から最遠点と距離を返す
function bfs($start, $graph, $n) {
    $dist = array_fill(0, $n + 1, -1);   // 距離配列（-1 は未訪問）
    $dist[$start] = 0;                    // スタート地点は 0
    $q = [$start];                        // BFS キュー
    $head = 0;                            // キューの読み取り位置
    $farthest = $start;
    $maxDist = 0;

    while ($head < count($q)) {
        $v = $q[$head++];                 // キューの先頭を取り出す
        foreach ($graph[$v] as $u) {
            if ($dist[$u] === -1) {       // 未訪問なら
                $dist[$u] = $dist[$v] + 1; // 距離を記録
                $q[] = $u;
                if ($dist[$u] > $maxDist) { // より遠ければ更新
                    $maxDist = $dist[$u];
                    $farthest = $u;
                }
            }
        }
    }
    return [$farthest, $maxDist];
}

[$u] = bfs(1, $graph, $N);              // 1回目: 都市 1 から最遠点 u を探す
[, $diameter] = bfs($u, $graph, $N);   // 2回目: u から直径を求める
echo $diameter + 1 . "\n";             // 直径 + 1 が答え', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_c_solution_rust', 'typical90_c', 'rust', 'use std::io::{self, BufRead, Write};
use std::collections::VecDeque;

// BFS で start から最遠点と距離を返す
fn bfs(start: usize, graph: &Vec<Vec<usize>>, n: usize) -> (usize, usize) {
    let mut dist = vec![usize::MAX; n + 1];  // 距離配列（MAX は未訪問）
    dist[start] = 0;                          // スタート地点は 0
    let mut q = VecDeque::new();
    q.push_back(start);
    let mut farthest = start;
    let mut max_dist = 0;

    while let Some(v) = q.pop_front() {      // キューの先頭を取り出す
        for &u in &graph[v] {               // 隣接都市を調べる
            if dist[u] == usize::MAX {      // 未訪問なら
                dist[u] = dist[v] + 1;     // 距離を記録
                q.push_back(u);
                if dist[u] > max_dist {    // より遠ければ更新
                    max_dist = dist[u];
                    farthest = u;
                }
            }
        }
    }
    (farthest, max_dist)
}

fn main() {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut out = io::BufWriter::new(stdout.lock());  // 出力バッファ

    let mut lines = stdin.lock().lines();
    let n: usize = lines.next().unwrap().unwrap().trim().parse().unwrap();  // 都市の数

    let mut graph = vec![vec![]; n + 1];  // 隣接リスト（1-indexed）

    for _ in 0..n - 1 {
        let line = lines.next().unwrap().unwrap();
        let mut iter = line.split_whitespace();
        let a: usize = iter.next().unwrap().parse().unwrap();  // 道路の一端
        let b: usize = iter.next().unwrap().parse().unwrap();  // 道路の他端
        graph[a].push(b);  // 双方向に追加
        graph[b].push(a);
    }

    let (u, _) = bfs(1, &graph, n);            // 1回目: 都市 1 から最遠点 u を探す
    let (_, diameter) = bfs(u, &graph, n);     // 2回目: u から直径を求める
    writeln!(out, "{}", diameter + 1).unwrap(); // 直径 + 1 が答え
}', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_c_solution_perl', 'typical90_c', 'perl', 'use strict;
use warnings;

my $N = int(<STDIN>);                       # 都市の数
my @graph = map { [] } (0..$N);             # 隣接リスト（1-indexed）

for (1..$N-1) {
    my ($a, $b) = split '' '', <STDIN>;       # 道路の両端
    push @{$graph[$a]}, $b;                 # 双方向に追加
    push @{$graph[$b]}, $a;
}

# BFS で start から最遠点と距離を返す
sub bfs {
    my ($start) = @_;
    my @dist = (-1) x ($N + 1);            # 距離配列（-1 は未訪問）
    $dist[$start] = 0;                      # スタート地点は 0
    my @q = ($start);                       # BFS キュー
    my ($farthest, $max_dist) = ($start, 0);

    while (@q) {
        my $v = shift @q;                   # キューの先頭を取り出す
        for my $u (@{$graph[$v]}) {         # 隣接都市を調べる
            if ($dist[$u] == -1) {          # 未訪問なら
                $dist[$u] = $dist[$v] + 1;  # 距離を記録
                push @q, $u;
                if ($dist[$u] > $max_dist) {# より遠ければ更新
                    $max_dist = $dist[$u];
                    $farthest = $u;
                }
            }
        }
    }
    return ($farthest, $max_dist);
}

my ($u) = bfs(1);                          # 1回目: 都市 1 から最遠点 u を探す
my (undef, $diameter) = bfs($u);           # 2回目: u から直径を求める
print $diameter + 1, "\n";                 # 直径 + 1 が答え', NULL);
INSERT OR REPLACE INTO bad_solutions (id, problem_id, language, label, code) VALUES ('typical90_c_bad_solution_python', 'typical90_c', 'python', 'O(N²) 全頂点BFS — 木の直径アルゴリズムを知らずに全頂点から探索', 'from collections import deque
import sys
input = sys.stdin.readline

N = int(input())
g = [[] for _ in range(N + 1)]
for _ in range(N - 1):
    a, b = map(int, input().split())
    g[a].append(b)
    g[b].append(a)

def bfs(s):
    d = [-1] * (N + 1)
    d[s] = 0
    q = deque([s])
    while q:
        v = q.popleft()
        for u in g[v]:
            if d[u] < 0:
                d[u] = d[v] + 1
                q.append(u)
    return d

ans = 0
# 全頂点からBFSしている → O(N²) でTLE
# 「木の直径」は端点からBFSを2回するだけで O(N) で求まる
for i in range(1, N + 1):
    ans = max(ans, max(bfs(i)[1:]))
print(ans + 1)');
INSERT OR REPLACE INTO problems (id, contest, problem_number, title, atcoder_url, difficulty, required_level, statement_md, constraints_md, constraints_note_md, statement_note_md, map_x, map_y, map_order, clear_reward_item_id, is_published, added_at, created_at, updated_at) VALUES ('typical90_d', '典型90問', '004', 'Cross Sum', 'https://atcoder.jp/contests/typical90/tasks/typical90_d', 2, 3, '$H$ 行 $W$ 列のマス目があります。上から $i$ $(1 \leq i \leq H)$ 行目、左から $j$ $(1 \leq j \leq W)$ 列目にあるマス $(i, j)$ には、整数 $A_{i,j}$ が書かれています。すべてのマス $(i, j)$ $(1 \leq i \leq H, 1 \leq j \leq W)$ について、以下の値を求めてください。

> マス $(i, j)$ と同じ行または同じ列にあるマス（自分自身を含む）に書かれている整数をすべて合計した値', '- $2 \leq H, W \leq 2000$
- $1 \leq A_{i,j} \leq 99$
- 入力は全て整数', '- `2 ≤ H, W ≤ 2000`：マスは最大 2000×2000 = **400万個**。
- 各マスごとに行・列を毎回足すと 400万 × 4000 = **160億回** の計算になり間に合わない。
- 先に行の合計・列の合計を計算しておけば、あとは足し算・引き算3回で1マスの答えが出る。', '## どんな問題？

H×W のマス目があって、各マスに数字が入っている。

各マス (i, j) について「同じ行にある全マスの合計 + 同じ列にある全マスの合計 − そのマス自身の値」を出力する。

たとえば 3×3 で全部1のマス目、マス(1,1)なら：行の合計3 + 列の合計3 − 自分1 = **5**。

---

## 全マスを毎回足し算すると遅い！

マス目は最大 2000×2000 = 400万個。各マスで行と列を毎回足すと何十億回も計算が必要で間に合わない。

そこで先に「各行の合計」「各列の合計」を計算して覚えておく（**前計算**）。

そうすれば各マスの答えは：

```
行の合計 + 列の合計 − そのマスの値
```

の 3 つの数字だけで出せる。', NULL, NULL, NULL, NULL, 1, '2026-05-22', '2026-07-09T04:39:46.638Z', '2026-07-09T04:39:46.638Z');
INSERT OR REPLACE INTO tags (id, name) VALUES ('累積和', '累積和');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_d', '累積和');
INSERT OR REPLACE INTO tags (id, name) VALUES ('配列', '配列');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_d', '配列');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_d_sample_1', 'typical90_d', 1, '3 3
1 1 1
1 1 1
1 1 1', '5 5 5
5 5 5
5 5 5', '**この入力の意味：** 3×3 のマス目で、全マスに 1 が書かれている。

マス $(1,1)$ と同じ行または列のマスは：

- 同じ行（1行目）：$(1,1), (1,2), (1,3)$ → 合計 $1+1+1=3$
- 同じ列（1列目）：$(1,1), (2,1), (3,1)$ → 合計 $1+1+1=3$
- **重複する $(1,1)$ は1回だけ数える** → $3+3-1=\mathbf{5}$

すべてのマスで同じ計算になるので、答えは全部 **5**。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_d_sample_2', 'typical90_d', 2, '4 4
3 1 4 1
5 9 2 6
5 3 5 8
9 7 9 3', '28 28 25 26
39 33 40 34
38 38 36 31
41 41 39 43', '**この入力の意味：** 4×4 のマス目で、それぞれのマスに数が書かれている。

マス $(1,1)$ の値は $3$。

- 1行目の合計：$3+1+4+1=9$
- 1列目の合計：$3+5+5+9=22$
- $(1,1)$ の値 $3$ は両方に含まれているので1回引く

$9+22-3=\mathbf{28}$ → 答えは **28**。

---');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_d_sample_3', 'typical90_d', 3, '2 10
31 41 59 26 53 58 97 93 23 84
62 64 33 83 27 95 2 88 41 97', '627 629 598 648 592 660 567 653 606 662
623 633 651 618 645 650 689 685 615 676', '');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_d_sample_4', 'typical90_d', 4, '10 10
83 86 77 65 93 85 86 92 99 71
62 77 90 59 63 76 90 76 72 86
61 68 67 79 82 80 62 73 67 85
79 52 72 58 69 67 93 56 61 92
79 73 71 69 84 87 98 74 65 70
63 76 91 80 56 73 62 70 96 81
55 75 84 77 86 55 96 79 63 57
74 95 82 95 64 67 84 64 93 50
87 58 76 78 88 84 53 51 54 99
82 60 76 68 89 62 76 86 94 89', '1479 1471 1546 1500 1518 1488 1551 1466 1502 1546
1414 1394 1447 1420 1462 1411 1461 1396 1443 1445
1388 1376 1443 1373 1416 1380 1462 1372 1421 1419
1345 1367 1413 1369 1404 1368 1406 1364 1402 1387
1416 1417 1485 1429 1460 1419 1472 1417 1469 1480
1410 1392 1443 1396 1466 1411 1486 1399 1416 1447
1397 1372 1429 1378 1415 1408 1431 1369 1428 1450
1419 1393 1472 1401 1478 1437 1484 1425 1439 1498
1366 1390 1438 1378 1414 1380 1475 1398 1438 1409
1425 1442 1492 1442 1467 1456 1506 1417 1452 1473', '');
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_d_solution_python', 'typical90_d', 'python', 'H, W = map(int, input().split())
A = [list(map(int, input().split())) for _ in range(H)]

# 行の合計
row = [sum(A[i]) for i in range(H)]

# 列の合計
col = [sum(A[i][j] for i in range(H)) for j in range(W)]

# 各マスの答えを出力
for i in range(H):
    print('' ''.join(str(row[i] + col[j] - A[i][j]) for j in range(W)))', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_d_solution_cpp', 'typical90_d', 'cpp', '#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);  // 高速入出力
    cin.tie(nullptr);

    int H, W;
    cin >> H >> W;

    vector<vector<int>> A(H, vector<int>(W));
    for (int i = 0; i < H; i++)
        for (int j = 0; j < W; j++)
            cin >> A[i][j];

    // 行の合計を計算
    vector<long long> row(H, 0);
    for (int i = 0; i < H; i++)
        for (int j = 0; j < W; j++)
            row[i] += A[i][j];

    // 列の合計を計算
    vector<long long> col(W, 0);
    for (int i = 0; i < H; i++)
        for (int j = 0; j < W; j++)
            col[j] += A[i][j];

    // 各マスの答えを出力
    for (int i = 0; i < H; i++) {
        for (int j = 0; j < W; j++) {
            if (j > 0) cout << '' '';
            cout << row[i] + col[j] - A[i][j];
        }
        cout << ''\n'';
    }
}', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_d_solution_typescript', 'typical90_d', 'typescript', 'import * as readline from ''readline'';

const rl = readline.createInterface({ input: process.stdin });
const lines: string[] = [];
rl.on(''line'', (line) => lines.push(line.trim()));
rl.on(''close'', () => {
  const [H, W] = lines[0].split('' '').map(Number);
  const A: number[][] = [];
  for (let i = 0; i < H; i++) {
    A.push(lines[i + 1].split('' '').map(Number));
  }

  // 行の合計
  const row = A.map((r) => r.reduce((s, v) => s + v, 0));

  // 列の合計
  const col = Array(W).fill(0);
  for (let i = 0; i < H; i++)
    for (let j = 0; j < W; j++)
      col[j] += A[i][j];

  // 各マスの答えを出力
  const out: string[] = [];
  for (let i = 0; i < H; i++) {
    const line: number[] = [];
    for (let j = 0; j < W; j++) {
      line.push(row[i] + col[j] - A[i][j]);
    }
    out.push(line.join('' ''));
  }
  console.log(out.join(''\n''));
});', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_d_solution_ruby', 'typical90_d', 'ruby', 'H, W = gets.split.map(&:to_i)
A = Array.new(H) { gets.split.map(&:to_i) }

row = A.map(&:sum)
col = Array.new(W, 0)
H.times { |i| W.times { |j| col[j] += A[i][j] } }

H.times do |i|
  puts (0...W).map { |j| row[i] + col[j] - A[i][j] }.join('' '')
end', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_d_solution_php', 'typical90_d', 'php', '<?php
[$H, $W] = array_map(''intval'', explode('' '', trim(fgets(STDIN))));
$A = [];
for ($i = 0; $i < $H; $i++) {
    $A[] = array_map(''intval'', explode('' '', trim(fgets(STDIN))));
}

$row = array_map(''array_sum'', $A);
$col = array_fill(0, $W, 0);
for ($i = 0; $i < $H; $i++)
    for ($j = 0; $j < $W; $j++)
        $col[$j] += $A[$i][$j];

for ($i = 0; $i < $H; $i++) {
    $line = [];
    for ($j = 0; $j < $W; $j++) {
        $line[] = $row[$i] + $col[$j] - $A[$i][$j];
    }
    echo implode('' '', $line) . "\n";
}', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_d_solution_rust', 'typical90_d', 'rust', 'use std::io::{self, Read, Write, BufWriter};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let stdout = io::stdout();
    let mut out = BufWriter::new(stdout.lock());

    let mut iter = input.split_ascii_whitespace();
    let h: usize = iter.next().unwrap().parse().unwrap();
    let w: usize = iter.next().unwrap().parse().unwrap();

    let mut a = vec![vec![0i64; w]; h];
    for i in 0..h {
        for j in 0..w {
            a[i][j] = iter.next().unwrap().parse().unwrap();
        }
    }

    let row: Vec<i64> = a.iter().map(|r| r.iter().sum()).collect();
    let mut col = vec![0i64; w];
    for i in 0..h {
        for j in 0..w {
            col[j] += a[i][j];
        }
    }

    for i in 0..h {
        for j in 0..w {
            if j > 0 { write!(out, " ").unwrap(); }
            write!(out, "{}", row[i] + col[j] - a[i][j]).unwrap();
        }
        writeln!(out).unwrap();
    }
}', NULL);
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_d_solution_perl', 'typical90_d', 'perl', 'use strict;
use warnings;

my ($H, $W) = split '' '', <STDIN>;
my @A;
for (0..$H-1) {
    push @A, [split '' '', <STDIN>];
}

my @row = map { my $r = $_; my $s = 0; $s += $_ for @$r; $s } @A;
my @col = (0) x $W;
for my $i (0..$H-1) {
    for my $j (0..$W-1) {
        $col[$j] += $A[$i][$j];
    }
}

for my $i (0..$H-1) {
    print join('' '', map { $row[$i] + $col[$_] - $A[$i][$_] } 0..$W-1) . "\n";
}', NULL);
INSERT OR REPLACE INTO bad_solutions (id, problem_id, language, label, code) VALUES ('typical90_d_bad_solution_python', 'typical90_d', 'python', 'O(HW(H+W)) 愚直解 — 各マスごとに行・列を毎回合計する', 'H, W = map(int, input().split())
A = [list(map(int, input().split())) for _ in range(H)]

for i in range(H):
    row = []
    for j in range(W):
        # sum(A[i]) → 毎回 W 回の足し算
        # sum(A[k][j]...) → 毎回 H 回の足し算
        # → 1マスにつき O(H+W) かかり、全体で O(HW(H+W)) → TLE
        # 先に行合計・列合計を計算しておけば O(HW) で済む
        s = sum(A[i]) + sum(A[k][j] for k in range(H)) - A[i][j]
        row.append(s)
    print('' ''.join(map(str, row)))');
INSERT OR REPLACE INTO problems (id, contest, problem_number, title, atcoder_url, difficulty, required_level, statement_md, constraints_md, constraints_note_md, statement_note_md, map_x, map_y, map_order, clear_reward_item_id, is_published, added_at, created_at, updated_at) VALUES ('typical90_e', '典型90問', '005', 'Restricted Digits', 'https://atcoder.jp/contests/typical90/tasks/typical90_e', 7, 13, '数字 $c_1, c_2, \ldots, c_K$ のみを使うことで作れる $N$ 桁の正の整数のうち $B$ の倍数であるものは何個あるでしょうか。$10^9+7$ で割った余りを求めてください。', '- $1 \leq K \leq 9$
- $1 \leq c_1 < c_2 < \cdots < c_K \leq 9$
- $1 \leq N \leq 10^{18}$
- $2 \leq B \leq 1000$
- 入力はすべて整数', '- `N ≤ 10^18`：N 桁の数を全部試すのは不可能。繰り返し二乗法で行列の N 乗を計算する。
- `B ≤ 1000`：余りは 0〜999 の最大1000種類。行列のサイズは 1000×1000。
- `K ≤ 9`：使える数字は最大 9 種類。遷移行列の各列は最大 9 か所しか 0 でない。
- 行列の掛け算を約60回くり返せば 10^18 でも答えが求まる。', '## どんな問題？

決まった数字（例：1, 4, 9）だけを使って N 桁の数を作る。その中で B の倍数は何個あるか数える。

N=3, B=7, 使える数字={1,4,9} なら：
- 作れる3桁の数は 3×3×3=27 通り
- その中で 7 の倍数は **119, 441, 994** の **3 個**

---

## 全部書き出すのは無理！

N が最大 10^18 のとき、作れる数は最大 9^(10億億) 通り。宇宙の原子の数よりはるかに多く、全部調べるのは絶対に無理。

---

## 「余り」だけ追いかけると速くなる！

今まで決めた桁を B で割った余りだけ覚えておく。

たとえば B=7、今の余りが 2 のとき、次に 4 を追加すると：

```
(2 × 10 + 4) % 7 = 24 % 7 = 3
```

→ 余りが 2 → 3 に変わる。どの余りにいるかだけ分かれば、前の桁の具体的な数字は覚えなくていい！

この「余りの変わり方」を表にすると、B×B のマス目（行列）になる。

---

## N が巨大なとき

「この行列を N-1 回かけると答えが出る」が、N=10^18 では 10^18 回かけるのは不可能。

**繰り返し二乗法**を使うと：
- 行列を2乗 → 2乗 → 2乗 … と 約60回 かけるだけで 10^18 乗が計算できる。

60回 × B×B の行列の掛け算 = 速く答えが出る。', NULL, NULL, NULL, NULL, 1, '2026-06-09', '2026-07-09T04:39:46.638Z', '2026-07-09T04:39:46.638Z');
INSERT OR REPLACE INTO tags (id, name) VALUES ('DP', 'DP');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_e', 'DP');
INSERT OR REPLACE INTO tags (id, name) VALUES ('行列累乗', '行列累乗');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_e', '行列累乗');
INSERT OR REPLACE INTO tags (id, name) VALUES ('余り', '余り');
INSERT OR REPLACE INTO problem_tags (problem_id, tag_id) VALUES ('typical90_e', '余り');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_e_sample_1', 'typical90_e', 1, '3 7 3
1 4 9', '3', '');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_e_sample_2', 'typical90_e', 2, '5 2 3
1 4 9', '81', '');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_e_sample_3', 'typical90_e', 3, '10000 27 7
1 3 4 6 7 8 9', '989112238', '');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_e_sample_4', 'typical90_e', 4, '1000000000000000000 29 6
1 2 4 5 7 9', '853993813', '');
INSERT OR REPLACE INTO samples (id, problem_id, position, input, output, explanation_md) VALUES ('typical90_e_sample_5', 'typical90_e', 5, '1000000000000000000 957 7
1 2 3 5 6 7 9', '205384995', '');
INSERT OR REPLACE INTO solutions (id, problem_id, language, code, steps_json) VALUES ('typical90_e_solution_python', 'typical90_e', 'python', 'import sys
input = sys.stdin.readline

MOD = 10**9 + 7  # 答えをこの数で割った余りを出す

def mat_mul(A, B, mod, size):
    """行列 A と B を掛け合わせる（mod を取りながら）"""
    C = [[0]*size for _ in range(size)]
    for i in range(size):
        for k in range(size):
            if A[i][k] == 0:  # 0 の場合は計算をスキップ
                continue
            for j in range(size):
                C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % mod
    return C

def mat_pow(M, p, mod, size):
    """行列 M の p 乗を繰り返し二乗法で計算する"""
    # 単位行列（掛けても変わらない行列）から始める
    result = [[1 if i == j else 0 for j in range(size)] for i in range(size)]
    while p > 0:
        if p & 1:  # p が奇数なら今の M を result に掛ける
            result = mat_mul(result, M, mod, size)
        M = mat_mul(M, M, mod, size)  # M を 2 乗する
        p >>= 1  # p を半分にする（右にビットシフト）
    return result

N, B, K = map(int, input().split())  # N 桁、B の倍数、K 種類の数字
digits = list(map(int, input().split()))  # 使える数字のリスト

# 遷移行列を作る
# T[r''][r] = 「余り r の数に桁 d を追加して余り r'' になる桁 d の個数」
T = [[0]*B for _ in range(B)]
for r in range(B):          # 今の余り r に対して
    for d in digits:        # 使える各桁 d を追加すると
        nr = (r * 10 + d) % B  # 新しい余りは nr
        T[nr][r] += 1

# 1桁のベクトルを作る
# v[r] = 「1桁で余りが r になる桁の個数」
v = [0] * B
for d in digits:
    v[d % B] += 1

if N == 1:
    print(v[0] % MOD)  # 1桁の場合はそのまま出力
else:
    TN = mat_pow(T, N - 1, MOD, B)  # 遷移行列の (N-1) 乗を計算
    ans = 0
    for j in range(B):
        # TN の 0 行目（余り 0 になる経路の数）と v の内積が答え
        ans = (ans + TN[0][j] * v[j]) % MOD
    print(ans)', NULL);
INSERT OR REPLACE INTO bad_solutions (id, problem_id, language, label, code) VALUES ('typical90_e_bad_solution_python', 'typical90_e', 'python', '', 'import sys
input = sys.stdin.readline

MOD = 10**9 + 7

N, B, K = map(int, input().split())
digits = list(map(int, input().split()))

# dp[r] = 今まで決めた桁で余りが r になる数の個数
dp = [0] * B
for d in digits:
    dp[d % B] += 1

# 1桁ずつ追加する ← N が最大 10^18 なのに 1 ずつループしている！
# N = 10^18 のとき、このループは 10^18 回まわる
# コンピューターでも何億年もかかってしまう（絶対に TLE）
for _ in range(N - 1):
    new_dp = [0] * B
    for r in range(B):
        if dp[r] == 0:
            continue
        for d in digits:
            nr = (r * 10 + d) % B
            new_dp[nr] = (new_dp[nr] + dp[r]) % MOD
    dp = new_dp

print(dp[0])');
INSERT OR REPLACE INTO glossary_entries (id, name, short, description_md, without_label, without_code, with_label, with_code, when_to_use_md) VALUES ('big_o', '計算量・O記法', 'プログラムの「速さ」を大まかに表す方法', 'プログラムが何回計算するかを、入力の大きさ（N）を使って表します。「O」は「だいたい〜回くらい」という意味です。

競プロでは「1秒間に約**1億回**の計算ができる」と考えます。

| 記法 | Nが2倍になると… | 例 |
|------|-----------------|----|
| O(N) | 計算回数も2倍 | 配列を1回なめる |
| O(N²) | 計算回数は4倍 | 全ペアを調べる |
| O(N log N) | ほんの少し増える | ソート |
| O(log N) | ほとんど変わらない | 二分探索 |

N = 100,000 のとき：
- O(N²) = **100億回** → 約100秒 → TLE（時間超過）
- O(N) = **10万回** → 0.001秒 → 余裕で間に合う', 'O(N²)：全ペアを調べる', '# N=100000 のとき100億回ループ → TLE
for i in range(N):
    for j in range(N):  # ← ここが問題。二重ループ
        if A[i] + A[j] == target:
            print(i, j)', 'O(N)：辞書を使って1回のループで解く', '# N=100000 のとき10万回ループ → 余裕
seen = set()
for i in range(N):
    if target - A[i] in seen:  # 辞書の検索は O(1)
        print("found")
    seen.add(A[i])', '答えを考えるとき、まず「この方法は何回計算するか？」を確認しよう。制約（N ≤ 100,000 など）を見て、どの計算量なら間に合うか判断する。');
INSERT OR REPLACE INTO glossary_entries (id, name, short, description_md, without_label, without_code, with_label, with_code, when_to_use_md) VALUES ('binary_search', '二分探索（バイナリサーチ）', '「真ん中を見て、答えのある方に絞る」をくり返して、高速に探す方法', '## 数当てゲームで体感しよう

**1〜10の数当てゲーム。答えは 7 だとする。**

### 全部試す場合

1？違う → 2？違う → 3？違う → 4？違う → 5？違う → 6？違う → **7？正解！**

→ **7回かかった**

### 二分探索の場合

1. 「**5** より大きい？」→ はい → 範囲が **6〜10** に絞れた
2. 「**8** より大きい？」→ いいえ → 範囲が **6〜8** に絞れた
3. 「**7** より大きい？」→ いいえ → 範囲が **6〜7** に絞れた
4. 「**6** と **7** どっち？」→ **7！正解！**

→ **4回で当てた！**

毎回「真ん中を確認 → 半分に絞る」をくり返す。  
10個 → 最大4回、100個 → 最大7回、**10億個 → 最大30回** で見つかる。

---

## プログラムでの使い方

競プロでは「答えそのものを二分探索する」ことが多い。

**ようかん問題の場合：**

「最小ピースを x cm 以上にできるか？」という質問を考える。

- x = 1 のとき → **できる**（簡単すぎる）
- x = 5 のとき → **できる**
- x = 13 のとき → **できる**
- x = 14 のとき → **できない**
- x = 20 のとき → **できない**

つまり「できる/できない」の境目が 1 か所だけある。
この**境目を二分探索**で探す！

```
「できる」「できる」「できる」「できない」「できない」
                             ↑
                          この境目を探す
```', '全部試す → x を 1 から L まで順番に確認（L が大きいと TLE）', '# L = 34 のとき、x = 1, 2, 3, ..., 34 と全部確認する
# L が最大10^9（10億）なら10億回ループ → 絶対TLE！
ans = 0
for x in range(1, L + 1):   # ← ここが問題。L が大きいと終わらない
    if ok(x):                # x cm 以上にできるか？
        ans = x
print(ans)  # → 13

# L=34 でさえ34回かかる。L=10^9 なら10億回。', '二分探索 → 約 30 回で答えが出る（L がいくら大きくても）', '# low = 「確実にできる」, high = 「確実にできない」
low, high = 0, L + 1   # low=0, high=35

while high - low > 1:  # 差が1になるまでくり返す
    mid = (low + high) // 2  # 真ん中を見る

    # 例: low=0, high=35 → mid=17
    # ok(17) → できない → high=17
    # low=0, high=17 → mid=8
    # ok(8)  → できる  → low=8
    # low=8, high=17 → mid=12
    # ok(12) → できる  → low=12
    # low=12, high=17 → mid=14
    # ok(14) → できない → high=14
    # low=12, high=14 → mid=13
    # ok(13) → できる  → low=13
    # low=13, high=14 → 差が1 → 終了！

    if ok(mid):
        low = mid
    else:
        high = mid

print(low)  # → 13', '「xが大きいほど難しくなる（または簡単になる）」という**単調性**があるとき。「最小ピースを最大にしたい」「最大コストを最小にしたい」という問題によく登場する。');
INSERT OR REPLACE INTO problem_glossary_links (problem_id, glossary_id) VALUES ('typical90_a', 'binary_search');
INSERT OR REPLACE INTO glossary_entries (id, name, short, description_md, without_label, without_code, with_label, with_code, when_to_use_md) VALUES ('greedy', '貪欲法（グリーディ）', '「今できる最善の選択」をその場で選び続ける方法。全部試さなくていい。', '## 具体例で考えよう

**ようかん 34cm、切れ目は [8, 13, 26]、1か所だけ切る。**
**「最小ピースを 13cm 以上にできるか？」を確認したい。**

---

### 全部の切り方を試す場合

- 8 で切る → ピース: 8, 26 → 最小 **8cm** → 13cm 未満 ✕
- 13 で切る → ピース: 13, 21 → 最小 **13cm** → 13cm 以上 ✓
- 26 で切る → ピース: 26, 8 → 最小 **8cm** → 13cm 未満 ✕

→ 切れ目が3か所なら3回試すだけ。でも**切れ目が10万か所**あったら？

---

### 貪欲法の場合

「左から見て、今切ったら条件を満たすなら、**すぐ切る**」というルールで決める。

```
前回切った位置 prev = 0

切れ目 8 を見る：
  ・8 - 0 = 8 cm → 13cm 未満 → まだ切らない

切れ目 13 を見る：
  ・13 - 0 = 13 cm → 13cm 以上 ✓
  ・34 - 13 = 21 cm → 13cm 以上 ✓
  → 切る！ cuts = 1, prev = 13

切れ目 26 を見る：（もう1回切れる場合）
  ...（今回は K=1 なので終わり）

cutsが1以上 → できる！
```

**1回左から見るだけで答えが出た！**

---

## なぜ「早めに切る」と正しい答えになるの？

「遅めに切る」より「早めに切る」ほど、**後ろにスペースが残る**から。

```
早めに切る: [13cm][21cm]  → 後ろが21cm、次の切り場所の選択肢が多い
遅めに切る: [26cm][ 8cm]  → 後ろが8cm、もう余裕がない
```

早めに切る選択は「後の自分に優しい」選択。だから最善になる。', '全ての切り方を試す → K が大きいと組み合わせ爆発でTLE', 'from itertools import combinations

# 切れ目 [8, 13, 26] から K=1 か所選ぶ全パターン
# → (8,), (13,), (26,) の3通り → これはまだいい
#
# でも切れ目が N=100000, K=3 なら
# C(100000, 3) ≈ 1660億通り → 絶対TLE！

A = [8, 13, 26]
L = 34
K = 1
x = 13
ans = False

for cuts in combinations(A, K):
    prev = 0
    ok = True
    for c in sorted(cuts):
        if c - prev < x:  # このピースが x 未満なら NG
            ok = False
        prev = c
    if L - prev < x:      # 最後のピースが x 未満なら NG
        ok = False
    if ok:
        ans = True

print(ans)  # → True', '貪欲法 → 左から1回なめるだけ O(N)、N=100000 でも余裕', '# 切れ目 [8, 13, 26]、L=34、K=1、x=13
A = [8, 13, 26]
L = 34
K = 1
x = 13

prev = 0   # 前回切った位置
cuts = 0   # 切った回数

for a in A:
    # このピース(a-prev)が x 以上 かつ 残り(L-a)も x 以上のとき切る
    if a - prev >= x and L - a >= x:
        cuts += 1   # 切る！
        prev = a    # 切った位置を更新

print(cuts >= K)  # → True（1回切れた）

# A を左から1回なめるだけ。N=100000 でも O(N) でOK！', '「早めに選ぶほど後が楽になる」パターンのとき。「全部試す」と遅すぎるが、「その場の最善」が全体の最善にもなることを証明（またはなんとなく納得）できるなら使える。');
INSERT OR REPLACE INTO problem_glossary_links (problem_id, glossary_id) VALUES ('typical90_a', 'greedy');
INSERT OR REPLACE INTO glossary_entries (id, name, short, description_md, without_label, without_code, with_label, with_code, when_to_use_md) VALUES ('recursion', '再帰・バックトラッキング', '関数が自分自身を呼び出して、問題を少しずつ小さくしていく方法', '**再帰の考え方**：「大きな問題を、同じ形の小さな問題に分ける」

例：「n段の階段の登り方は何通り？」
→ 「1段ずつ登る場合（n-1段の問題）」＋「2段まとめて登る場合（n-2段の問題）」
→ どちらも**同じ問題の小さいバージョン**！

**バックトラッキング**：「試してダメだったら戻る」探し方。
迷路を解くときに「行き止まりだったら1つ前に戻る」のと同じ。', '全文字列を生成してから判定 → O(2^(2N) × N)', 'from itertools import product
for n in range(1, N + 1):
    # 2^(2n) 通りの文字列を全部作ってから「正しいか」チェック
    # n=8 のとき 2^16 = 65536通り → まだ動くが無駄だらけ
    for bits in product(''()'', repeat=2*n):
        s = ''''.join(bits)
        if is_valid(s):  # 作ってから判定
            print(s)', '再帰で「正しい括弧列だけ」を構築 → O(カタラン数)', 'def solve(s, left, right, n):
    if left == 0 and right == 0:
        print(s)  # 完成！
        return
    if left > 0:           # まだ「(」を追加できる
        solve(s + ''('', left - 1, right, n)
    if right > left:       # 「)」を追加できる（open > close のとき）
        solve(s + '')'', left, right - 1, n)

for n in range(1, N + 1):
    solve('''', n, n, n)  # n個の「(」とn個の「)」を使う', '「選択肢を1つずつ選んで、条件を満たす組み合わせを全て列挙したい」とき。N が小さい（N ≤ 20 くらい）ときに有効。');
INSERT OR REPLACE INTO problem_glossary_links (problem_id, glossary_id) VALUES ('typical90_b', 'recursion');
INSERT OR REPLACE INTO glossary_entries (id, name, short, description_md, without_label, without_code, with_label, with_code, when_to_use_md) VALUES ('graph_tree', 'グラフ・木', '「点（ノード）」と「線（辺）」でつながりを表すデータ構造', '**グラフ**：点と線でつながりを表したもの。
- 例：路線図（駅＝点、線路＝辺）、SNSの友達関係

**木（tree）**：グラフの中でも特別なもの。
- 輪っか（サイクル）がない
- 全部の点がつながっている
- N個の点があるとき、辺はちょうど**N-1本**
- どの2点の間にも道が**ちょうど1本**だけ

**隣接リスト**：各点に「どの点とつながっているか」をリストで持つ。

```python
g = [[] for _ in range(N + 1)]  # g[i] = iとつながっている点のリスト
g[1].append(2)  # 1と2がつながっている
g[2].append(1)
```', '隣接行列（N×Nの表）→ メモリがN²かかる', '# N=100000 のとき 100000×100000 = 100億のメモリ → アウト
adj = [[0]*N for _ in range(N)]
adj[0][1] = 1
adj[1][0] = 1', '隣接リスト → メモリがO(N + 辺の数)で済む', '# N=100000 でも辺がN-1本なら O(N) のメモリ
g = [[] for _ in range(N + 1)]
for _ in range(N - 1):
    a, b = map(int, input().split())
    g[a].append(b)
    g[b].append(a)', '都市間の道路、友達のつながり、階層構造（親子関係）を扱うとき。');
INSERT OR REPLACE INTO problem_glossary_links (problem_id, glossary_id) VALUES ('typical90_c', 'graph_tree');
INSERT OR REPLACE INTO glossary_entries (id, name, short, description_md, without_label, without_code, with_label, with_code, when_to_use_md) VALUES ('bfs', 'BFS（幅優先探索）', '出発点から近い順に広がっていく探し方', '石を池に投げたときの**波紋**のように、出発点から近い順に調べていく。

**キュー（queue）**を使うのがポイント。
1. 出発点をキューに入れる
2. キューから取り出して、その隣をキューに追加
3. キューが空になるまで繰り返す

最短距離を求めるのに使える。グラフ上の全点への距離を O(N + 辺の数) で計算できる。', '全頂点からBFS → O(N²)', 'ans = 0
# 全頂点を出発点にしてBFS → N × O(N) = O(N²) → TLE
for i in range(1, N + 1):
    dist = bfs(i)                # 毎回O(N)かかる
    ans = max(ans, max(dist[1:]))', 'BFSを2回だけ → O(N)', 'from collections import deque

def bfs(start):
    dist = [-1] * (N + 1)
    dist[start] = 0
    q = deque([start])
    while q:
        v = q.popleft()
        for u in g[v]:
            if dist[u] < 0:      # まだ訪れていない
                dist[u] = dist[v] + 1
                q.append(u)
    return dist

# 1回目：適当な点(1番)からBFS
d1 = bfs(1)
u = d1.index(max(d1))  # 最も遠い点u
# 2回目：uからBFS
d2 = bfs(u)
print(max(d2) + 1)     # 直径 + 新しい辺1本', 'グラフ上での最短距離・最短経路を求めるとき。木の直径を求めるときも2回のBFSを使う。');
INSERT OR REPLACE INTO problem_glossary_links (problem_id, glossary_id) VALUES ('typical90_c', 'bfs');
INSERT OR REPLACE INTO glossary_entries (id, name, short, description_md, without_label, without_code, with_label, with_code, when_to_use_md) VALUES ('tree_diameter', '木の直径', '木の中で一番遠い2つの点の間の距離', '木の**直径（diameter）**とは、木に含まれるすべての2点ペアの中で、距離が最も長いもの。

**求め方（BFSを2回するだけ！）**
1. 適当な点sからBFSして、一番遠い点**u**を見つける
2. **u**からBFSして、一番遠い点**v**を見つける
3. **u〜v間の距離**が木の直径

なぜ2回で正しく求まるのかは数学的に証明できる。競プロでは「このアルゴリズムで正しい」と覚えておけばOK。', '全ペアの距離を計算 → O(N²)', 'ans = 0
# 全頂点を出発点にして最遠点を探す
# N=100000 のとき O(N²) = 100億回 → TLE
for i in range(1, N + 1):
    d = bfs(i)
    ans = max(ans, max(d[1:]))', 'BFS 2回で O(N)', '# 1回目：点1（どこでもいい）からBFS
d1 = bfs(1)
u = d1.index(max(d1[1:]), 1)  # 最遠点u

# 2回目：uからBFS
d2 = bfs(u)
diameter = max(d2[1:])         # 直径

# この問題では直径の道に辺を1本追加するので +1
print(diameter + 1)', '木構造で「最も遠い2点間の距離」を求めるとき。');
INSERT OR REPLACE INTO problem_glossary_links (problem_id, glossary_id) VALUES ('typical90_c', 'tree_diameter');
INSERT OR REPLACE INTO glossary_entries (id, name, short, description_md, without_label, without_code, with_label, with_code, when_to_use_md) VALUES ('precomputation', '前計算（累積和）', '同じ計算を何度もしないよう、先にまとめて計算しておく方法', '「クラス全員の点数の合計は？」を先生に何度も聞かれるとき：
- **毎回足す**：1回あたり N 回の計算 × Q回 = **N×Q 回**
- **先に計算しておく**：最初に1回 N 回の計算 → あとは答えを返すだけ = **N + Q 回**

N = Q = 100,000 のとき：
- 毎回計算 → **100億回** → TLE
- 前計算 → **20万回** → 余裕

**累積和（prefix sum）**はその応用で、「区間の合計」を O(1) で答えられるようにする。', '毎回合計を計算する → O(HW(H+W))', 'for i in range(H):
    for j in range(W):
        # 毎回この行を全部足す → O(W)
        row_sum = sum(A[i])
        # 毎回この列を全部足す → O(H)
        col_sum = sum(A[k][j] for k in range(H))
        # 合計 O(H+W) × HW マス = O(HW(H+W)) → TLE
        print(row_sum + col_sum - A[i][j])', '先に行・列の合計を計算 → O(HW)', '# 前計算：O(HW) で行の合計・列の合計を求める
row = [sum(A[i]) for i in range(H)]           # 各行の合計
col = [sum(A[i][j] for i in range(H))         # 各列の合計
       for j in range(W)]

# 各マスの答えを O(1) で計算
for i in range(H):
    print('' ''.join(
        str(row[i] + col[j] - A[i][j])  # A[i][j]は2回足されるので1回引く
        for j in range(W)
    ))', '「同じ部分の計算が何度も出てくる」とき。区間の合計・最大値・最小値など、クエリに何度も答える問題でよく使う。');
INSERT OR REPLACE INTO problem_glossary_links (problem_id, glossary_id) VALUES ('typical90_d', 'precomputation');
INSERT OR REPLACE INTO glossary_entries (id, name, short, description_md, without_label, without_code, with_label, with_code, when_to_use_md) VALUES ('check_function', '判定問題・チェック関数', '「答えがxのとき条件を満たせるか？」をYes/Noで答える関数に変換する考え方', '**難しい問題をシンプルな質問に変換する**

「最小のピースが最大になる切り方を求めよ」は難しい。でもこう変換すると：

> 「各ピースを**x cm以上**にしてK回切ることはできるか？」

これはYes/Noで答えられる。「できる」「できない」だけ考えればいい。

この**Yes/Noで答える小問題**のことを「**判定問題**」、判定する関数を「**チェック関数（ok関数）**」と呼ぶ。

---

**なぜ役に立つの？**

- xが小さい → 切りやすい（ほぼ必ず「できる」）
- xが大きい → 切りにくい（「できない」になる）

この「xが増えると難しくなる」という性質があれば、**二分探索**で最大のxを探せる！

チェック関数の中では、**貪欲法**（左から条件を満たしたらすぐ切る）を使うと速く判定できる。

**まとめ：**
```
難しい問題
  ↓ 変換
判定問題 ok(x)「x以上にできるか？」
  ↓ 使う
二分探索で最大のxを探す
  ↓ ok(x)の中では
貪欲法で高速に判定
```', '「どこで切ればいいか」を全通り試す → C(N,K)通りで天文学的に遅い', 'from itertools import combinations

A = [切れ目の位置リスト]  # 例: [8, 13, 26]
ans = 0

# N個の切れ目からK個選ぶ全パターンを試す
# N=100000, K=3 でも C(100000,3) ≈ 1.6億通り → TLE
for cuts in combinations(A, K):
    prev = 0
    pieces = []
    for c in sorted(cuts):
        pieces.append(c - prev)
        prev = c
    pieces.append(L - prev)
    ans = max(ans, min(pieces))  # 最小ピースを最大化

print(ans)', '「x以上にできるか？」判定に変換 → 二分探索＋貪欲でO(N log L)', 'def ok(x):  # 「各ピースをx以上にしてK回切れるか？」をYes/Noで答える
    cuts = 0
    prev = 0
    for a in A:
        # 貪欲：条件を満たす最初の場所でさっさと切る
        if a - prev >= x and L - a >= x:
            cuts += 1
            prev = a
    return cuts >= K  # K回切れたら「できる」

# あとは二分探索でok(x)=Trueになる最大のxを探すだけ
low, high = 0, L + 1
while high - low > 1:
    mid = (low + high) // 2
    if ok(mid):      # midでできる → もっと大きくできるかも
        low = mid
    else:            # midではできない → 小さくする
        high = mid
print(low)', '「最大値の最小化」「最小値の最大化」という問題のとき。「直接答えを求める」のが難しくても、「xのとき条件を満たすか？」という判定問題に変換できれば、二分探索と組み合わせて解ける。');
INSERT OR REPLACE INTO problem_glossary_links (problem_id, glossary_id) VALUES ('typical90_a', 'check_function');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('function_call', '() って何？', '道具を「使う」印', 'プログラムには「道具」（関数）がたくさんある。

道具の名前の後ろに `()` をつけると「この道具を今使う！」という意味になる。

| 書き方 | 意味 |
|--------|------|
| `int` | 変換できる道具の名前 |
| `int()` | 実際に変換する |
| `int("3")` | `"3"` を変換する → `3` |

`()` の中に渡すものを**引数**（ひきすう）という。道具に材料を渡すイメージ。', 'int("3")   # → 3
print("hello")  # → hello と表示される', '全言語共通のルール。C++・Java・Rustなどでも同じ。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('variable', '変数って何？', '数や文字に名前をつけた箱', '`N = 5` と書くと、`N` という名前の箱に `5` が入る。

あとで `N` と書くだけで中の値を取り出せる。

箱の中身はあとから変えられる（だから「変」数）。', 'N = 5
print(N)   # → 5
N = 10
print(N)   # → 10', '全言語共通の考え方。書き方は言語によって少し違う。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('input', 'input() — 入力をもらう', 'キーボードから1行受け取る', 'AtCoderでは問題の「入力」が自動的に渡される。

`input()` でその1行を**文字列**としてもらう。

もらえるのは**文字列**なので、計算するには数字に変換が必要。', 'line = input()   # "3 34" という文字列が入る
print(line)      # → 3 34', 'Pythonでは `input()`。C++では `cin >>`、Rubyでは `gets`。書き方は違うが「入力をもらう」考え方は全言語共通。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('int_conversion', 'int() — 数字に変換する', '文字を計算できる数字に変換する', 'コンピュータは `"3"`（文字の3）と `3`（数の3）を区別する。

`input()` でもらったものは**文字列**なので、足し算・引き算をするには `int()` で数字に変換する必要がある。

| 変換前 | 変換後 | 計算できる？ |
|--------|--------|-------------|
| `"3"` | `3` | ✕ → ✓ |
| `"34"` | `34` | ✕ → ✓ |', 'int("3")    # → 3
int("34")   # → 34

# 変換しないと足し算できない
"3" + "4"   # → "34"（文字がくっつくだけ）
3 + 4       # → 7（ちゃんと計算できる）', 'Pythonでは `int()`。C++では `stoi()`、Javaでは `Integer.parseInt()`。書き方は違う。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('split', '.split() — スペースで区切る', '「3 34」を ["3", "34"] に分ける', '1行に複数の数が並んでいるとき、スペースで切り分けてリストにする。

`"3 34".split()` → `["3", "34"]`

`.`（ドット）は「この文字列に対して」という意味。', 'line = "3 34"
parts = line.split()
print(parts)     # → [''3'', ''34'']
print(parts[0])  # → ''3''（1番目）
print(parts[1])  # → ''34''（2番目）', 'Pythonでは `.split()`。他の言語では調べてみよう。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('map', 'map() — まとめて変換する', 'リストの全要素に同じことをする', '`["3", "34"]` の全部を `int()` で変換したいとき、1個ずつ書くのは大変。

`map(int, リスト)` と書くと、リスト全部に `int()` を一気にかけられる。

`N, L = map(int, ...)` と書くと、変換した結果を `N` と `L` に同時に受け取れる。', '# 1個ずつ書く場合
parts = ["3", "34"]
N = int(parts[0])   # → 3
L = int(parts[1])   # → 34

# map を使うと1行で書ける
N, L = map(int, ["3", "34"])  # N=3, L=34', 'Pythonならではの書き方。他の言語では別の方法を使う。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('list', 'リスト — 複数の値をまとめる', '値を順番に並べた入れ物', '`[1, 2, 3]` のように `[]` で囲むとリストになる。

何番目の値かは `[0]` `[1]` ... と指定する（0から始まることに注意）。

`list()` は他のものをリストに変換する道具。', 'A = [8, 13, 26]
print(A[0])   # → 8（1番目）
print(A[1])   # → 13（2番目）
print(A[2])   # → 26（3番目）', '全言語に「リスト」や「配列」の概念はある。書き方は少し違う。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('def', 'def — 自分で道具を作る', '自分で関数（道具）を作る', '`def 名前(材料):` と書いて、その下に処理を書くと自分だけの道具が作れる。

作った道具は何度でも使いまわせる。

`return` で結果を外に渡す。', 'def tasu(a, b):   # a と b をもらって
    return a + b  # 足した結果を返す

print(tasu(3, 4))  # → 7
print(tasu(10, 20)) # → 30', '全言語に関数を作る仕組みはある。C++では `int tasu(int a, int b) { ... }` のように書く。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('return', 'return — 結果を返す', '道具の計算結果を外に渡す', '`def` で作った道具の中で `return 値` と書くと、その値が外に渡される。

`return` に達したらそこで道具の処理は終わる。', 'def check(x):
    if x > 10:
        return True   # ここで終わり
    return False      # x が 10 以下のとき

result = check(15)  # → True', '全言語共通の考え方。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('if_else', 'if / else — 条件で分ける', '条件によって動きを変える', '`if 条件:` の条件が正しければ上の処理、間違っていれば `else:` の処理が動く。

条件には `>` `<` `>=` `<=` `==`（等しい）`!=`（等しくない）などが使える。', 'x = 15
if x > 10:
    print("10より大きい")   # こっちが動く
else:
    print("10以下")', '全言語共通の考え方。書き方は少し違う。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('while', 'while — 条件が続く間くり返す', '条件が正しい間、ずっとくり返す', '`while 条件:` と書くと、条件が正しい間ずっと中の処理をくり返す。

条件が間違いになったら止まる。', 'n = 0
while n < 3:    # n が 3 未満の間くり返す
    print(n)    # → 0, 1, 2
    n += 1      # n を 1 増やす', '全言語共通の考え方。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('floor_div', '// — 整数で割る', '割り算の答えを整数にする（小数点以下切り捨て）', 'Pythonで `/` を使うと答えが小数になる。

整数の答えだけ欲しいときは `//` を使う。', '7 / 2    # → 3.5（小数）
7 // 2   # → 3（整数、切り捨て）

# 二分探索でよく使う
mid = (low + high) // 2', 'Pythonならではの書き方。C++では `/`（整数同士なら自動で整数）。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('print', 'print() — 出力する', '画面に表示する・AtCoderでは答えを出力する', 'AtCoderでは答えを `print()` で出力する。

`()` の中に表示したいものを入れる。', 'print(42)         # → 42
print("hello")    # → hello
print(1 + 2)      # → 3', 'Pythonでは `print()`。C++では `cout <<`、Rubyでは `puts`。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('for_loop', 'for — くり返す', 'リストや回数を指定してくり返す', 'リストの全要素や、決まった回数だけ同じ処理をくり返すときに使う。

`for 変数 in リスト:` と書くと、リストの要素を1つずつ取り出してくり返す。

回数で繰り返すときは `range(N)` を使う。`range(N)` は `0, 1, 2, ..., N-1` のリストのように動く。', '# リストの要素を順番に取り出す
A = [8, 13, 26]
for a in A:
    print(a)   # → 8, 13, 26 の順に表示

# 3回くり返す（0, 1, 2）
for i in range(3):
    print(i)   # → 0, 1, 2

# 1 から 5 まで
for i in range(1, 6):
    print(i)   # → 1, 2, 3, 4, 5', '全言語共通の考え方。C++では `for(int i=0; i<N; i++)` のように書く。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('compound_assign', '+= / -= — 自分に足す・引く', '変数の値を今の値をもとに変える', '`n += 1` は `n = n + 1` と同じ意味。今の値に 1 を足して、同じ変数に入れ直す。

カウンターを増やしたり、合計を積み上げるときによく使う。', 'cnt = 0
cnt += 1   # cnt = cnt + 1 と同じ → cnt は 1
cnt += 1   # → cnt は 2

total = 0
for x in [3, 5, 2]:
    total += x   # 合計を積み上げる → 3, 8, 10
print(total)  # → 10', '全言語共通。`*=`（掛ける）や `//=`（割る）も同様に使える。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('modulo', '% — 余りを求める', '割り算の余りを出す', '`a % b` で `a` を `b` で割ったときの余りが出る。

競プロでは「10^9+7 で割った余りを出力する」という問題が多い。答えがとても大きくなるとき、この余りだけ出せばよい。', '10 % 3   # → 1（10 ÷ 3 = 3 あまり 1）
7 % 7    # → 0（割り切れる）

# 偶数か奇数か判定
n = 4
if n % 2 == 0:
    print("偶数")  # → 偶数

# 大きい答えを mod で管理
ans = 123456789 * 987654321
print(ans % (10**9 + 7))  # → 余りだけ出す', '全言語共通。`%` を余り演算子という。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('len', 'len() — 個数を数える', 'リストや文字列の長さを返す', '`len(リスト)` でリストの要素数、`len(文字列)` で文字数が出る。

リストの最後のインデックスは `len(A) - 1`（0始まりなので）。', 'A = [8, 13, 26]
print(len(A))     # → 3（要素が3個）

s = "hello"
print(len(s))     # → 5（文字が5個）

# よく使う：最後の要素
print(A[len(A)-1])  # → 26', '全言語共通の考え方。C++では `A.size()`、Rustでは `A.len()`。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('min_max', 'min() / max() — 最小・最大を求める', '複数の値の中から一番小さい・大きいものを返す', '`min(a, b)` で小さい方、`max(a, b)` で大きい方が出る。

リストを渡して `min(A)` のようにも使える。

競プロでは「今の答えより小さければ更新する」ときによく使う。', 'print(min(3, 7))   # → 3
print(max(3, 7))   # → 7

A = [5, 2, 8, 1]
print(min(A))      # → 1
print(max(A))      # → 8

# 答えの更新によく使う
ans = 10**18  # とても大きい数で初期化
for x in A:
    ans = min(ans, x)  # 小さい方に更新
print(ans)  # → 1', '全言語共通の考え方。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('sorted_sort', 'sorted() / .sort() — 並び替える', 'リストの要素を小さい順（または大きい順）に並べる', '`sorted(A)` は並び替えた**新しいリスト**を返す（元のリストは変わらない）。

`A.sort()` は元のリストを直接並び替える（返り値はない）。

`reverse=True` を追加すると大きい順になる。', 'A = [5, 2, 8, 1]
B = sorted(A)      # → [1, 2, 5, 8]（A は変わらない）
print(A)           # → [5, 2, 8, 1]
print(B)           # → [1, 2, 5, 8]

A.sort()           # A を直接並び替える
print(A)           # → [1, 2, 5, 8]

A.sort(reverse=True)  # 大きい順
print(A)           # → [8, 5, 2, 1]', '全言語共通の考え方。C++では `sort(A.begin(), A.end())`。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('append', '.append() — リストに追加する', 'リストの末尾に要素を1つ追加する', '`A.append(値)` でリストの末尾に値を追加できる。

最初に空のリスト `[]` を作って、1つずつ追加していく使い方がよくある。', 'A = []
A.append(3)   # → [3]
A.append(7)   # → [3, 7]
A.append(1)   # → [3, 7, 1]
print(A)      # → [3, 7, 1]

# for ループと組み合わせる
B = []
for i in range(4):
    B.append(i * 2)  # 0, 2, 4, 6 を追加
print(B)  # → [0, 2, 4, 6]', '全言語共通の考え方。C++では `push_back()`。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('in_operator', 'in — 含まれているか確認する', 'リストや文字列の中に値があるか調べる', '`値 in リスト` で、そのリストに値が含まれていれば `True`、なければ `False` になる。

`if x in A:` のように `if` と組み合わせてよく使う。

`not in` で「含まれていなければ」という条件も書ける。', 'A = [1, 3, 5, 7]
print(3 in A)    # → True（3 は含まれる）
print(4 in A)    # → False（4 は含まれない）

# if と組み合わせる
if 3 in A:
    print("ある")  # → ある

# 文字列でも使える
s = "hello"
print("ell" in s)  # → True', '全言語共通の考え方。C++では `find()` や `count()` を使う。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('bool_values', 'True / False — 正しい・間違い', '条件の結果を表す2つの値', '`True`（正しい）と `False`（間違い）は、条件が成り立つかどうかを表す特別な値。

比較演算子（`>` `==` など）の結果は `True` か `False` になる。

関数が `return True` や `return False` を返すと、呼び出し元で `if` の条件として使える。', 'print(3 > 1)    # → True
print(3 < 1)    # → False
print(3 == 3)   # → True

# 関数が True/False を返す例
def is_even(n):
    return n % 2 == 0  # 偶数なら True

if is_even(4):
    print("偶数")  # → 偶数', '全言語共通の考え方。C++では `true` / `false`（小文字）。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('and_or_not', 'and / or / not — 条件を組み合わせる', '複数の条件を「かつ」「または」「否定」でつなぐ', '- `A and B`：A も B も正しいとき → `True`（両方満たす）
- `A or B`：A か B のどちらかが正しいとき → `True`
- `not A`：A が正しくないとき → `True`

`if a > 0 and b > 0:` のように複数の条件を一度に書けるのが便利。', 'x = 5
if x > 0 and x < 10:
    print("1以上9以下")  # → 1以上9以下

if x < 0 or x > 3:
    print("0以下か4以上")  # → 4以上なので表示される

if not x == 3:
    print("3ではない")  # → 3ではない', '全言語共通の考え方。C++では `&&`（and）、`||`（or）、`!`（not）。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('2d_list', '2次元リスト — 表形式のデータ', 'リストの中にリストを入れて「行×列」の表を作る', '`A[i][j]` で i 行目 j 列目の要素を取り出せる（どちらも 0 から始まる）。

グリッド（マス目）の問題でよく使う。

H 行 W 列の表を作るには `[[0]*W for _ in range(H)]` と書く。', '# 3×3 の表（リストの中にリスト）
A = [
    [1, 2, 3],   # 0行目
    [4, 5, 6],   # 1行目
    [7, 8, 9],   # 2行目
]
print(A[0][0])  # → 1（0行0列）
print(A[1][2])  # → 6（1行2列）

# 全部 0 の 3×4 表を作る
H, W = 3, 4
B = [[0]*W for _ in range(H)]
print(B[2][3])  # → 0', '全言語共通の考え方。C++では `vector<vector<int>>` や配列 `A[i][j]`。');
INSERT OR REPLACE INTO code_reading_entries (id, name, short, body_md, python_code, other_note) VALUES ('sum', 'sum() — 合計を求める', 'リストの全要素を足し合わせる', '`sum(リスト)` でリストの全要素の合計が一発で出る。

`for` ループで1つずつ足すのと同じだが、1行で書けてスッキリする。', 'A = [3, 5, 2, 8]
print(sum(A))   # → 18

# for ループで書くと同じ意味
total = 0
for x in A:
    total += x
print(total)    # → 18

# 行の合計（typical90_d でよく使う）
row = [1, 2, 3]
print(sum(row))  # → 6', '全言語共通の考え方。C++では `accumulate()` を使う。');
