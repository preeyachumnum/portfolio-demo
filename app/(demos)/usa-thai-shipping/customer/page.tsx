"use client";

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Camera,
  Check,
  Home,
  MapPin,
  Package,
  Search,
  Truck,
} from 'lucide-react';
import {
  getAvailableCustomerIds,
  INITIAL_PACKAGES,
  normalizeCustomerId,
  readStoredPackages,
  SHIPPING_LOADING_BG_CLASS,
  SHIPPING_PAGE_SHELL_CLASS,
  ShippingBackgroundDecor,
  type ShippingPackage,
  STATUSES,
} from '../shared';

export default function ShippingCustomerPortal() {
  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<ShippingPackage[]>(INITIAL_PACKAGES);
  const [searchCustomerId, setSearchCustomerId] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setPackages(readStoredPackages());
  }, []);

  const handleCustomerSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchCustomerId.trim()) {
      return;
    }

    setCurrentCustomer(normalizeCustomerId(searchCustomerId));
  };

  const customerPackages = currentCustomer
    ? packages.filter((pkg) => pkg.customerId === currentCustomer)
    : [];
  const customerTotalWeight = customerPackages.reduce((sum, pkg) => sum + pkg.weight, 0);
  const customerTotalBoxes = customerPackages.reduce((sum, pkg) => sum + pkg.boxes, 0);
  const availableMockIds = getAvailableCustomerIds(packages);

  if (!mounted) {
    return <div className={SHIPPING_LOADING_BG_CLASS}></div>;
  }

  return (
    <div className={`${SHIPPING_PAGE_SHELL_CLASS} h-full overflow-y-auto font-sans selection:bg-indigo-100`}>
      <ShippingBackgroundDecor />

      <div className="relative flex min-h-full flex-col">
        <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900">
              <div className="rounded-lg bg-indigo-600 p-1.5 text-white">
                <Truck size={20} />
              </div>
              MyShop<span className="text-indigo-600">Shipping</span>
            </div>

            <a
              href="/usa-thai-shipping"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
            >
              <Home size={16} />
              กลับหน้าหลัก
            </a>
          </div>
        </header>

        <main className="relative mx-auto flex w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
          {!currentCustomer ? (
            <div className="mx-auto mt-12 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-[2rem] border border-white/80 bg-white/88 p-8 text-center shadow-[0_24px_80px_-32px_rgba(79,70,229,0.35)] backdrop-blur-xl">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                  <Search className="h-8 w-8 text-indigo-600" />
                </div>

                <h1 className="mb-2 text-2xl font-extrabold text-gray-900">เช็คสถานะพัสดุ</h1>
                <p className="mb-8 text-sm text-gray-500">
                  กรอกรหัสลูกค้า (Customer ID) ด้านล่าง
                </p>

                <form onSubmit={handleCustomerSearch} className="space-y-4">
                  <input
                    type="text"
                    value={searchCustomerId}
                    onChange={(event) => setSearchCustomerId(event.target.value)}
                    placeholder="เช่น CUST-01"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-center text-lg font-bold uppercase text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-indigo-700"
                  >
                    ค้นหาข้อมูล
                  </button>
                </form>

                {availableMockIds.length > 0 && (
                  <div className="mt-8 border-t border-gray-100 pt-6 text-left">
                    <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-gray-400">
                      รหัสสำหรับทดสอบ
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {availableMockIds.map((customerId) => (
                        <button
                          key={customerId}
                          type="button"
                          onClick={() => setSearchCustomerId(customerId)}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          {customerId}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6 animate-in fade-in duration-300">
              <div className="mb-2 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">รายการพัสดุของคุณ</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    ค้นหาด้วยรหัส: <span className="font-bold text-indigo-600">{currentCustomer}</span>
                  </p>
                </div>

                <button
                  onClick={() => setCurrentCustomer(null)}
                  className="rounded-lg border border-white/80 bg-white/85 px-4 py-2 text-sm font-semibold text-gray-500 shadow-sm backdrop-blur transition-colors hover:text-indigo-600"
                >
                  ค้นหารหัสอื่น
                </button>
              </div>

              {customerPackages.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-white/80 bg-white/88 p-10 text-center shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl md:p-16">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                    <AlertCircle className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">ไม่พบข้อมูลพัสดุ</h3>
                  <p className="mx-auto mb-6 max-w-sm text-sm text-gray-500">
                    ไม่พบรายการพัสดุสำหรับรหัส{' '}
                    <span className="font-semibold">&quot;{currentCustomer}&quot;</span>
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-white/80 bg-white/88 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl md:justify-start md:gap-12">
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                        จำนวนรวม
                      </p>
                      <p className="text-2xl font-black text-gray-900">
                        {customerPackages.length}{' '}
                        <span className="text-sm font-medium text-gray-500">ชิ้น</span>
                      </p>
                    </div>
                    <div className="hidden h-10 w-px bg-gray-200 md:block"></div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                        กล่องรวม
                      </p>
                      <p className="text-2xl font-black text-gray-900">
                        {customerTotalBoxes}{' '}
                        <span className="text-sm font-medium text-gray-500">กล่อง</span>
                      </p>
                    </div>
                    <div className="hidden h-10 w-px bg-gray-200 md:block"></div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                        น้ำหนักรวม
                      </p>
                      <p className="text-2xl font-black text-indigo-600">
                        {customerTotalWeight.toFixed(2)}{' '}
                        <span className="text-sm font-medium text-indigo-400">kg</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {customerPackages.map((pkg) => {
                      const currentStatusIndex = STATUSES.indexOf(pkg.status);

                      return (
                        <div
                          key={pkg.id}
                          className="overflow-hidden rounded-2xl border border-white/80 bg-white/88 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl"
                        >
                          <div className="flex flex-col justify-between gap-4 border-b border-gray-100/80 bg-white/60 p-5 sm:flex-row sm:items-center md:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
                                <Package className="text-gray-400" size={20} />
                              </div>
                              <div>
                                <p className="mb-0.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                  Tracking No.
                                </p>
                                <p className="text-lg font-black tracking-tight text-gray-900">
                                  {pkg.trackingNo}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                                currentStatusIndex === STATUSES.length - 1
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : 'border-indigo-200 bg-indigo-50 text-indigo-700'
                              }`}
                            >
                              {currentStatusIndex === STATUSES.length - 1 ? (
                                <Check size={12} />
                              ) : (
                                <Truck size={12} />
                              )}
                              {pkg.status}
                            </span>
                          </div>

                          <div className="flex flex-col gap-8 p-5 md:flex-row md:p-6">
                            <div className="flex w-full flex-col gap-4 md:w-1/2 lg:w-2/5">
                              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-gray-700 shadow-sm backdrop-blur">
                                  <Camera size={12} />
                                  รูปถ่าย
                                </div>
                                <img
                                  src={pkg.imageUrl}
                                  alt={pkg.trackingNo}
                                  className="h-40 w-full object-cover md:h-48"
                                />
                              </div>

                              <div className="flex gap-3">
                                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-3">
                                  <p className="mb-1 text-xs font-medium text-gray-500">น้ำหนัก</p>
                                  <p className="font-bold text-gray-900">
                                    {pkg.weight}{' '}
                                    <span className="text-xs font-normal text-gray-500">kg</span>
                                  </p>
                                </div>
                                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-3">
                                  <p className="mb-1 text-xs font-medium text-gray-500">จำนวน</p>
                                  <p className="font-bold text-gray-900">
                                    {pkg.boxes}{' '}
                                    <span className="text-xs font-normal text-gray-500">กล่อง</span>
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="w-full md:w-1/2 md:border-l md:border-gray-100 md:pl-4 lg:w-3/5">
                              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                                <MapPin size={16} className="text-gray-400" />
                                ลำดับสถานะการจัดส่ง
                              </h4>

                              <div className="pt-2">
                                {STATUSES.map((status, index) => {
                                  const log = pkg.timeline.find((entry) => entry.status === status);
                                  const isCompleted = index <= currentStatusIndex;
                                  const isCurrent = index === currentStatusIndex;
                                  const isLast = index === STATUSES.length - 1;

                                  return (
                                    <div key={status} className="relative flex gap-4 pb-6 last:pb-0">
                                      {!isLast && (
                                        <div
                                          className={`absolute bottom-0 left-3.5 top-7 -ml-px w-0.5 rounded-full ${
                                            index < currentStatusIndex ? 'bg-indigo-600' : 'bg-gray-100'
                                          }`}
                                        ></div>
                                      )}

                                      <div className="relative z-10 shrink-0">
                                        <div
                                          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                            isCurrent
                                              ? 'border-indigo-600 bg-white shadow-sm ring-4 ring-indigo-50'
                                              : isCompleted
                                                ? 'border-indigo-600 bg-indigo-600'
                                                : 'border-gray-200 bg-white'
                                          }`}
                                        >
                                          {isCompleted && !isCurrent ? (
                                            <Check size={14} className="text-white" />
                                          ) : isCurrent ? (
                                            <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                                          ) : null}
                                        </div>
                                      </div>

                                      <div className="-mt-1 w-full">
                                        <p
                                          className={`text-sm font-bold ${
                                            isCurrent
                                              ? 'text-indigo-700'
                                              : isCompleted
                                                ? 'text-gray-900'
                                                : 'text-gray-400'
                                          }`}
                                        >
                                          {status}
                                        </p>

                                        {log ? (
                                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                            <Calendar size={12} className="text-gray-400" />
                                            {log.date}
                                          </p>
                                        ) : (
                                          <p className="mt-1 text-xs text-gray-300">-</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
