/* 아이디어 발굴 프롬프트 워크북
 * 프롬프트 템플릿의 {{key}} 는 노란 빈칸이 되고, 같은 key는 모든 카드·결과물 칸에서 함께 바뀝니다. */
(function () {
  'use strict';

  /* ───────── 빈칸 정의 ───────── */
  const FIELDS = {
    who:      { ph: '대학생 / 중장년 / 가게 사장님', opts: ['대학생', '중장년', '가게 사장님'] },
    field:    { ph: '자취 생활 / 자기소개와 취업 / 먹거리 / 여행 / 지역 가게', opts: ['자취 생활', '자기소개와 취업', '먹거리', '여행', '지역 가게', '가족 추억'], multi: true },
    persona:  { ph: '반찬 솜씨 좋은 55세 동네 주부', opts: ['반찬 솜씨 좋은 55세 동네 주부', '30년 된 동네 가게 사장님', '대학가에서 자취하는 2학년 대학생'] },
    topic:    { ph: '반찬을 만들어 파는 일' },
    memo:     { ph: '테이블에서 들은 말 두세 줄' },
    problem:  { ph: '앞에서 고른 문제 정의 문장' },
    idea:     { ph: '내가 고른 아이디어' },
    oneLiner: { ph: '한 줄 소개' },
    money:    { ph: '돈의 흐름: 누가, 무엇에, 어떻게 내나' },
    qa:       { ph: '프롬프트 9가 알려 준 예상 질문' },
    asks:     { ph: '(가정) 칸을 멘토에게 물을 질문으로' },
    // 만능 틀
    fRole:    { ph: '역할' },
    fMe:      { ph: '나는 누구이고 무엇을 하려는지' },
    fTask:    { ph: '해 줄 일' },
    fCond:    { ph: '지켜야 할 기준 두세 가지' },
    fShape:   { ph: '표 / 다섯 줄 / 번호 목록', opts: ['표', '다섯 줄', '번호 목록'] },
  };

  /* ───────── 사례 프리셋 (시뮬레이션 트랙 A·B) ───────── */
  const CASES = {
    case1: {
      who: '대학생', field: '자취 생활',
      persona: '반찬 솜씨 좋은 55세 동네 주부', topic: '반찬을 만들어 파는 일',
      memo: '반찬 나눠 준 적은 많은데 팔아 본 적은 없다. 주문 받고 돈 받는 게 제일 걸린다. 카톡으로 주문 받으면 될 것 같다.',
      problem: '자취생은 알바 끝난 평일 저녁 끼니를 챙기려 할 때 시간이 없고 1인분 배달은 비싸 거르거나 편의점으로 때운다. 지금은 편의점·배달로 버티지만 식비가 많이 들고 집밥 같은 반찬은 구할 수 없다.',
      idea: '9번 동네 반찬 요리인 ↔ 자취생 주간 구독',
      oneLiner: "자취 대학생을 위한 '동네 밥상 구독'으로, AI가 예산과 입맛에 맞춰 주간 반찬을 추천하고 동네 중장년 요리인과 이어 주어 평일 저녁 끼니 문제를 해결한다.",
      money: '학생 주간 구독(매주 자동 결제, 결제는 부모도 가능). 가격은 조사 필요',
    },
    case2: {
      who: '대학생', field: '자기소개와 취업',
      persona: '30년 된 동네 가게 사장님', topic: '가게를 알리는 일',
      memo: '내 일을 설명하려면 자랑 같아서 입이 안 떨어진다. 전단지는 해 봤는데 효과가 없었다.',
      problem: '취업 준비 대학생은 자기소개 글·영상을 만들 때 무엇을 말해야 할지 몰라 자격증과 경험을 나열한다. 지금은 인터넷 예시를 베끼거나 친구에게 묻지만 내 이야기가 빠져 남들과 비슷해진다.',
      idea: '9번 AI가 기자처럼 인터뷰해 만드는 30초 이야기 영상 (학생·사장님 공용)',
      oneLiner: "취업 준비 대학생과 가게 사장님을 위한 '30초 이야기 영상 코치'로, AI가 기자처럼 인터뷰해 자랑 대신 이야기로 된 대본과 영상 초안을 만들어 '뭘 말해야 할지 모르는' 문제를 해결한다.",
      money: '대학 취업지원센터 학기 단위 계약(한 학기 특강 + 영상 제작). 가격은 조사 필요',
    },
  };
  const TRACKS = { A: '트랙 A · 동네 밥상 잇기', B: '트랙 B · 나를 알리는 30초 영상' };

  /* ───────── 단계 · 프롬프트 (PPT 슬라이드 12~37) ───────── */
  const STAGES = [
    {
      id: 'stage1', step: '1단계', title: '문제 정의', time: '11:15 ~ 11:35 · 20분',
      output: '문제 정의 문장 1개', icon: 'search',
      intro: {
        title: '문제 정의 문장 공식',
        formula: '[누가]는 [어떤 상황에서] [무엇을 하려 할 때] [어떤 어려움]을 겪는다.\n지금은 [현재 방법]으로 버티지만 [그 한계]가 남는다.',
        tip: '빈칸 여섯 개가 다 차면 좋은 문제 정의입니다.',
      },
      prompts: [
        {
          n: 1, title: '불편 찾기', min: 3,
          tpl: '너는 창업 아이디어를 찾아 주는 문제 발견 코치야.\n나는 {{who}}이고,\n관심 있는 분야는 {{field}}야.\n이 분야에서 사람들이 실제로 겪는 불편을 15개 찾아 줘.\n조건\n- 한 문장에 \'누가, 언제, 무엇이 불편한지\'가 다 들어가게\n- \'귀찮다, 아깝다, 불안하다, 막막하다\' 네 가지 감정으로 나눠서\n- 대학생과 중장년이 함께 겪거나 서로 도울 수 있는 불편을 3개 이상 넣어 줘\n- 정보가 부족하면 먼저 나에게 질문 2개를 해 줘',
          callout: ['AI가 먼저 질문을 하면', '한 줄로 짧게 답하고 넘어가세요. 예) "대학가 원룸 1년, 평일 저녁 6~9시 수업과 알바." 길게 답하면 2분이 지나갑니다.'],
          why: [
            ['\'코치\' 역할', '답만 내놓지 않고 되묻습니다'],
            ['\'누가, 언제, 무엇이\'', '"홍보가 어렵다" 같은 막연한 불편을 막습니다'],
            ['감정 네 가지', '한쪽으로 쏠리지 않고 고르게 나옵니다'],
            ['세대 조건', '테이블의 다른 세대와 바로 이어집니다'],
          ],
        },
        {
          n: 2, title: 'AI 가상 고객 인터뷰', min: 3,
          tpl: '지금부터 너는 {{persona}}이야.\n실제 그 사람처럼 솔직하고 짧게 대답해 줘. 모르는 건 모른다고 해.\n나는 창업을 준비하고 있고, {{topic}}에 대해 인터뷰하려고 해.\n내 질문에 그 사람의 입장에서만 대답해 줘.',
          followups: {
            title: '이렇게 물어보세요',
            items: ['최근에 그 일을 할 때 어떻게 하셨어요?', '그때 가장 답답했던 순간은요?', '돈이나 시간을 얼마나 쓰셨어요?', '누구에게 도움을 받아 보셨어요?'],
            note: '앞으로 쓸지를 묻지 말고, 지난 행동을 묻습니다. 미래 질문에는 누구나 "좋네요"라고 답합니다. 시간이 빠듯하면 네 질문을 한 번에 보내거나 음성 입력을 쓰세요.',
            all: '아래 네 질문에 차례로 답해 줘.',
          },
          why: [
            ['트랙 A라면', '[반찬 솜씨 좋은 55세 동네 주부], [반찬을 만들어 파는 일]'],
            ['트랙 B라면', '[30년 된 동네 가게 사장님], [가게를 알리는 일]'],
            ['AI 고객의 숫자', '"서너 시간, 열 명분"처럼 그럴듯한 숫자는 지어낸 가설입니다. 진짜 숫자는 테이블의 사람에게서'],
            ['지난 행동을 묻기', '"쓰실 건가요?"보다 "지난번엔 어떻게 하셨어요?"가 진짜 답을 끌어냅니다'],
          ],
        },
        {
          offline: true, title: '세대 인터뷰 · 진짜 고객에게 묻기', min: 4,
          cols: [
            ['대학생 → 중장년', ['요즘 가장 귀찮거나 아까운 일은요?', '자녀나 주변 젊은 사람 때문에 걱정되는 일은요?']],
            ['중장년 → 대학생', ['지난주에 가장 불편했던 순간은요?', '그때 어떻게 해결했고, 돈은 얼마나 썼어요?']],
          ],
          note: '2분씩 서로 묻습니다. 중장년이 없는 테이블은 이웃 테이블과 짝을 짓거나 프롬프트 2를 한 번 더 합니다.',
          ask: 'AI 고객과 진짜 고객의 답, 어디서 달랐나요? 들은 말을 아래 메모에 적어 두면 프롬프트 3에 들어갑니다.',
          memoKey: 'memo',
        },
        {
          n: 3, title: '문제 정의 문장', min: 4,
          tpl: '지금까지의 대화와 아래 실제 인터뷰 메모를 바탕으로 문제 정의 문장을 3개 써 줘.\n실제 인터뷰 메모: {{memo}}\n형식: [누가]는 [어떤 상황에서] [무엇을 하려 할 때] [어떤 어려움]을 겪는다.\n지금은 [현재 방법]으로 버티지만 [그 한계]가 남는다.\n각 문장을 아래 세 기준으로 1~5점 매겨 표로 보여 줘.\n- 이 불편을 겪는 사람이 많은가\n- 자주, 크게 겪는가\n- 지금 돈이나 시간을 쓰고 있는가\n가장 점수가 높은 문장 하나를 고르고 이유를 두 줄로 써 줘.',
          why: [
            ['형식 지정', '빠진 칸이 바로 보입니다'],
            ['실제 인터뷰 메모', '일반론 대신 진짜 고객의 말로 문장을 씁니다'],
            ['세 가지 기준', '심사위원이 묻는 \'시장이 있나, 절실한가, 돈이 되나\'와 같습니다'],
          ],
        },
      ],
      results: [
        { key: 'problem', label: '문제 정의 문장', hint: 'AI가 고른 문장을 붙여 넣고, 빈칸 여섯 개가 다 찼는지 확인하세요. 오픈채팅방에도 올립니다.', builder: true },
      ],
    },
    {
      id: 'stage2', step: '2단계', title: '아이디어 도출', time: '11:35 ~ 11:55 · 20분',
      output: '한 줄 아이디어 1개', icon: 'bulb',
      intro: {
        title: '펼치고, 좁히고, 다듬는다',
        funnel: [['20', 'AI가 펼친다', '프롬프트 4'], ['5', '기준으로 좁힌다', '프롬프트 5'], ['1', '한 줄로 다듬는다', '프롬프트 6']],
        tip: '펼치기는 AI가, 고르기는 사람이 합니다.',
      },
      prompts: [
        {
          n: 4, title: '아이디어 20개 펼치기', min: 4,
          tpl: '너는 창업 아이디어 발상 전문가야.\n아래 문제를 해결하는 아이디어를 20개 내 줘.\n문제: {{problem}}\n조건\n- 다섯 방향으로 4개씩\n① AI가 대신 해 준다   ② AI가 가르쳐 준다\n③ 사람과 사람을 이어 준다   ④ 다른 업종의 방법을 빌려 온다\n⑤ 정반대로 뒤집어 본다\n- 아이디어마다 한 줄로\n- 뻔한 것과 엉뚱한 것을 섞어 줘',
          why: [
            ['다섯 방향', '비슷한 20개가 아니라 서로 다른 20개가 나옵니다'],
            ['사람과 사람을 이어 준다', '세대 협업 아이디어가 나오는 자리입니다. 트랙 A의 반찬 구독, 트랙 B의 AI 기자 인터뷰가 여기서 나왔습니다'],
            ['엉뚱한 것 허락', '심사위원이 기억할 아이디어가 섞여 나옵니다'],
          ],
        },
        {
          n: 5, title: '다섯 개로 좁히기', min: 5, chained: true,
          tpl: '위 20개 중에서 해커톤에 맞는 아이디어 5개를 골라 표로 비교해 줘.\n칸: 아이디어 / 문제를 얼마나 풀어 주나 / 대학생 팀이 6개월 안에 시작할 수 있나 / AI가 꼭 필요한가 / 비슷한 서비스와 다른 점\n점수 칸은 1~5점, 마지막에 합계.\n합계 1위와, 점수는 낮지만 가능성이 큰 숨은 후보 하나를 추천해 줘.',
          why: [
            ['기준은 내가 정한다', 'AI가 고른 \'좋아 보이는 답\'에 끌려가지 않습니다'],
            ['AI가 꼭 필요한가', 'AI 창업 해커톤이라 꼭 넣습니다. "단순 매칭이면 AI가 필요 없다"는 단서가 여기서 나옵니다'],
            ['고르는 건 사람', '테이블의 다른 세대에게 "이거라면 돈을 내시겠어요?"'],
          ],
        },
        {
          n: 6, title: '한 줄로 다듬기', min: 5,
          tpl: '내가 고른 아이디어는 {{idea}}야. 아래 형식으로 정리해 줘.\n1. 한 줄 소개: [누구]를 위한 [서비스]로, [AI가 하는 일]을 통해 [문제]를 해결한다\n2. 고객이 처음 쓰는 순간부터 끝까지 다섯 단계 사용 장면\n3. 부르기 쉬운 서비스 이름 5개',
          why: [
            ['한 줄 소개 형식', '내일 발표의 첫 문장이 됩니다'],
            ['사용 장면 다섯 단계', '빠진 기능과 AI가 들어갈 자리가 보입니다'],
          ],
        },
      ],
      results: [
        { key: 'idea', label: '고른 아이디어', hint: '프롬프트 5의 표를 보고 사람이 고릅니다. 프롬프트 6에 자동으로 들어갑니다.', short: true },
        { key: 'oneLiner', label: '한 줄 소개', hint: '[누구]를 위한 [서비스]로, [AI가 하는 일]을 통해 [문제]를 해결한다' },
      ],
    },
    {
      id: 'stage3', step: '3단계', title: '비즈니스 모델', time: '11:55 ~ 12:15 · 20분',
      output: '린 캔버스 초안 1장', icon: 'canvas',
      intro: { title: '린 캔버스 9칸', canvas: true, tip: '오후 워크숍이 비즈니스 모델 캔버스를 쓰면 프롬프트 7의 캔버스 이름만 바꿔 넣습니다.' },
      prompts: [
        {
          n: 7, title: '린 캔버스 초안', min: 7,
          tpl: '너는 초기 창업팀을 돕는 사업 모델 코치야.\n아래 내용으로 린 캔버스 9칸 초안을 만들어 줘.\n문제: {{problem}}\n아이디어: {{oneLiner}}\n칸: 문제 / 고객 / 고유한 가치(한 문장) / 해결 방법 / 고객을 만나는 길 / 수익 / 비용 / 핵심 숫자(성공을 무엇으로 셀까) / 남이 따라 하기 어려운 강점\n조건\n- 칸마다 2~3줄, 대학생 팀이 실제로 할 수 있는 수준으로\n- 아직 확인하지 않은 내용에는 (가정)이라고 표시\n- 시장 규모나 통계 숫자는 지어내지 말고 \'조사 필요\'라고 써 줘',
          why: [
            ['문제와 아이디어 다시 붙이기', '새 대화창에서도 이어서 쓸 수 있습니다'],
            ['(가정) 표시', '멘토링 때 확인할 질문 목록이 됩니다'],
            ['숫자 지어내지 않기', '출처 없는 시장 규모는 심사장에서 무너집니다'],
          ],
        },
        {
          n: 8, title: '돈의 흐름 설계', min: 5, chained: true,
          tpl: '이 서비스로 돈을 버는 방법을 세 가지로 설계해 줘.\n각각: 누가 돈을 내나 / 무엇에 내나 / 어떻게 내나(한 번, 매달, 건당) / 첫 고객 10명을 어디서 찾나\n그중 가장 현실적인 하나를 고르고, 다음 한 달 동안 해 볼 수 있는 작은 실험 하나를 제안해 줘.',
          why: [
            ['누가 돈을 내나', '쓰는 사람과 돈 내는 사람이 다를 수 있습니다'],
            ['사례로 보면', '트랙 A는 학생이 먹고 부모가 냅니다. 트랙 B는 학생이 쓰고 취업지원센터가 냅니다'],
            ['작은 실험', '"다음에 무엇을 할 건가요?"의 답이 됩니다'],
          ],
          aside: '실습 중 한마디 · 다른 세대에게 "얼마면 내시겠어요?"',
        },
      ],
      results: [
        { key: 'money', label: '돈의 흐름', hint: '프롬프트 8에서 고른 가장 현실적인 방법. 누가, 무엇에, 어떻게 내나.' },
        { key: 'asks', label: '멘토에게 물을 질문', hint: '린 캔버스의 (가정) 표시 칸을 질문으로 옮겨 적습니다.' },
      ],
    },
  ];

  const P9 = {
    n: 9, title: '약점 점검', min: 5,
    tpl: '아래 창업 아이디어를 심사위원 입장에서 날카롭게 검토해 줘.\n심사위원: 투자사 대표, 창업 연구소장, IT 기업 매니저, ESG 협회 대표, 지역 진흥원 연구원\n문제 정의: {{problem}}\n한 줄 소개: {{oneLiner}}\n돈의 흐름: {{money}}\n1. 약점 다섯 가지\n2. 가장 치명적인 약점 하나와 보완 방법\n3. 질의응답 5분 동안 심사위원이 물어볼 질문 다섯 가지',
    why: [
      ['실제 심사위원 구성', '역할로 넣으면 질문이 현실에 가까워집니다'],
      ['약점은 아이디어마다 다르다', '트랙 A는 위생·법규, 트랙 B는 차별성. 그래서 멘토에게 물을 것도 다릅니다'],
      ['보완 → 확인', '보완책은 AI가 내지만, 실제로 가능한지는 멘토링에서 묻는다'],
    ],
  };

  const FRAME = {
    n: 0, title: '나만의 프롬프트', frame: true,
    tpl: '너는 {{fRole}}이야.\n나는 {{fMe}}야.\n{{fTask}}을 해 줘.\n조건: {{fCond}}\n{{fShape}}(으)로 정리해 줘.\n정보가 부족하면 먼저 나에게 질문해 줘.',
    rows: ['역할', '상황', '할 일', '조건', '답 모양', '되묻기'],
  };

  const CANVAS = [
    ['problem', '문제', '무엇이 불편한가'],
    ['solution', '해결 방법', '어떻게 풀어 주나'],
    ['uvp', '고유한 가치', '한 문장으로 하는 약속'],
    ['edge', '강점', '남이 쉽게 따라 하지 못하는 것'],
    ['customer', '고객', '누가 겪고, 누가 먼저 쓰나'],
    ['metric', '핵심 숫자', '성공을 무엇으로 세나'],
    ['channel', '고객을 만나는 길', '어디서 만나나'],
    ['cost', '비용', '무엇에 돈이 드나'],
    ['revenue', '수익', '누가, 무엇에, 얼마를 내나'],
  ];

  const AIS = [
    { id: 'chatgpt', name: 'ChatGPT', url: (q) => 'https://chatgpt.com/?q=' + encodeURIComponent(q) },
    { id: 'gemini', name: 'Gemini', url: () => 'https://gemini.google.com/app', pasteOnly: true },
    { id: 'claude', name: 'Claude', url: (q) => 'https://claude.ai/new?q=' + encodeURIComponent(q) },
  ];

  const ICONS = {
    search: '<circle cx="27" cy="27" r="17" fill="none" stroke="currentColor" stroke-width="5"/><path d="M40 40l14 14" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
    bulb: '<path d="M32 8a17 17 0 0 0-10 30.8V45h20v-6.2A17 17 0 0 0 32 8z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M24 53h16" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
    canvas: '<rect x="8" y="12" width="48" height="40" rx="2" fill="none" stroke="currentColor" stroke-width="5"/><path d="M8 40h48M24 12v28M40 12v28M32 40v12" stroke="currentColor" stroke-width="4"/>',
  };

  /* ───────── 상태 ───────── */
  const STORE = 'idea-workbook-v1';
  let state = { f: {}, done: {} };
  try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && s.f) state = { f: s.f, done: s.done || {} }; } catch (e) { /* 저장소 없음 */ }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* 무시 */ } };
  const val = (k) => (state.f[k] || '').trim();

  /* ───────── 유틸 ───────── */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const keysOf = (tpl) => [...new Set([...tpl.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
  const fill = (tpl) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => val(k) || '[' + FIELDS[k].ph + ']');

  function copyText(text) {
    // 클릭 처리 중에 바로 호출해야 합니다. 클립보드 API가 거부되면 선택-복사로 대신합니다.
    if (navigator.clipboard && window.isSecureContext) {
      try { navigator.clipboard.writeText(text).catch(() => execCopy(text)); return true; } catch (e) { /* 아래로 */ }
    }
    return execCopy(text);
  }
  function execCopy(text) {
    let ok = false;
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.top = '0';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ───────── 렌더: 프롬프트 박스 ───────── */
  function promptBody(tpl) {
    return tpl.split(/(\{\{\w+\}\})/).map((part) => {
      const m = part.match(/^\{\{(\w+)\}\}$/);
      if (!m) return esc(part);
      const k = m[1];
      return '<span class="blank" contenteditable="true" spellcheck="false" role="textbox" aria-label="' + esc(FIELDS[k].ph) + '" data-key="' + k + '" data-ph="' + esc(FIELDS[k].ph) + '">' + esc(val(k)) + '</span>';
    }).join('');
  }

  function optsRow(tpl) {
    return keysOf(tpl).filter((k) => FIELDS[k].opts).map((k) =>
      '<div class="opts" data-for="' + k + '">' + FIELDS[k].opts.map((o) =>
        '<button type="button" class="chip" data-key="' + k + '" data-opt="' + esc(o) + '">' + esc(o) + '</button>').join('') + '</div>'
    ).join('');
  }

  function actions(id) {
    return '<div class="actions" data-pid="' + id + '">' +
      '<button type="button" class="btn primary" data-act="copy">복사하기</button>' +
      '<div class="ai-row"><span class="ai-label">복사하고 열기</span>' +
      AIS.map((a) => '<a class="btn ai ai-' + a.id + '" href="' + a.url('') + '" target="_blank" rel="noopener" data-act="open" data-ai="' + a.id + '">' + a.name + '</a>').join('') +
      '</div></div>';
  }

  function whyList(why) {
    return '<aside class="why"><h4>이 줄을 넣는 이유</h4><dl>' +
      why.map(([t, d]) => '<dt>' + esc(t) + '</dt><dd>' + esc(d) + '</dd>').join('') + '</dl></aside>';
  }

  /* ───────── 샘플 답 (시뮬레이션 트랙 A·B) ───────── */
  const SAMPLES = window.SAMPLES || {};
  let track = 'A';
  try { if (localStorage.getItem('idea-workbook-track') === 'B') track = 'B'; } catch (e) { /* 무시 */ }

  function sampleBlock(b) {
    if (b.t === 'ask') return '<div class="s-ask"><p class="s-sent"><b>보낸 내용</b> ' + esc(b.sent) + '</p>' +
      '<p class="bubble ai"><b>AI</b>' + esc(b.ai) + '</p><p class="bubble me"><b>나</b>' + esc(b.me) + '</p></div>';
    if (b.t === 'chat') return '<div class="s-chat">' + b.rows.map(([q, a]) =>
      '<p class="bubble me"><b>나</b>' + esc(q) + '</p><p class="bubble ai"><b>AI · ' + esc(b.role) + '</b>' + esc(a) + '</p>').join('') + '</div>';
    if (b.t === 'table') return '<div class="tbl-wrap"><table class="s-table' + (b.num ? ' num' : '') + '"><thead><tr>' + b.head.map((h) => '<th>' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' +
      b.rows.map((r) => '<tr>' + r.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    if (b.t === 'canvas') return canvasGrid(b.c);
    if (b.t === 'flow') return '<ol class="flow">' + b.steps.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol>';
    if (b.t === 'list') return '<div class="s-list"><h5>' + esc(b.title) + '</h5><ol>' + b.items.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol></div>';
    if (b.t === 'pick') return '<p class="s-pick"><b>' + esc(b.label) + '</b>' + esc(b.text) + '</p>';
    return '';
  }

  function samplesBox(n) {
    const sm = SAMPLES[n];
    if (!sm) return '';
    return '<details class="sample" data-sample="' + n + '"><summary>샘플 답 보기 · 실습 시뮬레이션 결과</summary>' +
      '<div class="tabs" role="tablist">' + Object.keys(TRACKS).map((k) =>
        '<button type="button" class="tab" role="tab" data-track="' + k + '" aria-selected="' + (k === track) + '">' + TRACKS[k] + '</button>').join('') + '</div>' +
      Object.keys(TRACKS).map((k) => '<div class="tab-panel" data-panel="' + k + '"' + (k === track ? '' : ' hidden') + '>' + sm[k].map(sampleBlock).join('') + '</div>').join('') +
      '<p class="note">같은 프롬프트에 빈칸만 바꿔 넣고 한 대화창에서 이어 돌린 실제 답을 줄인 것입니다. AI 앱마다 표현은 달라도 모양과 분량은 비슷합니다.</p></details>';
  }

  function setTrack(k) {
    track = k;
    try { localStorage.setItem('idea-workbook-track', k); } catch (e) { /* 무시 */ }
    document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.track === k)));
    document.querySelectorAll('.tab-panel').forEach((p) => { p.hidden = p.dataset.panel !== k; });
  }

  /* PPT 하단 '다음 ›' 줄 */
  let NEXT = {};
  function footer(id) {
    const nx = NEXT[id];
    return '<footer class="card-foot"><a href="#' + (nx ? nx.href : 'finale') + '"><span>다음 ›</span> ' + esc(nx ? nx.label : '마무리') + '</a><span>김미연 강사</span></footer>';
  }

  function promptCard(p, stage) {
    const keys = keysOf(p.tpl);
    let extra = '';
    if (p.followups) {
      const f = p.followups;
      extra += '<div class="followups"><h4>' + f.title + '</h4><ul>' +
        f.items.map((q) => '<li><span>"' + esc(q) + '"</span><button type="button" class="mini" data-copy="' + esc(q) + '">복사</button></li>').join('') +
        '</ul>' + (f.all ? '<button type="button" class="btn sm" data-copy="' + esc(f.all + '\n' + f.items.map((q, i) => (i + 1) + '. ' + q).join('\n')) + '">네 질문 한 번에 복사</button>' : '') +
        '<p class="note">' + esc(f.note) + '</p></div>';
    }
    extra += samplesBox(p.n);
    const hint = keys.length
      ? '<span class="sw"></span>노란 칸만 내 상황으로 바꿔 넣습니다 <span class="left" data-left></span>'
      : '바꿀 곳이 없습니다. 앞의 대화에 이어서 그대로 붙여 넣습니다.';
    return '<article class="card" id="p' + p.n + '" data-pid="' + p.n + '">' +
      '<p class="card-kicker">' + (stage ? stage.step + ' ' + stage.title : '마무리') + ' · 프롬프트 ' + p.n + '</p>' +
      '<header class="card-head"><h3><span class="pn">프롬프트 ' + p.n + '</span> · ' + esc(p.title) + '</h3>' +
      '<span class="min">' + p.min + '분</span><span class="done-badge" aria-hidden="true">✓ 복사함</span></header>' +
      '<div class="card-grid"><div class="card-main">' +
      '<div class="pbox' + (p.chained ? ' chained' : '') + '"><div class="ptext">' + promptBody(p.tpl) + '</div></div>' +
      optsRow(p.tpl) +
      '<p class="hint">' + hint + '</p>' +
      actions(p.n) +
      (p.callout ? '<p class="callout"><b>' + esc(p.callout[0]) + '</b>' + esc(p.callout[1]) + '</p>' : '') +
      (p.chained ? '<p class="chain-note">앞의 답을 보고 이어서 묻는 프롬프트입니다. 새 대화로 열지 말고 <b>같은 대화창에 붙여 넣으세요.</b></p>' : '') +
      (p.aside ? '<p class="aside">' + esc(p.aside) + '</p>' : '') +
      extra +
      '</div>' + whyList(p.why) + '</div>' + footer('p' + p.n) + '</article>';
  }

  function offlineCard(p, stage) {
    return '<article class="card offline" id="talk"><p class="card-kicker">' + stage.step + ' ' + stage.title + ' · 테이블에서</p><header class="card-head"><h3><span class="pn">테이블에서</span> · ' + esc(p.title) + '</h3><span class="min">' + p.min + '분</span></header>' +
      '<div class="interview">' + p.cols.map(([t, qs]) => '<div><h4>' + esc(t) + '</h4><ul>' + qs.map((q) => '<li>"' + esc(q) + '"</li>').join('') + '</ul></div>').join('') + '</div>' +
      '<p class="note">' + esc(p.note) + '</p>' +
      '<p class="ask">' + esc(p.ask) + '</p>' +
      resultField({ key: p.memoKey, label: '실제 인터뷰 메모', hint: '들은 말을 그대로 두세 줄. 프롬프트 3의 노란 칸에 들어갑니다.' }) +
      footer('talk') + '</article>';
  }

  function resultField(r) {
    return '<label class="result' + (r.short ? ' short' : '') + '"><span class="result-label">' + esc(r.label) + '</span>' +
      (r.short
        ? '<input type="text" data-key="' + r.key + '" placeholder="' + esc(FIELDS[r.key].ph) + '" value="' + esc(val(r.key)) + '">'
        : '<textarea rows="3" data-key="' + r.key + '" placeholder="' + esc(FIELDS[r.key].ph) + '">' + esc(val(r.key)) + '</textarea>') +
      '<span class="result-hint">' + esc(r.hint) + '</span></label>';
  }

  function builder() {
    const parts = [['누가', '자취하는 대학생'], ['어떤 상황에서', '바쁜 평일 저녁에'], ['무엇을 하려 할 때', '끼니를 챙기려 할 때'], ['어떤 어려움', '시간과 돈이 모자라 거르게 되는 어려움'], ['현재 방법', '편의점 음식과 배달 앱'], ['그 한계', '1인분 배달은 비싸고 집밥 같은 반찬은 구하기 어려운 한계']];
    return '<details class="builder"><summary>공식으로 직접 써 보기 (빈칸 여섯 개)</summary><div class="builder-grid">' +
      parts.map(([l, ph], i) => '<label><span>' + l + '</span><input type="text" data-b="' + i + '" placeholder="' + ph + '"></label>').join('') +
      '</div><p class="builder-out" id="builderOut"></p><button type="button" class="btn" id="builderSave">문제 정의 문장으로 저장</button></details>';
  }

  function canvasGrid(c, live) {
    return '<div class="lean">' + CANVAS.map(([k, t, d]) =>
      '<div class="lc lc-' + k + '"><b>' + t + '</b><span>' + esc(c ? (c[k] || '') : d) + '</span></div>').join('') + '</div>';
  }

  function stageIntro(s) {
    const i = s.intro;
    let body = '';
    if (i.formula) body = '<p class="formula">' + esc(i.formula).replace(/\[([^\]]+)\]/g, '<span class="fb">$1</span>').replace(/\n/g, '<br>') + '</p>';
    if (i.funnel) body = '<div class="funnel">' + i.funnel.map(([n, t, p]) => '<div class="fn"><b>' + n + '</b><strong>' + t + '</strong><span>' + p + '</span></div>').join('<span class="arrow">→</span>') + '</div>';
    if (i.canvas) body = canvasGrid(null);
    return '<div class="slide"><h3 class="slide-title sm">' + i.title + '</h3>' + body + '<p class="tip">' + i.tip + '</p></div>';
  }

  function divider(s, idx) {
    return '<div class="divider"><div class="divider-text"><p class="divider-step">' + s.step + '</p><h2>' + s.title + '</h2>' +
      '<p class="divider-time">' + s.time + '</p><p class="divider-meta">결과물 <strong>' + s.output + '</strong></p>' +
      '<ol class="stage-flow">' + STAGES.map((x, j) => '<li class="' + (j === idx ? 'on' : '') + '">' + x.step + ' ' + x.title + '</li>').join('') + '</ol></div>' +
      '<svg class="divider-icon" viewBox="0 0 64 64" aria-hidden="true">' + ICONS[s.icon] + '</svg></div>';
  }

  function buildNext() {
    const seq = [];
    STAGES.forEach((s) => s.prompts.forEach((p) => seq.push(p.offline ? { id: 'talk', label: '테이블에서 · ' + p.title } : { id: 'p' + p.n, label: '프롬프트 ' + p.n + ' · ' + p.title })));
    seq.push({ id: 'p9', label: '프롬프트 9 · ' + P9.title });
    NEXT = {};
    seq.forEach((x, i) => { const nx = seq[i + 1]; NEXT[x.id] = nx ? { href: nx.id, label: nx.label } : { href: 'frame', label: '만능 틀 · 나만의 프롬프트' }; });
  }

  function renderStages() {
    buildNext();
    document.getElementById('stages').innerHTML = STAGES.map((s, idx) =>
      '<section class="sec" id="' + s.id + '" data-label="' + s.step + ' · ' + s.title + '">' +
      divider(s, idx) + stageIntro(s) +
      s.prompts.map((p) => (p.offline ? offlineCard(p, s) : promptCard(p, s))).join('') +
      '<div class="outbox"><h3>내 결과물 · ' + s.output + '</h3>' + s.results.map(resultField).join('') +
      (s.results.some((r) => r.builder) ? builder() : '') +
      '<p class="note">이 칸에 적은 내용이 다음 단계 프롬프트의 노란 칸에 자동으로 들어갑니다.</p></div>' +
      '</section>').join('');

    document.getElementById('finaleBody').innerHTML =
      '<div class="slide"><h3 class="slide-title sm">두 사람의 한 줄</h3><p class="note">대학생 한 명, 중장년 한 명 · 두 문장만 읽어 주세요. 빈칸이 다 찼나요?</p>' +
      '<div class="two-lines"><div><span class="tl-n">①</span><b>문제 정의 문장</b><p data-show="problem"></p></div>' +
      '<div><span class="tl-n">②</span><b>한 줄 소개</b><p data-show="oneLiner"></p></div></div></div>' +
      promptCard(P9) +
      '<div class="slide"><h3 class="slide-title sm">두 트랙의 치명적 약점, 나란히</h3><div class="pair">' +
      '<div><span class="case-tag">' + TRACKS.A + '</span><strong>위생·법규</strong><span>집에서 만든 반찬 판매는 위생 신고 대상. 공유주방·기존 반찬 가게와 손잡는 길을 멘토에게 묻는다</span></div>' +
      '<div><span class="case-tag">' + TRACKS.B + '</span><strong>차별성</strong><span>"챗GPT에 그냥 묻는 것과 뭐가 다른가?" 묻고 들어서 이야기를 꺼낸다는 점을 증명할 방법을 멘토에게 묻는다</span></div>' +
      '</div><p class="tip">약점은 아이디어마다 다르고, 그래서 멘토에게 물을 것도 다릅니다.</p></div>' +
      '<div class="outbox"><h3>내 결과물 · 오후에 들고 갈 세 가지</h3>' + resultField({ key: 'qa', label: '예상 질문과 보완', hint: '프롬프트 9의 질문 다섯 가지. 내일 발표 질의응답에 대비합니다.' }) +
      '<button type="button" class="btn primary" id="copyAll">결과물 한 번에 복사 (오픈채팅방·팀 공유용)</button></div>' +
      '<div class="slide"><h3 class="slide-title sm">AI 답을 믿기 전에</h3><ol class="three">' +
      '<li><b>1</b><div><strong>AI 답은 \'가설\'이다</strong><span>진짜인지는 고객이 정한다</span></div></li>' +
      '<li><b>2</b><div><strong>숫자는 출처를 찾는다</strong><span>AI 고객의 숫자는 가설, 진짜 숫자는 테이블의 사람에게서</span></div></li>' +
      '<li><b>3</b><div><strong>한 번에 끝내지 않는다</strong><span>되묻고, 비교하고, 공격하게 한다</span></div></li></ol></div>' +
      '<div class="slide"><h3 class="slide-title sm">오후와 내일로</h3><div class="next3">' +
      '<div><b>13:30</b><strong>팀빌딩</strong><span>문제 정의 문장을 들고 가세요. 팀 주제를 고를 때 후보가 됩니다.</span></div>' +
      '<div><b>15:30</b><strong>멘토링</strong><span>프롬프트 9로 약점을 먼저 점검. (가정) 표시 칸을 멘토에게 물을 질문으로.</span></div>' +
      '<div><b>내일</b><strong>발표</strong><span>발표 5분 + 질의응답 5분. 한 줄 소개가 첫 문장, 예상 질문으로 대비.</span></div></div></div>';
    updateBuilder();

    const rows = FRAME.tpl.split('\n');
    document.getElementById('frameCard').innerHTML =
      '<article class="card frame" id="p0" data-pid="0"><div class="pbox"><div class="frame-rows">' +
      rows.map((r, i) => '<div class="fr"><span class="fr-label">' + FRAME.rows[i] + '</span><span class="fr-text">' + promptBody(r) + '</span></div>').join('') +
      '</div></div>' + optsRow(FRAME.tpl) + '<p class="hint"><span class="sw"></span>노란 칸을 채우면 어떤 질문이든 좋은 프롬프트가 됩니다 <span class="left" data-left></span></p>' + actions(0) + '</article>';
  }

  /* ───────── 동기화 ───────── */
  const tplOf = (pid) => { pid = +pid; if (pid === 0) return FRAME.tpl; if (pid === 9) return P9.tpl; for (const s of STAGES) for (const p of s.prompts) if (p.n === pid) return p.tpl; return ''; };

  function refresh() {
    document.querySelectorAll('.card[data-pid]').forEach((card) => {
      const left = keysOf(tplOf(card.dataset.pid)).filter((k) => !val(k)).length;
      const el = card.querySelector('[data-left]');
      if (el) { el.textContent = left ? '· 빈칸 ' + left + '개 남음' : '· 모두 채움 ✓'; el.classList.toggle('ok', !left); }
      card.classList.toggle('is-done', !!state.done[card.dataset.pid]);
    });
    document.querySelectorAll('.chip').forEach((c) => {
      const v = val(c.dataset.key);
      const on = FIELDS[c.dataset.key].multi ? v.split(/\s*\/\s*/).includes(c.dataset.opt) : v === c.dataset.opt;
      c.classList.toggle('on', on);
    });
    document.querySelectorAll('[data-show]').forEach((el) => {
      const v = val(el.dataset.show);
      el.textContent = v || (el.dataset.show === 'problem'
        ? '[누가]는 [어떤 상황에서] [무엇을 하려 할 때] [어떤 어려움]을 겪는다. 지금은 [현재 방법]으로 버티지만 [그 한계]가 남는다.'
        : '[누구]를 위한 [서비스]로, [AI가 하는 일]을 통해 [문제]를 해결한다');
      el.classList.toggle('empty', !v);
    });
    const n = Object.keys(state.done).filter((k) => k !== '0').length;
    document.getElementById('crumbProgress').textContent = n + ' / 9';
  }

  function setField(key, v, source) {
    state.f[key] = v; save();
    document.querySelectorAll('[data-key="' + key + '"]').forEach((el) => {
      if (el === source || el.classList.contains('chip')) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = v; else el.textContent = v;
    });
    refresh();
  }

  /* ───────── 이벤트 ───────── */
  function bind() {
    document.addEventListener('input', (e) => {
      const el = e.target;
      if (el.matches('.blank')) {
        let v = el.innerText.replace(/\n+$/, '');
        if (!v.trim()) { el.innerHTML = ''; v = ''; }
        setField(el.dataset.key, v, el);
      } else if (el.matches('input[data-key], textarea[data-key]')) {
        setField(el.dataset.key, el.value, el);
      } else if (el.matches('[data-b]')) {
        updateBuilder();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.matches && e.target.matches('.blank') && e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
    });
    document.addEventListener('paste', (e) => {
      if (!e.target.closest || !e.target.closest('.blank')) return;
      e.preventDefault();
      const t = (e.clipboardData || window.clipboardData).getData('text').replace(/\s*\n\s*/g, ' ');
      document.execCommand('insertText', false, t);
    });

    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) {
        const k = chip.dataset.key, o = chip.dataset.opt;
        if (FIELDS[k].multi) {
          const cur = val(k) ? val(k).split(/\s*\/\s*/).filter(Boolean) : [];
          const i = cur.indexOf(o); if (i >= 0) cur.splice(i, 1); else cur.push(o);
          setField(k, cur.join(' / '));
        } else setField(k, val(k) === o ? '' : o);
        return;
      }
      const tab = e.target.closest('.tab');
      if (tab) { setTrack(tab.dataset.track); return; }
      const mini = e.target.closest('[data-copy]');
      if (mini) { copyText(mini.dataset.copy); toast('질문을 복사했어요. AI 대화창에 붙여 넣으세요.'); return; }

      const btn = e.target.closest('[data-act]');
      if (btn) {
        const pid = btn.closest('[data-pid]').dataset.pid;
        const text = fill(tplOf(pid));
        const left = keysOf(tplOf(pid)).filter((k) => !val(k)).length;
        const ok = copyText(text);
        state.done[pid] = true; save(); refresh();
        if (btn.dataset.act === 'open') {
          const ai = AIS.find((a) => a.id === btn.dataset.ai);
          btn.href = ai.url(text); // 기본 링크 이동이 이 주소로 새 탭을 엽니다
          toast(ai.pasteOnly ? '복사했어요. ' + ai.name + ' 입력창을 길게 눌러 붙여 넣으세요.' : ai.name + ' 새 대화로 엽니다. 이미 대화 중이면 그 창에 붙여 넣으세요.');
        } else {
          toast(ok ? (left ? '복사했어요. 빈칸 ' + left + '개는 [ ]로 남아 있어요.' : '복사했어요. AI 대화창에 붙여 넣으세요.') : '복사에 실패했어요. 프롬프트를 길게 눌러 직접 복사해 주세요.');
        }
        return;
      }

      const cc = e.target.closest('[data-case]');
      if (cc) { applyCase(cc.dataset.case); return; }

      if (e.target.id === 'builderSave') {
        const s = builderSentence();
        if (!s) { toast('빈칸 여섯 개를 먼저 채워 주세요.'); return; }
        setField('problem', s); toast('문제 정의 문장으로 저장했어요.');
      }
      if (e.target.id === 'copyAll') {
        const t = '■ 문제 정의 문장\n' + (val('problem') || '-') + '\n\n■ 한 줄 소개\n' + (val('oneLiner') || '-') +
          '\n\n■ 돈의 흐름\n' + (val('money') || '-') + '\n\n■ 멘토에게 물을 질문\n' + (val('asks') || '-') + '\n\n■ 예상 질문과 보완\n' + (val('qa') || '-');
        copyText(t); toast('결과물을 모두 복사했어요.');
      }
      if (e.target.id === 'resetAll') {
        if (!armed('reset', '한 번 더 누르면 입력한 내용을 모두 지웁니다.')) return;
        state = { f: {}, done: {} }; save(); renderStages(); refresh(); toast('모두 지웠어요.');
      }
    });
  }

  // 확인 창 대신 '한 번 더 누르기'로 확인합니다 (confirm()이 막힌 환경 대비).
  let armedKey = null, armedTimer;
  function armed(key, msg) {
    if (armedKey === key) { armedKey = null; clearTimeout(armedTimer); return true; }
    armedKey = key; clearTimeout(armedTimer); armedTimer = setTimeout(() => { armedKey = null; }, 4000);
    toast(msg); return false;
  }

  function applyCase(id) {
    const hasData = Object.values(state.f).some((v) => v && v.trim());
    if (hasData && !armed('case-' + id, id === 'mine' ? '한 번 더 누르면 입력한 빈칸을 모두 비웁니다.' : '한 번 더 누르면 지금 입력한 빈칸이 사례 내용으로 바뀝니다.')) return;
    state.f = id === 'mine' ? {} : Object.assign({}, CASES[id]);
    if (id !== 'mine') { track = id === 'case2' ? 'B' : 'A'; try { localStorage.setItem('idea-workbook-track', track); } catch (e) { /* 무시 */ } }
    save(); renderStages(); refresh();
    toast(id === 'mine' ? '빈칸을 비웠어요. 프롬프트 1부터 시작하세요.' : '사례를 채웠어요. 프롬프트 1부터 따라 해 보세요.');
    document.getElementById('stage1').scrollIntoView({ behavior: 'smooth' });
  }

  function builderSentence() {
    const v = [...document.querySelectorAll('[data-b]')].map((i) => i.value.trim());
    if (v.some((x) => !x)) return '';
    return v[0] + '는 ' + v[1] + ' ' + v[2] + ' ' + v[3] + '을 겪는다. 지금은 ' + v[4] + '으로 버티지만 ' + v[5] + '가 남는다.';
  }
  function updateBuilder() {
    const out = document.getElementById('builderOut');
    if (out) out.textContent = builderSentence() || '빈칸을 채우면 여기에 문장이 완성됩니다.';
  }

  /* ───────── 상단 흐름 표시 ───────── */
  function spy() {
    const label = document.getElementById('crumbLabel');
    const links = document.querySelectorAll('.crumb a');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.id;
        links.forEach((a) => a.classList.toggle('on', a.dataset.sec === id));
        label.textContent = en.target.dataset.label;
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.sec').forEach((s) => io.observe(s));
  }

  renderStages();
  bind();
  refresh();
  updateBuilder();
  spy();
})();
