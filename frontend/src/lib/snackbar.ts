/**
 * グローバルSnackBar通知用。
 * APIクライアントなどReact外から呼び出すためにモジュールレベルのハンドラを使用。
 */
export type SnackbarVariant = 'success' | 'error';

type SnackbarHandler = (message: string, variant: SnackbarVariant) => void;

let handler: SnackbarHandler | null = null;

export function setSnackbarHandler(fn: SnackbarHandler | null) {
  handler = fn;
}

export function showSnackbar(message: string, variant: SnackbarVariant) {
  handler?.(message, variant);
}
