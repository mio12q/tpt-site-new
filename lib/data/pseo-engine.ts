import type { PseoCategory, PseoPage } from '../domain/types';
import { BRAND_CONFIG } from './editorial-data';

export const CORE_PSEO_PAGES: PseoPage[] = [
  // -------------------------------------------------------------------------
  // 1. CONDITION EXPLAINERS (/conditions/[slug])
  // -------------------------------------------------------------------------
  {
    slug: 'major-depressive-disorder',
    category: 'condition',
    urlPath: '/conditions/major-depressive-disorder',
    title: 'Major Depressive Disorder (MDD): Condition Explainer & Treatment Overview',
    subtitle:
      'Structured clinical reference covering diagnostic criteria, neurobiological pathways, and treatment options.',
    metaTitle: 'Major Depressive Disorder (MDD): Condition Explainer',
    metaDescription:
      'Structured explainer on Major Depressive Disorder (MDD): symptoms, diagnostic criteria, psychotherapy, and treatment overview.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/conditions/major-depressive-disorder`,
    dsmOrIcdCode: '[Diagnostic Code Placeholder]',
    lastReviewedAt: '2026-10-28T12:00:00.000Z',
    updatedAt: '2026-10-28T12:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary:
      '[Clinical summary placeholder for Major Depressive Disorder — insert verified overview of symptoms, course of illness, and clinical subtypes.]',
    neurobiologicalMechanism:
      '[Neurobiological mechanism placeholder — insert verified neurochemical, circuit, and physiological context from primary medical literature.]',
    diagnosticOrClinicalCriteria: [
      '[Diagnostic criterion 1 placeholder — insert verified diagnostic manual criteria]',
      '[Diagnostic criterion 2 placeholder — insert duration and functional impact thresholds]',
      '[Diagnostic criterion 3 placeholder — insert differential diagnosis considerations]',
    ],
    epidemiologyAndMetrics: [
      {
        metric: '[Epidemiological Metric 1 Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source / Agency Placeholder]',
      },
      {
        metric: '[Outcome Metric 2 Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source / Study Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Cognitive Behavioral Therapy (CBT)',
        efficacySummary: '[Treatment overview placeholder — insert verified efficacy summary and clinical indications.]',
        durationOrDosage: '[Session / Duration Placeholder]',
        guidelineSource: '[Clinical Guideline Source Placeholder]',
      },
      {
        name: 'Pharmacotherapy & Neuromodulation',
        efficacySummary: '[Pharmacotherapy & neuromodulation summary placeholder.]',
        durationOrDosage: '[Protocol Duration Placeholder]',
        guidelineSource: '[Clinical Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'How is Major Depressive Disorder evaluated clinically?',
        answer:
          '[FAQ answer placeholder — insert clinician-reviewed explanation of comprehensive diagnostic evaluation.]',
      },
      {
        question: 'What treatment modalities are commonly used for Major Depressive Disorder?',
        answer:
          '[FAQ answer placeholder — insert clinician-reviewed summary of psychotherapy, medication, and lifestyle support.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-mdd-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal or Health Agency Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Guideline / Review Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Cognitive Behavioral Therapy (CBT)', urlPath: '/treatments/cognitive-behavioral-therapy-cbt', category: 'treatment' },
      { title: 'Transcranial Magnetic Stimulation (TMS)', urlPath: '/treatments/transcranial-magnetic-stimulation-tms', category: 'treatment' },
      { title: 'Anhedonia (Medical Glossary)', urlPath: '/glossary/anhedonia', category: 'glossary' },
    ],
    relatedArticleSlugs: [
      'lead-clinical-research-report-template',
      'neuromodulation-treatment-protocol-report',
    ],
  },
  {
    slug: 'generalized-anxiety-disorder',
    category: 'condition',
    urlPath: '/conditions/generalized-anxiety-disorder',
    title: 'Generalized Anxiety Disorder (GAD): Condition Explainer & Treatment Overview',
    subtitle:
      'Structured clinical reference on persistent worry, autonomic arousal, and evidence-based care.',
    metaTitle: 'Generalized Anxiety Disorder (GAD): Condition Explainer',
    metaDescription:
      'Structured explainer on Generalized Anxiety Disorder (GAD): symptoms, diagnostic criteria, and treatment protocols.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/conditions/generalized-anxiety-disorder`,
    dsmOrIcdCode: '[Diagnostic Code Placeholder]',
    lastReviewedAt: '2026-10-28T10:00:00.000Z',
    updatedAt: '2026-10-28T10:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary:
      '[Clinical summary placeholder for Generalized Anxiety Disorder — insert verified overview of symptoms and diagnostic features.]',
    neurobiologicalMechanism:
      '[Neurobiological mechanism placeholder — insert verified autonomic and neural circuit overview.]',
    diagnosticOrClinicalCriteria: [
      '[Diagnostic criterion 1 placeholder]',
      '[Diagnostic criterion 2 placeholder]',
    ],
    epidemiologyAndMetrics: [
      {
        metric: '[Prevalence Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Cognitive Behavioral Therapy for GAD',
        efficacySummary: '[Treatment summary placeholder.]',
        durationOrDosage: '[Duration Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'What are the core clinical features of Generalized Anxiety Disorder?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-gad-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Review Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Cognitive Behavioral Therapy (CBT)', urlPath: '/treatments/cognitive-behavioral-therapy-cbt', category: 'treatment' },
      { title: 'Vagus Nerve Autonomic Regulation', urlPath: '/glossary/vagus-nerve-autonomic-regulation', category: 'glossary' },
    ],
    relatedArticleSlugs: ['lead-clinical-research-report-template'],
  },
  {
    slug: 'post-traumatic-stress-disorder-ptsd',
    category: 'condition',
    urlPath: '/conditions/post-traumatic-stress-disorder-ptsd',
    title: 'Post-Traumatic Stress Disorder (PTSD): Condition Explainer & Trauma Therapies',
    subtitle:
      'Structured clinical reference on trauma responses, diagnostic criteria, and psychotherapy options.',
    metaTitle: 'Post-Traumatic Stress Disorder (PTSD): Condition Explainer',
    metaDescription:
      'Structured guide to Post-Traumatic Stress Disorder (PTSD): symptoms, diagnostic criteria, EMDR, and Prolonged Exposure.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/conditions/post-traumatic-stress-disorder-ptsd`,
    dsmOrIcdCode: '[Diagnostic Code Placeholder]',
    lastReviewedAt: '2026-10-28T09:00:00.000Z',
    updatedAt: '2026-10-28T09:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary:
      '[Clinical summary placeholder for Post-Traumatic Stress Disorder.]',
    neurobiologicalMechanism:
      '[Neurobiological mechanism placeholder for PTSD.]',
    diagnosticOrClinicalCriteria: [
      '[Diagnostic criterion 1 placeholder]',
      '[Diagnostic criterion 2 placeholder]',
    ],
    epidemiologyAndMetrics: [
      {
        metric: '[Clinical Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Eye Movement Desensitization and Reprocessing (EMDR)',
        efficacySummary: '[Treatment summary placeholder.]',
        durationOrDosage: '[Session Count Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'How do trauma-focused psychotherapies address PTSD symptoms?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-ptsd-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'EMDR Therapy Explainer', urlPath: '/treatments/emdr-therapy', category: 'treatment' },
      { title: 'Dialectical Behavior Therapy (DBT)', urlPath: '/treatments/dialectical-behavior-therapy-dbt', category: 'treatment' },
    ],
    relatedArticleSlugs: ['trauma-psychotherapy-mechanism-report'],
  },
  {
    slug: 'postpartum-depression',
    category: 'condition',
    urlPath: '/conditions/postpartum-depression',
    title: 'Postpartum Depression: Condition Explainer, Screening & Care Options',
    subtitle:
      'Structured clinical reference on perinatal mood symptoms, screening tools, and treatment options.',
    metaTitle: 'Postpartum Depression: Condition Explainer & Care Options',
    metaDescription:
      'Structured explainer on Postpartum Depression: screening, symptoms, psychotherapy, and treatment considerations.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/conditions/postpartum-depression`,
    dsmOrIcdCode: '[Diagnostic Code Placeholder]',
    lastReviewedAt: '2026-10-28T11:30:00.000Z',
    updatedAt: '2026-10-28T11:30:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary:
      '[Clinical summary placeholder for Postpartum Depression.]',
    neurobiologicalMechanism:
      '[Neurobiological mechanism placeholder for Postpartum Depression.]',
    diagnosticOrClinicalCriteria: [
      '[Screening & diagnostic criterion placeholder]',
    ],
    epidemiologyAndMetrics: [
      {
        metric: '[Perinatal Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: '[Treatment Protocol Placeholder]',
        efficacySummary: '[Efficacy summary placeholder.]',
        durationOrDosage: '[Duration Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'How is postpartum depression screened in clinical settings?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-ppd-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Transcranial Magnetic Stimulation (TMS)', urlPath: '/treatments/transcranial-magnetic-stimulation-tms', category: 'treatment' },
      { title: 'Major Depressive Disorder', urlPath: '/conditions/major-depressive-disorder', category: 'condition' },
    ],
    relatedArticleSlugs: ['neuromodulation-treatment-protocol-report'],
  },
  {
    slug: 'bipolar-disorder',
    category: 'condition',
    urlPath: '/conditions/bipolar-disorder',
    title: 'Bipolar Spectrum Disorders: Condition Explainer & Clinical Management',
    subtitle:
      'Structured clinical reference on Bipolar I and II disorders, circadian regulation, and mood stabilization.',
    metaTitle: 'Bipolar Spectrum Disorders: Condition Explainer',
    metaDescription:
      'Structured clinical reference on Bipolar I and Bipolar II Disorder: diagnostic criteria and management.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/conditions/bipolar-disorder`,
    dsmOrIcdCode: '[Diagnostic Code Placeholder]',
    lastReviewedAt: '2026-10-27T14:00:00.000Z',
    updatedAt: '2026-10-27T14:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary: '[Clinical summary placeholder for Bipolar Spectrum Disorders.]',
    neurobiologicalMechanism: '[Neurobiological mechanism placeholder.]',
    diagnosticOrClinicalCriteria: ['[Diagnostic criterion placeholder]'],
    epidemiologyAndMetrics: [
      {
        metric: '[Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: '[Treatment Protocol Placeholder]',
        efficacySummary: '[Efficacy summary placeholder.]',
        durationOrDosage: '[Duration Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'How do clinicians distinguish Bipolar I from Bipolar II Disorder?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-bd-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Major Depressive Disorder', urlPath: '/conditions/major-depressive-disorder', category: 'condition' },
    ],
    relatedArticleSlugs: ['circadian-sleep-architecture-wellness-report'],
  },
  {
    slug: 'borderline-personality-disorder',
    category: 'condition',
    urlPath: '/conditions/borderline-personality-disorder',
    title: 'Borderline Personality Disorder (BPD): Condition Explainer & Psychotherapy',
    subtitle:
      'Structured clinical reference on emotion regulation, interpersonal sensitivity, and evidence-based psychotherapies.',
    metaTitle: 'Borderline Personality Disorder (BPD): Condition Explainer',
    metaDescription:
      'Structured overview of Borderline Personality Disorder (BPD): diagnostic criteria and Dialectical Behavior Therapy (DBT).',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/conditions/borderline-personality-disorder`,
    dsmOrIcdCode: '[Diagnostic Code Placeholder]',
    lastReviewedAt: '2026-10-28T08:00:00.000Z',
    updatedAt: '2026-10-28T08:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary: '[Clinical summary placeholder for Borderline Personality Disorder.]',
    neurobiologicalMechanism: '[Neurobiological mechanism placeholder.]',
    diagnosticOrClinicalCriteria: ['[Diagnostic criterion placeholder]'],
    epidemiologyAndMetrics: [
      {
        metric: '[Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Dialectical Behavior Therapy (DBT)',
        efficacySummary: '[Efficacy summary placeholder.]',
        durationOrDosage: '[Duration Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'What is the primary treatment modality for Borderline Personality Disorder?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-bpd-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Dialectical Behavior Therapy (DBT)', urlPath: '/treatments/dialectical-behavior-therapy-dbt', category: 'treatment' },
    ],
    relatedArticleSlugs: ['trauma-psychotherapy-mechanism-report'],
  },

  // -------------------------------------------------------------------------
  // 2. TREATMENT EXPLAINERS (/treatments/[slug])
  // -------------------------------------------------------------------------
  {
    slug: 'cognitive-behavioral-therapy-cbt',
    category: 'treatment',
    urlPath: '/treatments/cognitive-behavioral-therapy-cbt',
    title: 'Cognitive Behavioral Therapy (CBT): Treatment Explainer & Clinical Structure',
    subtitle:
      'Structured overview of cognitive reappraisal, behavioral activation, and exposure protocols.',
    metaTitle: 'Cognitive Behavioral Therapy (CBT): Treatment Explainer',
    metaDescription:
      'Treatment explainer on Cognitive Behavioral Therapy (CBT): core principles, session structure, and clinical applications.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/treatments/cognitive-behavioral-therapy-cbt`,
    dsmOrIcdCode: '[Treatment Code / Classification Placeholder]',
    lastReviewedAt: '2026-10-28T12:00:00.000Z',
    updatedAt: '2026-10-28T12:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary:
      '[Clinical summary placeholder for Cognitive Behavioral Therapy (CBT) — insert verified description of cognitive and behavioral principles.]',
    neurobiologicalMechanism:
      '[Mechanism placeholder — insert verified neuroimaging and cognitive mechanism summary.]',
    diagnosticOrClinicalCriteria: [
      '[Core clinical component 1 placeholder]',
      '[Core clinical component 2 placeholder]',
    ],
    epidemiologyAndMetrics: [
      {
        metric: '[Clinical Outcome Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Standard Structured CBT Protocol',
        efficacySummary: '[Protocol summary placeholder.]',
        durationOrDosage: '[Session Count Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'What happens during a typical course of Cognitive Behavioral Therapy?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-cbt-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Review Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Major Depressive Disorder', urlPath: '/conditions/major-depressive-disorder', category: 'condition' },
      { title: 'Generalized Anxiety Disorder', urlPath: '/conditions/generalized-anxiety-disorder', category: 'condition' },
    ],
    relatedArticleSlugs: ['opinion-clinical-formulation-essay-template'],
  },
  {
    slug: 'dialectical-behavior-therapy-dbt',
    category: 'treatment',
    urlPath: '/treatments/dialectical-behavior-therapy-dbt',
    title: 'Dialectical Behavior Therapy (DBT): Treatment Explainer & Skills Modules',
    subtitle:
      'Structured overview of mindfulness, distress tolerance, emotion regulation, and interpersonal effectiveness.',
    metaTitle: 'Dialectical Behavior Therapy (DBT): Treatment Explainer',
    metaDescription:
      'Clinical explainer on Dialectical Behavior Therapy (DBT): treatment modes and skills training modules.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/treatments/dialectical-behavior-therapy-dbt`,
    dsmOrIcdCode: '[Treatment Classification Placeholder]',
    lastReviewedAt: '2026-10-28T08:30:00.000Z',
    updatedAt: '2026-10-28T08:30:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary: '[Clinical summary placeholder for Dialectical Behavior Therapy (DBT).]',
    neurobiologicalMechanism: '[Mechanism placeholder for DBT.]',
    diagnosticOrClinicalCriteria: [
      '[Module 1: Mindfulness placeholder]',
      '[Module 2: Distress Tolerance placeholder]',
      '[Module 3: Emotion Regulation placeholder]',
      '[Module 4: Interpersonal Effectiveness placeholder]',
    ],
    epidemiologyAndMetrics: [
      {
        metric: '[Outcome Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Comprehensive Outpatient DBT',
        efficacySummary: '[Protocol summary placeholder.]',
        durationOrDosage: '[Duration Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'What are the four core skills modules in DBT?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-dbt-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Borderline Personality Disorder', urlPath: '/conditions/borderline-personality-disorder', category: 'condition' },
    ],
    relatedArticleSlugs: ['trauma-psychotherapy-mechanism-report'],
  },
  {
    slug: 'emdr-therapy',
    category: 'treatment',
    urlPath: '/treatments/emdr-therapy',
    title: 'EMDR Therapy (Eye Movement Desensitization and Reprocessing): Treatment Explainer',
    subtitle:
      'Structured overview of the 8-phase EMDR trauma processing protocol and bilateral stimulation.',
    metaTitle: 'EMDR Therapy: Treatment Explainer & Protocol',
    metaDescription:
      'Explainer on Eye Movement Desensitization and Reprocessing (EMDR) therapy for trauma and PTSD.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/treatments/emdr-therapy`,
    dsmOrIcdCode: '[Treatment Classification Placeholder]',
    lastReviewedAt: '2026-10-28T09:00:00.000Z',
    updatedAt: '2026-10-28T09:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary: '[Clinical summary placeholder for EMDR Therapy.]',
    neurobiologicalMechanism: '[Mechanism placeholder for EMDR Therapy.]',
    diagnosticOrClinicalCriteria: ['[8-Phase protocol overview placeholder]'],
    epidemiologyAndMetrics: [
      {
        metric: '[Outcome Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Standard 8-Phase EMDR Protocol',
        efficacySummary: '[Protocol summary placeholder.]',
        durationOrDosage: '[Duration Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'How is EMDR structured across sessions?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-emdr-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'PTSD & Complex PTSD', urlPath: '/conditions/post-traumatic-stress-disorder-ptsd', category: 'condition' },
    ],
    relatedArticleSlugs: ['trauma-psychotherapy-mechanism-report'],
  },
  {
    slug: 'transcranial-magnetic-stimulation-tms',
    category: 'treatment',
    urlPath: '/treatments/transcranial-magnetic-stimulation-tms',
    title: 'Transcranial Magnetic Stimulation (TMS): Treatment Explainer & Protocol Guide',
    subtitle:
      'Structured overview of non-invasive electromagnetic neuromodulation and clinical indications.',
    metaTitle: 'Transcranial Magnetic Stimulation (TMS): Treatment Explainer',
    metaDescription:
      'Explainer on repetitive Transcranial Magnetic Stimulation (rTMS) and theta-burst stimulation protocols.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/treatments/transcranial-magnetic-stimulation-tms`,
    dsmOrIcdCode: '[Treatment Classification Placeholder]',
    lastReviewedAt: '2026-10-28T11:30:00.000Z',
    updatedAt: '2026-10-28T11:30:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary: '[Clinical summary placeholder for Transcranial Magnetic Stimulation (TMS).]',
    neurobiologicalMechanism: '[Mechanism placeholder for TMS.]',
    diagnosticOrClinicalCriteria: ['[Clinical indication & contraindication placeholder]'],
    epidemiologyAndMetrics: [
      {
        metric: '[Outcome Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Standard & Accelerated TMS Protocols',
        efficacySummary: '[Protocol summary placeholder.]',
        durationOrDosage: '[Session Schedule Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between rTMS and ECT?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-tms-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Postpartum Depression', urlPath: '/conditions/postpartum-depression', category: 'condition' },
      { title: 'Major Depressive Disorder', urlPath: '/conditions/major-depressive-disorder', category: 'condition' },
    ],
    relatedArticleSlugs: ['neuromodulation-treatment-protocol-report'],
  },

  // -------------------------------------------------------------------------
  // 3. TOPIC HUBS (/topics/[slug])
  // -------------------------------------------------------------------------
  {
    slug: 'anxiety-disorders-clinical-research',
    category: 'topic-hub',
    urlPath: '/topics/anxiety-disorders-clinical-research',
    title: 'Topic Hub: Latest News & Clinical Explainers on Anxiety',
    subtitle:
      'Curated news dispatches, study explainers, and condition guides covering anxiety disorders.',
    metaTitle: 'Anxiety News & Clinical Topic Hub',
    metaDescription:
      'Topic hub aggregating news, study explainers, and treatment guides on Generalized Anxiety Disorder and panic.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/topics/anxiety-disorders-clinical-research`,
    dsmOrIcdCode: '[Topic Classification Placeholder]',
    lastReviewedAt: '2026-10-28T14:00:00.000Z',
    updatedAt: '2026-10-28T14:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary: '[Topic hub summary placeholder for Anxiety Disorders.]',
    neurobiologicalMechanism: '[Mechanism overview placeholder.]',
    diagnosticOrClinicalCriteria: ['[Topic scope item placeholder]'],
    epidemiologyAndMetrics: [
      {
        metric: '[Epidemiological Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Cognitive Behavioral Therapy & Exposure Protocols',
        efficacySummary: '[Protocol summary placeholder.]',
        durationOrDosage: '[Duration Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'What conditions are covered in the Anxiety Topic Hub?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-hub-anx-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Generalized Anxiety Disorder', urlPath: '/conditions/generalized-anxiety-disorder', category: 'condition' },
      { title: 'Cognitive Behavioral Therapy (CBT)', urlPath: '/treatments/cognitive-behavioral-therapy-cbt', category: 'treatment' },
    ],
    relatedArticleSlugs: ['lead-clinical-research-report-template'],
  },
  {
    slug: 'neuroinflammation-metabolic-psychiatry',
    category: 'topic-hub',
    urlPath: '/topics/neuroinflammation-metabolic-psychiatry',
    title: 'Topic Hub: Neuroinflammation & Metabolic Psychiatry',
    subtitle:
      'Curated coverage of immune-metabolic signaling and mood disorder research.',
    metaTitle: 'Neuroinflammation & Metabolic Psychiatry Topic Hub',
    metaDescription:
      'Topic hub covering neuroinflammation, metabolic psychiatry, and mood research.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/topics/neuroinflammation-metabolic-psychiatry`,
    dsmOrIcdCode: '[Topic Classification Placeholder]',
    lastReviewedAt: '2026-10-28T16:00:00.000Z',
    updatedAt: '2026-10-28T16:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary: '[Topic hub summary placeholder for Neuroinflammation & Metabolic Psychiatry.]',
    neurobiologicalMechanism: '[Mechanism overview placeholder.]',
    diagnosticOrClinicalCriteria: ['[Biomarker & research scope placeholder]'],
    epidemiologyAndMetrics: [
      {
        metric: '[Research Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Primary Source Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: '[Investigational Protocol Placeholder]',
        efficacySummary: '[Summary placeholder.]',
        durationOrDosage: '[Duration Placeholder]',
        guidelineSource: '[Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'What is metabolic psychiatry?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-hub-metab-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Major Depressive Disorder', urlPath: '/conditions/major-depressive-disorder', category: 'condition' },
    ],
    relatedArticleSlugs: ['lead-clinical-research-report-template'],
  },

  // -------------------------------------------------------------------------
  // 4. STUDY EXPLAINERS (/studies/[slug])
  // -------------------------------------------------------------------------
  {
    slug: 'neuro-metab-04-glp1-depression-trial-methodology',
    category: 'study-explainer',
    urlPath: '/studies/neuro-metab-04-glp1-depression-trial-methodology',
    title: 'Study Explainer: Methodology, Sample Size & Clinical Takeaways Template',
    subtitle:
      'Structured template for breaking down clinical trial design, inclusion criteria, statistical endpoints, and study limitations.',
    metaTitle: 'Clinical Study Explainer Template: Methodology & Takeaways',
    metaDescription:
      'Structured study explainer covering clinical trial methodology, sample size, endpoints, and limitations.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/studies/neuro-metab-04-glp1-depression-trial-methodology`,
    dsmOrIcdCode: '[Trial Registration ID Placeholder]',
    lastReviewedAt: '2026-10-28T18:00:00.000Z',
    updatedAt: '2026-10-28T18:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary:
      '[Study explainer summary placeholder — replace with verified trial methodology and findings.]',
    neurobiologicalMechanism:
      '[Biological or psychological mechanism evaluated in the study.]',
    diagnosticOrClinicalCriteria: [
      'Inclusion Criteria: [Insert verified study inclusion criteria]',
      'Exclusion Criteria: [Insert verified study exclusion criteria]',
    ],
    epidemiologyAndMetrics: [
      {
        metric: 'Primary Endpoint',
        value: '[Outcome Value Placeholder]',
        clinicalReference: '[Statistical Model / p-value Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: '[Study Intervention Arm Placeholder]',
        efficacySummary: '[Summary of study intervention and control comparator.]',
        durationOrDosage: '[Study Follow-Up Duration Placeholder]',
        guidelineSource: '[Journal Citation Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'What were the main limitations noted by the study authors?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-study-1',
        title: '[Primary Study Citation Placeholder]',
        journalOrInstitution: '[Journal Name Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Study Design Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Major Depressive Disorder', urlPath: '/conditions/major-depressive-disorder', category: 'condition' },
    ],
    relatedArticleSlugs: ['lead-clinical-research-report-template'],
  },

  // -------------------------------------------------------------------------
  // 5. MEDICAL GLOSSARY TERMS (/glossary/[slug])
  // -------------------------------------------------------------------------
  {
    slug: 'anhedonia',
    category: 'glossary',
    urlPath: '/glossary/anhedonia',
    title: 'Anhedonia: Medical Glossary Definition & Clinical Context',
    subtitle:
      'Definition of anticipatory and consummatory reward deficits in mood and psychiatric conditions.',
    metaTitle: 'Anhedonia: Medical Glossary Definition',
    metaDescription:
      'Medical glossary entry on Anhedonia: clinical definition, reward circuitry, and assessment context.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/glossary/anhedonia`,
    dsmOrIcdCode: '[Clinical Term Code Placeholder]',
    lastReviewedAt: '2026-10-28T12:00:00.000Z',
    updatedAt: '2026-10-28T12:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary:
      '[Glossary definition placeholder for Anhedonia — insert verified clinical definition and distinction between anticipatory and consummatory pleasure.]',
    neurobiologicalMechanism: '[Neurobiological pathway placeholder.]',
    diagnosticOrClinicalCriteria: ['[Clinical assessment scale placeholder]'],
    epidemiologyAndMetrics: [
      {
        metric: '[Clinical Context Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Reference Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Behavioral Activation & Targeted Care',
        efficacySummary: '[Summary placeholder.]',
        durationOrDosage: '[Duration Placeholder]',
        guidelineSource: '[Guideline Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'How is anhedonia defined in clinical psychiatry?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-gloss-anh-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Review Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Major Depressive Disorder', urlPath: '/conditions/major-depressive-disorder', category: 'condition' },
    ],
    relatedArticleSlugs: ['lead-clinical-research-report-template'],
  },
  {
    slug: 'vagus-nerve-autonomic-regulation',
    category: 'glossary',
    urlPath: '/glossary/vagus-nerve-autonomic-regulation',
    title: 'Vagus Nerve & Autonomic Regulation: Medical Glossary Definition',
    subtitle:
      'Overview of parasympathetic nervous system signaling and gut-brain communication.',
    metaTitle: 'Vagus Nerve & Autonomic Regulation: Medical Glossary',
    metaDescription:
      'Medical glossary entry on the Vagus Nerve (Cranial Nerve X) and autonomic regulation.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/glossary/vagus-nerve-autonomic-regulation`,
    dsmOrIcdCode: 'Cranial Nerve X · Autonomic Nervous System',
    lastReviewedAt: '2026-10-27T12:00:00.000Z',
    updatedAt: '2026-10-27T12:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary: '[Glossary definition placeholder for Vagus Nerve & Autonomic Regulation.]',
    neurobiologicalMechanism: '[Anatomical & physiological pathway placeholder.]',
    diagnosticOrClinicalCriteria: ['[Measurement & clinical context placeholder]'],
    epidemiologyAndMetrics: [
      {
        metric: '[Physiological Metric Placeholder]',
        value: '[Value Placeholder]',
        clinicalReference: '[Reference Placeholder]',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: '[Autonomic Regulation Protocol Placeholder]',
        efficacySummary: '[Summary placeholder.]',
        durationOrDosage: '[Duration Placeholder]',
        guidelineSource: '[Guideline Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'What role does the vagus nerve play in the parasympathetic nervous system?',
        answer: '[FAQ answer placeholder.]',
      },
    ],
    primarySources: [
      {
        id: 'pseo-gloss-vagus-1',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
        studyDesign: '[Reference Placeholder]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Generalized Anxiety Disorder', urlPath: '/conditions/generalized-anxiety-disorder', category: 'condition' },
    ],
    relatedArticleSlugs: ['lead-clinical-research-report-template'],
  },

  // -------------------------------------------------------------------------
  // 6. CLINICAL FAQ PAGES (/faq/[slug])
  // -------------------------------------------------------------------------
  {
    slug: 'suicidal-ideation-crisis-intervention',
    category: 'faq',
    urlPath: '/faq/suicidal-ideation-crisis-intervention',
    title: 'FAQ: Crisis Resources, 988 Lifeline & Collaborative Safety Planning',
    subtitle:
      'Frequently asked questions regarding immediate crisis support and safety planning protocols.',
    metaTitle: 'Crisis Support & Safety Planning FAQ (988 Lifeline)',
    metaDescription:
      'FAQ on mental health crisis resources, the 988 Suicide & Crisis Lifeline, and collaborative safety planning.',
    canonicalUrl: `${BRAND_CONFIG.canonicalBase}/faq/suicidal-ideation-crisis-intervention`,
    dsmOrIcdCode: 'Crisis Support & Safety Planning FAQ',
    lastReviewedAt: '2026-10-28T15:00:00.000Z',
    updatedAt: '2026-10-28T15:00:00.000Z',
    reviewerSlug: 'reviewer-placeholder',
    authorSlug: 'author-placeholder',
    clinicalSummary:
      'If you or someone you know is in crisis, call or text 988 in the United States and Canada, call 999 or 111 in the UK, or call 112 in Europe. [Insert additional clinician-reviewed safety planning overview here.]',
    neurobiologicalMechanism: '[Clinical context placeholder.]',
    diagnosticOrClinicalCriteria: [
      'Step 1: Recognizing warning signs',
      'Step 2: Internal coping strategies',
      'Step 3: Social contacts and settings that provide distraction',
      'Step 4: Trusted family members or friends',
      'Step 5: Professionals, local urgent care, and 988 Suicide & Crisis Lifeline',
      'Step 6: Making the environment safe',
    ],
    epidemiologyAndMetrics: [
      {
        metric: 'US & Canada Crisis Lifeline',
        value: 'Call or Text 988 (24/7)',
        clinicalReference: '988 Suicide & Crisis Lifeline',
      },
    ],
    treatmentOrClinicalProtocols: [
      {
        name: 'Collaborative Safety Planning',
        efficacySummary: '[Safety planning summary placeholder.]',
        durationOrDosage: '[Clinical Protocol Placeholder]',
        guidelineSource: '[Guideline Source Placeholder]',
      },
    ],
    faqs: [
      {
        question: 'How do I reach the 988 Suicide & Crisis Lifeline?',
        answer:
          'In the United States and Canada, call or text 988 at any time (24/7) for free, confidential support.',
      },
    ],
    primarySources: [
      {
        id: 'pseo-faq-988',
        title: '[Primary Reference Title Placeholder]',
        journalOrInstitution: '[Health Agency / Journal Placeholder]',
        publicationDate: '[Publication Date]',
        doiOrUrl: 'https://988lifeline.org',
        studyDesign: '[Public Health Resource]',
      },
    ],
    relatedPseoPaths: [
      { title: 'Major Depressive Disorder', urlPath: '/conditions/major-depressive-disorder', category: 'condition' },
    ],
    relatedArticleSlugs: ['public-health-crisis-access-report'],
  },
];

// ---------------------------------------------------------------------------
// Combinatorial Structured pSEO Template Matrix
// Generates structured template URLs for chunked sitemaps using explicit
// placeholders rather than invented statistics or claims.
// ---------------------------------------------------------------------------

const MATRIX_CONDITIONS = [
  { key: 'major-depressive-disorder', label: 'Major Depressive Disorder', code: '[Diagnostic Code]' },
  { key: 'generalized-anxiety-disorder', label: 'Generalized Anxiety Disorder', code: '[Diagnostic Code]' },
  { key: 'post-traumatic-stress-disorder', label: 'Post-Traumatic Stress Disorder', code: '[Diagnostic Code]' },
  { key: 'bipolar-spectrum-disorder', label: 'Bipolar Spectrum Disorder', code: '[Diagnostic Code]' },
  { key: 'obsessive-compulsive-disorder', label: 'Obsessive-Compulsive Disorder', code: '[Diagnostic Code]' },
  { key: 'panic-disorder', label: 'Panic Disorder', code: '[Diagnostic Code]' },
  { key: 'social-anxiety-disorder', label: 'Social Anxiety Disorder', code: '[Diagnostic Code]' },
  { key: 'postpartum-depression', label: 'Postpartum Depression', code: '[Diagnostic Code]' },
  { key: 'borderline-personality-disorder', label: 'Borderline Personality Disorder', code: '[Diagnostic Code]' },
  { key: 'insomnia-disorder', label: 'Chronic Insomnia Disorder', code: '[Diagnostic Code]' },
  { key: 'attention-deficit-hyperactivity-disorder', label: 'Adult & Adolescent ADHD', code: '[Diagnostic Code]' },
  { key: 'complex-ptsd', label: 'Complex PTSD (CPTSD)', code: '[Diagnostic Code]' },
  { key: 'persistent-depressive-disorder', label: 'Persistent Depressive Disorder', code: '[Diagnostic Code]' },
  { key: 'somatic-symptom-disorder', label: 'Somatic Symptom Disorder', code: '[Diagnostic Code]' },
  { key: 'binge-eating-disorder', label: 'Binge-Eating Disorder', code: '[Diagnostic Code]' },
];

const MATRIX_INTERVENTIONS = [
  { key: 'cbt-protocol', label: 'Cognitive Behavioral Therapy (CBT)' },
  { key: 'dbt-skills', label: 'Dialectical Behavior Therapy (DBT)' },
  { key: 'emdr-reconsolidation', label: 'EMDR Therapy' },
  { key: 'accelerated-itbs-tms', label: 'Transcranial Magnetic Stimulation (TMS)' },
  { key: 'act-acceptance', label: 'Acceptance and Commitment Therapy (ACT)' },
  { key: 'prolonged-exposure', label: 'Prolonged Exposure (PE)' },
  { key: 'ipsrt-circadian', label: 'Interpersonal & Social Rhythm Therapy (IPSRT)' },
  { key: 'ssri-snri-pharmacotherapy', label: 'Pharmacotherapy Overview' },
  { key: 'vagus-nerve-biofeedback', label: 'Autonomic & Biofeedback Therapy' },
  { key: 'nutritional-psychobiotic', label: 'Nutritional Psychiatry Overview' },
  { key: 'cbt-i-sleep-architecture', label: 'CBT for Insomnia (CBT-I)' },
  { key: 'mbt-mentalization', label: 'Mentalization-Based Treatment (MBT)' },
];

const MATRIX_POPULATIONS = [
  { key: 'adults', label: 'Adults' },
  { key: 'adolescents-young-adults', label: 'Adolescents & Young Adults' },
  { key: 'older-adults', label: 'Older Adults' },
  { key: 'perinatal-postpartum', label: 'Perinatal & Postpartum Patients' },
  { key: 'treatment-resistant', label: 'Treatment-Resistant Presentations' },
  { key: 'high-inflammation-crp', label: 'Inflammatory Subtypes' },
  { key: 'comorbid-insomnia', label: 'Comorbid Sleep Disturbance' },
  { key: 'dissociative-phenotype', label: 'Dissociative Presentations' },
  { key: 'primary-care-collaborative', label: 'Collaborative Primary Care' },
  { key: 'acute-step-down', label: 'Outpatient Step-Down Care' },
  { key: 'healthcare-clinicians', label: 'Healthcare Workers' },
  { key: 'neurodivergent-adults', label: 'Neurodivergent Adults' },
  { key: 'veterans-first-responders', label: 'Veterans & First Responders' },
  { key: 'chronic-medical-illness', label: 'Comorbid Chronic Illness' },
];

export interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'hourly' | 'daily' | 'weekly';
  priority: string;
  title: string;
  category: PseoCategory | 'article' | 'section' | 'institutional';
}

export function getTotalProgrammaticPageCount(): number {
  return (
    CORE_PSEO_PAGES.length +
    MATRIX_CONDITIONS.length * MATRIX_INTERVENTIONS.length * MATRIX_POPULATIONS.length
  );
}

export function getAllSitemapEntries(): SitemapUrlEntry[] {
  const base = BRAND_CONFIG.canonicalBase;
  const entries: SitemapUrlEntry[] = [];

  const coreStaticPaths = [
    { path: '/', title: 'Therapist Psychologist Today — Homepage', priority: '1.0', freq: 'hourly' as const },
    { path: '/directory', title: 'Programmatic SEO Directory', priority: '0.9', freq: 'daily' as const },
    { path: '/editorial-policy', title: 'Editorial Policy', priority: '0.7', freq: 'weekly' as const },
    { path: '/medical-review-process', title: 'Medical Review Process', priority: '0.7', freq: 'weekly' as const },
    { path: '/corrections-policy', title: 'Corrections Policy', priority: '0.6', freq: 'weekly' as const },
    { path: '/crisis-resources', title: '988 & International Crisis Resources', priority: '0.9', freq: 'weekly' as const },
    { path: '/terms', title: 'Terms of Use & Copyright Notice', priority: '0.5', freq: 'weekly' as const },
    { path: '/dmca', title: 'DMCA Takedown Notice', priority: '0.5', freq: 'weekly' as const },
  ];

  for (const item of coreStaticPaths) {
    entries.push({
      loc: `${base}${item.path}`,
      lastmod: '2026-10-28T18:00:00.000Z',
      changefreq: item.freq,
      priority: item.priority,
      title: item.title,
      category: 'institutional',
    });
  }

  for (const page of CORE_PSEO_PAGES) {
    entries.push({
      loc: page.canonicalUrl,
      lastmod: page.updatedAt,
      changefreq: 'weekly',
      priority: '0.85',
      title: page.title,
      category: page.category,
    });
  }

  for (const cond of MATRIX_CONDITIONS) {
    for (const tx of MATRIX_INTERVENTIONS) {
      for (const pop of MATRIX_POPULATIONS) {
        const slug = `${cond.key}-${tx.key}-${pop.key}`;
        entries.push({
          loc: `${base}/clinical-guides/${slug}`,
          lastmod: '2026-10-28T06:00:00.000Z',
          changefreq: 'weekly',
          priority: '0.75',
          title: `${tx.label} for ${cond.label} (${pop.label})`,
          category: 'treatment',
        });
      }
    }
  }

  return entries;
}

export function getSitemapChunks(chunkSize: number = 1000): {
  chunkIndex: number;
  filename: string;
  entries: SitemapUrlEntry[];
  lastmod: string;
}[] {
  const all = getAllSitemapEntries();
  const chunks: {
    chunkIndex: number;
    filename: string;
    entries: SitemapUrlEntry[];
    lastmod: string;
  }[] = [];
  for (let i = 0; i < all.length; i += chunkSize) {
    const slice = all.slice(i, i + chunkSize);
    const chunkIndex = Math.floor(i / chunkSize) + 1;
    chunks.push({
      chunkIndex,
      filename: `/sitemap_${chunkIndex}.xml`,
      entries: slice,
      lastmod: '2026-10-28T18:15:00.000Z',
    });
  }
  return chunks;
}

export function resolveDynamicPseoPage(
  categoryOrRoute: string,
  slug: string
): PseoPage | null {
  const direct = CORE_PSEO_PAGES.find((p) => p.slug === slug);
  if (direct) return direct;

  for (const cond of MATRIX_CONDITIONS) {
    if (!slug.startsWith(cond.key + '-')) continue;
    const remainder = slug.slice(cond.key.length + 1);
    for (const tx of MATRIX_INTERVENTIONS) {
      if (!remainder.startsWith(tx.key + '-')) continue;
      const popKey = remainder.slice(tx.key.length + 1);
      const pop = MATRIX_POPULATIONS.find((p) => p.key === popKey);
      if (!pop) continue;

      const urlPath = `/${categoryOrRoute}/${slug}`;
      return {
        slug,
        category: (categoryOrRoute === 'conditions'
          ? 'condition'
          : categoryOrRoute === 'treatments'
            ? 'treatment'
            : categoryOrRoute === 'studies'
              ? 'study-explainer'
              : categoryOrRoute === 'glossary'
                ? 'glossary'
                : categoryOrRoute === 'faq'
                  ? 'faq'
                  : 'topic-hub') as PseoCategory,
        urlPath,
        title: `${tx.label} for ${cond.label} (${pop.label}): Clinical Explainer Template`,
        subtitle: `[Template subtitle placeholder for ${tx.label} in ${cond.label} (${pop.label}). Replace with verified clinical data.]`,
        metaTitle: `${tx.label} for ${cond.label} (${pop.label})`,
        metaDescription: `Structured clinical template for ${tx.label} in ${cond.label} (${pop.label}).`,
        canonicalUrl: `${BRAND_CONFIG.canonicalBase}${urlPath}`,
        dsmOrIcdCode: cond.code,
        lastReviewedAt: '2026-10-28T06:00:00.000Z',
        updatedAt: '2026-10-28T06:00:00.000Z',
        reviewerSlug: 'reviewer-placeholder',
        authorSlug: 'author-placeholder',
        clinicalSummary: `[Clinical summary placeholder for ${tx.label} in ${cond.label} (${pop.label}). Fill with verified primary literature.]`,
        neurobiologicalMechanism: `[Mechanism placeholder for ${tx.label}.]`,
        diagnosticOrClinicalCriteria: [
          `[Diagnostic & clinical evaluation criterion 1 placeholder for ${cond.label}]`,
          `[Clinical protocol step 2 placeholder for ${tx.label}]`,
        ],
        epidemiologyAndMetrics: [
          {
            metric: `[Epidemiological Metric Placeholder for ${cond.label}]`,
            value: '[Metric Value Placeholder]',
            clinicalReference: '[Primary Source Placeholder]',
          },
          {
            metric: `[Treatment Outcome Placeholder for ${tx.label}]`,
            value: '[Outcome Value Placeholder]',
            clinicalReference: '[Clinical Trial Reference Placeholder]',
          },
          {
            metric: 'Protocol Duration',
            value: '[Duration Placeholder]',
            clinicalReference: '[Clinical Guideline Placeholder]',
          },
        ],
        treatmentOrClinicalProtocols: [
          {
            name: `${tx.label} (${pop.label})`,
            efficacySummary: '[Efficacy summary placeholder — insert verified study results.]',
            durationOrDosage: '[Duration / Dosage Placeholder]',
            guidelineSource: '[Guideline Source Placeholder]',
          },
        ],
        faqs: [
          {
            question: `How is ${tx.label} used for ${cond.label}?`,
            answer: `[FAQ answer placeholder for ${tx.label} in ${cond.label}.]`,
          },
        ],
        primarySources: [
          {
            id: `src-${slug}`,
            title: '[Primary Study or Clinical Guideline Title Placeholder]',
            journalOrInstitution: '[Journal or Institution Placeholder]',
            publicationDate: '[Publication Date]',
            doiOrUrl: 'https://doi.org/[DOI-Placeholder]',
            studyDesign: '[Study Design Placeholder]',
          },
        ],
        relatedPseoPaths: [
          { title: 'Major Depressive Disorder', urlPath: '/conditions/major-depressive-disorder', category: 'condition' },
          { title: 'Cognitive Behavioral Therapy (CBT)', urlPath: '/treatments/cognitive-behavioral-therapy-cbt', category: 'treatment' },
        ],
        relatedArticleSlugs: ['lead-clinical-research-report-template'],
      };
    }
  }

  return null;
}

export function getSampleMatrixPages(limit: number = 24): {
  slug: string;
  urlPath: string;
  title: string;
  conditionLabel: string;
  treatmentLabel: string;
  populationLabel: string;
  icdCode: string;
}[] {
  const results: {
    slug: string;
    urlPath: string;
    title: string;
    conditionLabel: string;
    treatmentLabel: string;
    populationLabel: string;
    icdCode: string;
  }[] = [];

  for (const cond of MATRIX_CONDITIONS) {
    for (const tx of MATRIX_INTERVENTIONS) {
      for (const pop of MATRIX_POPULATIONS) {
        const slug = `${cond.key}-${tx.key}-${pop.key}`;
        results.push({
          slug,
          urlPath: `/clinical-guides/${slug}`,
          title: `${tx.label} for ${cond.label} (${pop.label})`,
          conditionLabel: cond.label,
          treatmentLabel: tx.label,
          populationLabel: pop.label,
          icdCode: cond.code,
        });
        if (results.length >= limit) return results;
      }
    }
  }
  return results;
}
