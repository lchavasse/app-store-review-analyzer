export interface Review {
  id: string;
  text: string;
  rating: number;
  date: string;
  store: 'App Store' | 'Play Store';
}