/* 아이디어 발굴 프롬프트 워크북
 * 프롬프트 템플릿의 {{key}} 는 노란 빈칸이 되고, 같은 key는 모든 카드·결과물 칸에서 함께 바뀝니다. */
(function () {
  'use strict';

  /* ───────── 빈칸 정의 ───────── */
  const FIELDS = {
    who:      { ph: '대학생 / 중장년 / 가게 사장님', opts: ['대학생', '중장년', '가게 사장님'] },
    field:    { ph: '자취 생활 / 먹거리 / 여행 / 지역 가게 / 가족 추억', opts: ['자취 생활', '먹거리', '여행', '지역 가게', '가족 추억'], multi: true },
    persona:  { ph: '대학가에서 자취하는 2학년 대학생' },
    topic:    { ph: '평일 저녁 끼니' },
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

  /* ───────── 사례 프리셋 (PPT 사례 1·2) ───────── */
  const CASES = {
    case1: {
      who: '대학생', field: '자취 생활 / 먹거리',
      persona: '대학가에서 자취하는 2학년 대학생', topic: '평일 저녁 끼니',
      memo: '지난주에 저녁을 세 번 걸렀다. 1인분 배달은 비싸서 편의점으로 때운다. 집밥 같은 반찬이 제일 아쉽다.',
      problem: '대학가에서 자취하는 대학생은 수업과 아르바이트로 바쁜 평일 저녁에 끼니를 챙기려 할 때 시간과 돈이 모자라 거르거나 편의점 음식으로 때운다. 지금은 배달 앱을 쓰지만 1인분 배달은 비싸고 집밥 같은 반찬은 구하기 어렵다.',
      idea: '동네 밥상 구독',
      oneLiner: "자취 대학생을 위한 '동네 밥상 구독'으로, AI가 예산과 입맛에 맞춰 주간 반찬을 추천하고 동네 중장년 요리인과 이어 준다.",
      money: "학생 주간 구독, 부모의 '자녀 밥상 선물', 판매 수수료 (가격은 조사 필요)",
    },
    case2: {
      who: '중장년', field: '여행 / 가족 추억',
      persona: '여수로 가족 여행을 다녀온 50대 부모', topic: '여행 사진 정리',
      memo: '사진은 수백 장인데 다시 본 적이 없다. 정리하는 법을 모르겠다. 손주에게 보여 줄 무언가를 남기고 싶다.',
      problem: '여수로 여행 온 가족과 친구들은 여행이 끝난 뒤 사진을 정리하려 할 때 시간과 편집 실력이 없어 휴대폰 속에 묻어 둔다. 지금은 앨범 앱에 모아 두거나 몇 장만 인화하지만 그날의 이야기와 장소의 추억은 남지 않는다.',
      idea: '여행 사진 그림책',
      oneLiner: "여수 여행자를 위한 '여행 사진 그림책'으로, AI가 사진 10장으로 우리만의 여행 이야기와 그림을 만들어 그림책과 30초 영상으로 완성한다.",
      money: '그림책 1권 판매, 영상 추가 구매, 호텔·관광지 제휴 수수료 (가격은 조사 필요)',
    },
  };

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
            note: '앞으로 쓸지를 묻지 말고, 지난 행동을 묻습니다. 미래 질문에는 누구나 "좋네요"라고 답합니다.',
          },
          why: [
            ['사례 2라면', '[여수로 가족 여행을 다녀온 50대 부모], [여행 사진 정리]'],
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
          sample: [
            ['사례 1 · 동네 밥상 잇기', '대학가에서 자취하는 대학생은 수업과 아르바이트로 바쁜 평일 저녁에 끼니를 거르거나 편의점 음식으로 때운다. 지금은 배달 앱을 쓰지만 1인분 배달은 비싸고 집밥 같은 반찬은 구하기 어렵다. 같은 동네에서 요리 경험이 많은 중장년은 반찬을 만들어 팔고 싶어도 판로를 찾지 못한다.'],
            ['사례 2 · 여행 사진 그림책', '여수로 여행 온 가족과 친구들은 사진을 수백 장 찍지만, 정리할 시간과 편집 실력이 없어 휴대폰 속에 묻어 둔다. 지금은 앨범 앱에 모아 두거나 몇 장만 인화하지만, 그날의 이야기와 장소의 추억은 남지 않는다.'],
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
            ['사람과 사람을 이어 준다', '세대 협업 아이디어가 나오는 자리입니다. 사례 1의 반찬 잇기가 여기서 나옵니다'],
            ['엉뚱한 것 허락', '심사위원이 기억할 아이디어가 섞여 나옵니다'],
          ],
        },
        {
          n: 5, title: '다섯 개로 좁히기', min: 5, chained: true,
          tpl: '위 20개 중에서 해커톤에 맞는 아이디어 5개를 골라 표로 비교해 줘.\n칸: 아이디어 / 문제를 얼마나 풀어 주나 / 대학생 팀이 6개월 안에 시작할 수 있나 / AI가 꼭 필요한가 / 비슷한 서비스와 다른 점\n점수 칸은 1~5점, 마지막에 합계.\n합계 1위와, 점수는 낮지만 가능성이 큰 숨은 후보 하나를 추천해 줘.',
          why: [
            ['기준은 내가 정한다', 'AI가 고른 \'좋아 보이는 답\'에 끌려가지 않습니다'],
            ['AI가 꼭 필요한가', 'AI 창업 해커톤이라 꼭 넣습니다'],
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
          sampleFlow: [
            ['사례 1', "자취 대학생을 위한 '동네 밥상 구독'으로, AI가 예산과 입맛에 맞춰 주간 반찬을 추천하고 동네 중장년 요리인과 이어 준다.", ['입맛·예산 입력', 'AI 주간 식단 추천', '요리인이 반찬 준비', '주 2회 픽업', '남긴 양 기록, 추천이 정확해짐']],
            ['사례 2', "여수 여행자를 위한 '여행 사진 그림책'으로, AI가 사진 10장으로 우리만의 여행 이야기와 그림을 만들어 그림책과 30초 영상으로 완성한다.", ['사진 10장 올리기', '기억나는 순간 세 줄', 'AI가 이야기·그림 생성', '제작자가 다듬기', '그림책 배송·영상 전송']],
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
          canvasSamples: true,
        },
        {
          n: 8, title: '돈의 흐름 설계', min: 5, chained: true,
          tpl: '이 서비스로 돈을 버는 방법을 세 가지로 설계해 줘.\n각각: 누가 돈을 내나 / 무엇에 내나 / 어떻게 내나(한 번, 매달, 건당) / 첫 고객 10명을 어디서 찾나\n그중 가장 현실적인 하나를 고르고, 다음 한 달 동안 해 볼 수 있는 작은 실험 하나를 제안해 줘.',
          why: [
            ['누가 돈을 내나', '쓰는 사람과 돈 내는 사람이 다를 수 있습니다'],
            ['사례로 보면', '사례 1은 학생이 먹고 부모가 냅니다. 사례 2는 부모가 주인공이고 자녀가 선물로 냅니다'],
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
      ['이런 질문이 나오면', '"집에서 만든 반찬을 팔 때 위생 기준과 영업 신고는 어떻게 할 건가?"'],
      ['보완 → 확인', '공유주방이나 기존 반찬 가게와 손잡는다 → 실제로 가능한지는 멘토링에서 묻는다'],
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
  const CANVAS_SAMPLES = {
    '사례 1 · 동네 밥상 잇기': {
      problem: '자취생은 끼니를 거르고, 동네 요리인은 판로가 없다',
      solution: 'AI 식단 추천 → 요리인 조리 → 주 2회 픽업',
      uvp: '집밥 같은 반찬을 매주 알아서, 배달 한 끼보다 부담 없이',
      edge: '동네 요리인 연결망과 학생 입맛 기록',
      customer: '대학가 자취생. 먼저 쓸 사람은 기숙사 밖 1~2학년 (가정)',
      metric: '다음 주 재구독 비율, 남는 반찬 비율',
      channel: '학과 단체 대화방, 기숙사·생협, 학부모 모임',
      cost: '포장·픽업 운영, 위생 관리, 앱 운영',
      revenue: "학생 주간 구독, 부모의 '자녀 밥상 선물', 판매 수수료 (가격은 조사 필요)",
    },
    '사례 2 · 여행 사진 그림책': {
      problem: '여행 사진이 휴대폰에 묻히고, 그날의 추억은 남지 않는다',
      solution: 'AI 이야기·그림 생성 → 제작자 다듬기 → 인쇄·전송',
      uvp: '사진 10장이면 우리 여행이 한 권의 그림책이 된다',
      edge: '여수 장소별 이야기 틀과 고유한 그림체 (가정)',
      customer: '여수를 찾는 가족 여행자와 친구 여행자 (가정)',
      metric: '주문 수, 선물로 다시 주문한 비율',
      channel: '호텔·관광지 안내 데스크, 여행 모임, 사진 인화점',
      cost: 'AI 도구 사용료, 인쇄·배송, 제작자 활동비',
      revenue: '그림책 1권 판매, 영상 추가 구매, 호텔·관광지 제휴 수수료 (가격은 조사 필요)',
    },
  };

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
    let ok = false;
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.top = '0';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (!ok && navigator.clipboard) { navigator.clipboard.writeText(text).catch(() => {}); ok = true; }
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
      AIS.map((a) => '<button type="button" class="btn ai ai-' + a.id + '" data-act="open" data-ai="' + a.id + '">' + a.name + '</button>').join('') +
      '</div></div>';
  }

  function whyList(why) {
    return '<aside class="why"><h4>이 줄을 넣는 이유</h4><dl>' +
      why.map(([t, d]) => '<dt>' + esc(t) + '</dt><dd>' + esc(d) + '</dd>').join('') + '</dl></aside>';
  }

  function promptCard(p) {
    const keys = keysOf(p.tpl);
    let extra = '';
    if (p.followups) {
      extra += '<div class="followups"><h4>' + p.followups.title + '</h4><ul>' +
        p.followups.items.map((q) => '<li><span>"' + esc(q) + '"</span><button type="button" class="mini" data-copy="' + esc(q) + '">복사</button></li>').join('') +
        '</ul><p class="note">' + esc(p.followups.note) + '</p></div>';
    }
    if (p.sample) {
      extra += '<details class="sample"><summary>샘플 답 보기 · 문제 정의 문장</summary><div class="sample-grid">' +
        p.sample.map(([t, d]) => '<div class="sample-item"><strong>' + esc(t) + '</strong><p>' + esc(d) + '</p></div>').join('') +
        '</div><p class="note">AI가 돌려준 답의 예시입니다. 공식의 빈칸이 다 찼는지 확인합니다.</p></details>';
    }
    if (p.sampleFlow) {
      extra += '<details class="sample"><summary>샘플 답 보기 · 한 줄 아이디어</summary>' +
        p.sampleFlow.map(([t, line, steps]) => '<div class="sample-item"><p><strong>' + esc(t) + '</strong> ' + esc(line) + '</p><ol class="flow">' +
          steps.map((s) => '<li>' + esc(s) + '</li>').join('') + '</ol></div>').join('') + '</details>';
    }
    if (p.canvasSamples) {
      extra += '<details class="sample"><summary>샘플 답 보기 · 린 캔버스</summary>' +
        Object.entries(CANVAS_SAMPLES).map(([t, c]) => '<div class="sample-item"><strong>' + esc(t) + '</strong>' + canvasGrid(c) + '</div>').join('') +
        '<p class="note">AI가 돌려준 초안을 줄인 예시입니다. 같은 프롬프트에 사례만 바꿔 넣은 결과입니다.</p></details>';
    }
    const hint = keys.length
      ? '<span class="sw"></span>노란 칸만 내 상황으로 바꿔 넣습니다 <span class="left" data-left></span>'
      : '바꿀 곳이 없습니다. 앞의 대화에 이어서 그대로 붙여 넣습니다.';
    return '<article class="card" id="p' + p.n + '" data-pid="' + p.n + '">' +
      '<header class="card-head"><h3><span class="pn">프롬프트 ' + p.n + '</span> · ' + esc(p.title) + '</h3>' +
      '<span class="min">' + p.min + '분</span><span class="done-badge" aria-hidden="true">✓ 복사함</span></header>' +
      '<div class="card-grid"><div class="card-main">' +
      '<div class="pbox' + (p.chained ? ' chained' : '') + '"><div class="ptext">' + promptBody(p.tpl) + '</div></div>' +
      optsRow(p.tpl) +
      '<p class="hint">' + hint + '</p>' +
      actions(p.n) +
      (p.chained ? '<p class="chain-note">앞의 답을 보고 이어서 묻는 프롬프트입니다. 새 대화로 열지 말고 <b>같은 대화창에 붙여 넣으세요.</b></p>' : '') +
      (p.aside ? '<p class="aside">' + esc(p.aside) + '</p>' : '') +
      extra +
      '</div>' + whyList(p.why) + '</div></article>';
  }

  function offlineCard(p) {
    return '<article class="card offline"><header class="card-head"><h3><span class="pn">테이블에서</span> · ' + esc(p.title) + '</h3><span class="min">' + p.min + '분</span></header>' +
      '<div class="interview">' + p.cols.map(([t, qs]) => '<div><h4>' + esc(t) + '</h4><ul>' + qs.map((q) => '<li>"' + esc(q) + '"</li>').join('') + '</ul></div>').join('') + '</div>' +
      '<p class="note">' + esc(p.note) + '</p>' +
      '<p class="ask">' + esc(p.ask) + '</p>' +
      resultField({ key: p.memoKey, label: '실제 인터뷰 메모', hint: '들은 말을 그대로 두세 줄. 프롬프트 3의 노란 칸에 들어갑니다.' }) +
      '</article>';
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

  function renderStages() {
    document.getElementById('stages').innerHTML = STAGES.map((s, idx) =>
      '<section class="sec" id="' + s.id + '" data-label="' + s.step + ' · ' + s.title + '">' +
      divider(s, idx) + stageIntro(s) +
      s.prompts.map((p) => (p.offline ? offlineCard(p) : promptCard(p))).join('') +
      '<div class="outbox"><h3>내 결과물 · ' + s.output + '</h3>' + s.results.map(resultField).join('') +
      (s.results.some((r) => r.builder) ? builder() : '') +
      '<p class="note">이 칸에 적은 내용이 다음 단계 프롬프트의 노란 칸에 자동으로 들어갑니다.</p></div>' +
      '</section>').join('');

    document.getElementById('finaleBody').innerHTML =
      '<div class="slide"><h3 class="slide-title sm">두 사람의 한 줄</h3><p class="note">대학생 한 명, 중장년 한 명 · 두 문장만 읽어 주세요. 빈칸이 다 찼나요?</p>' +
      '<div class="two-lines"><div><span class="tl-n">①</span><b>문제 정의 문장</b><p data-show="problem"></p></div>' +
      '<div><span class="tl-n">②</span><b>한 줄 소개</b><p data-show="oneLiner"></p></div></div></div>' +
      promptCard(P9) +
      '<div class="outbox"><h3>내 결과물 · 오후에 들고 갈 세 가지</h3>' + resultField({ key: 'qa', label: '예상 질문과 보완', hint: '프롬프트 9의 질문 다섯 가지. 내일 발표 질의응답에 대비합니다.' }) +
      '<button type="button" class="btn primary" id="copyAll">결과물 한 번에 복사 (오픈채팅방·팀 공유용)</button></div>' +
      '<div class="slide"><h3 class="slide-title sm">AI 답을 믿기 전에</h3><ol class="three">' +
      '<li><b>1</b><div><strong>AI 답은 \'가설\'이다</strong><span>진짜인지는 고객이 정한다</span></div></li>' +
      '<li><b>2</b><div><strong>숫자는 출처를 찾는다</strong><span>출처가 없으면 쓰지 않는다</span></div></li>' +
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
          window.open(ai.url(text), '_blank', 'noopener');
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
        if (!confirm('입력한 빈칸과 결과물을 모두 지울까요?')) return;
        state = { f: {}, done: {} }; save(); renderStages(); refresh(); toast('모두 지웠어요.');
      }
    });
  }

  function applyCase(id) {
    const hasData = Object.values(state.f).some((v) => v && v.trim());
    if (hasData && !confirm(id === 'mine' ? '입력한 빈칸을 모두 비울까요?' : '지금 입력한 빈칸이 사례 내용으로 바뀝니다. 계속할까요?')) return;
    state.f = id === 'mine' ? {} : Object.assign({}, CASES[id]);
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
