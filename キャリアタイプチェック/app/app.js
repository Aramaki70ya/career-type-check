/**
 * キャリアタイプ12診断 - 共通ユーティリティ
 */

// LocalStorage keys
const STORAGE_KEYS = {
  ANSWERS: 'careerType_answers',
  CURRENT_INDEX: 'careerType_currentIndex',
  COMPLETED_AT: 'careerType_completedAt'
};

/**
 * LocalStorage操作
 */
const storage = {
  // 回答データを保存
  saveAnswers(answers) {
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
  },

  // 回答データを取得
  getAnswers() {
    const data = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    return data ? JSON.parse(data) : {};
  },

  // 現在の質問インデックスを保存
  saveCurrentIndex(index) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, String(index));
  },

  // 現在の質問インデックスを取得
  getCurrentIndex() {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX);
    return data ? parseInt(data, 10) : 0;
  },

  // 完了日時を保存
  saveCompletedAt(date) {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_AT, date.toISOString());
  },

  // 完了日時を取得
  getCompletedAt() {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_AT);
    return data ? new Date(data) : null;
  },

  // 進捗があるかどうか
  hasProgress() {
    const answers = this.getAnswers();
    return Object.keys(answers).length > 0;
  },

  // 診断が完了しているかどうか
  isCompleted() {
    return this.getCompletedAt() !== null;
  },

  // 全データをクリア
  clear() {
    localStorage.removeItem(STORAGE_KEYS.ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_INDEX);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_AT);
  }
};

/**
 * スコア計算
 */
const scoring = {
  // タイプごとのスコアを計算
  calculateTypeScores(answers) {
    const scores = {};
    
    // 全タイプを0で初期化
    TYPES.forEach(type => {
      scores[type.id] = 0;
    });
    
    // 回答からスコアを加算
    Object.entries(answers).forEach(([questionId, value]) => {
      const question = getQuestionById(questionId);
      if (question) {
        scores[question.typeId] += value;
      }
    });
    
    return scores;
  },

  // メインタイプ（同率1位を含む）を取得
  getMainTypes(scores) {
    const maxScore = Math.max(...Object.values(scores));
    const mainTypeIds = Object.entries(scores)
      .filter(([_, score]) => score === maxScore)
      .map(([typeId, _]) => typeId);
    
    return mainTypeIds.map(id => getTypeById(id)).filter(Boolean);
  },

  // 全タイプのスコアをソートして取得
  getSortedScores(scores) {
    return Object.entries(scores)
      .map(([typeId, score]) => ({
        type: getTypeById(typeId),
        score
      }))
      .filter(item => item.type)
      .sort((a, b) => b.score - a.score);
  }
};

/**
 * ページ遷移
 */
const navigation = {
  goToQuestions() {
    window.location.href = 'questions.html';
  },

  goToResult() {
    window.location.href = 'result.html';
  },

  goToIndex() {
    window.location.href = 'index.html';
  }
};

/**
 * 日時フォーマット
 */
function formatDate(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${d} ${h}:${min}`;
}

/**
 * 群（グループ）の色を取得
 */
function getGroupColor(groupId) {
  const colors = {
    A: 'var(--color-group-a)',
    B: 'var(--color-group-b)',
    C: 'var(--color-group-c)',
    D: 'var(--color-group-d)'
  };
  return colors[groupId] || 'var(--color-primary)';
}
