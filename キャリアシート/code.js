/**
 * キャリアレポート生成ツール
 * 文字起こしデータからPDFレポートを生成（Gemini API対応）
 * 
 * ⚠️ 権限設定が必要です：
 * 
 * 【方法1: マニフェストファイルを使う（推奨）】
 * 詳細は「権限設定手順.md」を参照
 * 
 * 【方法2: マニフェストファイルを使わない（簡単）】
 * 1. requestUrlFetchPermission() 関数を選択して「実行」ボタンをクリック
 * 2. 権限ダイアログが表示されたら「権限を確認」→「許可」をクリック
 * 3. これで権限が付与されます
 * 
 * 権限が付与されたら、checkGeminiApiKey() を実行して確認してください。
 * 
 * ■ スクリプトプロパティで設定可能な項目：
 * - GEMINI_API_KEY: Gemini APIキー（必須）
 * - CONSULTANT_NAME: コンサルタント名（デフォルト: 石井 貴大）
 * - COMPANY_NAME: 会社名（デフォルト: 女性活躍カンパニー）
 * - PROMPT_SUFFIX: プロンプト共通サフィックス
 * - PROMPT_WHY_NOW: 転職理由用プロンプト
 * - PROMPT_STRENGTH: 強み用プロンプト
 * - PROMPT_WORK: 業務内容用プロンプト
 * - PROMPT_ACHIEVEMENT: 成果用プロンプト
 * - PROMPT_CHALLENGE: 課題用プロンプト
 * - PROMPT_AXIS: キャリア軸用プロンプト
 */

// ===========================================
// 設定管理
// ===========================================

/**
 * スクリプトプロパティからAPIキーを取得
 */
function getGeminiApiKey() {
  try {
    const properties = PropertiesService.getScriptProperties();
    const apiKey = properties.getProperty('GEMINI_API_KEY') || '';
    return apiKey;
  } catch (error) {
    console.error('[getGeminiApiKey] エラー:', error.toString());
    return '';
  }
}

/**
 * スクリプトプロパティから設定値を取得
 */
function getConfig() {
  const properties = PropertiesService.getScriptProperties();
  
  return {
    consultantName: properties.getProperty('CONSULTANT_NAME') || '石井 貴大',
    companyName: properties.getProperty('COMPANY_NAME') || '女性活躍カンパニー'
  };
}

/**
 * 設定値を保存するヘルパー関数（管理者用）
 * 例: setConfig('CONSULTANT_NAME', '山田 太郎')
 */
function setConfig(key, value) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty(key, value);
  console.log('[setConfig] ' + key + ' を設定しました');
}

/**
 * 現在の設定を確認（管理者用）
 */
function showCurrentConfig() {
  const config = getConfig();
  const prompts = getPromptConfig();
  
  console.log('=== 現在の設定 ===');
  console.log('コンサルタント名:', config.consultantName);
  console.log('会社名:', config.companyName);
  console.log('');
  console.log('=== プロンプト設定 ===');
  console.log('共通サフィックス:', prompts.suffix);
  console.log('転職理由:', prompts.whyNow);
  console.log('強み:', prompts.strength);
  
  return { config, prompts };
}

/**
 * スクリプトプロパティからプロンプト設定を取得
 */
