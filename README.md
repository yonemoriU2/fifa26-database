# FC26 Scout Database Prototype

React + Vite + TypeScript + shadcn/ui で作成した、EA SPORTS FC 26向けの選手検索プロトタイプです。

## 現在の状態

- FC 26選手データ: **18,405人**
- 13個のJSONチャンクに分割してGitHub Pagesから読み込み
- 1ページ100人で表示し、大量データでもDOMを肥大化させない構成
- React + Vite + TypeScript
- shadcn/uiベース
- GitHub Pages向けGitHub Actions設定済み

## 機能

- 選手名 / フルネーム / クラブ / 国籍 / リーグの検索
- ポジション絞り込み
- 年齢レンジ
- OVRレンジ
- POTレンジ
- クラブ / リーグ / 国籍フィルター
- OVR / POT / 年齢 / 市場価値ソート
- 100件単位のページング
- 選手顔画像表示
- 選手クリックで詳細パネル表示
- OVR / POT / PAC / SHO / PAS / DRI / DEF / PHY
- 身長 / 体重 / 利き足 / 弱い足 / スキルムーブ
- 市場価値 / 週給
- レスポンシブ表示

## データ

実データは以下に格納しています。

```
public/data/
  players-00.json
  players-01.json
  ...
  players-12.json
```

ブラウザ側では `src/data/load-players.ts` が13ファイルを並列ロードして、UI用の `Player` 型へ正規化します。

### データソース

FC 26属性データは、公開プロジェクト
`thompgt/fc26-player-analysis` の `players_fc26_clean.csv` を基に、検索UI用の軽量JSONへ変換しています。

同プロジェクトでは元データとして Kaggle の
`rovnez/fc-26-fifa-26-player-data` を使用しており、README上で **CC-BY licensed dataset** と記載されています。

このリポジトリはEA公式データ配布物ではありません。選手評価値はゲーム更新などで変わる可能性があります。

## 起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## GitHub Pages

`.github/workflows/deploy-pages.yml` を同梱しています。

GitHubのリポジトリ設定で Pages の Source を **GitHub Actions** に設定すると、
`main` ブランチへのpushをトリガーにビルド・デプロイされます。

Viteの `base` は `./` にしてあるため、GitHub Pagesのリポジトリ配下URLでも
`data/players-XX.json` を相対パスで読み込めます。

## 主な構成

```
src/
  App.tsx
  components/
    player-detail.tsx
    stat-card.tsx
    ui/
  data/
    load-players.ts
    players.ts        # 初期プロトタイプ用モック。現在の画面では未使用
  types/
    player.ts

public/
  data/
    players-00.json
    ...
    players-12.json
```
