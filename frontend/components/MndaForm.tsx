"use client";

import { MndaFormData, PartyDetails } from "@/lib/mnda-content";

interface MndaFormProps {
  data: MndaFormData;
  onChange: (data: MndaFormData) => void;
}

const inputClasses =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

const labelClasses = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

function PartyFields({
  label,
  party,
  onChange,
}: {
  label: string;
  party: PartyDetails;
  onChange: (party: PartyDetails) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div>
        <label className={labelClasses}>Company name</label>
        <input
          className={inputClasses}
          value={party.companyName}
          onChange={(e) => onChange({ ...party, companyName: e.target.value })}
          placeholder="Acme, Inc."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClasses}>Signatory name</label>
          <input
            className={inputClasses}
            value={party.signatoryName}
            onChange={(e) => onChange({ ...party, signatoryName: e.target.value })}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className={labelClasses}>Signatory title</label>
          <input
            className={inputClasses}
            value={party.signatoryTitle}
            onChange={(e) => onChange({ ...party, signatoryTitle: e.target.value })}
            placeholder="CEO"
          />
        </div>
      </div>
      <div>
        <label className={labelClasses}>Notice address (email or postal)</label>
        <input
          className={inputClasses}
          value={party.noticeAddress}
          onChange={(e) => onChange({ ...party, noticeAddress: e.target.value })}
          placeholder="legal@acme.com"
        />
      </div>
    </fieldset>
  );
}

export function MndaForm({ data, onChange }: MndaFormProps) {
  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <PartyFields
        label="Party 1"
        party={data.partyOne}
        onChange={(partyOne) => onChange({ ...data, partyOne })}
      />
      <PartyFields
        label="Party 2"
        party={data.partyTwo}
        onChange={(partyTwo) => onChange({ ...data, partyTwo })}
      />

      <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-1 text-sm font-semibold">Deal details</legend>

        <div>
          <label className={labelClasses}>Purpose</label>
          <textarea
            className={inputClasses}
            rows={2}
            value={data.purpose}
            onChange={(e) => onChange({ ...data, purpose: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClasses}>Effective date</label>
          <input
            type="date"
            className={inputClasses}
            value={data.effectiveDate}
            onChange={(e) => onChange({ ...data, effectiveDate: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClasses}>MNDA term</label>
          <div className="mt-1 flex items-center gap-2">
            <select
              className={inputClasses}
              value={data.mndaTermType}
              onChange={(e) =>
                onChange({ ...data, mndaTermType: e.target.value as MndaFormData["mndaTermType"] })
              }
            >
              <option value="expires">Expires after a set number of years</option>
              <option value="untilTerminated">Continues until terminated</option>
            </select>
            {data.mndaTermType === "expires" && (
              <input
                type="number"
                min={1}
                className={`${inputClasses} w-24`}
                value={data.mndaTermYears}
                onChange={(e) => onChange({ ...data, mndaTermYears: Number(e.target.value) || 1 })}
              />
            )}
          </div>
        </div>

        <div>
          <label className={labelClasses}>Term of confidentiality</label>
          <div className="mt-1 flex items-center gap-2">
            <select
              className={inputClasses}
              value={data.confidentialityTermType}
              onChange={(e) =>
                onChange({
                  ...data,
                  confidentialityTermType: e.target.value as MndaFormData["confidentialityTermType"],
                })
              }
            >
              <option value="years">Set number of years from Effective Date</option>
              <option value="perpetuity">In perpetuity</option>
            </select>
            {data.confidentialityTermType === "years" && (
              <input
                type="number"
                min={1}
                className={`${inputClasses} w-24`}
                value={data.confidentialityTermYears}
                onChange={(e) =>
                  onChange({ ...data, confidentialityTermYears: Number(e.target.value) || 1 })
                }
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>Governing law (state)</label>
            <input
              className={inputClasses}
              value={data.governingLaw}
              onChange={(e) => onChange({ ...data, governingLaw: e.target.value })}
              placeholder="Delaware"
            />
          </div>
          <div>
            <label className={labelClasses}>Jurisdiction</label>
            <input
              className={inputClasses}
              value={data.jurisdiction}
              onChange={(e) => onChange({ ...data, jurisdiction: e.target.value })}
              placeholder="New Castle, DE"
            />
          </div>
        </div>
      </fieldset>
    </form>
  );
}
