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

## ファイル命名ルール（必須）



YYYY-MM-内容.jpg


### 例


2026-02-live.jpg
2026-02-stream.jpg


### ルール理由
- 日付順で自動ソートされる
- 探しやすい
- 被りにくい

---

## 画像追加手順（これだけやればOK）

### ① full に元画像を入れる


images/illust/original/full/


### ② thumb に縮小版を入れる（同じ名前）


images/illust/original/thumb/


※ ファイル名は必ず full と同じにする

---

### ③ gallery.html のテンプレをコピペ

gallery.html の `<div class="grid">` 内に以下をコピペして編集：

```html
<a class="card" href="images/illust/original/full/2026-01-sample.jpg" data-caption="2026-01 / タイトル">
  <img src="images/illust/original/thumb/2026-01-sample.jpg" alt="2026-01 / タイトル">
  <div class="cardCaption">2026-01 / タイトル</div>
</a>
```

変更するのは：

ファイル名

表示タイトル

のみ。

サムネイル作成ルール（推奨）

横幅：600px前後

容量：150KB〜300KB以内

形式：jpg または png

公開前チェック

必ず以下を確認：

ブラウザで直接開けるか

https://lay.mocomoco.xyz/images/illust/original/full/ファイル名.jpg
https://lay.mocomoco.xyz/images/illust/original/thumb/ファイル名.jpg


gallery.html に表示されるか

404が出ていないか

注意

大文字小文字はサーバーで区別される
❌ MaidGirl.jpg
⭕ maidgirl.jpg

拡張子を混在させない（jpgで統一推奨）

更新履歴

初期作成：テンプレ運用方式導入

