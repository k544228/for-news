CREATE TABLE IF NOT EXISTS development_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    action TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    commit_hash TEXT,
    status TEXT DEFAULT 'completed',
    notes TEXT
);

CREATE TABLE IF NOT EXISTS project_milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    milestone_name TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    completed_date DATE,
    status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS feature_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    feature_name TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'requested',
    implementation_notes TEXT
);

-- 插入初始數據
INSERT INTO development_log (action, description, status) VALUES
('項目初始化', 'FOR-NEWS半自動化新聞聚合系統開始開發', 'completed'),
('RSS系統實現', '建立BBC新聞源RSS抓取功能', 'completed'),
('Mercury整合', '整合@postlight/mercury-parser內容擷取', 'completed'),
('MCP安裝', '安裝MCP servers提升Claude記憶能力', 'in_progress');

INSERT INTO project_milestones (milestone_name, description, status) VALUES
('基礎架構完成', 'RSS + Mercury + 前端界面', 'completed'),
('MCP整合', '安裝MCP提升開發效率', 'in_progress'),
('用戶測試', '收集用戶反饋並優化', 'pending'),
('功能擴展', '根據需求添加新功能', 'pending');
