import { Component } from '@angular/core';
import { CartService } from '../cart/cart.service';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  customizable: boolean;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  
  menuItems: MenuItem[] = [
    {
      id: 'margherita',
      name: 'Margherita',
      price: 189,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=150&fit=crop&crop=center',
      isVeg: true,
      rating: 4.0,
      reviewCount: 47,
      description: 'Pizza topped with our herb-infused signature pan sauce and 100% mozzarella cheese. A classic treat for all cheese lovers out there!',
      customizable: true
    },
    {
      id: 'veggie-feast',
      name: 'Veggie Feast',
      price: 249,
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&h=150&fit=crop&crop=center',
      isVeg: true,
      rating: 4.0,
      reviewCount: 10,
      description: 'A delightful combination of fresh vegetables including bell peppers, onions, mushrooms, and tomatoes on our signature pizza base with mozzarella cheese.',
      customizable: true
    },
    {
      id: 'chicken-supreme',
      name: 'Chicken Supreme',
      price: 299,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=150&fit=crop&crop=center',
      isVeg: false,
      rating: 4.2,
      reviewCount: 25,
      description: 'Loaded with tender chicken pieces, bell peppers, onions, and our special spice blend on a bed of melted mozzarella cheese.',
      customizable: true
    },
    {
      id: 'pepperoni-classic',
      name: 'Pepperoni Classic',
      price: 279,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&h=150&fit=crop&crop=center',
      isVeg: false,
      rating: 4.3,
      reviewCount: 35,
      description: 'Classic pepperoni pizza with premium quality pepperoni slices and extra mozzarella cheese for that perfect taste.',
      customizable: true
    }
  ];

  searchTerm: string = '';
  activeFilter: 'all' | 'veg' | 'non-veg' | 'bestseller' = 'all';

  constructor(private cartService: CartService) {}

  addToCart(item: MenuItem): void {
    this.cartService.addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      isVeg: item.isVeg,
      vendor: 'Kitchen Bells'
    });
  }

  setFilter(filter: 'all' | 'veg' | 'non-veg' | 'bestseller'): void {
    this.activeFilter = filter;
  }

  getFilteredItems(): MenuItem[] {
    let filtered = this.menuItems;

    // Apply search filter
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (this.activeFilter) {
      case 'veg':
        filtered = filtered.filter(item => item.isVeg);
        break;
      case 'non-veg':
        filtered = filtered.filter(item => !item.isVeg);
        break;
      case 'bestseller':
        filtered = filtered.filter(item => item.rating >= 4.2);
        break;
    }

    return filtered;
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
  }

  generateStars(rating: number): number[] {
    return Array.from({ length: Math.floor(rating) }, (_, i) => i);
  }
}