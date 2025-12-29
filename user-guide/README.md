# RenderJPCV（ユーザー向け）

このリポジトリには「配布するCLI本体」と「ユーザーが作業するフォルダ（履歴書プロジェクト）」が混在しがちなので、役割を分けて説明します。

## 何がどこで動く？（混乱しやすいポイント）

- **開発/配布側（このリポジトリ）**: `render-jpcv` コマンドそのもの（テンプレ・CLIソース・ビルド成果物）
- **実行/作業側（あなたの履歴書フォルダ）**: `resume.yaml` を置いて `render-jpcv build` する場所
- `npx render-jpcv ...` を使う場合、CLIは一時ディレクトリへインストールされますが、**成果物（PDFなど）は「実行したカレントディレクトリ」側に出ます**。

## ユーザー用の標準ディレクトリ構成（おすすめ）

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

- `resume.yaml`: 通常運用の入力（編集するのは基本これ）
- `archive/`: 提出用スナップショット（`config.render_date` を元に作る）
- `.render-jpcv/`: ツール管理領域（テンプレのコピーなど）。消しても `init` で復元できます。

## このリポジトリに入っているサンプル

- `user-guide/sample-project/`
  - `resume.yaml` / `resume.pdf`
  - `resume-wareki.yaml` / `resume-wareki.pdf`（和暦表示のサンプル）
  - `archive/` 配下の `resume-YYYYMMDD(-N).yaml/pdf`

※サンプルは「YAMLとPDF」を見せる用途を優先し、`.render-jpcv/` は同梱していません。

## コマンド例

```
# 初期化（テンプレコピー + resume.yaml 生成/同期）
npx render-jpcv init

# PDF生成
npx render-jpcv build

# アーカイブ作成（archive/ に resume-YYYYMMDD(-N).yaml を作る）
npx render-jpcv archive

# アーカイブYAMLからPDF生成（PDFは入力YAMLと同じフォルダに出る）
npx render-jpcv build archive/resume-20251229.yaml
```
