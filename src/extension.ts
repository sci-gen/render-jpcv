import * as vscode from 'vscode';
import { initCommand } from './commands/init';
import { triggerPreview } from './commands/preview';

export function activate(context: vscode.ExtensionContext) {
    console.log('RenderJPCV is now active!');

    // 1. 初期化コマンド (RenderJPCV: Init)
    let initDisposable = vscode.commands.registerCommand('render-jpcv.init', () => {
        initCommand(context);
    });

    // 2. プレビューコマンド (手動用)
    let previewDisposable = vscode.commands.registerCommand('render-jpcv.preview', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            triggerPreview(editor.document.uri);
        }
    });

    // 3. 自動プレビュー検知
    // resume.yaml がアクティブになったら、裏で .render-jpcv/template.typ のプレビューを更新する
    let changeEditorDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.fileName.endsWith('resume.yaml')) {
            triggerPreview(editor.document.uri);
        }
    });

    context.subscriptions.push(initDisposable);
    context.subscriptions.push(previewDisposable);
    context.subscriptions.push(changeEditorDisposable);
}

export function deactivate() {}