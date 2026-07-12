function saveUserAdded(agents) {
    localStorage.setItem(LS_KEY, JSON.stringify(agents));
}

function quickAdd() {
    const input = document.getElementById('json-input');
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = '';

    try {
        const parsed = JSON.parse(input.value);
        if (!parsed.id || !parsed.name || !parsed.url) {
            feedback.innerHTML = '<div class="error-msg">エラー: id, name, url は必須項目です。</div>';
            return;
        }
        const agents = loadUserAdded();
        if (agents.some(a => a.id === parsed.id)) {
            feedback.innerHTML = '<div class="error-msg">エラー: 同じIDのエントリが既に存在します。</div>';
            return;
        }
        agents.push(parsed);
        saveUserAdded(agents);
        input.value = '';
        feedback.innerHTML = '<div class="success-msg">追加しました。</div>';
        renderLocalEntries();
    } catch (e) {
        feedback.innerHTML = `<div class="error-msg">JSONパースエラー: ${e.message}</div>`;
    }
}

function deleteEntry(id) {
    const agents = loadUserAdded().filter(a => a.id !== id);
    saveUserAdded(agents);
    renderLocalEntries();
}

function clearAll() {
    if (!confirm('ローカル追加エントリをすべて削除しますか？')) return;
    saveUserAdded([]);
    renderLocalEntries();
}

function renderLocalEntries() {
    const container = document.getElementById('local-entries');
    const agents = loadUserAdded();
    if (agents.length === 0) {
        container.innerHTML = '<div class="empty-state">ローカル追加エントリはありません。</div>';
        return;
    }
    container.innerHTML = agents.map(a => `
        <div class="entry-item">
            <div class="entry-info">
                <div class="entry-name">${a.name}</div>
                <div class="entry-meta">${a.id} &middot; ${a.interface || '-'} &middot; ${a.category || '-'}</div>
            </div>
            <button class="btn-danger" onclick="deleteEntry('${a.id}')">削除</button>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderLocalEntries);
