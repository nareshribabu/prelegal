"use client";

import { MndaFormData, PartyDetails } from "@/lib/mnda-content";

interface MndaFormProps {
  data: MndaFormData;
  onChange: (data: MndaFormData) => void;
}

const inputClasses =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

const labelClasses = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

const MAX_TERM_YEARS = 99;

/** Coerces a raw number input value to a whole number of years in [1, MAX_TERM_YEARS]. */
function clampTermYears(rawValue: string): number {
  const rounded = Math.round(Number(rawValue));
  if (!Number.isFinite(rounded)) return 1;
  return Math.min(MAX_TERM_YEARS, Math.max(1, rounded));
}

function PartyFields({
  idPrefix,
  label,
  party,
  onChange,
}: {
  idPrefix: string;
  label: string;
  party: PartyDetails;
  onChange: (party: PartyDetails) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div>
        <label className={labelClasses} htmlFor={`${idPrefix}-companyName`}>
          Company name
        </label>
        <input
          id={`${idPrefix}-companyName`}
          className={inputClasses}
          value={party.companyName}
          onChange={(e) => onChange({ ...party, companyName: e.target.value })}
          placeholder="Acme, Inc."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClasses} htmlFor={`${idPrefix}-signatoryName`}>
            Signatory name
          </label>
          <input
            id={`${idPrefix}-signatoryName`}
            className={inputClasses}
            value={party.signatoryName}
            onChange={(e) => onChange({ ...party, signatoryName: e.target.value })}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className={labelClasses} htmlFor={`${idPrefix}-signatoryTitle`}>
            Signatory title
          </label>
          <input
            id={`${idPrefix}-signatoryTitle`}
            className={inputClasses}
            value={party.signatoryTitle}
            onChange={(e) => onChange({ ...party, signatoryTitle: e.target.value })}
            placeholder="CEO"
          />
        </div>
      </div>
      <div>
        <label className={labelClasses} htmlFor={`${idPrefix}-noticeAddress`}>
          Notice address (email or postal)
        </label>
        <input
          id={`${idPrefix}-noticeAddress`}
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
        idPrefix="party1"
        label="Party 1"
        party={data.partyOne}
        onChange={(partyOne) => onChange({ ...data, partyOne })}
      />
      <PartyFields
        idPrefix="party2"
        label="Party 2"
        party={data.partyTwo}
        onChange={(partyTwo) => onChange({ ...data, partyTwo })}
      />

      <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <legend className="px-1 text-sm font-semibold">Deal details</legend>

        <div>
          <label className={labelClasses} htmlFor="purpose">
            Purpose
          </label>
          <textarea
            id="purpose"
            className={inputClasses}
            rows={2}
            value={data.purpose}
            onChange={(e) => onChange({ ...data, purpose: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClasses} htmlFor="effectiveDate">
            Effective date
          </label>
          <input
            id="effectiveDate"
            type="date"
            className={inputClasses}
            value={data.effectiveDate}
            onChange={(e) => onChange({ ...data, effectiveDate: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClasses} htmlFor="mndaTermType">
            MNDA term
          </label>
          <div className="mt-1 flex items-center gap-2">
            <select
              id="mndaTermType"
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
                aria-label="MNDA term years"
                type="number"
                min={1}
                max={MAX_TERM_YEARS}
                className={`${inputClasses} w-24`}
                value={data.mndaTermYears}
                onChange={(e) => onChange({ ...data, mndaTermYears: clampTermYears(e.target.value) })}
              />
            )}
          </div>
        </div>

        <div>
          <label className={labelClasses} htmlFor="confidentialityTermType">
            Term of confidentiality
          </label>
          <div className="mt-1 flex items-center gap-2">
            <select
              id="confidentialityTermType"
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
                aria-label="Term of confidentiality years"
                type="number"
                min={1}
                max={MAX_TERM_YEARS}
                className={`${inputClasses} w-24`}
                value={data.confidentialityTermYears}
                onChange={(e) =>
                  onChange({ ...data, confidentialityTermYears: clampTermYears(e.target.value) })
                }
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses} htmlFor="governingLaw">
              Governing law (state)
            </label>
            <input
              id="governingLaw"
              className={inputClasses}
              value={data.governingLaw}
              onChange={(e) => onChange({ ...data, governingLaw: e.target.value })}
              placeholder="Delaware"
            />
          </div>
          <div>
            <label className={labelClasses} htmlFor="jurisdiction">
              Jurisdiction
            </label>
            <input
              id="jurisdiction"
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
