# RenderJPCV アーキテクチャ（CLI版）

このリポジトリは **Node.js CLI（npx / npm install）** として履歴書PDFを生成します。

## 1) このリポジトリ（配布するもの）

```
renderJPCV/
  package.json
  tsconfig.json
  src/
    cli.ts        # init/build/archive コマンド
    compiler.ts   # Typstコンパイル（PDF生成）
  assets/
    template.typ
    build-info.typ
    era.typ
  bin/
    cli.js        # npm の bin エントリ（shebangつき）
  lib/            # tsc の出力（公開/実行に必要）
```

- `bin/cli.js` が `lib/cli.js` を起動します。
- `assets/` は `init` 実行時に、ユーザー側の `.render-jpcv/` にコピーされます。

## 2) ユーザーの作業フォルダ（履歴書プロジェクト）

ユーザーが `render-jpcv` を実行するディレクトリです。

```
MyResume/
  resume.yaml
  resume.pdf
  archive/
    resume-YYYYMMDD.yaml
    resume-YYYYMMDD.pdf
  .render-jpcv/
    template.typ
    build-info.typ
    era.typ
```

- `resume.yaml`: 通常運用の入力
- `archive/`: 提出用スナップショット（`config.render_date` を元に生成）
- `.render-jpcv/`: ツール管理領域（消しても `init` で復元可能）

## 3) このリポジトリ内のユーザー説明用サンプル

`user-guide/` は「ユーザー説明・サンプル置き場」です。

- `user-guide/sample-project/` に `resume.yaml` と生成済みPDF/アーカイブの例を置きます。

## 4) 生成物（基本的に消してOK）

このリポジトリ直下に以下がある場合、**開発時に生成された一時ファイル**であることが多いです。

- `.render-jpcv/`（リポジトリ直下にあるもの）
- `archive/`（リポジトリ直下にあるもの）
- `resume*.pdf` / `resume-*.yaml`（リポジトリ直下にあるもの）
- `render-jpcv-*.tgz`（`npm pack` の成果物）

必要なら `user-guide/` 側に移して残すのがおすすめです。
