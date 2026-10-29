import type {
  Article,
  AuthorProfile,
  SectionInfo,
  SectionSlug,
} from '../domain/types';

export const BRAND_CONFIG = {
  siteName: 'Therapist Psychologist Today',
  domain: 'TherapistPsychologistToday.com',
  canonicalBase: 'https://therapistpsychologisttoday.com',
  tagline: 'News & Information on Psychology, Psychiatry & Mental Health',
  colors: {
    royalBlue: '#1D4ED8',
    accessibleBlue: '#1E40AF',
    hoverBlue: '#1E3A8A',
    lightBlueTint: '#EEF2FB',
    pageBg: '#FAFAF7',
    inkBlack: '#111111',
    dividerGray: '#E5E5E0',
  },
};

export const SECTIONS: SectionInfo[] = [
  {
    slug: 'latest-news',
    name: 'Latest News',
    shortName: 'Latest News',
    description:
      'Latest dispatches, clinical updates, and public health reporting template.',
    leadNote: 'Latest News Desk',
  },
  {
    slug: 'mental-health',
    name: 'Mental Health',
    shortName: 'Mental Health',
    description:
      'Reporting on mood conditions, trauma recovery, neurodivergence, and community mental health.',
    leadNote: 'Mental Health Coverage',
  },
  {
    slug: 'research-studies',
    name: 'Research & Studies',
    shortName: 'Research & Studies',
    description:
      'Study summaries, methodology explainers, and primary literature coverage.',
    leadNote: 'Research & Studies Desk',
  },
  {
    slug: 'public-health',
    name: 'Public Health',
    shortName: 'Public Health',
    description:
      'Public health policy, crisis infrastructure, and access-to-care coverage.',
    leadNote: 'Public Health Desk',
  },
  {
    slug: 'conditions',
    name: 'Conditions',
    shortName: 'Conditions',
    description:
      'Structured condition explainers covering symptoms, diagnostic criteria, and clinical context.',
    leadNote: 'Condition Explainers',
  },
  {
    slug: 'treatments',
    name: 'Treatments',
    shortName: 'Treatments',
    description:
      'Structured treatment explainers covering psychotherapies (CBT, DBT, EMDR), medications, and clinical protocols.',
    leadNote: 'Treatment Explainers',
  },
  {
    slug: 'wellness',
    name: 'Wellness',
    shortName: 'Wellness',
    description:
      'Sleep, circadian rhythms, stress regulation, and behavioral health.',
    leadNote: 'Wellness & Behavioral Health',
  },
  {
    slug: 'opinion',
    name: 'Opinion',
    shortName: 'Opinion',
    description:
      'Commentary, essays, and perspectives on mental health care and psychology.',
    leadNote: 'Perspectives & Opinion',
  },
];

export const AUTHORS: AuthorProfile[] = [
  {
    slug: 'author-placeholder',
    name: '[Author Name]',
    credentials: '[Credentials]',
    role: '[Author Role / Title]',
    institution: '[Institution / Affiliation]',
    bio: '[Author biography placeholder — replace with verified education, clinical background, and reporting beat.]',
    education: [
      '[Degree / University Placeholder 1]',
      '[Degree / Clinical Training Placeholder 2]',
    ],
    clinicalSpecialties: [
      '[Specialty 1]',
      '[Specialty 2]',
      '[Specialty 3]',
    ],
    peerReviewedPublications: 0,
    conflictOfInterestDisclosure:
      '[Conflict of interest disclosure placeholder — e.g., No financial relationships declared.]',
    isMedicalReviewer: false,
    orcid: '[ORCID Placeholder]',
  },
  {
    slug: 'reviewer-placeholder',
    name: '[Reviewer Name]',
    credentials: '[Credentials]',
    role: '[Clinical Reviewer Role]',
    institution: '[Reviewer Institution / Affiliation]',
    bio: '[Reviewer biography placeholder — replace with verified clinical licensure, academic affiliation, and review scope.]',
    education: [
      '[Medical / Doctoral Degree Placeholder]',
      '[Residency / Licensure Placeholder]',
    ],
    clinicalSpecialties: [
      '[Review Specialty 1]',
      '[Review Specialty 2]',
    ],
    peerReviewedPublications: 0,
    conflictOfInterestDisclosure:
      '[Reviewer conflict of interest disclosure placeholder.]',
    isMedicalReviewer: true,
    orcid: '[ORCID Placeholder]',
  },
];