function getPromptConfig() {
  const properties = PropertiesService.getScriptProperties();
  
  // デフォルトプロンプト
  // 目的：ヒアリング内容を読みやすく整理する（原文を尊重、飛躍しない）
  const defaults = {
    suffix: '【ルール】マークダウン記法は禁止。箇条書き記号も禁止。「です」「ます」は絶対に使わない。「〜する」「〜した」「〜したい」「〜してしまう」のような常体で書くこと。元の発言から飛躍しない。',
    
    whyNow: `以下の転職理由を整理。「です」「ます」禁止。「〜したい」「〜と感じている」など常体で。
40〜50文字程度。`,

    strength: `以下の強みを整理。「です」「ます」禁止。「〜できる」「〜が得意」など常体で。
40〜50文字程度。`,

    work: `以下の業務内容を整理。「です」「ます」禁止。「〜を担当」「〜している」など常体で。
40〜50文字程度。`,

    achievement: `以下の成果を整理。数字は残す。「です」「ます」禁止。「〜を達成」「〜した」など常体で。
40〜50文字程度。`,

    challenge: `以下の課題を整理。「です」「ます」禁止。「〜が苦手」「〜してしまう」など常体で。
30〜40文字程度。`,

    axis: `以下の価値観を整理。「です」「ます」禁止。「〜を大切にしたい」など常体で。
25〜35文字程度。`,

    workStyle: `以下の働き方希望を整理。「です」「ます」禁止。「〜が理想」「〜を希望」など常体で。
30〜40文字程度。`,

    vision: `以下のビジョンを整理。「です」「ます」禁止。「〜になりたい」「〜を目指す」など常体で。
40〜50文字程度。`,

    behaviorTraits: `以下の発言内容から、その人の特徴を3〜4個選んでください。
以下からカンマ区切りで出力：
聞き上手, 話し上手, コツコツ型, 行動派, チームワーク重視, 一人で集中, 新しいこと好き, 安定志向, 人と接するのが好き, 数字に強い, 段取り上手, 粘り強い, 周りを巻き込める, 気配りできる, 論理的, 直感的
発言に当てはまるものだけを選んでください。`,

    challengeAction: `以下の課題に対する、シンプルで実践的な改善アクションを1つ提案してください。
大げさにせず、現実的なアドバイスで。
25〜40文字程度で。`,

    careerDirections: `以下の情報を基に、現実的なキャリアの方向性を3つ提案してください。
以下の形式で出力（改行で区切る）：
タイトル1|説明1
タイトル2|説明2
タイトル3|説明3

タイトルは12文字以内、説明は25〜35文字程度で。
大げさにせず、本人の経験・希望に沿った現実的な提案にしてください。`
  };
  
  return {
    suffix: properties.getProperty('PROMPT_SUFFIX') || defaults.suffix,
    whyNow: properties.getProperty('PROMPT_WHY_NOW') || defaults.whyNow,
    strength: properties.getProperty('PROMPT_STRENGTH') || defaults.strength,
    work: properties.getProperty('PROMPT_WORK') || defaults.work,
    achievement: properties.getProperty('PROMPT_ACHIEVEMENT') || defaults.achievement,
    challenge: properties.getProperty('PROMPT_CHALLENGE') || defaults.challenge,
    axis: properties.getProperty('PROMPT_AXIS') || defaults.axis,
    workStyle: properties.getProperty('PROMPT_WORK_STYLE') || defaults.workStyle,
    vision: properties.getProperty('PROMPT_VISION') || defaults.vision,
    behaviorTraits: properties.getProperty('PROMPT_BEHAVIOR_TRAITS') || defaults.behaviorTraits,
    challengeAction: properties.getProperty('PROMPT_CHALLENGE_ACTION') || defaults.challengeAction,
    careerDirections: properties.getProperty('PROMPT_CAREER_DIRECTIONS') || defaults.careerDirections
  };
}

/**
 * プロンプト設定を保存（管理者用）
 * 例: setPromptConfig('whyNow', '転職理由を20文字以内で...')
 */
function setPromptConfig(category, promptText) {
  const keyMap = {
    'suffix': 'PROMPT_SUFFIX',
    'whyNow': 'PROMPT_WHY_NOW',
    'strength': 'PROMPT_STRENGTH',
    'work': 'PROMPT_WORK',
    'achievement': 'PROMPT_ACHIEVEMENT',
    'challenge': 'PROMPT_CHALLENGE',
    'axis': 'PROMPT_AXIS'
  };
  
  const key = keyMap[category];
  if (!key) {
    console.error('[setPromptConfig] 無効なカテゴリ:', category);
    return false;
  }
  
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty(key, promptText);
  console.log('[setPromptConfig] ' + category + ' のプロンプトを設定しました');
  return true;
}

// ===========================================
// 権限・API確認
// ===========================================

/**
 * 権限を要求する関数（マニフェストファイル不要）
 */
