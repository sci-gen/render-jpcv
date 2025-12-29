import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { triggerPreview } from './preview';

export async function initCommand(context: vscode.ExtensionContext) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('RenderJPCV: フォルダを開いてから実行してください。');
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const hiddenDir = path.join(rootPath, '.render-jpcv');
    const yamlPath = path.join(rootPath, 'resume.yaml');
    
    // assetsフォルダのパス (拡張機能インストール先/assets)
    const assetsDir = path.join(context.extensionPath, 'assets');
    const templateSource = path.join(assetsDir, 'template.typ');

    try {
        // 1. .render-jpcv フォルダ作成
        if (!fs.existsSync(hiddenDir)) {
            fs.mkdirSync(hiddenDir);
        }

        // 2. template.typ をコピー (上書き)
        const templateDest = path.join(hiddenDir, 'template.typ');
        if (fs.existsSync(templateSource)) {
            fs.copyFileSync(templateSource, templateDest);
        } else {
            vscode.window.showErrorMessage(`Template source not found at ${templateSource}`);
            return;
        }

        // 3. resume.yaml 作成 (存在しない場合のみデフォルト値を書き込む)
        if (!fs.existsSync(yamlPath)) {
            // シンプルな初期データ
            const defaultYaml = `config:\n  font_size: 11pt\nprofile:\n  name: 氏名を入力\n  name_kana: しめい\n  birthday: 2000-01-01\n  address: 東京都千代田区\n`;
            fs.writeFileSync(yamlPath, defaultYaml, 'utf8');
        }

        // 4. .gitignore 設定
        const gitignorePath = path.join(rootPath, '.gitignore');
        const ignoreContent = '\n# RenderJPCV\n.render-jpcv/\n*.pdf\n';
        if (fs.existsSync(gitignorePath)) {
            const currentContent = fs.readFileSync(gitignorePath, 'utf8');
            if (!currentContent.includes('.render-jpcv/')) {
                fs.appendFileSync(gitignorePath, ignoreContent);
            }
        } else {
            fs.writeFileSync(gitignorePath, ignoreContent);
        }

        // 5. VS Code設定 (.vscode/settings.json) で .typ を隠す
        const vscodeDir = path.join(rootPath, '.vscode');
        if (!fs.existsSync(vscodeDir)) fs.mkdirSync(vscodeDir);
        
        const settingsPath = path.join(vscodeDir, 'settings.json');
        let settings: any = {};
        if (fs.existsSync(settingsPath)) {
            try {
                settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            } catch (e) {}
        }
        
        // files.exclude の更新
        if (!settings['files.exclude']) settings['files.exclude'] = {};
        settings['files.exclude']['**/.render-jpcv'] = true; // 隠しフォルダごと隠す
        settings['files.exclude']['**/*.typ'] = true;        // typファイルを隠す
        
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        vscode.window.showInformationMessage('RenderJPCV: プロジェクトを作成しました！');

        // 6. resume.yaml を開いてプレビュー開始
        const doc = await vscode.workspace.openTextDocument(yamlPath);
        await vscode.window.showTextDocument(doc);
        triggerPreview(vscode.Uri.file(yamlPath));

    } catch (error) {
        vscode.window.showErrorMessage(`RenderJPCV Error: ${error}`);
        console.error(error);
    }
}