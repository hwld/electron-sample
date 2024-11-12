# 概要

Electronを試すためのリポジトリ  
MacOS以外だと動かない

Electron Forge + viteを使用していたのだが、本番環境でprismaのmigrateが動かず、調べてもよくわからなかったため諦めている。

本番環境で`fork`を使って`prisma migrate`を実行したかったのだが、`child_node.fork`を使うと無限にプロセスが生成されてしまい、`utilityProcess.fork`を使うとコマンドが終了してもexitイベントが発行されずにプロセスが終了してくれなかった。
