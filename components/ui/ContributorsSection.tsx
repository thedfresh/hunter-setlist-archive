import React from 'react';

interface ContributorsSectionProps {
  contributors: Array<{
    id: number;
    description: string;
    contributor: { name: string };
  }>;
}

const ContributorsSection: React.FC<ContributorsSectionProps> = ({ contributors }) => {
  if (!contributors || contributors.length === 0) return null;
  return (
    <div className="notes-section">
      <div className="notes-title font-semibold mb-1">Contributors</div>
      {contributors.map((c) => (
        <div className="notes-content" key={c.id}>
          {c.description} {c.contributor.name}
        </div>
      ))}
    </div>
  );
};

export default ContributorsSection;
