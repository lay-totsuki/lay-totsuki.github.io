✅ README.md（画像管理用・完成版）
# Lay Website - Image Management Guide

## フォルダ構成



images/
└ illust/
└ original/
├ full/ ← 元画像（大きいサイズ）
└ thumb/ ← サムネ用（軽量）


※ fanart を使う場合も同じ構成で作成する

---

## ファイル命名ルール（推奨）
`YYYY-MM-内容.jpg`

例：
- `2026-02-live.jpg`
- `2026-02-stream.jpg`

理由：
- 日付順で並べやすい
- 探しやすい
- 被りにくい

---

## 画像追加手順（これだけ）

### ① full に元画像を入れる（大きい画像）
- Original：`images/illust/original/full/`
- Fanart：`images/illust/fanart/full/`
- Mini：`images/illust/mini/full/`

### ② thumb に縮小版を入れる（同じファイル名）
- Original：`images/illust/original/thumb/`
- Fanart：`images/illust/fanart/thumb/`
- Mini：`images/illust/mini/thumb/`

※ ファイル名は必ず full と同じにする

---

## ③ HTMLにカードを追加する（コピペ）

追加先：
- Original → `gallery-original.html` の `<div class="grid">` 内
- Fanart   → `gallery-fanart.html` の `<div class="grid">` 内
- Mini     → `gallery-mini.html` の `<div class="grid">` 内

テンプレ（Original例）：
```html
<a class="card" href="images/illust/original/full/2026-01-sample.jpg" data-caption="2026-01 / タイトル">
  <img src="images/illust/original/thumb/2026-01-sample.jpg" alt="2026-01 / タイトル">
  <div class="cardCaption">2026-01 / タイトル</div>
</a>
```

変更するのは：

* ファイル名
* 表示タイトル（caption/alt/text）

のみ。

---

## サムネ作成ルール（推奨）

* 横幅：600px前後
* 容量：150KB〜300KB以内
* 形式：jpg または png

---

## 公開前チェック

1. ブラウザで直接開けるか

* full：`https://lay.mocomoco.xyz/images/illust/original/full/ファイル名.jpg`
* thumb：`https://lay.mocomoco.xyz/images/illust/original/thumb/ファイル名.jpg`

2. ギャラリーに表示されるか

* `gallery-original.html` など

3. 404が出ていないか

注意：

* 大文字小文字はサーバーで区別される

  * ❌ `MaidGirl.jpg`
  * ⭕ `maidgirl.jpg`
* 拡張子を混在させない（jpgで統一推奨）

