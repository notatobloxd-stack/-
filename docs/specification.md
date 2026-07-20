# BloxdTool 仕様書

Version: 1.0.0  
Status: Draft

---

# プロジェクト概要

BloxdTool は Bloxd.io 用の便利ツールです。

目的は、プレイヤーがゲーム内の情報を効率よく管理・計算できるようにすることです。

---

# 開発目標

- 高速
- 正確
- シンプル
- スマホ対応
- GitHub Pages対応
- PWA対応

---

# 機能一覧

## Phase 1

### 名札座標推定

測定した距離からプレイヤーの位置を推定する。

### 地図表示

Canvasを利用して測定結果を表示する。

---

## Phase 2

### クラフト素材計算機

必要アイテム数から素材数を自動計算する。

---

## Phase 3

### データ保存

ローカル保存

JSON保存

JSON読み込み

---

## Phase 4

PWA対応

オフライン利用

---

# フォルダ構成

```
BloxdTool/

index.html
style.css

js/
    app.js
    solver.js
    map.js
    storage.js

assets/
data/
docs/
```

---

# solver.js

## 入力

```
measurements = [

    {
        x,
        z,
        distance
    }

]
```

最低2件以上必要。

---

## 出力

```
{

    x,

    z,

    confidence,

    averageError,

    maxError,

    measurements,

    searchTime,

    candidates

}
```

---

# 探索アルゴリズム

探索は4段階で行う。

```
100m

↓

20m

↓

5m

↓

1m
```

最後に誤差が最小の座標を採用する。

---

# 誤差計算

```
error =

|計算距離 - 測定距離|
```

全測定の誤差を合計する。

---

# 重み付け

誤差が少ない測定ほど重要。

探索が進むにつれて重みを更新する。

---

# 信頼度

信頼度は100点満点。

計算に使用する要素

- 平均誤差
- 最大誤差
- 測定回数

---

# map.js

Canvas API を利用する。

表示する内容

- グリッド
- 測定地点
- 距離円
- 推定地点
- 将来的にヒートマップ

---

# app.js

担当

- UI
- ボタン
- 入力
- solver.js呼び出し
- map.js呼び出し

計算は行わない。

---

# storage.js

担当

- LocalStorage
- JSON保存
- JSON読み込み

---

# コーディングルール

- ES6+
- const優先
- let最小限
- strict mode
- コメントを付ける
- HTML操作と計算を分離する

---

# バージョン

## v0.1

HTML

CSS

## v0.2

UI

Canvas

## v0.3

Solver

## v0.4

Storage

## v0.5

Craft Calculator

## v1.0

正式版
