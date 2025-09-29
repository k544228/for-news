#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=".claude-mcp/backups/$DATE"

mkdir -p "$BACKUP_DIR"

# 備份重要文件
cp -r src/ "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp package-lock.json "$BACKUP_DIR/"
cp tsconfig.json "$BACKUP_DIR/"
cp .claude-mcp/dev-log.db "$BACKUP_DIR/"

echo "備份完成：$BACKUP_DIR"
