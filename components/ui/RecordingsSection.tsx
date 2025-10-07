import React from 'react';

interface RecordingsSectionProps {
  recordings: Array<{
    id: number;
    recordingType?: { name: string } | null;
    description?: string | null;
    url?: string | null;
    lmaIdentifier?: string | null;
    youtubeVideoId?: string | null;
    losslessLegsId?: string | null;
    shnId?: string | null;
    contributor?: { name: string } | null;
  }>;
}

const badgeClass = (type?: string | null) => {
  if (!type) return 'badge';
  const t = type.toLowerCase();
  if (t.includes('sbd')) return 'badge badge-sbd';
  if (t.includes('aud')) return 'badge badge-aud';
  return 'badge';
};

const RecordingsSection: React.FC<RecordingsSectionProps> = ({ recordings }) => {
  if (!recordings || recordings.length === 0) return null;
  return (
    <div className="recording-section mt-5">
      <div className="notes-title font-semibold mb-1">Recordings</div>
      {recordings.map((rec) => (
        <div className="recording-item mb-1" key={rec.id}>
          {/* {rec.lmaIdentifier && (
            <iframe
              src={`https://archive.org/embed/${rec.lmaIdentifier}&playlist=1&amp;list_height=150`}
              width="500"
              height="300"
              frameBorder="0"
              allow="fullscreen"
              className="mb-3"
              title={`LMA Player ${rec.lmaIdentifier}`}
            />
          )} */}
          {rec.recordingType && (
            <span className={badgeClass(rec.recordingType.name) + ' mr-2'}>
              {rec.recordingType.name.toUpperCase()}
            </span>
          )}
          {rec.description && <span>{rec.description} </span>}
          {rec.contributor?.name && (
            <span className="ml-2">Recorded by {rec.contributor.name}</span>
          )}
          {/* External links */}
          {rec.lmaIdentifier && (
            <a
              href={`https://archive.org/details/${rec.lmaIdentifier}`}
              className="link-external text-blue-600 underline ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Archive.org
            </a>
          )}
          {rec.losslessLegsId && (
            <a
              href={`https://www.shnflac.net/index.php?page=torrent-details&id=${rec.losslessLegsId}`}
              className="link-external text-blue-600 underline ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lossless Legs
            </a>
          )}
          {rec.youtubeVideoId && (
            <a
              href={`https://youtube.com/watch?v=${rec.youtubeVideoId}`}
              className="link-external text-blue-600 underline ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube
            </a>
          )}
          {rec.shnId && (
            <a
              href={`https://etreedb.org/shn/${rec.shnId}`}
              className="link-external text-blue-600 underline ml-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              etree
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecordingsSection;
