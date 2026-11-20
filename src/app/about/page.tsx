import { getResumeEntries } from '@/lib/db';
import { getSiteContent } from '@/lib/content';
import PageWrapper from '@/components/layout/PageWrapper';
import type { ResumeEntry } from '@/types/portfolio';

export const dynamic = 'force-dynamic';

function groupBySection(entries: ResumeEntry[]): Record<string, ResumeEntry[]> {
  return entries.reduce<Record<string, ResumeEntry[]>>((acc, entry) => {
    if (!acc[entry.section]) acc[entry.section] = [];
    acc[entry.section].push(entry);
    return acc;
  }, {});
}

const SECTION_LABELS: Record<string, string> = {
  experience: 'Experience',
  education: 'Education',
  exhibition: 'Exhibitions',
};

export default function AboutPage() {
  const content = getSiteContent();
  const entries = getResumeEntries();
  const sections = groupBySection(entries);

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-32">
        {/* Left — Dynamic Bio from content.json */}
        <div>
          <h1 className="text-text-bright text-sm tracking-[0.3em] uppercase mb-8">About</h1>

          <div className="space-y-5 text-text-muted text-sm leading-relaxed">
            {content.owner.bio.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Right — Resume */}
        <div className="space-y-12">
          {Object.entries(sections).map(([section, sectionEntries]) => (
            <div key={section}>
              <h2 className="text-xs tracking-[0.25em] uppercase text-neutral-600 mb-5">
                {SECTION_LABELS[section] ?? section}
              </h2>
              <ul className="space-y-5">
                {sectionEntries.map((entry, idx) => (
                  <li key={entry.id ?? idx} className="flex justify-between items-start gap-8">
                    <div>
                      <p className="text-sm text-text-bright">{entry.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{entry.organization}</p>
                    </div>
                    <span className="text-xs text-neutral-600 whitespace-nowrap flex-shrink-0">
                      {entry.period}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
