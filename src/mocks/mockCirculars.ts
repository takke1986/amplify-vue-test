// Circular型
export interface File {
  id: string;
  name: string;
  url: string;
}

export interface CirculationStatus {
  departmentId: string;
  status: 'pending' | 'next' | 'remand' | 'completed';
  comment?: string;
}

export interface Circular {
  id: string;
  title: string;
  content: string;
  creator: string;
  createdAt: string;
  deadline: string;
  status: 'draft' | 'in_progress' | 'completed' | 'expired';
  department: string;
  recipients: string[];
  files?: File[];
  circulationStatus: CirculationStatus[];
  updatedBy: string;
  updatedAt: string;
}

export const departments = Array.from({ length: 9 }, (_, i) => [
  { id: `${(i + 1) * 1000 + 1}`, name: `${i + 1}部署（営業）` },
  { id: `${(i + 1) * 1000 + 2}`, name: `${i + 1}部署（配電）` },
]).flat();

const recipientSamples = [
  ['山田一郎', '佐藤花子'],
  ['鈴木次郎'],
  ['田中三郎', '高橋四郎', '伊藤五郎'],
  ['渡辺六郎'],
  ['加藤七子', '中村八男'],
];

const departmentIds = departments.map((d) => d.id);

export const specialCircular: Circular = {
  id: '999',
  title: '配電回覧中テスト',
  content: '配電回覧中の本文サンプル',
  creator: '配電作成者',
  createdAt: '2024-04-01',
  deadline: '2024-04-10',
  status: 'in_progress',
  department: '1002', // 1部署配電
  recipients: ['配電受信者'],
  files: [
    {
      id: '1',
      name: '配電資料.pdf',
      url: '#',
    },
  ],
  circulationStatus: [
    {
      departmentId: '1002', // 配電
      status: 'pending' as const,
      comment: '',
    },
  ],
  updatedBy: '配電作成者',
  updatedAt: '2024-04-01',
};

// 1〜9部署の配電で回覧中のデータを追加
export const haidenInProgressCirculars: Circular[] = Array.from(
  { length: 9 },
  (_, i) => {
    const deptId = `${(i + 1) * 1000 + 2}`;
    return {
      id: `pd-${i + 1}`,
      title: `${i + 1}部署配電回覧中テスト`,
      content: `${i + 1}部署配電回覧中の本文サンプル`,
      creator: `${i + 1}部署配電作成者`,
      createdAt: '2024-04-01',
      deadline: '2024-04-10',
      status: 'in_progress',
      department: deptId,
      recipients: [`${i + 1}部署配電受信者`],
      files: [
        {
          id: '1',
          name: '配電資料.pdf',
          url: '#',
        },
      ],
      circulationStatus: [
        {
          departmentId: deptId,
          status: 'pending' as const,
          comment: '',
        },
      ],
      updatedBy: `${i + 1}部署配電作成者`,
      updatedAt: '2024-04-01',
    };
  }
);

// departmentは営業、回覧先が配電、回覧中のデータ（10件）
export const eigyoToHaidenInProgressMockMany: Circular[] = Array.from(
  { length: 10 },
  (_, i) => {
    const group = (i % 9) + 1;
    const eigyoDeptId = `${group * 1000 + 1}`;
    const haidenDeptId = `${group * 1000 + 2}`;
    return {
      id: `mock-haiden-inprogress-${i + 1}`,
      title: `${group}部署配電回覧中テスト${i + 1}`,
      content: `${group}部署配電回覧中の本文サンプル${i + 1}`,
      creator: `${group}部署営業作成者`,
      createdAt: '2024-04-01',
      deadline: '2024-04-10',
      status: 'in_progress',
      department: eigyoDeptId,
      recipients: [`${group}部署配電受信者`],
      files: [
        {
          id: '1',
          name: '配電資料.pdf',
          url: '#',
        },
      ],
      circulationStatus: [
        {
          departmentId: haidenDeptId,
          status: 'pending' as const,
          comment: '',
        },
      ],
      updatedBy: `${group}部署営業作成者`,
      updatedAt: '2024-04-01',
    };
  }
);

// departmentは営業、circulationStatusのdepartmentIdは配電の回覧中データ（1〜9部署分）
export const eigyoToHaidenInProgressCirculars: Circular[] = Array.from(
  { length: 9 },
  (_, i) => {
    const eigyoDeptId = `${(i + 1) * 1000 + 1}`; // 営業
    const haidenDeptId = `${(i + 1) * 1000 + 2}`; // 配電
    return {
      id: `pd-to-haiden-${i + 1}`,
      title: `${i + 1}部署営業作成・配電回覧中テスト`,
      content: `${i + 1}部署営業作成・配電回覧中の本文サンプル`,
      creator: `${i + 1}部署営業作成者`,
      createdAt: '2024-04-01',
      deadline: '2024-04-10',
      status: 'in_progress',
      department: eigyoDeptId,
      recipients: [`${i + 1}部署配電受信者`],
      files: [
        {
          id: '1',
          name: '配電資料.pdf',
          url: '#',
        },
      ],
      circulationStatus: [
        {
          departmentId: haidenDeptId,
          status: 'pending' as const,
          comment: '',
        },
      ],
      updatedBy: `${i + 1}部署営業作成者`,
      updatedAt: '2024-04-01',
    };
  }
);

export const circulars: Circular[] = [
  ...eigyoToHaidenInProgressMockMany,
  ...eigyoToHaidenInProgressCirculars,
  ...haidenInProgressCirculars,
  specialCircular,
  ...Array.from({ length: 90 }, (_, i) => {
    const deptIdx = i % departmentIds.length;
    const group = Math.floor(deptIdx / 2) + 1;
    const eigyoOrHaiden = deptIdx % 2 === 0 ? '営業' : '配電';
    const department = departmentIds[deptIdx];
    const status = ['draft', 'in_progress', 'completed', 'expired'][
      i % 4
    ] as Circular['status'];
    const creator = `${group}部署${eigyoOrHaiden}の作成者${(i % 5) + 1}`;
    const createdAt = `2024-03-${String((i % 28) + 1).padStart(2, '0')}`;
    return {
      id: String(i + 1),
      title: `${group}部署${eigyoOrHaiden}のテスト回覧${i + 1}`,
      content: `${group}部署${eigyoOrHaiden}の本文サンプル${i + 1}`,
      creator,
      createdAt,
      deadline: `2024-04-${String((i % 28) + 1).padStart(2, '0')}`,
      status,
      department,
      recipients: recipientSamples[i % recipientSamples.length],
      files: [
        {
          id: '1',
          name: 'サンプル資料.pdf',
          url: '#',
        },
      ],
      circulationStatus: [
        status === 'completed'
          ? {
              departmentId: getKairanSaki(department),
              status: 'completed' as const,
              comment: '処理完了',
            }
          : {
              departmentId: getKairanSaki(department),
              status: 'pending' as const,
              comment: '',
            },
      ],
      updatedBy: creator,
      updatedAt: createdAt,
    };
  }),
];

function getKairanSaki(busho: string | number | undefined): string {
  if (busho === undefined) return '';
  const num = Number(busho);
  if (isNaN(num)) return '';
  return num % 10 === 1 ? String(num + 1) : String(num - 1);
}
