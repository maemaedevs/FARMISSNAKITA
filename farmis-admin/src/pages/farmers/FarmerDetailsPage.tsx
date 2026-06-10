import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronDown,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button } from '@/components/common';
import { InfoSection } from '@/components/farmers/InfoSection';
import { GeneratePasswordSection } from '@/components/farmers/GeneratePasswordSection';
import { LandDocumentsSection } from '@/components/farmers/LandDocumentsSection';
import { cn } from '@/lib/cn';
import { formatDate } from '@/utils/format';
import { resolveAssetUrl } from '@/utils/resolveAssetUrl';
import type { FarmerDetail } from '@/types';
import { api } from '@/services/api';

type DetailTab =
  | 'overview'
  | 'farm-land'
  | 'documents'
  | 'assistance'
  | 'training'
  | 'notes';

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'farm-land', label: 'Farm Land' },
  { id: 'documents', label: 'Documents' },
  { id: 'assistance', label: 'Assistance History' },
  { id: 'training', label: 'Training & Seminars' },
  { id: 'notes', label: 'Notes & Activity' },
];

export default function FarmerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: farmer, isLoading } = useQuery<FarmerDetail | null>({
    queryKey: ['farmer', id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await api.get<FarmerDetail>(`/admin/farmers/${id}`);
        return res.data;
      } catch (error) {
        // 404 or auth error will surface as null here; UI will show not found.
        return null;
      }
    },
  });
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-ink-500">
        Loading farmer details...
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-ink-500">Farmer not found.</p>
        <Link
          to="/farmers"
          className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          Back to Farmers List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="text-xs text-ink-400">
          <Link to="/farmers" className="hover:text-brand-600">
            Farmers
          </Link>
          <span className="mx-1.5">/</span>
          <span className="font-medium text-ink-600">Farmer Details</span>
        </nav>

        <div className="flex gap-2">
          <Button variant="secondary" size="md">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button size="md" className="gap-1">
            More Actions
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ProfileHeader farmer={farmer} />

      <div className="border-b border-ink-100">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition',
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-700'
                  : 'border-transparent text-ink-500 hover:text-ink-800',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' ? (
        <OverviewTab farmer={farmer} />
      ) : (
        <TabPlaceholder label={TABS.find((t) => t.id === activeTab)?.label ?? ''} />
      )}
    </div>
  );
}

function ProfileHeader({ farmer }: { farmer: FarmerDetail }) {
  const isActive = farmer.status === 'active';

  return (
    <div className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <Avatar
          name={farmer.name}
          src={resolveAssetUrl(farmer.avatarUrl)}
          size={80}
          colorful
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-ink-800">{farmer.name}</h1>
            <span
              className={
                isActive
                  ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700'
                  : 'inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700'
              }
            >
              <span
                className={
                  isActive
                    ? 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                    : 'h-1.5 w-1.5 rounded-full bg-amber-500'
                }
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-ink-400">
            Farmer ID:{' '}
            <span className="font-medium text-ink-600">{farmer.registryId}</span>
          </p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-ink-400" />
              {farmer.contactNumber}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-ink-400" />
              {farmer.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-ink-400" />
              {farmer.address}
            </span>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          <Metric label="Date Registered" value={formatDate(farmer.registeredAt)} />
          <Metric label="Age" value={String(farmer.age)} />
          <Metric label="Gender" value={farmer.gender} />
          <Metric label="Civil Status" value={farmer.civilStatus} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-ink-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-ink-800">{value}</div>
    </div>
  );
}

function OverviewTab({ farmer }: { farmer: FarmerDetail }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farmer.landLocation)}`;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="space-y-4">
        <InfoSection
          title="Personal Information"
          rows={[
            { label: 'Full Name', value: farmer.name },
            { label: 'Birthday', value: farmer.birthday },
            { label: 'Place of Birth', value: farmer.placeOfBirth },
            { label: 'Nationality', value: farmer.nationality },
            { label: 'Occupation', value: farmer.occupation },
            { label: 'Educational Attainment', value: farmer.education },
            { label: 'Contact Number', value: farmer.contactNumber },
            { label: 'Email Address', value: farmer.email },
            { label: 'Household Size', value: String(farmer.householdSize) },
            { label: 'Primary Source of Income', value: farmer.primaryIncome },
          ]}
        />

        <GeneratePasswordSection
          farmerId={farmer.id}
          farmerCode={farmer.farmerCode}
          hasPassword={farmer.hasPassword}
        />

        <InfoSection
          title="Farming Information"
          rows={[
            {
              label: 'Farming Experience',
              value: `${farmer.farmingExperienceYears} years`,
            },
            { label: 'Main Crop', value: farmer.mainCrop },
            { label: 'Other Crops', value: farmer.otherCrops },
            { label: 'Livestock Raised', value: farmer.livestock },
            { label: 'Farming Type', value: farmer.farmingType },
            { label: 'Farm Size', value: `${farmer.farmSizeHa.toFixed(2)} hectares` },
          ]}
        />

        <div className="rounded-[var(--radius-card)] border border-emerald-100 bg-emerald-50/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-ink-500">
                Verification Status
              </div>
              <div className="mt-1 text-sm text-ink-700">
                Verified by:{' '}
                <span className="font-medium">{farmer.verifiedBy}</span>
              </div>
              <div className="mt-0.5 text-xs text-ink-400">{farmer.verifiedAt}</div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Verified
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <section className="overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-ink-800">
              Farm Land Location
            </h3>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
            >
              View in Google Maps
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="relative h-56 bg-ink-100">
            <iframe
              title="Farm land map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=121.038%2C14.585%2C121.048%2C14.593&layer=mapnik&marker=14.5892%2C121.0428"
              className="h-full w-full border-0"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-8 border-2 border-white/90 bg-brand-500/10 shadow-lg" />
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 text-sm sm:grid-cols-3">
            <div>
              <div className="text-xs text-ink-400">Total Land Area</div>
              <div className="font-medium text-ink-800">
                {farmer.farmSizeHa.toFixed(2)} hectares
              </div>
            </div>
            <div>
              <div className="text-xs text-ink-400">Location</div>
              <div className="font-medium text-ink-800">{farmer.landLocation}</div>
            </div>
            <div>
              <div className="text-xs text-ink-400">Coordinates</div>
              <div className="font-medium text-ink-800">{farmer.coordinates}</div>
            </div>
            <div>
              <div className="text-xs text-ink-400">Land Type</div>
              <div className="font-medium text-ink-800">{farmer.landType}</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-ink-400">Title No.</div>
              <div className="font-medium text-ink-800">{farmer.titleNo}</div>
            </div>
          </div>
        </section>

        <LandDocumentsSection
          farmerId={farmer.id}
          documents={farmer.landDocuments}
        />

        <section className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-4 shadow-[var(--shadow-soft)]">
          <h3 className="mb-2 text-sm font-semibold text-ink-800">Notes</h3>
          <p className="text-sm leading-relaxed text-ink-600">{farmer.notes}</p>
        </section>
      </div>
    </div>
  );
}

function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-12 text-center shadow-[var(--shadow-soft)]">
      <User className="mx-auto h-10 w-10 text-brand-500" />
      <h2 className="mt-4 text-base font-semibold text-ink-800">{label}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
        This section will display {label.toLowerCase()} records for the farmer.
        Content is available on the Overview tab for now.
      </p>
    </div>
  );
}
