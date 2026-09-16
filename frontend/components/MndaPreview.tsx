import {
  MndaFormData,
  SOURCE_ATTRIBUTION,
  TextRun,
  buildStandardTerms,
  formatConfidentialityTermCoverPage,
  formatDate,
  formatMndaTermCoverPage,
} from "@/lib/mnda-content";

function Runs({ runs }: { runs: TextRun[] }) {
  return (
    <>
      {runs.map((run, i) =>
        run.bold ? <strong key={i}>{run.text}</strong> : <span key={i}>{run.text}</span>
      )}
    </>
  );
}

export function MndaPreview({ data }: { data: MndaFormData }) {
  const clauses = buildStandardTerms(data);

  return (
    <article className="mx-auto max-w-2xl space-y-8 bg-white p-10 text-sm leading-relaxed text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100">
      <header className="space-y-1 text-center">
        <h1 className="text-xl font-bold">Mutual Non-Disclosure Agreement</h1>
        <p className="text-xs text-zinc-500">Effective as of {formatDate(data.effectiveDate) || "[Effective Date]"}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Cover Page</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold">Party 1</div>
            <div>{data.partyOne.companyName || "[Party 1 name]"}</div>
            <div>{data.partyOne.signatoryName}{data.partyOne.signatoryTitle ? `, ${data.partyOne.signatoryTitle}` : ""}</div>
            <div className="text-zinc-500">{data.partyOne.noticeAddress}</div>
          </div>
          <div>
            <div className="font-semibold">Party 2</div>
            <div>{data.partyTwo.companyName || "[Party 2 name]"}</div>
            <div>{data.partyTwo.signatoryName}{data.partyTwo.signatoryTitle ? `, ${data.partyTwo.signatoryTitle}` : ""}</div>
            <div className="text-zinc-500">{data.partyTwo.noticeAddress}</div>
          </div>
        </div>

        <dl className="space-y-2">
          <div>
            <dt className="font-semibold">Purpose</dt>
            <dd>{data.purpose || "[Purpose]"}</dd>
          </div>
          <div>
            <dt className="font-semibold">MNDA Term</dt>
            <dd>{formatMndaTermCoverPage(data)}</dd>
          </div>
          <div>
            <dt className="font-semibold">Term of Confidentiality</dt>
            <dd>{formatConfidentialityTermCoverPage(data)}</dd>
          </div>
          <div>
            <dt className="font-semibold">Governing Law &amp; Jurisdiction</dt>
            <dd>
              Governing Law: {data.governingLaw || "[Governing Law]"}
              <br />
              Jurisdiction: {data.jurisdiction || "[Jurisdiction]"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Standard Terms</h2>
        {clauses.map((clause) => (
          <div key={clause.number}>
            <h3 className="font-semibold">
              {clause.number}. {clause.title}
            </h3>
            {clause.paragraphs.map((paragraph, i) => (
              <p key={i} className="mt-1">
                <Runs runs={paragraph} />
              </p>
            ))}
          </div>
        ))}
      </section>

      <footer className="border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-800">
        {SOURCE_ATTRIBUTION}
      </footer>
    </article>
  );
}
