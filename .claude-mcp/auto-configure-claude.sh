#!/bin/bash

echo "🚀 FOR-NEWS Claude Desktop MCP 自動配置腳本"
echo "=============================================="

# 定義可能的Claude Desktop配置路徑
CLAUDE_PATHS=(
    "/mnt/c/Users/KEN/AppData/Roaming/Claude"
    "/mnt/c/Users/$USER/AppData/Roaming/Claude"
    "$HOME/.config/claude"
    "/home/$USER/.config/claude"
)

# MCP配置內容
MCP_CONFIG='{
  "mcpServers": {
    "for-news-filesystem": {
      "command": "node",
      "args": [
        "/mnt/c/Users/KEN/for-news/node_modules/@modelcontextprotocol/server-filesystem/dist/index.js",
        "/mnt/c/Users/KEN/for-news"
      ]
    }
  }
}'

echo "🔍 正在檢測Claude Desktop安裝位置..."

# 檢查每個可能的路徑
CLAUDE_DIR=""
for path in "${CLAUDE_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "✅ 找到Claude Desktop目錄: $path"
        CLAUDE_DIR="$path"
        break
    else
        echo "❌ 未找到: $path"
    fi
done

# 如果沒找到，嘗試創建
if [ -z "$CLAUDE_DIR" ]; then
    echo ""
    echo "⚠️  未找到現有的Claude Desktop配置目錄"
    echo "🔧 嘗試創建配置目錄..."

    # 優先使用Windows路徑（如果在WSL中）
    if [ -d "/mnt/c/Users/KEN" ]; then
        CLAUDE_DIR="/mnt/c/Users/KEN/AppData/Roaming/Claude"
        mkdir -p "$CLAUDE_DIR"
        echo "✅ 創建Windows配置目錄: $CLAUDE_DIR"
    else
        CLAUDE_DIR="$HOME/.config/claude"
        mkdir -p "$CLAUDE_DIR"
        echo "✅ 創建Linux配置目錄: $CLAUDE_DIR"
    fi
fi

# 配置文件路徑
CONFIG_FILE="$CLAUDE_DIR/claude_desktop_config.json"

echo ""
echo "📝 配置文件位置: $CONFIG_FILE"

# 檢查是否已有配置文件
if [ -f "$CONFIG_FILE" ]; then
    echo "⚠️  發現現有配置文件"
    echo "💾 創建備份..."
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ 備份完成: $CONFIG_FILE.backup.*"

    # 檢查是否已有MCP配置
    if grep -q "mcpServers" "$CONFIG_FILE"; then
        echo "🔧 檢測到現有MCP配置，將進行合併..."
        # 這裡我們會小心地合併配置
        EXISTING_CONFIG=$(cat "$CONFIG_FILE")
        echo "📄 現有配置:"
        cat "$CONFIG_FILE" | jq . 2>/dev/null || cat "$CONFIG_FILE"
        echo ""
        echo "❓ 是否要覆蓋現有的MCP配置？[y/N]"
        read -r OVERWRITE
        if [[ "$OVERWRITE" =~ ^[Yy]$ ]]; then
            echo "$MCP_CONFIG" > "$CONFIG_FILE"
            echo "✅ 配置已覆蓋"
        else
            echo "ℹ️  保持現有配置不變"
            echo "📋 您可以手動將以下配置添加到現有文件中:"
            echo "$MCP_CONFIG"
            exit 0
        fi
    else
        echo "🔧 現有配置中無MCP設定，添加MCP配置..."
        # 嘗試合併JSON
        if command -v jq &> /dev/null; then
            MERGED=$(echo "$EXISTING_CONFIG" | jq ". + $MCP_CONFIG")
            echo "$MERGED" > "$CONFIG_FILE"
            echo "✅ 配置已合併"
        else
            echo "⚠️  未安裝jq，將覆蓋配置文件"
            echo "$MCP_CONFIG" > "$CONFIG_FILE"
            echo "✅ 配置已設定"
        fi
    fi
else
    echo "📄 創建新的配置文件..."
    echo "$MCP_CONFIG" > "$CONFIG_FILE"
    echo "✅ 配置文件已創建"
fi

# 設置正確的權限
chmod 644 "$CONFIG_FILE"

echo ""
echo "🎉 Claude Desktop MCP配置完成！"
echo "=============================================="
echo "📁 配置文件: $CONFIG_FILE"
echo "🧠 MCP服務器: for-news-filesystem"
echo "📂 專案路徑: /mnt/c/Users/KEN/for-news"
echo ""
echo "📋 最終配置內容:"
cat "$CONFIG_FILE" | jq . 2>/dev/null || cat "$CONFIG_FILE"
echo ""
echo "🔄 下一步操作:"
echo "1. 完全關閉Claude Desktop應用程式"
echo "2. 重新啟動Claude Desktop"
echo "3. 等待MCP連接初始化（可能需要幾秒鐘）"
echo "4. 測試指令: '請讀取 .claude-mcp/memory-system.json'"
echo ""
echo "✅ 配置完成！重啟Claude Desktop後您將擁有完整的專案記憶能力！"