import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export async function triggerPreview(documentUri: vscode.Uri) {
    // 開いているファイルが resume.yaml でなければ無視
    if (!documentUri.fsPath.endsWith('resume.yaml')) {
        return;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
    if (!workspaceFolder) return;

    // 隠されているテンプレートのパスを構築
    // .render-jpcv/template.typ
    const hiddenTemplatePath = path.join(workspaceFolder.uri.fsPath, '.render-jpcv', 'template.typ');

    if (fs.existsSync(hiddenTemplatePath)) {
        const templateUri = vscode.Uri.file(hiddenTemplatePath);
        
        // Tinymist拡張機能のプレビューコマンドを実行
        // side: 横に表示, preserveFocus: エディタからフォーカスを奪わない
        try {
            await vscode.commands.executeCommand('tinymist.showPreview', templateUri, {
                side: vscode.ViewColumn.Beside,
                preserveFocus: true
            });
        } catch (e) {
            // Tinymistが入っていない場合などのエラーハンドリング
            console.warn('Tinymist preview command failed. Is Tinymist installed?', e);
        }
    }
}