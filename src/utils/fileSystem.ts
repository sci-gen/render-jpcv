import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * ディレクトリが存在しない場合に作成します（再帰的）。
 * @param dirPath ディレクトリパス
 */
export function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * ファイルが存在しない場合のみ作成します。
 * @param filePath ファイルパス
 * @param content 書き込む内容
 */
export function createFileIfNotExists(filePath: string, content: string): void {
    if (!fs.existsSync(filePath)) {
        ensureDirectoryExists(path.dirname(filePath));
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

/**
 * ファイルをコピーします。コピー先のディレクトリがない場合は作成します。
 * @param src 元ファイルのパス
 * @param dest 先ファイルのパス
 */
export function copyFile(src: string, dest: string): void {
    if (!fs.existsSync(src)) {
        throw new Error(`Source file not found: ${src}`);
    }
    ensureDirectoryExists(path.dirname(dest));
    fs.copyFileSync(src, dest);
}

/**
 * 指定されたファイルパスのファイルが存在するか確認します。
 */
export function exists(filePath: string): boolean {
    return fs.existsSync(filePath);
}

/**
 * 現在のワークスペースのルートパスを取得します。
 * ワークスペースが開かれていない場合は undefined を返します。
 */
export function getWorkspaceRoot(): string | undefined {
    return vscode.workspace.workspaceFolders?.[0].uri.fsPath;
}