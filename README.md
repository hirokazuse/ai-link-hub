# ai-link-hub

## 起動方法

`data.json` を `fetch` で読み込む構成のため、`index.html` を `file://` で直接開くとCORSエラーになる。
簡易HTTPサーバー経由で起動すること。

### Python の場合

```bash
cd /Users/seritahirokazu/projects/apps/ai-link-hub
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/index.html` を開く。

### Node.js の場合

```bash
npx serve .
```

表示されたURL（例: `http://localhost:3000`）にアクセス。

## 構成ファイル

- `index.html` - メイン画面
- `app.js` - ロジック
- `data.json` - 読み込みデータ
