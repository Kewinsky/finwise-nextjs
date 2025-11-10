import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help',
  description:
    'Get help and support for your questions. Contact our team or browse our FAQ section.',
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
