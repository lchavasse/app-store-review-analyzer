declare module 'app-store-scraper' {
    export function reviews(options: {
      id: string | number;
      sort: any;
      page: number;
      country: string;
    }): Promise<any[]>;
  
    export const sort: {
      RECENT: any;
      HELPFUL: any;
    };
  
    // Add other methods and properties as needed
  }