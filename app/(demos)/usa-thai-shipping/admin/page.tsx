"use client";

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  Home,
  Plus,
  Scan,
  Send,
  Truck,
  Users,
} from 'lucide-react';
import {
  buildCustomerSummaries,
  createRandomTrackingNumber,
  createShippingPackage,
  EMPTY_NEW_PACKAGE_FORM,
  INITIAL_PACKAGES,
  readStoredPackages,
  resetStoredPackages,
  SHIPPING_LOADING_BG_CLASS,
  SHIPPING_PAGE_SHELL_CLASS,
  ShippingBackgroundDecor,
  type CustomerSummary,
  type NewPackageForm,
  type ShippingPackage,
  STATUSES,
  writeStoredPackages,
} from '../shared';

export default function ShippingAdminPortal() {
  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<ShippingPackage[]>(INITIAL_PACKAGES);
  const [newPackage, setNewPackage] = useState<NewPackageForm>(EMPTY_NEW_PACKAGE_FORM);
  const [lineMessagePreview, setLineMessagePreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setPackages(readStoredPackages());
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    writeStoredPackages(packages);
  }, [mounted, packages]);

  const handleMockScan = () => {
    setNewPackage((current) => ({ ...current, trackingNo: createRandomTrackingNumber() }));
  };

  const handleAddPackage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newPackage.trackingNo || !newPackage.customerId) {
      return;
    }

    setPackages((current) => [...current, createShippingPackage(newPackage)]);
    setNewPackage(EMPTY_NEW_PACKAGE_FORM);
  };

  const handleUpdateStatus = (id: number, newStatusIndex: number) => {
    const status = STATUSES[newStatusIndex];

    if (!status) {
      return;
    }

    setPackages((current) =>
      current.map((pkg) => {
        if (pkg.id !== id) {
          return pkg;
        }

        const updatedTimeline = [...pkg.timeline];

        if (!updatedTimeline.find((entry) => entry.status === status)) {
          updatedTimeline.push({ status, date: new Date().toLocaleString('th-TH') });
        }

        return { ...pkg, status, timeline: updatedTimeline };
      }),
    );
  };

  const customerSummaries = useMemo<Record<string, CustomerSummary>>(
    () => buildCustomerSummaries(packages),
    [packages],
  );

  const generateLineMessage = (customerId: string) => {
    const summary = customerSummaries[customerId];

    if (!summary) {
      return;
    }

    const message = `📦 สรุปยอดพัสดุชิปปิ้ง
รหัสลูกค้า: ${customerId}
จำนวนพัสดุ: ${summary.packageCount} รายการ
รวมจำนวนกล่อง: ${summary.totalBoxes} กล่อง
น้ำหนักรวม: ${summary.totalWeight.toFixed(2)} kg

🔍 เช็คสถานะพัสดุของคุณได้ที่:
https://your-custom-domain.com/track/${customerId}`;

    setLineMessagePreview(message);
  };

  if (!mounted) {
    return <div className={SHIPPING_LOADING_BG_CLASS}></div>;
  }

  return (
    <div className={`${SHIPPING_PAGE_SHELL_CLASS} font-sans pb-12`}>
      <ShippingBackgroundDecor />

      <div className="relative min-h-screen">
        <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600 p-2 text-white">
                <Users size={18} />
              </div>
              <span className="text-lg font-bold text-gray-900">Admin Portal</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setPackages(resetStoredPackages())}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                รีเซ็ตข้อมูล
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <a
                href="/usa-thai-shipping"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                <Home size={18} />
                กลับ
              </a>
            </div>
          </div>
        </nav>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-white/80 bg-white/88 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl">
              <div className="border-b border-gray-100/80 bg-white/60 p-5">
                <h2 className="flex items-center gap-2 font-bold text-gray-900">
                  <Plus size={18} className="text-blue-600" />
                  รับเข้าพัสดุ
                </h2>
              </div>

              <form onSubmit={handleAddPackage} className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">
                    Tracking Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      required
                      type="text"
                      value={newPackage.trackingNo}
                      onChange={(event) =>
                        setNewPackage((current) => ({
                          ...current,
                          trackingNo: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleMockScan}
                      className="rounded-lg bg-gray-800 px-3 py-2 text-white transition-colors hover:bg-gray-700"
                    >
                      <Scan size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">
                    Customer ID
                  </label>
                  <input
                    required
                    type="text"
                    value={newPackage.customerId}
                    onChange={(event) =>
                      setNewPackage((current) => ({
                        ...current,
                        customerId: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium uppercase text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">
                      น้ำหนัก (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newPackage.weight}
                      onChange={(event) =>
                        setNewPackage((current) => ({
                          ...current,
                          weight: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-gray-500">
                      จำนวนกล่อง
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newPackage.boxes}
                      onChange={(event) =>
                        setNewPackage((current) => ({
                          ...current,
                          boxes: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700"
                >
                  <Plus size={16} />
                  บันทึก
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/88 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-gray-100/80 bg-white/60 p-5">
                <h2 className="flex items-center gap-2 font-bold text-gray-900">
                  <ClipboardList size={18} className="text-blue-600" />
                  สรุปยอดเพื่อส่ง LINE
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-100/80 bg-white/60 text-xs font-bold uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-3">รหัสลูกค้า</th>
                      <th className="px-5 py-3">ชิ้น</th>
                      <th className="px-5 py-3">กล่อง</th>
                      <th className="px-5 py-3">น้ำหนัก</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(customerSummaries).map(([customerId, summary]) => (
                      <tr key={customerId} className="hover:bg-slate-50/80">
                        <td className="px-5 py-3 font-bold text-gray-900">{customerId}</td>
                        <td className="px-5 py-3 text-gray-600">{summary.packageCount}</td>
                        <td className="px-5 py-3 text-gray-600">{summary.totalBoxes}</td>
                        <td className="px-5 py-3 font-semibold text-gray-700">
                          {summary.totalWeight.toFixed(2)} kg
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => generateLineMessage(customerId)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-[#00B900] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#009900]"
                          >
                            <Send size={14} />
                            ส่ง LINE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {lineMessagePreview && (
                <div className="relative m-4 rounded-xl border border-white/80 bg-slate-50/80 p-4 backdrop-blur">
                  <button
                    onClick={() => setLineMessagePreview(null)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                  >
                    x
                  </button>
                  <h3 className="mb-2 text-xs font-bold uppercase text-gray-500">
                    พรีวิวข้อความ (คัดลอกได้)
                  </h3>
                  <pre className="mb-3 whitespace-pre-wrap rounded border border-white/80 bg-white/90 p-3 font-sans text-sm text-gray-800 backdrop-blur">
                    {lineMessagePreview}
                  </pre>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/88 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl">
              <div className="border-b border-gray-100/80 bg-white/60 p-5">
                <h2 className="flex items-center gap-2 font-bold text-gray-900">
                  <Truck size={18} className="text-blue-600" />
                  อัปเดตสถานะพัสดุ
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex flex-col gap-3 rounded-xl border border-white/80 bg-white/85 p-4 backdrop-blur transition-colors hover:border-blue-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{pkg.trackingNo}</div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {pkg.customerId} • {pkg.weight}kg • {pkg.boxes}กล่อง
                        </div>
                      </div>
                    </div>

                    <select
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={STATUSES.indexOf(pkg.status)}
                      onChange={(event) =>
                        handleUpdateStatus(pkg.id, Number.parseInt(event.target.value, 10))
                      }
                    >
                      {STATUSES.map((status, index) => (
                        <option key={status} value={index}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
