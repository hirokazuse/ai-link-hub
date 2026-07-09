document.addEventListener('DOMContentLoaded', () => {
    // 1. JSONデータをローカル環境から取得
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // 2. 「chat」ツールが最上位にくるようにデータを並び替える
            const sortedAgents = sortAgentsByInterface(data.agents);
            // 3. 並び替えたデータをHTML画面に描画する
            renderLinks(sortedAgents);
        })
        .catch(error => console.error('データの読み込みに失敗しました:', error));
});

/**
 * インターフェース属性に基づいてツールを並び替える関数
 * 「chat」を最優先にし、それ以外（cli, web等）は後方に配置します
 */
function sortAgentsByInterface(agents) {
    return agents.sort((a, b) => {
        if (a.interface === 'chat' && b.interface !== 'chat') return -1;
        if (b.interface === 'chat' && a.interface !== 'chat') return 1;
        return 0; // 同一タイプ、またはchat以外の組み合わせは順序維持
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