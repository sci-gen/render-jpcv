# RenderJPCV

YAML + Typst で JIS様式の履歴書PDFを生成する Node.js CLI です。

## 使い方（npx）

### 1) 初期化

作業用フォルダで以下を実行します。

```
npx render-jpcv init
```

生成されるもの:

- `resume.yaml`（あなたが編集する入力）
- `.render-jpcv/`（テンプレ・ビルド情報など）

### 2) PDF生成

```
npx render-jpcv build
```

### 3) アーカイブ運用（archive/ フォルダに保存）

`resume.yaml` の `config.render_date`（例: `2025-12-29`）を元に、提出用スナップショットを作ります。

```
npx render-jpcv archive
npx render-jpcv build archive/resume-20251229.yaml
```

同じ日付が既にある場合は `-2`, `-3`… が付きます（例: `archive/resume-20251229-2.yaml`）。

## 使い方（インストール後）

### グローバルインストール

```
npm i -g render-jpcv
render-jpcv init
render-jpcv build
```

### プロジェクトローカルにインストール

```
npm i -D render-jpcv
npx render-jpcv init
npx render-jpcv build
```

## 出力の仕様

- `build`（引数なし）: ルートに `resume.pdf`
- `build archive/...yaml`: 入力YAMLと同じフォルダにPDF（例: `archive/resume-...pdf`）

## 必要要件

- Node.js 18+

## ライセンス

MIT License
