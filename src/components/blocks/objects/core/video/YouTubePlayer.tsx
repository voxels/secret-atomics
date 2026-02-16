interface YouTubePlayerProps {
  url: string;
  onError: (err: unknown) => void;
}

export const YouTubePlayer = ({ url, onError }: YouTubePlayerProps) => {
  // Extract video ID from the watch URL
  const getVideoId = (url: string) => {
    try {
      if (url.includes('v=')) {
        return url.split('v=')[1].split('&')[0];
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  const videoId = getVideoId(url);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  if (!videoId) {
    onError && onError(new Error('Invalid YouTube URL'));
    return null;
  }

  return (
    <div className="w-full h-full bg-black">
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        onError={(e) => onError && onError(e)}
      />
    </div>
  );
};
