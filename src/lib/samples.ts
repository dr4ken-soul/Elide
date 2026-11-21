export interface SampleDocument {
  id: string
  label: string
  title: string
  text: string
  question: string
}

export const SAMPLES: SampleDocument[] = [
  {
    id: 'clinic',
    label: 'Clinic note',
    title: 'Clinic note, 14 November',
    text: 'Patient Ada Lovelace, record QQ123456C, was seen at 12 Baker Street, London NW1 6XE. Contact ada@example.com or 07700 900123. Payment card 4111 1111 1111 1111 was declined. Review the sequence of events and note any follow-up required.',
    question: 'Summarise the events and list the follow-up actions.',
  },
  {
    id: 'legal',
    label: 'Legal memo',
    title: 'Legal memo, lease',
    text: 'Tenant Grace Hopper of 8 Finsbury Circus, London EC2M 7AQ holds account GB82 WEST 1234 5698 7654 32. Ref SSN 482-91-7365. The landlord asks whether the break clause can be exercised before the end of the term.',
    question: 'Can the break clause be exercised early, and what should be checked first?',
  },
  {
    id: 'support',
    label: 'Support ticket',
    title: 'Support ticket, 8842',
    text: 'Customer Alan Turing, email alan@example.org, reports that card 5500 0000 0000 0004 failed twice. Order reference WT-44821. Ask what to tell the customer about the next step.',
    question: 'What should the agent tell the customer next?',
  },
]
