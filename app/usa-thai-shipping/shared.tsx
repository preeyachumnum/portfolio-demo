export const SHIPPING_STORAGE_KEY = 'shipping_mock_data';

export const SHIPPING_LOADING_BG_CLASS =
  'min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.14),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_52%,#f8fafc_100%)]';

export const SHIPPING_PAGE_SHELL_CLASS =
  'relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)]';

export function ShippingBackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_15%_78%,rgba(99,102,241,0.08),transparent_24%)]"></div>
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.09)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]"></div>
      <div className="absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl"></div>
      <div className="absolute right-[-5rem] top-32 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
      <div className="absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/50 blur-3xl"></div>
    </div>
  );
}

export const STATUSES = [
  'รับของที่โกดัง US',
  'กำลังเดินทางมาไทย',
  'ถึงโกดังไทย',
  'จัดส่งให้ลูกค้าแล้ว',
] as const;

export type ShippingStatus = (typeof STATUSES)[number];

export type PackageTimelineEntry = {
  status: ShippingStatus;
  date: string;
};

export type ShippingPackage = {
  id: number;
  trackingNo: string;
  customerId: string;
  weight: number;
  boxes: number;
  status: ShippingStatus;
  imageUrl: string;
  timeline: PackageTimelineEntry[];
};

export type NewPackageForm = {
  trackingNo: string;
  customerId: string;
  weight: string;
  boxes: string;
};

export type CustomerSummary = {
  totalWeight: number;
  totalBoxes: number;
  packageCount: number;
};

export const INITIAL_PACKAGES: ShippingPackage[] = [
  {
    id: 1,
    trackingNo: 'US-123456789',
    customerId: 'CUST-01',
    weight: 1.5,
    boxes: 1,
    status: STATUSES[0],
    imageUrl:
      'https://images.unsplash.com/photo-1607227063002-677dc5fdf96f?q=80&w=800&auto=format&fit=crop',
    timeline: [{ status: STATUSES[0], date: '2026-03-01 10:00' }],
  },
  {
    id: 2,
    trackingNo: 'US-987654321',
    customerId: 'CUST-01',
    weight: 5.2,
    boxes: 2,
    status: STATUSES[1],
    imageUrl:
      'https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=800&auto=format&fit=crop',
    timeline: [
      { status: STATUSES[0], date: '2026-03-01 10:00' },
      { status: STATUSES[1], date: '2026-03-05 14:30' },
    ],
  },
  {
    id: 3,
    trackingNo: 'US-555555555',
    customerId: 'CUST-02',
    weight: 10,
    boxes: 3,
    status: STATUSES[2],
    imageUrl:
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop',
    timeline: [
      { status: STATUSES[0], date: '2026-02-20 11:00' },
      { status: STATUSES[1], date: '2026-02-25 08:00' },
      { status: STATUSES[2], date: '2026-03-05 16:45' },
    ],
  },
];

export const EMPTY_NEW_PACKAGE_FORM: NewPackageForm = {
  trackingNo: '',
  customerId: '',
  weight: '',
  boxes: '',
};

export const mergePackagesWithSeed = (savedPackages: ShippingPackage[]): ShippingPackage[] => {
  const packageMap = new Map(INITIAL_PACKAGES.map((pkg) => [pkg.trackingNo, pkg]));

  savedPackages.forEach((pkg) => {
    packageMap.set(pkg.trackingNo, pkg);
  });

  return Array.from(packageMap.values());
};

export const readStoredPackages = (): ShippingPackage[] => {
  const saved = localStorage.getItem(SHIPPING_STORAGE_KEY);

  if (!saved) {
    return INITIAL_PACKAGES;
  }

  try {
    return mergePackagesWithSeed(JSON.parse(saved) as ShippingPackage[]);
  } catch (error) {
    console.error(error);
    return INITIAL_PACKAGES;
  }
};

export const writeStoredPackages = (packages: ShippingPackage[]) => {
  localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(packages));
};

export const resetStoredPackages = (): ShippingPackage[] => {
  localStorage.removeItem(SHIPPING_STORAGE_KEY);
  return INITIAL_PACKAGES;
};

export const normalizeCustomerId = (value: string) => value.trim().toUpperCase();

export const getAvailableCustomerIds = (packages: ShippingPackage[]) =>
  [...new Set(packages.map((pkg) => pkg.customerId))];

export const createRandomTrackingNumber = () =>
  `US-${Math.floor(100000000 + Math.random() * 900000000)}`;

export const createShippingPackage = (newPackage: NewPackageForm): ShippingPackage => ({
  id: Date.now(),
  trackingNo: newPackage.trackingNo,
  customerId: normalizeCustomerId(newPackage.customerId),
  weight: Number.parseFloat(newPackage.weight) || 0,
  boxes: Number.parseInt(newPackage.boxes, 10) || 1,
  status: STATUSES[0],
  imageUrl:
    'https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=800&auto=format&fit=crop',
  timeline: [{ status: STATUSES[0], date: new Date().toLocaleString('th-TH') }],
});

export const buildCustomerSummaries = (
  packages: ShippingPackage[],
): Record<string, CustomerSummary> => {
  const summaries: Record<string, CustomerSummary> = {};

  packages.forEach((pkg) => {
    if (!summaries[pkg.customerId]) {
      summaries[pkg.customerId] = { totalWeight: 0, totalBoxes: 0, packageCount: 0 };
    }

    summaries[pkg.customerId].totalWeight += pkg.weight;
    summaries[pkg.customerId].totalBoxes += pkg.boxes;
    summaries[pkg.customerId].packageCount += 1;
  });

  return summaries;
};
