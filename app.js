let allAgents = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. JSONデータをローカル環境から取得
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allAgents = data.agents;
            // 2. 初期表示：「chat」ツールが最上位にくるようにデータを並び替える
            const sortedAgents = sortAgentsByInterface(allAgents, 'chat');
            // 3. 並び替えたデータをHTML画面に描画する
            renderLinks(sortedAgents);
            // 4. 並び替えボタンのセットアップ
            setupSortButtons();
        })
        .catch(error => console.error('データの読み込みに失敗しました:', error));
});

/**
 * インターフェース属性に基づいてツールを並び替える関数
 * 指定された「priority」を最優先にし、それ以外は後方に配置します
 */
function sortAgentsByInterface(agents, priority) {
    return [...agents].sort((a, b) => {
        const aHasPriority = a.interface && a.interface.includes(priority);
        const bHasPriority = b.interface && b.interface.includes(priority);

        if (aHasPriority && !bHasPriority) return -1;
        if (!aHasPriority && bHasPriority) return 1;
        return 0; // 同一タイプ、または優先度以外の組み合わせは順序維持
    });
}

/**
 * 並び替えボタンにイベントリスナーを登録する関数
 */
function setupSortButtons() {
    const buttons = document.querySelectorAll('.sort-controls button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');

            // アクティブなボタンのスタイルを切り替え
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // データを並び替えて再描画
            const sorted = sortAgentsByInterface(allAgents, type);
            renderLinks(sorted);
        });

        // 初期状態で「chat」ボタンをアクティブにする
        if (button.getAttribute('data-type') === 'chat') {
            button.classList.add('active');
        }
    });
}

/**
 * データを元にHTMLカードを動的に生成・配置する関数
 */
function renderLinks(agents) {
    const container = document.getElementById('agent-list');
    container.innerHTML = ''; // 一度中身を空にする

    agents.forEach(agent => {
        // 各ツールの得意分野（配列）をliタグの列に変換
        const strengthsHtml = agent.strengths && agent.strengths.length 
            ? agent.strengths.map(s => `<li>${s}</li>`).join('')
            : '<li>情報なし</li>';

        // 課金形態の情報を取得（オブジェクト構造に対応）
        const billingType = agent.billing && agent.billing.type 
            ? agent.billing.type 
            : '未定';
        
        // 課金に関する注意書き等があれば取得
        const billingNote = agent.billing && agent.billing.note 
            ? `<p class="billing-note"><small>※ ${agent.billing.note}</small></p>` 
            : '';

        // スタイル分けしやすいように、クラス名に「chat-type」などを動的に付与
        const card = document.createElement('div');
        card.className = `card ${agent.interface || 'unknown'}-type`;
        
        card.innerHTML = `
            <div class="card-header">
                <a href="${agent.url}" target="_blank" class="url-link">${agent.name}</a>
                <span class="badge badge-${agent.interface}">${(agent.interface || 'UNKNOWN').toUpperCase()}</span>
            </div>
            <p><strong>カテゴリ:</strong> ${agent.category || '未分類'}</p>
            <p><strong>課金形態:</strong> ${billingType}</p>
            ${billingNote}
            <p><strong>得意分野:</strong></p>
            <ul>${strengthsHtml}</ul>
        `;
        
        container.appendChild(card);
    });
}