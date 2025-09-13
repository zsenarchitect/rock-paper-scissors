#!/bin/bash

# Generate HTML Dashboard for Project Review
# Rock Paper Scissors Battle Royale

REPO_OWNER="zsenarchitect"
REPO_NAME="rock-paper-scissors"
DASHBOARD_FILE="project-dashboard.html"

echo "🎯 Generating Project Dashboard..."
echo ""

# Get project data
echo "📊 Fetching project data..."
ISSUE_DATA=$(gh issue list --repo "$REPO_OWNER/$REPO_NAME" --state all --json number,title,labels,state,createdAt,updatedAt,assignees,milestone,body)

# Create HTML dashboard
cat > "$DASHBOARD_FILE" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 Rock Paper Scissors Battle Royale - Project Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: #666;
            font-size: 1.1em;
        }
        
        .views {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            padding: 30px;
        }
        
        .view-section {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .view-title {
            font-size: 1.5em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            color: #333;
        }
        
        .issue-item {
            background: #f8f9fa;
            margin: 10px 0;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            transition: all 0.3s ease;
        }
        
        .issue-item:hover {
            background: #e9ecef;
            transform: translateX(5px);
        }
        
        .issue-number {
            font-weight: bold;
            color: #667eea;
            font-size: 1.1em;
        }
        
        .issue-title {
            margin: 5px 0;
            color: #333;
        }
        
        .issue-labels {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
        }
        
        .label {
            padding: 3px 8px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .label-urgent { background: #ff6b6b; color: white; }
        .label-high { background: #ffa726; color: white; }
        .label-medium { background: #ffeb3b; color: #333; }
        .label-low { background: #4caf50; color: white; }
        .label-phase-1 { background: #2196f3; color: white; }
        .label-phase-2 { background: #9c27b0; color: white; }
        .label-phase-3 { background: #ff9800; color: white; }
        .label-frontend { background: #e91e63; color: white; }
        .label-backend { background: #607d8b; color: white; }
        .label-ai-training { background: #795548; color: white; }
        .label-infrastructure { background: #009688; color: white; }
        .label-open { background: #4caf50; color: white; }
        .label-closed { background: #f44336; color: white; }
        
        .priority-urgent { border-left-color: #ff6b6b; }
        .priority-high { border-left-color: #ffa726; }
        .priority-medium { border-left-color: #ffeb3b; }
        .priority-low { border-left-color: #4caf50; }
        
        .footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 20px;
        }
        
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            margin: 10px;
        }
        
        .refresh-btn:hover {
            background: #5a6fd8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Rock Paper Scissors Battle Royale</h1>
            <p>Project Dashboard - Iteration-Driven Development</p>
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh Data</button>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="total-issues">-</div>
                <div class="stat-label">Total Issues</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="open-issues">-</div>
                <div class="stat-label">Open Issues</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="urgent-issues">-</div>
                <div class="stat-label">Urgent Priority</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="high-issues">-</div>
                <div class="stat-label">High Priority</div>
            </div>
        </div>
        
        <div class="views">
            <div class="view-section">
                <h2 class="view-title">🔴 Urgent Issues</h2>
                <div id="urgent-list"></div>
            </div>
            
            <div class="view-section">
                <h2 class="view-title">🟠 High Priority</h2>
                <div id="high-list"></div>
            </div>
            
            <div class="view-section">
                <h2 class="view-title">🚀 Phase 1 - Core Foundation</h2>
                <div id="phase1-list"></div>
            </div>
            
            <div class="view-section">
                <h2 class="view-title">🎨 Frontend Issues</h2>
                <div id="frontend-list"></div>
            </div>
            
            <div class="view-section">
                <h2 class="view-title">⚙️ Backend Issues</h2>
                <div id="backend-list"></div>
            </div>
            
            <div class="view-section">
                <h2 class="view-title">🤖 AI Training Issues</h2>
                <div id="ai-list"></div>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on $(date) | <a href="https://github.com/$REPO_OWNER/$REPO_NAME" style="color: #667eea;">View on GitHub</a></p>
        </div>
    </div>
    
    <script>
        // Project data will be injected here
        const projectData = PROJECT_DATA_PLACEHOLDER;
        
        // Update statistics
        function updateStats() {
            document.getElementById('total-issues').textContent = projectData.length;
            document.getElementById('open-issues').textContent = projectData.filter(issue => issue.state === 'OPEN').length;
            document.getElementById('urgent-issues').textContent = projectData.filter(issue => issue.labels.some(label => label.name === 'urgent')).length;
            document.getElementById('high-issues').textContent = projectData.filter(issue => issue.labels.some(label => label.name === 'high')).length;
        }
        
        // Create issue HTML
        function createIssueHTML(issue) {
            const labels = issue.labels.map(label => {
                const className = `label-${label.name.replace(/-/g, '-')}`;
                return `<span class="label ${className}">${label.name}</span>`;
            }).join('');
            
            const priorityClass = issue.labels.some(label => label.name === 'urgent') ? 'priority-urgent' :
                                 issue.labels.some(label => label.name === 'high') ? 'priority-high' :
                                 issue.labels.some(label => label.name === 'medium') ? 'priority-medium' :
                                 issue.labels.some(label => label.name === 'low') ? 'priority-low' : '';
            
            return `
                <div class="issue-item ${priorityClass}">
                    <div class="issue-number">#${issue.number}</div>
                    <div class="issue-title">${issue.title}</div>
                    <div class="issue-labels">${labels}</div>
                </div>
            `;
        }
        
        // Filter and display issues
        function displayIssues(containerId, filter) {
            const container = document.getElementById(containerId);
            const filteredIssues = projectData.filter(filter);
            container.innerHTML = filteredIssues.map(createIssueHTML).join('');
        }
        
        // Initialize dashboard
        function initDashboard() {
            updateStats();
            
            displayIssues('urgent-list', issue => issue.labels.some(label => label.name === 'urgent'));
            displayIssues('high-list', issue => issue.labels.some(label => label.name === 'high'));
            displayIssues('phase1-list', issue => issue.labels.some(label => label.name === 'phase-1'));
            displayIssues('frontend-list', issue => issue.labels.some(label => label.name === 'frontend'));
            displayIssues('backend-list', issue => issue.labels.some(label => label.name === 'backend'));
            displayIssues('ai-list', issue => issue.labels.some(label => label.name === 'ai-training'));
        }
        
        // Start dashboard
        initDashboard();
    </script>
</body>
</html>
EOF

# Replace placeholder with actual data
echo "📊 Injecting project data into dashboard..."
echo "$ISSUE_DATA" | jq -c '.' > temp_data.json
sed -i '' "s/PROJECT_DATA_PLACEHOLDER/$(cat temp_data.json)/" "$DASHBOARD_FILE"
rm temp_data.json

echo "✅ Dashboard generated: $DASHBOARD_FILE"
echo "🌐 Open the dashboard in your browser to view the project"
echo ""
echo "💡 Usage:"
echo "  - Open $DASHBOARD_FILE in your browser"
echo "  - Click 'Refresh Data' to update the view"
echo "  - Use the different sections to review issues by category"
