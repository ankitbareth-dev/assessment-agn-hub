export type ServiceCategory = "Development" | "Consulting" | "Design";

export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: ServiceCategory;
}