function requestUrlFetchPermission() {
  console.log('[requestUrlFetchPermission] 権限要求開始');
  
  try {
    const testUrl = 'https://www.google.com';
    const response = UrlFetchApp.fetch(testUrl, { 
      muteHttpExceptions: true,
      method: 'get'
    });
    
    console.log('[requestUrlFetchPermission] ✅ 権限が既に付与されています');
    return {
      success: true,
      message: '権限は既に付与されています。Gemini APIが使用できます。'
    };
  } catch (error) {
    const errorMessage = error.toString();
    
    if (errorMessage.includes('permission') || errorMessage.includes('権限')) {
      console.log('[requestUrlFetchPermission] ⚠️ 権限が必要です');
      return {
        success: false,
        message: '権限が必要です。プロジェクト設定から手動でOAuthスコープを追加してください。',
        instructions: [
          '1. 左側の歯車アイコン（⚙️）→「プロジェクトの設定」',
          '2. 「OAuth スコープ」→「スコープを追加」',
          '3. 以下を入力：https://www.googleapis.com/auth/script.external_request',
          '4. 保存',
          '5. checkGeminiApiKey() を実行して確認'
        ]
      };
    }
    
    return {
      success: false,
      message: 'エラー: ' + errorMessage
    };
  }
}

/**
 * APIキーが設定されているかチェック
 */
function checkGeminiApiKey() {
  console.log('[checkGeminiApiKey] 関数開始');
  const apiKey = getGeminiApiKey();
  
  if (!apiKey || apiKey.length < 10) {
    console.warn('[checkGeminiApiKey] APIキーが未設定または短すぎます');
    return {
      success: false,
      message: 'APIキーが未設定です。スクリプトプロパティに「GEMINI_API_KEY」を設定してください。'
    };
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: 'テスト' }] }],
      generationConfig: { maxOutputTokens: 10 }
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.error) {
      return {
        success: false,
        message: 'APIエラー: ' + result.error.message
      };
    }
    
    return {
      success: true,
      message: 'Gemini API接続OK！文章整形が有効です。'
    };
  } catch (error) {
    console.error('[checkGeminiApiKey] エラー:', error.toString());
    return {
      success: false,
      message: 'API接続エラー: ' + error.toString()
    };
  }
}

// ===========================================
// Webアプリ
// ===========================================

/**
 * Webアプリのメイン関数
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('キャリアレポート生成ツール')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * クライアントサイドに設定値を返す
 */
function getClientConfig() {
  return getConfig();
}

// ===========================================
// Gemini API 文章整形
// ===========================================

/**
 * Gemini APIを使って文章を自然に整形
 */
