// 現在の言語（デフォルト: 日本語）
let currentLang = 'ja';

// UI文字列の翻訳辞書
const i18n = {
    ja: {
        category_label: 'カテゴリ',
        billing_label: '課金形態',
        strengths_label: '得意分野',
        no_info: '情報なし',
        no_category: '未分類',
        billing_unknown: '未定',
        billing_note_prefix: '※ ',
    },
    en: {
        category_label: 'Category',
        billing_label: 'Billing',
        strengths_label: 'Strengths',
        no_info: 'No info',
        no_category: 'Uncategorized',
        billing_unknown: 'Unknown',
        billing_note_prefix: 'Note: ',
    }
};

/** 言語を切り替える（HTML内 data-i18n 要素も更新） */
function setLang(lang) {
    currentLang = lang;

    // ボタンのactive状態を更新
    document.getElementById('btn-ja').classList.toggle('active', lang === 'ja');
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');

    // data-i18n 属性を持つ要素のテキストを更新
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key] !== undefined) {
            el.textContent = i18n[lang][key];
        }
    });

    // カードを再描画
    if (window._cachedAgents) {
        renderLinks(window._cachedAgents);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 初期表示: data-i18n 要素を日本語で埋める
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n['ja'][key] !== undefined) {
            el.textContent = i18n['ja'][key];
        }
    });

    // 1. JSONデータをローカル環境から取得
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // 2. localStorageのユーザー追加エントリをマージ
            const userAdded = loadUserAdded();
            const merged = [...data.agents, ...userAdded];
            // 3. 「chat」ツールが最上位にくるようにデータを並び替える
            const sortedAgents = sortAgentsByInterface(merged);
            // キャッシュしておく（言語切り替え・フィルター再描画用）
            window._cachedAgents = sortedAgents;
            window._baseAgents  = data.agents; // export用にオリジナルも保持
            // 4. 並び替えたデータをHTML画面に描画する
            renderLinks(sortedAgents);
            // 5. フィルタードロップダウンを初期化する
            initFilterBar(sortedAgents);
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
    const t = i18n[currentLang];
    const container = document.getElementById('agent-list');
    container.innerHTML = ''; // 一度中身を空にする

    agents.forEach(agent => {
        // 各ツールの得意分野（配列）をliタグの列に変換
        const strengthsHtml = agent.strengths && agent.strengths.length 
            ? agent.strengths.map(s => `<li>${s}</li>`).join('')
            : `<li>${t.no_info}</li>`;

        // 課金形態の情報を取得（オブジェクト構造に対応）
        const billingType = agent.billing && agent.billing.type 
            ? agent.billing.type 
            : t.billing_unknown;
        
        // 課金に関する注意書き等があれば取得
        const billingNote = agent.billing && agent.billing.note 
            ? `<p class="billing-note"><small>${t.billing_note_prefix}${agent.billing.note}</small></p>` 
            : '';

        // スタイル分けしやすいように、クラス名に「chat-type」などを動的に付与
        const card = document.createElement('div');
        card.className = `card ${agent.interface || 'unknown'}-type`;
        
        card.innerHTML = `
            <div class="card-header">
                <a href="${agent.url}" target="_blank" class="url-link">${agent.name}</a>
                <span class="badge badge-${agent.interface}">${(agent.interface || 'UNKNOWN').toUpperCase()}</span>
            </div>
            <p><strong>${t.category_label}:</strong> ${agent.category || t.no_category}</p>
            <p><strong>${t.billing_label}:</strong> ${billingType}</p>
            ${billingNote}
            <p><strong>${t.strengths_label}:</strong></p>
            <ul>${strengthsHtml}</ul>
        `;
        
        container.appendChild(card);
    });
}

/**
 * フィルタードロップダウンの初期化・イベント設定
 * interface フィールドが複合値（例: "cli / web"）の場合も部分マッチで対応
 */
function initFilterBar(allAgents) {
    const select = document.getElementById('filter-select');
    if (!select) return;

    select.addEventListener('change', () => {
        const filter = select.value;
        if (filter === 'all') {
            renderLinks(allAgents);
        } else {
            const filtered = allAgents.filter(agent =>
                agent.interface && agent.interface.includes(filter)
            );
            renderLinks(filtered);
        }
    });
}

// ─── localStorage ユーティリティ ───────────────────────────────
const LS_KEY = 'ai_link_hub_user_added';

/** localStorageからユーザー追加エントリを取得 */
function loadUserAdded() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    } catch { return []; }
}