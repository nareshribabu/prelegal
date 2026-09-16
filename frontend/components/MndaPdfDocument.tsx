import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  MndaFormData,
  SOURCE_ATTRIBUTION,
  TextRun,
  buildCoverPageFields,
  buildStandardTerms,
  formatDate,
} from "@/lib/mnda-content";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, lineHeight: 1.5, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 9, textAlign: "center", color: "#666", marginBottom: 20 },
  sectionHeading: { fontSize: 12, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  clauseHeading: { fontSize: 10, fontWeight: 700, marginTop: 10, marginBottom: 3 },
  paragraph: { marginBottom: 4 },
  row: { flexDirection: "row", marginBottom: 8 },
  col: { flex: 1 },
  label: { fontWeight: 700 },
  muted: { color: "#666" },
  field: { marginBottom: 6 },
  footer: { marginTop: 24, paddingTop: 8, borderTop: "1px solid #ccc", fontSize: 8, color: "#666" },
});

function RunsText({ runs }: { runs: TextRun[] }) {
  return (
    <Text style={styles.paragraph}>
      {runs.map((run, i) => (
        <Text key={i} style={run.bold ? { fontWeight: 700 } : undefined}>
          {run.text}
        </Text>
      ))}
    </Text>
  );
}

export function MndaPdfDocument({ data }: { data: MndaFormData }) {
  const clauses = buildStandardTerms(data);

  return (
    <Document title="Mutual Non-Disclosure Agreement">
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>Mutual Non-Disclosure Agreement</Text>
        <Text style={styles.subtitle}>
          Effective as of {formatDate(data.effectiveDate) || "[Effective Date]"}
        </Text>

        <Text style={styles.sectionHeading}>Cover Page</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Party 1</Text>
            <Text>{data.partyOne.companyName || "[Party 1 name]"}</Text>
            <Text>
              {data.partyOne.signatoryName}
              {data.partyOne.signatoryTitle ? `, ${data.partyOne.signatoryTitle}` : ""}
            </Text>
            <Text style={styles.muted}>{data.partyOne.noticeAddress}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Party 2</Text>
            <Text>{data.partyTwo.companyName || "[Party 2 name]"}</Text>
            <Text>
              {data.partyTwo.signatoryName}
              {data.partyTwo.signatoryTitle ? `, ${data.partyTwo.signatoryTitle}` : ""}
            </Text>
            <Text style={styles.muted}>{data.partyTwo.noticeAddress}</Text>
          </View>
        </View>

        {buildCoverPageFields(data).map((field) => (
          <View key={field.label} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>
            <Text>{field.value}</Text>
          </View>
        ))}

        <Text style={styles.sectionHeading}>Standard Terms</Text>
        {clauses.map((clause) => (
          // Not `wrap={false}`: an unusually long clause (e.g. a long Purpose
          // substituted in) must still be allowed to split across pages rather
          // than overflow the page height.
          <View key={clause.number} minPresenceAhead={40}>
            <Text style={styles.clauseHeading}>
              {clause.number}. {clause.title}
            </Text>
            {clause.paragraphs.map((paragraph, i) => (
              <RunsText key={i} runs={paragraph} />
            ))}
          </View>
        ))}

        <Text style={styles.footer}>{SOURCE_ATTRIBUTION}</Text>
      </Page>
    </Document>
  );
}
