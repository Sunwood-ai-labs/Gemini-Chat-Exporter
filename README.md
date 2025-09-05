<div align="center">

![](https://github.com/user-attachments/assets/1e220090-2581-4f6b-b3ef-78c9bb4da759)

<h1 align="center">Gemini Sheets Exporter</h1>

<p align="center">
  Gemini とチャットして会話を CSV および Google Sheets にエクスポートします。このリポジトリは `gemini-sheets-exporter` という名前です。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

</div>

アプリを AI Studio で表示: https://ai.studio/apps/drive/1AxEk89BtPKLB3Jj75rOqxTED-Yfc_5-m

## 🚀 ローカルで実行

**前提条件:** Node.js

1. 依存関係をインストール:
    `npm install`
2. `.env` で環境変数を設定:
    - `VITE_GOOGLE_CLIENT_ID` — あなたの Google OAuth クライアント ID (ブラウザ向け安全)。
    - `GEMINI_API_KEY` — あなたの Gemini API キー (オプション、チャットがローカルで動作する場合)。
3. アプリを実行:
    `npm run dev`

注意事項:
- Google `client_secret` をクライアントサイドアプリに置かないでください。ブラウザに決して公開しないようにしてください。このアプリは Google Identity Services (token client) を使用し、フロントエンドでクライアント ID のみが必要です。

## 📊 Google Sheets へエクスポート

- `VITE_GOOGLE_CLIENT_ID` を使用して設定から Google アカウントを接続 (歯車アイコン)。
- 現在の会話をエクスポートするには "スプレッドシートに保存" をクリック。
- 初回エクスポート時に、Drive に "Gemini Sheets Exporter" という名前のスプレッドシートと "Conversations" シートが作成され、次回から再利用されます (ログイン中のメールごと)。
- 必要なスコープ: `https://www.googleapis.com/auth/spreadsheets` 

## 🔍 使用方法

1. ローカルでアプリを実行。
2. Gemini とチャット。
3. 会話を CSV または Google Sheets にエクスポート。

> 注意: スクリーンショットや詳しいガイドは適宜追加予定。

## 📚 ドキュメント

- [インストール手順](README.md#ローカルで実行)
- [エクスポート方法](README.md#google-sheets-へエクスポート)

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下でリリースされています。
