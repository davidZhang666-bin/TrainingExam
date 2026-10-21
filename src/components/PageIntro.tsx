import type { ReactNode } from 'react';
export default function PageIntro({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
