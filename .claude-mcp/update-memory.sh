#!/bin/bash

# FOR-NEWS 記憶系統更新腳本

echo "📝 更新FOR-NEWS記憶系統..."

# 獲取最新的Git commit信息
LATEST_COMMIT=$(git log -1 --format="%H %s" 2>/dev/null || echo "無Git信息")
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# 更新memory-system.json中的lastUpdated時間
sed -i "s/\"lastUpdated\": \".*\"/\"lastUpdated\": \"$CURRENT_DATE\"/" .claude-mcp/memory-system.json

# 添加最新的commit到開發歷史
cat > .claude-mcp/latest-update.json << EOF
{
  "updateTime": "$CURRENT_DATE",
  "latestCommit": "$LATEST_COMMIT",
  "projectStatus": "active",
  "memorySystemStatus": "operational"
}
EOF

echo "✅ 記憶系統更新完成"
echo "📊 最新狀態已記錄到 latest-update.json"
echo "🕐 更新時間: $CURRENT_DATE"