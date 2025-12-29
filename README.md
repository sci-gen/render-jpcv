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

## サンプル

以下は `user-guide/sample-project/resume.yaml` と同様の入力例（アルバイト向けの抜粋）です。ファイル全体は `user-guide/sample-project/resume-parttime.yaml` を参照してください。

```yaml
config:
	year_style: seireki
	render_date: 2025-12-29

profile:
	name: 佐藤 花子
	name_kana: サトウ ハナコ
	birthday: 2004-07-15
	age: 21
	gender: 女
	address: 東京都渋谷区1-2-3
	phone: 080-9876-5432
	email: hanako.sato@example.com

education:
	- date: 2020-04
		event: 〇〇大学 短期大学部 入学

work:
	- date: 2023-08
		event: コンビニエンスストア アルバイト（レジ・品出し）

motivation: |
	学業と両立しながら接客経験を積みたいと考え、御社の募集に応募しました。
```

下はこの CLI で生成した履歴書のサンプルイメージ（PDF をスクリーンショット化したものの例）です。

![アルバイト向けサンプル履歴書](user-guide/sample-project/resume-parttime.svg)

## ライセンス

MIT License