function refineTextWithGemini(text, category) {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    return text;
  }
  
  const promptConfig = getPromptConfig();
  
  // カテゴリ別のベースプロンプトを取得
  const basePrompts = {
    'whyNow': promptConfig.whyNow,
    'strength': promptConfig.strength,
    'work': promptConfig.work,
    'achievement': promptConfig.achievement,
    'challenge': promptConfig.challenge,
    'axis': promptConfig.axis,
    'workStyle': promptConfig.workStyle,
    'vision': promptConfig.vision,
    'behaviorTraits': promptConfig.behaviorTraits,
    'challengeAction': promptConfig.challengeAction,
    'careerDirections': promptConfig.careerDirections
  };
  
  const basePrompt = basePrompts[category] || promptConfig.strength;
  
  // 完全なプロンプトを構築（サフィックスで出力形式を厳密に指定）
  const fullPrompt = `${basePrompt}

${promptConfig.suffix}

入力テキスト：
${text}

整理後：`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{ text: fullPrompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200
      }
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());

    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      let refinedText = result.candidates[0].content.parts[0].text.trim();
      
      // マークダウン記法を徹底的に除去
      refinedText = refinedText
        .replace(/\*\*/g, '')           // ** を除去
        .replace(/\*/g, '')             // * を除去
        .replace(/##/g, '')             // ## を除去
        .replace(/#/g, '')              // # を除去
        .replace(/^[-・•●◆▪︎]\s*/gm, '')  // 箇条書き記号を除去
        .replace(/^\d+\.\s*/gm, '')     // 番号付きリストを除去
        .replace(/`/g, '')              // バッククォートを除去
        .replace(/"/g, '')              // ダブルクォートを除去
        .replace(/\n/g, ' ')            // 改行をスペースに
        .replace(/\s+/g, ' ')           // 複数スペースを1つに
        // 句読点の正規化
        .replace(/^[。、：:・\s]+/, '')   // 文頭の不要な記号を除去
        .replace(/。+/g, '。')           // 重複句点を除去
        .replace(/、+/g, '、')           // 重複読点を除去
        .replace(/。、|、。/g, '。')     // 「。、」「、。」を「。」に
        .trim();
      
      return refinedText;
    }
  } catch (error) {
    console.error('[refineTextWithGemini] エラー:', error.toString());
  }

  return text;
}

/**
 * 配列内のテキストをGeminiで整形（レート制限対応）
 */
function refineArrayWithGemini(arr, category) {
  if (!arr || arr.length === 0) return arr;
  
  const results = [];
  for (let i = 0; i < arr.length; i++) {
    results.push(refineTextWithGemini(arr[i], category));
    
    // レート制限対策: 各リクエスト間に待機（API呼び出しが増えたため500msに）
    if (i < arr.length - 1) {
      Utilities.sleep(500);
    }
  }
  return results;
}

/**
 * 単一テキストをGeminiで整形（待機時間付き）
 */
function refineWithGeminiAndWait(text, category) {
  const result = refineTextWithGemini(text, category);
  Utilities.sleep(500);
  return result;
}

// ===========================================
// 文字起こしデータ解析
// ===========================================

/**
 * 文字起こしテキストから候補者名を動的に検出
 */
function detectCandidateName(transcriptText) {
  // パターン1: 「参加者：...、○○（候補者）」形式
  const participantMatch = transcriptText.match(/参加者[：:][^）]*、\s*([^（\n]+)（候補者）/);
  if (participantMatch) {
    return participantMatch[1].replace(/\*\*/g, '').trim();
  }
  
  // パターン2: 「参加者：...（カウンセラー）、○○」形式
  const participantMatch2 = transcriptText.match(/参加者[：:][^）]*（カウンセラー）[^、]*、\s*([^\n（]+)/);
  if (participantMatch2) {
    return participantMatch2[1].replace(/\*\*/g, '').trim();
  }
  
  // パターン3: セクション内の発言者を分析して候補者を特定
  // カウンセラー以外で最も発言が多い人を候補者とみなす
  const config = getConfig();
  const consultantLastName = config.consultantName.split(' ')[0]; // 「石井 貴大」→「石井」
  
  // 発言者をカウント
  const speakerCounts = {};
  const speakerMatches = transcriptText.match(/^[\*]*([^\*：:\n]+)[：:]/gm);
  
  if (speakerMatches) {
    speakerMatches.forEach(function(match) {
      const speaker = match.replace(/[\*：:]/g, '').trim();
      // カウンセラー名は除外
      if (speaker && !speaker.includes(consultantLastName) && speaker.length <= 10) {
        speakerCounts[speaker] = (speakerCounts[speaker] || 0) + 1;
      }
    });
  }
  
  // 最も発言が多い人を候補者とする
  let maxCount = 0;
  let candidateName = '';
  for (const speaker in speakerCounts) {
    if (speakerCounts[speaker] > maxCount) {
      maxCount = speakerCounts[speaker];
      candidateName = speaker;
    }
  }
  
  return candidateName || '';
}

/**
 * カウンセラー名を検出
 */
function detectConsultantName(transcriptText) {
  // パターン1: 「○○（カウンセラー）」形式
  const consultantMatch = transcriptText.match(/([^、\n]+)（カウンセラー）/);
  if (consultantMatch) {
    return consultantMatch[1].replace(/\*\*/g, '').trim();
  }
  
  // デフォルト設定を返す
  return getConfig().consultantName;
}

/**
 * 文字起こしデータを解析して構造化データに変換
 */
function parseTranscript(transcriptText, useGemini) {
  const config = getConfig();
  
  // 候補者名を動的に検出
  const candidateName = detectCandidateName(transcriptText);
  const consultantName = detectConsultantName(transcriptText);
  
  // カウンセラーの苗字を取得（発言抽出に使用）
  const consultantLastName = consultantName.split(' ')[0];
  
  const data = {
    candidateName: candidateName,
    date: '',
    consultantName: consultantName,
    companyName: config.companyName,
    whyNow: [],
    strengths: [],
    careerAxis: [],
    currentWork: {
      description: [],
      achievements: []
    },
    workStyle: {
      remote: '',
      management: '',
      team: ''
    },
    vision: {
      oneYear: '',
      threeYears: '',
      fiveYears: { salary: '', goal: '' }
    },
    challenges: [],
    // 新規追加項目（Geminiで生成）
    behaviorTraits: [],      // 行動特性タグ
    careerDirections: []     // キャリア方向性提案
  };

  // 日付を抽出
  const dateMatch = transcriptText.match(/([0-9]{4})年([0-9]{1,2})月([0-9]{1,2})日/);
  if (dateMatch) {
    data.date = `${dateMatch[1]}年${dateMatch[2]}月${dateMatch[3]}日`;
  } else {
    data.date = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年MM月dd日');
  }

  // 候補者の苗字を取得（発言抽出に使用）
  const candidateLastName = candidateName.split(' ')[0] || candidateName;

  // 転職理由を抽出
  const whyNowSection = extractSection(transcriptText, '転職理由・背景');
  if (whyNowSection) {
    data.whyNow = extractCandidateResponses(whyNowSection, candidateLastName, consultantLastName).slice(0, 3);
  }

  // 強みを抽出
  const strengthSection = extractSection(transcriptText, '強み・行動特性');
  if (strengthSection) {
    data.strengths = extractCandidateResponses(strengthSection, candidateLastName, consultantLastName).slice(0, 4);
  }

  // 現職の業務を抽出
  const workSection = extractSection(transcriptText, '現職の業務・成果');
  if (workSection) {
    const workMatches = extractCandidateResponses(workSection, candidateLastName, consultantLastName);
    workMatches.forEach(function(text) {
      if (text.includes('担当') || text.includes('営業') || text.includes('サポート') || 
          text.includes('業務') || text.includes('管理')) {
        data.currentWork.description.push(text);
      }
      if (text.includes('万円') || text.includes('%') || text.includes('開拓') || 
          text.includes('立ち上げ') || text.includes('増') || text.includes('達成')) {
        data.currentWork.achievements.push(text);
      }
    });
    data.currentWork.description = data.currentWork.description.slice(0, 2);
    data.currentWork.achievements = data.currentWork.achievements.slice(0, 3);
  }

  // キャリア軸を抽出
  const axisSection = extractSection(transcriptText, 'キャリア軸・価値観');
  if (axisSection) {
    data.careerAxis = extractCandidateResponses(axisSection, candidateLastName, consultantLastName).slice(0, 3);
  }

  // 働き方の希望を抽出
  const workStyleSection = extractSection(transcriptText, '働き方・環境の希望');
  if (workStyleSection) {
    const workStyleResponses = extractCandidateResponses(workStyleSection, candidateLastName, consultantLastName);
    
    // リモートに関する発言を探す
    workStyleResponses.forEach(function(text) {
      if ((text.includes('リモート') || text.includes('出社') || text.includes('ハイブリッド')) && !data.workStyle.remote) {
        data.workStyle.remote = cleanText(text, candidateLastName);
      }
      if ((text.includes('マネージャー') || text.includes('支援型') || text.includes('上司')) && !data.workStyle.management) {
        data.workStyle.management = cleanText(text, candidateLastName);
      }
      if ((text.includes('チーム') || text.includes('文化') || text.includes('雰囲気') || text.includes('挑戦')) && !data.workStyle.team) {
        data.workStyle.team = cleanText(text, candidateLastName);
      }
    });
  }

  // 将来ビジョンを抽出
  const visionSection = extractSection(transcriptText, '将来のビジョン');
  if (visionSection) {
    const visionResponses = extractCandidateResponses(visionSection, candidateLastName, consultantLastName);
    
    visionResponses.forEach(function(text) {
      const cleanedText = cleanText(text, candidateLastName);
      
      if ((cleanedText.includes('1年') || cleanedText.includes('一年')) && !data.vision.oneYear) {
        let vision = cleanedText.replace(/1年後[はに]?/, '').replace(/一年後[はに]?/, '').trim();
        data.vision.oneYear = vision;
      }
      if ((cleanedText.includes('3年') || cleanedText.includes('三年')) && !data.vision.threeYears) {
        let vision = cleanedText.replace(/3年後[はに]?/, '').replace(/三年後[はに]?/, '').trim();
        data.vision.threeYears = vision;
      }
      if ((cleanedText.includes('5年') || cleanedText.includes('五年') || cleanedText.includes('万円')) && !data.vision.fiveYears.salary) {
        const salaryMatch = cleanedText.match(/([0-9]+)万円/);
        if (salaryMatch) {
          data.vision.fiveYears.salary = salaryMatch[1] + '万円以上';
        }
      }
    });
  }

  // 課題を抽出
  const challengeSection = extractSection(transcriptText, '課題・苦手領域');
  if (challengeSection) {
    data.challenges = extractCandidateResponses(challengeSection, candidateLastName, consultantLastName).slice(0, 3);
  }

  // Gemini APIで文章を自然に整形（求職者の自己理解を深める表現に）
  if (useGemini && getGeminiApiKey()) {
    console.log('[parseTranscript] Gemini APIで整形開始');
    try {
      // 各セクションを分析・言語化
      data.whyNow = refineArrayWithGemini(data.whyNow, 'whyNow');
      data.strengths = refineArrayWithGemini(data.strengths, 'strength');
      data.currentWork.description = refineArrayWithGemini(data.currentWork.description, 'work');
      data.currentWork.achievements = refineArrayWithGemini(data.currentWork.achievements, 'achievement');
      data.careerAxis = refineArrayWithGemini(data.careerAxis, 'axis');
      
      // 課題を整形（シンプルに課題のみ）
      const refinedChallenges = [];
      for (let i = 0; i < data.challenges.length; i++) {
        const issue = refineTextWithGemini(data.challenges[i], 'challenge');
        Utilities.sleep(500);
        refinedChallenges.push({ issue: issue });
      }
      data.challenges = refinedChallenges;
      
      // 働き方の希望も整形
      if (data.workStyle.remote) {
        data.workStyle.remote = refineTextWithGemini(data.workStyle.remote, 'workStyle');
        Utilities.sleep(500);
      }
      if (data.workStyle.management) {
        data.workStyle.management = refineTextWithGemini(data.workStyle.management, 'workStyle');
        Utilities.sleep(500);
      }
      if (data.workStyle.team) {
        data.workStyle.team = refineTextWithGemini(data.workStyle.team, 'workStyle');
        Utilities.sleep(500);
      }
      
      // ビジョンも整形
      if (data.vision.oneYear) {
        data.vision.oneYear = refineTextWithGemini(data.vision.oneYear, 'vision');
        Utilities.sleep(500);
      }
      if (data.vision.threeYears) {
        data.vision.threeYears = refineTextWithGemini(data.vision.threeYears, 'vision');
        Utilities.sleep(500);
      }
      
      // 行動特性を生成
      const traitsInput = data.strengths.join('。') + '。' + data.currentWork.description.join('。');
      const traitsResult = refineTextWithGemini(traitsInput, 'behaviorTraits');
      if (traitsResult) {
        data.behaviorTraits = traitsResult.split(/[,、，]/).map(t => t.trim()).filter(t => t.length > 0);
      }
      Utilities.sleep(500);
      
      // キャリア方向性を生成
      const careerInput = `
転職理由: ${data.whyNow.join('。')}
強み: ${data.strengths.join('。')}
価値観: ${data.careerAxis.join('。')}
希望: ${data.workStyle.remote} ${data.workStyle.team}
ビジョン: ${data.vision.threeYears}`;
      const directionsResult = refineTextWithGemini(careerInput, 'careerDirections');
      if (directionsResult) {
        const lines = directionsResult.split('\n').filter(l => l.includes('|'));
        data.careerDirections = lines.map(function(line) {
          const parts = line.split('|');
          return {
            title: (parts[0] || '').trim(),
            description: (parts[1] || '').trim()
          };
        }).filter(d => d.title && d.description);
      }
      
      console.log('[parseTranscript] Gemini API整形完了');
    } catch (error) {
      console.error('[parseTranscript] Gemini API整形中にエラー:', error.toString());
    }
  }

  return data;
}

/**
 * 候補者の発言を抽出（動的に候補者名を使用）
 */
function extractCandidateResponses(text, candidateLastName, consultantLastName) {
  const results = [];
  
  // 候補者名が特定できない場合は、カウンセラー以外の発言を全て取得
  if (!candidateLastName) {
    // 発言パターンを検出
    const allMatches = text.match(/^[\*]*([^\*：:\n]+)[：:]\s*([^\n]+)/gm);
    if (allMatches) {
      allMatches.forEach(function(match) {
        const parts = match.match(/^[\*]*([^\*：:\n]+)[：:]\s*(.+)/);
        if (parts && parts[2]) {
          const speaker = parts[1].replace(/\*/g, '').trim();
          const content = parts[2].replace(/\*\*/g, '').trim();
          
          // カウンセラーの発言は除外
          if (!speaker.includes(consultantLastName) && content.length > 10) {
            results.push(cleanText(content, speaker));
          }
        }
      });
    }
  } else {
    // 候補者名での発言を検出（改行で区切る）
    const lines = text.split('\n');
    lines.forEach(function(line) {
      // 候補者名で始まる行を探す
      const candidateRegex = new RegExp('^[\\*]*' + candidateLastName + '[：:]\\s*(.+)', 'i');
      const match = line.match(candidateRegex);
      
      if (match && match[1]) {
        let content = match[1].replace(/\*\*/g, '').trim();
        content = cleanText(content, candidateLastName);
        
        if (content.length > 10) {
          results.push(content);
        }
      }
    });
  }
  
  return results;
}

/**
 * テキストをクリーンアップ（候補者名も除去）
 */
function cleanText(text, candidateLastName) {
  let cleaned = text
    // マークダウン記法を除去
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#+\s*/gm, '')        // # や ## を除去
    .replace(/##/g, '')             // 途中の ## も除去
    .replace(/`/g, '')              // バッククォートを除去
    // 発言者名パターンを除去（「田中：」「田中。」などの形式）
    .replace(/^[^\s：:。、]+[：:]\s*/g, '')
    // 末尾の不完全な発言者名を除去（「。田中」「。佐藤」など）
    .replace(/。[^\s。、]{1,4}$/g, '。')
    .replace(/、[^\s。、]{1,4}$/g, '')
    // 空白の正規化
    .replace(/\s+/g, ' ')
    .trim();
  
  // 候補者名が渡された場合、テキスト内の候補者名も除去
  if (candidateLastName) {
    // 「田中」「田中：」「。田中」などを除去
    const nameRegex = new RegExp('[。、\\s]?' + candidateLastName + '[：:、。]?\\s*', 'g');
    cleaned = cleaned.replace(nameRegex, '').trim();
  }
  
  // 句読点の正規化
  cleaned = normalizePunctuation(cleaned);
  
  // 長すぎる場合は最初の2文程度を抽出
  if (cleaned.length > 150) {
    // 2文目の終わりを探す
    const sentences = cleaned.match(/^[^。]+。[^。]+。/);
    if (sentences) {
      cleaned = sentences[0];
    } else {
      const firstSentence = cleaned.match(/^[^。]+。/);
      if (firstSentence) {
        cleaned = firstSentence[0];
      } else {
        cleaned = cleaned.substring(0, 150);
      }
    }
  }
  
  return cleaned;
}

/**
 * 句読点を正規化
 */
function normalizePunctuation(text) {
  return text
    // 文頭の不要な記号を除去
    .replace(/^[。、：:・\s]+/, '')
    // 文末の重複句読点を除去
    .replace(/。+/g, '。')
    .replace(/、+/g, '、')
    // 「。、」「、。」を「。」に
    .replace(/[。、]+/g, function(match) {
      return match.includes('。') ? '。' : '、';
    })
    // 文末に句点がなければ追加しない（そのまま）
    .trim();
}

/**
 * セクションを抽出
 */
function extractSection(text, sectionName) {
  const regex = new RegExp(`【${sectionName}[^】]*】([\\s\\S]*?)(?=【|$)`, 'i');
  const match = text.match(regex);
  if (match) {
    // マークダウン見出しを除去してから返す
    return match[1]
      .replace(/^##\s*.*$/gm, '')  // ## 見出しを除去
      .replace(/^#\s*.*$/gm, '')   // # 見出しを除去
      .trim();
  }
  return null;
}

// ===========================================
// レポート生成
// ===========================================

/**
 * HTMLレポートを生成
 */
function generateReport(data) {
  const template = HtmlService.createTemplateFromFile('template');
  template.data = data;
  return template.evaluate().getContent();
}

/**
 * 文字起こしデータを解析してデータのみ返す（編集用）
 */
function analyzeTranscript(transcriptText, useGemini) {
  try {
    const data = parseTranscript(transcriptText, useGemini);
    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 編集されたデータからHTMLレポートを生成
 */
function generateReportFromData(data) {
  try {
    const html = generateReport(data);
    return {
      success: true,
      html: html
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 文字起こしデータを処理してHTMLを返す（従来互換）
 */
function processTranscript(transcriptText, useGemini) {
  try {
    const data = parseTranscript(transcriptText, useGemini);
    const html = generateReport(data);
    return {
      success: true,
      html: html,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
