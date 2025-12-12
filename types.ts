export interface UtmParams {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

export interface UtmHistoryItem {
  id: string;
  url: string;
  shortUrl?: string;
  params: UtmParams;
  createdAt: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}