export const ARTICLES: Article[] = [
  {
    slug: 'lead-clinical-research-report-template',
    title:
      '[Lead Story Headline: Primary Research Finding on Neuroinflammation and Depression]',
    subtitle:
      '[Subheadline placeholder: Summarize the study design, sample size, and primary clinical outcome from the verified source.]',
    excerpt:
      '[Article excerpt placeholder: Concise summary of the clinical research findings and context for readers.]',
    section: 'research-studies',
    authorSlug: 'author-placeholder',
    reviewerSlug: 'reviewer-placeholder',
    publishedAt: '2026-10-28T13:30:00.000Z',
    updatedAt: '2026-10-28T18:15:00.000Z',
    lastReviewedAt: '2026-10-28T18:15:00.000Z',
    readingTimeMinutes: 6,
    isBreaking: true,
    isFeaturedLead: true,
    mostReadRank: 1,
    locationDateline: '[DATELINE]',
    pullQuote: {
      quote:
        '[Pull quote placeholder: Insert a direct verified quote from the study lead author or clinical commentator.]',
      attribution:
        '[Quote Attribution Name], [Credentials], [Institution]',
    },
    keyTakeaways: [
      '[Key finding 1 placeholder — insert verified primary endpoint and statistical result]',
      '[Key finding 2 placeholder — insert verified secondary outcome or mechanism]',
      '[Key finding 3 placeholder — insert clinical limitations or contraindications]',
    ],
    body: [
      {
        paragraphs: [
          '[Opening paragraph placeholder: Introduce the clinical background, the newly published study or health dispatch, and the institution or journal where the primary research appeared.]',
          '[Second paragraph placeholder: Describe the study population, methodology, and how the researchers evaluated the primary outcome.]',
        ],
      },
      {
        heading: '[Section Heading: Methodology and Primary Outcomes]',
        paragraphs: [
          '[Body paragraph placeholder: Detail the main findings, comparison groups, and timeline without inventing unverified statistics.]',
          '[Body paragraph placeholder: Provide clinical context explaining how these results fit into existing treatment guidelines.]',
        ],
        callout: {
          title: 'Study Methodology & Source Summary',
          items: [
            'Study Design: [Insert study design, e.g., Randomized Controlled Trial / Cohort Study]',
            'Sample Size: [Insert verified sample size, e.g., n = XXX]',
            'Primary Endpoint: [Insert primary clinical scale or measure]',
            'Source Journal: [Insert peer-reviewed journal name and publication date]',
          ],
        },
      },
      {
        heading: '[Section Heading: Clinical Limitations and Next Steps]',
        paragraphs: [
          '[Closing paragraph placeholder: Note study limitations, populations excluded from the research, and commentary from independent clinicians.]',
        ],
      },
    ],
    figure: {
      id: 'fig-lead-template',
      type: 'clinical-trial-chart',
      title: 'Fig 1. [Figure Title Placeholder: Primary Outcome Comparison]',
      subtitle: '[Figure Subtitle: Study Cohort & Measurement Scale Placeholder]',
      caption:
        '[Figure caption placeholder: Explain error bars, measurement units, and study timeframe from the primary source.]',
      credit: 'Source: [Primary Journal / Institution Placeholder]',
      dataPoints: [
        { label: '[Intervention Group Placeholder]', value: 65, secondaryValue: 40, unit: '[Unit]', note: '[p-value / CI placeholder]' },
        { label: '[Subgroup A Placeholder]', value: 50, secondaryValue: 35, unit: '[Unit]', note: '[Note placeholder]' },
        { label: '[Control / Baseline Placeholder]', value: 30, secondaryValue: 30, unit: '[Unit]', note: '[Reference group]' },
      ],
    },
    primarySources: [
      {
        id: 'src-placeholder-1',
        title: '[Primary Study Title Placeholder]',
        journalOrInstitution: '[Journal or Health Agency Name]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
        sampleSize: '[n = Placeholder]',
      },
    ],
    tags: ['Research & Studies', 'Depression', 'Clinical Trials', 'Neurobiology'],
    relatedArticleSlugs: [
      'neuromodulation-treatment-protocol-report',
      'public-health-crisis-access-report',
      'trauma-psychotherapy-mechanism-report',
    ],
    relatedPseoSlugs: [
      'major-depressive-disorder',
      'anhedonia',
      'cognitive-behavioral-therapy-cbt',
    ],
  },
  {
    slug: 'neuromodulation-treatment-protocol-report',
    title:
      '[Secondary Headline: Accelerated Neuromodulation Protocol in Postpartum Depression]',
    subtitle:
      '[Subheadline placeholder: Summary of non-invasive transcranial magnetic stimulation protocol and clinical follow-up.]',
    excerpt:
      '[Excerpt placeholder: Overview of treatment schedule, target cortical region, and maternal health outcomes.]',
    section: 'treatments',
    authorSlug: 'author-placeholder',
    reviewerSlug: 'reviewer-placeholder',
    publishedAt: '2026-10-28T09:40:00.000Z',
    updatedAt: '2026-10-28T11:20:00.000Z',
    lastReviewedAt: '2026-10-28T11:20:00.000Z',
    readingTimeMinutes: 5,
    isBreaking: true,
    isSecondaryLead: true,
    mostReadRank: 2,
    locationDateline: '[DATELINE]',
    pullQuote: {
      quote:
        '[Pull quote placeholder: Insert verified clinician quote regarding perinatal treatment timelines.]',
      attribution: '[Reviewer Name], [Credentials]',
    },
    keyTakeaways: [
      '[Key takeaway 1 placeholder — insert verified remission or response metric]',
      '[Key takeaway 2 placeholder — insert safety and tolerability profile]',
    ],
    body: [
      {
        paragraphs: [
          '[Article body placeholder: Describe the neuromodulation protocol, session frequency, and patient cohort.]',
          '[Article body placeholder: Detail follow-up assessments and clinical guidance.]',
        ],
      },
    ],
    figure: {
      id: 'fig-tms-template',
      type: 'neuro-pathway',
      title: 'Fig 1. [Cortical Target & Symptom Trajectory Placeholder]',
      subtitle: '[Scale & Follow-Up Window Placeholder]',
      caption: '[Caption placeholder describing the neuroimaging target and outcome curve.]',
      credit: 'Source: [Journal / Institution Placeholder]',
      dataPoints: [
        { label: '[Baseline Score Placeholder]', value: 80, secondaryValue: 80, unit: '[Scale pts]', note: '[Baseline]' },
        { label: '[Post-Treatment Placeholder]', value: 30, secondaryValue: 65, unit: '[Scale pts]', note: '[Primary endpoint]' },
      ],
    },
    primarySources: [
      {
        id: 'src-placeholder-2',
        title: '[Primary Study Title Placeholder]',
        journalOrInstitution: '[Journal Name Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    tags: ['Postpartum Depression', 'TMS', 'Treatments'],
    relatedArticleSlugs: [
      'lead-clinical-research-report-template',
      'public-health-crisis-access-report',
    ],
    relatedPseoSlugs: [
      'postpartum-depression',
      'transcranial-magnetic-stimulation-tms',
    ],
  },
  {
    slug: 'public-health-crisis-access-report',
    title:
      '[Secondary Headline: Public Health Audit of Crisis Stabilization & Mental Health Parity]',
    subtitle:
      '[Subheadline placeholder: Summary of emergency department boarding data and outpatient step-down care access.]',
    excerpt:
      '[Excerpt placeholder: Examination of crisis hotline routing, inpatient bed availability, and insurance parity enforcement.]',
    section: 'public-health',
    authorSlug: 'author-placeholder',
    reviewerSlug: 'reviewer-placeholder',
    publishedAt: '2026-10-28T06:15:00.000Z',
    updatedAt: '2026-10-28T10:00:00.000Z',
    lastReviewedAt: '2026-10-28T10:00:00.000Z',
    readingTimeMinutes: 7,
    isSecondaryLead: true,
    mostReadRank: 3,
    locationDateline: '[DATELINE]',
    pullQuote: {
      quote:
        '[Pull quote placeholder: Insert verified public health commentary on crisis care access.]',
      attribution: '[Commentator Name], [Credentials]',
    },
    keyTakeaways: [
      '[Key takeaway 1 placeholder — emergency boarding duration metric]',
      '[Key takeaway 2 placeholder — outpatient follow-up availability metric]',
    ],
    body: [
      {
        paragraphs: [
          '[Article body placeholder: Summarize the public health report, agency source, and scope of the audit.]',
        ],
      },
    ],
    figure: {
      id: 'fig-public-health-template',
      type: 'epidemiology-trend',
      title: 'Fig 1. [Public Health Access Metric Placeholder]',
      subtitle: '[Dataset & Reporting Period Placeholder]',
      caption: '[Caption placeholder for public health chart.]',
      credit: 'Source: [Health Agency / Report Placeholder]',
      dataPoints: [
        { label: '[Metric A Placeholder]', value: 60, secondaryValue: 20, unit: '[Unit]', note: '[Comparison note]' },
        { label: '[Metric B Placeholder]', value: 45, secondaryValue: 15, unit: '[Unit]', note: '[Comparison note]' },
      ],
    },
    primarySources: [
      {
        id: 'src-placeholder-3',
        title: '[Public Health Agency Report Title Placeholder]',
        journalOrInstitution: '[Health Agency / Institution Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Policy / Epidemiological Audit]',
      },
    ],
    tags: ['Public Health', '988 Lifeline', 'Health Policy'],
    relatedArticleSlugs: [
      'lead-clinical-research-report-template',
      'opinion-clinical-formulation-essay-template',
    ],
    relatedPseoSlugs: [
      'suicidal-ideation-crisis-intervention',
      'major-depressive-disorder',
    ],
  },
  {
    slug: 'trauma-psychotherapy-mechanism-report',
    title:
      '[Mental Health Headline: Neuroimaging Comparison of EMDR and Prolonged Exposure in PTSD]',
    subtitle:
      '[Subheadline placeholder: Summary of trauma-focused psychotherapy neural circuits and treatment completion.]',
    excerpt:
      '[Excerpt placeholder: How fear extinction and working-memory taxation operate in trauma recovery.]',
    section: 'mental-health',
    authorSlug: 'author-placeholder',
    reviewerSlug: 'reviewer-placeholder',
    publishedAt: '2026-10-27T16:20:00.000Z',
    updatedAt: '2026-10-28T08:00:00.000Z',
    lastReviewedAt: '2026-10-28T08:00:00.000Z',
    readingTimeMinutes: 6,
    mostReadRank: 4,
    locationDateline: '[DATELINE]',
    pullQuote: {
      quote:
        '[Pull quote placeholder: Verified clinical explanation of trauma processing mechanisms.]',
      attribution: '[Author / Clinician Name], [Credentials]',
    },
    keyTakeaways: [
      '[Key takeaway 1 placeholder — psychotherapy outcome comparison]',
      '[Key takeaway 2 placeholder — clinical matching considerations]',
    ],
    body: [
      {
        paragraphs: [
          '[Article body placeholder: Summarize the trauma psychotherapy study and clinical implications.]',
        ],
      },
    ],
    figure: {
      id: 'fig-ptsd-template',
      type: 'biomarker-matrix',
      title: 'Fig 1. [Psychotherapy Outcome Comparison Placeholder]',
      subtitle: '[Trial Cohort Placeholder]',
      caption: '[Caption placeholder.]',
      credit: 'Source: [Journal Placeholder]',
      dataPoints: [
        { label: '[Arm A Placeholder]', value: 75, unit: '[%]', note: '[Note]' },
        { label: '[Arm B Placeholder]', value: 72, unit: '[%]', note: '[Note]' },
      ],
    },
    primarySources: [
      {
        id: 'src-placeholder-4',
        title: '[Primary Study Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Clinical Trial Placeholder]',
      },
    ],
    tags: ['PTSD', 'EMDR', 'Psychotherapy'],
    relatedArticleSlugs: ['lead-clinical-research-report-template'],
    relatedPseoSlugs: ['post-traumatic-stress-disorder-ptsd', 'emdr-therapy'],
  },
  {
    slug: 'circadian-sleep-architecture-wellness-report',
    title:
      '[Wellness Headline: Evening Light Exposure, Circadian Timing & Mood Stability]',
    subtitle:
      '[Subheadline placeholder: Summary of sleep-wake regularity research and behavioral sleep interventions.]',
    excerpt:
      '[Excerpt placeholder: Overview of circadian rhythm entrainment and evening light hygiene.]',
    section: 'wellness',
    authorSlug: 'author-placeholder',
    reviewerSlug: 'reviewer-placeholder',
    publishedAt: '2026-10-26T14:00:00.000Z',
    updatedAt: '2026-10-27T09:30:00.000Z',
    lastReviewedAt: '2026-10-27T09:30:00.000Z',
    readingTimeMinutes: 5,
    mostReadRank: 5,
    locationDateline: '[DATELINE]',
    pullQuote: {
      quote:
        '[Pull quote placeholder: Insert verified sleep researcher quote.]',
      attribution: '[Researcher Name], [Credentials]',
    },
    keyTakeaways: [
      '[Key takeaway 1 placeholder — circadian timing finding]',
      '[Key takeaway 2 placeholder — behavioral sleep recommendation]',
    ],
    body: [
      {
        paragraphs: [
          '[Article body placeholder: Detail the circadian biology and sleep architecture findings.]',
        ],
      },
    ],
    figure: {
      id: 'fig-sleep-template',
      type: 'sleep-architecture',
      title: 'Fig 1. [Circadian Phase & Sleep Architecture Placeholder]',
      subtitle: '[Cohort Placeholder]',
      caption: '[Caption placeholder.]',
      credit: 'Source: [Journal Placeholder]',
      dataPoints: [
        { label: '[Group 1 Placeholder]', value: 60, unit: '[Unit]' },
        { label: '[Group 2 Placeholder]', value: 35, unit: '[Unit]' },
      ],
    },
    primarySources: [
      {
        id: 'src-placeholder-5',
        title: '[Study Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Cohort Placeholder]',
      },
    ],
    tags: ['Circadian Rhythm', 'Sleep', 'Wellness'],
    relatedArticleSlugs: ['lead-clinical-research-report-template'],
    relatedPseoSlugs: ['bipolar-disorder', 'cognitive-behavioral-therapy-cbt'],
  },
  {
    slug: 'opinion-clinical-formulation-essay-template',
    title:
      '[Opinion Headline: Why Automated Symptom Checklists Cannot Replace Clinical Listening]',
    subtitle:
      '[Subheadline placeholder: Guest essay examining diagnostic nuance and the therapeutic alliance in mental health care.]',
    excerpt:
      '[Excerpt placeholder: Perspective on screening questionnaires versus comprehensive clinical evaluation.]',
    section: 'opinion',
    authorSlug: 'author-placeholder',
    reviewerSlug: 'reviewer-placeholder',
    publishedAt: '2026-10-26T08:00:00.000Z',
    updatedAt: '2026-10-26T08:00:00.000Z',
    lastReviewedAt: '2026-10-26T08:00:00.000Z',
    readingTimeMinutes: 5,
    isOpinion: true,
    locationDateline: '[DATELINE]',
    pullQuote: {
      quote:
        '[Pull quote placeholder: Insert guest essayist quote on clinical formulation and patient care.]',
      attribution: '[Guest Essayist Name], [Credentials]',
    },
    keyTakeaways: [
      '[Key point 1 placeholder — role of screening scales vs. comprehensive evaluation]',
      '[Key point 2 placeholder — importance of therapeutic alliance]',
    ],
    body: [
      {
        paragraphs: [
          '[Essay body placeholder: Insert the guest clinician or contributor essay text.]',
        ],
      },
    ],
    figure: {
      id: 'fig-opinion-template',
      type: 'clinical-trial-chart',
      title: 'Fig 1. [Clinical Evaluation Comparison Placeholder]',
      subtitle: '[Dataset Placeholder]',
      caption: '[Caption placeholder.]',
      credit: 'Source: [Source Placeholder]',
      dataPoints: [
        { label: '[Category A Placeholder]', value: 50, unit: '[%]' },
        { label: '[Category B Placeholder]', value: 30, unit: '[%]' },
      ],
    },
    primarySources: [
      {
        id: 'src-placeholder-6',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Review / Meta-Analysis Placeholder]',
      },
    ],
    tags: ['Opinion', 'Therapeutic Alliance', 'Clinical Care'],
    relatedArticleSlugs: ['public-health-crisis-access-report'],
    relatedPseoSlugs: ['major-depressive-disorder', 'cognitive-behavioral-therapy-cbt'],
  },
];
