export interface ParsedVideoInfo {
  type:
    | "youtube"
    | "vimeo"
    | "loom"
    | "gdrive"
    | "dailymotion"
    | "tiktok"
    | "twitch"
    | "streamable"
    | "wistia"
    | "direct"
    | "iframe";
  embedUrl: string;
  originalUrl: string;
  providerName: string;
}

/**
 * Transforms any standard video URL from YouTube (standard, shorts), TikTok, Vimeo,
 * Loom, Google Drive, Twitch, Dailymotion, Streamable, Wistia, or direct video files
 * into a clean, embeddable player format.
 */
export function parseVideoUrl(url?: string | null): ParsedVideoInfo | null {
  if (!url || !url.trim()) return null;

  const trimmed = url.trim();

  // 1. YouTube (watch?v=, youtu.be, embed, shorts)
  const ytRegex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    // Preserve start time if present (?t=120 or &t=120s)
    let startTime = "";
    const timeMatch = trimmed.match(/[?&]t=(\d+s?)/);
    if (timeMatch && timeMatch[1]) {
      const seconds = parseInt(timeMatch[1], 10);
      if (!isNaN(seconds) && seconds > 0) {
        startTime = `&start=${seconds}`;
      }
    }

    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1${startTime}`,
      originalUrl: trimmed,
      providerName: "YouTube",
    };
  }

  // 2. Vimeo (vimeo.com/123456789)
  const vimeoRegex =
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`,
      originalUrl: trimmed,
      providerName: "Vimeo",
    };
  }

  // 3. Loom (loom.com/share/VIDEO_ID or loom.com/embed/VIDEO_ID)
  const loomRegex = /loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/;
  const loomMatch = trimmed.match(loomRegex);
  if (loomMatch && loomMatch[1]) {
    return {
      type: "loom",
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      originalUrl: trimmed,
      providerName: "Loom",
    };
  }

  // 4. TikTok (tiktok.com/@user/video/VIDEO_ID or vm.tiktok.com/...)
  const tiktokRegex = /tiktok\.com\/(?:@[^\/]+\/video\/|v\/|embed\/v2\/)(\d+)/;
  const tiktokMatch = trimmed.match(tiktokRegex);
  if (tiktokMatch && tiktokMatch[1]) {
    return {
      type: "tiktok",
      embedUrl: `https://www.tiktok.com/player/v1/${tiktokMatch[1]}?autoplay=0`,
      originalUrl: trimmed,
      providerName: "TikTok",
    };
  }

  // 5. Google Drive (drive.google.com/file/d/FILE_ID)
  const gdriveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const gdriveMatch = trimmed.match(gdriveRegex);
  if (gdriveMatch && gdriveMatch[1]) {
    return {
      type: "gdrive",
      embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
      originalUrl: trimmed,
      providerName: "Google Drive",
    };
  }

  // 6. Dailymotion (dailymotion.com/video/ID or dai.ly/ID)
  const dmRegex = /(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/;
  const dmMatch = trimmed.match(dmRegex);
  if (dmMatch && dmMatch[1]) {
    return {
      type: "dailymotion",
      embedUrl: `https://www.dailymotion.com/embed/video/${dmMatch[1]}`,
      originalUrl: trimmed,
      providerName: "Dailymotion",
    };
  }

  // 7. Twitch (twitch.tv/videos/ID or clips.twitch.tv/ID)
  const twitchVideo = /twitch\.tv\/videos\/(\d+)/.exec(trimmed);
  if (twitchVideo && twitchVideo[1]) {
    const parent = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return {
      type: "twitch",
      embedUrl: `https://player.twitch.tv/?video=${twitchVideo[1]}&parent=${parent}&autoplay=false`,
      originalUrl: trimmed,
      providerName: "Twitch",
    };
  }

  // 8. Streamable (streamable.com/ID)
  const streamableRegex = /streamable\.com\/([a-zA-Z0-9]+)/;
  const streamableMatch = trimmed.match(streamableRegex);
  if (streamableMatch && streamableMatch[1]) {
    return {
      type: "streamable",
      embedUrl: `https://streamable.com/e/${streamableMatch[1]}`,
      originalUrl: trimmed,
      providerName: "Streamable",
    };
  }

  // 9. Wistia (wistia.com/medias/ID or wi.st/ID)
  const wistiaRegex = /(?:wistia\.com\/medias\/|wi\.st\/)([a-zA-Z0-9]+)/;
  const wistiaMatch = trimmed.match(wistiaRegex);
  if (wistiaMatch && wistiaMatch[1]) {
    return {
      type: "wistia",
      embedUrl: `https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}`,
      originalUrl: trimmed,
      providerName: "Wistia",
    };
  }

  // 10. Direct Video Files (.mp4, .webm, .ogg, .mov, .m4v)
  const directRegex = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;
  if (directRegex.test(trimmed)) {
    return {
      type: "direct",
      embedUrl: trimmed,
      originalUrl: trimmed,
      providerName: "Direct Video File (MP4/WebM)",
    };
  }

  // 11. Generic Embed / Web Link (https://...)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return {
      type: "iframe",
      embedUrl: trimmed,
      originalUrl: trimmed,
      providerName: "Web Video Embed",
    };
  }

  return null;
}

