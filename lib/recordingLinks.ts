// Patterns for recording link URLs, identifier keys:
export const recordingLinkPatterns = {
  lma: (id: string) => `https://archive.org/details/${id}`,
  ll: (id: string) => `https://shnflac.net/index.php?page=torrent-details&id=${id}`,
  yt: (id: string) => `https://www.youtube.com/watch?v=${id}`,
  et: (id: string) => `https://etreedb.org/shn/${id}`,
};
