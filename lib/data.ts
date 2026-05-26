import { Instagram, Facebook, Phone } from 'lucide-react';

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  isHero?: boolean;
};

export type Category = {
  id: string;
  name: string;
};

export type HeroBanner = {
  id: string;
  image: string;
};

// Initial Mock Data
let products: Product[] = [
  {
    id: '1',
    name: 'Real Madrid 23/24 Home',
    price: 3500,
    image: 'https://picsum.photos/seed/realmadrid/800/1000',
    category: 'Club Jerseys',
    description: 'Official replica of the Real Madrid 23/24 home kit.',
    isHero: true,
  },
  {
    id: '2',
    name: 'Argentina 2024 Home',
    price: 3800,
    image: 'https://picsum.photos/seed/argentina/800/1000',
    category: 'National Jerseys',
    description: 'Show your support for the world champions.',
    isHero: true,
  },
  {
    id: '3',
    name: 'Manchester United 07/08 Retro',
    price: 4000,
    image: 'https://picsum.photos/seed/manutd/800/1000',
    category: 'Retro Jerseys',
    description: 'Iconic retro jersey from the Champions League winning season.',
    isHero: true,
  },
  {
    id: '4',
    name: 'Barcelona 23/24 Away',
    price: 3500,
    image: 'https://picsum.photos/seed/barca/800/1000',
    category: 'Club Jerseys',
    description: 'Clean white away kit for FC Barcelona.',
  },
  {
    id: '5',
    name: 'Brazil 2024 Home',
    price: 3800,
    image: 'https://picsum.photos/seed/brazil/800/1000',
    category: 'National Jerseys',
    description: 'Classic yellow jersey of the Seleção.',
  },
  {
    id: '6',
    name: 'AC Milan 06/07 Retro',
    price: 4200,
    image: 'https://picsum.photos/seed/milan/800/1000',
    category: 'Retro Jerseys',
    description: 'Legendary Kaka era retro kit.',
  },
];

let categories: Category[] = [
  { id: '1', name: 'National Jerseys' },
  { id: '2', name: 'Club Jerseys' },
  { id: '3', name: 'Retro Jerseys' },
  { id: '4', name: 'Custom Jerseys' },
];

export const getProducts = () => products;
export const getCategories = () => categories;

export const addProduct = (product: Product) => {
  products.push(product);
};

export const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
  products = products.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p));
};

export const deleteProduct = (id: string) => {
  products = products.filter((p) => p.id !== id);
};

export const getHeroProducts = () => products.filter((p) => p.isHero);

export const WHATSAPP_NUMBER = '+880 1626-031969';
export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61581974722213';
