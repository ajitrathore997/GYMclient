const exerciseOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": import.meta.env.VITE_EXERCISE_API_KEY,
    "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
  },
};

const youtubeExerciseOptions = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": import.meta.env.VITE_YOUTUBE_API_KEY,
    "X-RapidAPI-Host": "youtube-search-and-download.p.rapidapi.com",
  },
};

const fetchData = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json();
  // console.log(data);
  return data;
};

// const BASE_URL = "http://localhost:5000";
  const BASE_URL="https://gymserver-7x15.onrender.com";
  const resolveMediaUrl = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;

  const normalized = raw.replace(/\\/g, "/");

  try {
    const parsed = new URL(normalized);
    if (parsed.pathname.startsWith("/uploads/")) {
      return `${BASE_URL}${parsed.pathname}`;
    }
    return parsed.toString();
  } catch (_error) {
    if (normalized.startsWith("/uploads/")) {
      return `${BASE_URL}${normalized}`;
    }
    if (normalized.startsWith("uploads/")) {
      return `${BASE_URL}/${normalized}`;
    }
    const uploadsIndex = normalized.toLowerCase().indexOf("/uploads/");
    if (uploadsIndex >= 0) {
      return `${BASE_URL}${normalized.slice(uploadsIndex)}`;
    }
    if (normalized.toLowerCase().startsWith("uploads/")) {
      return `${BASE_URL}/${normalized}`;
    }
    return normalized;
  }
};

export { fetchData, exerciseOptions, youtubeExerciseOptions, BASE_URL, resolveMediaUrl };

