import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartItem, CartService } from '../cart/cart.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
  vendor: string;
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
export class MenuComponent implements OnInit, OnDestroy{
  vendor: string = '';
  menuItems: MenuItem[] = [];

  vendorConfig: { [key: string]: { ratings: string; price: string; cuisine: string } } = {
    'Kitchen Bells': {
      ratings: '4.5 (2.2K+ ratings)',
      price: '₹350 for two',
      cuisine: 'North Indian, Fast Food'
    },
    'Fresh N Healthy': {
      ratings: '4.8 (1.5K+ ratings)',
      price: '₹250 for two',
      cuisine: 'Healthy, Vegan Options'
    }
  };

  allMenuItems: MenuItem[] = [
    {
      id: 'margherita',
      name: 'Margherita',
      price: 189,
      image: 'https://images.unsplash.com/photo-1723861113025-ea972fe48e98?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hcmdlcml0YSUyMHBpenphfGVufDB8fDB8fHww',
      isVeg: true,
      vendor: 'Kitchen Bells',
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
      vendor: 'Kitchen Bells',
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
      vendor: 'Kitchen Bells',
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
      vendor: 'Kitchen Bells',
      rating: 4.3,
      reviewCount: 35,
      description: 'Classic pepperoni pizza with premium quality pepperoni slices and extra mozzarella cheese for that perfect taste.',
      customizable: true
    },
    {
      id: "greek-salad",
      name: "Greek Salad",
      price: 179,
      image: "https://images.unsplash.com/photo-1599021419847-d8a7a6aba5b4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3JlZWslMjBzYWxhZHxlbnwwfHwwfHx8MA%3D%3D",
      isVeg: true,
      vendor: "Fresh N Healthy",
      rating: 4.7,
      reviewCount: 112,
      description: "A refreshing mix of cucumbers, tomatoes, olives, and feta cheese tossed in olive oil.",
      customizable: true
    },
    {
      id: "quinoa-bowl",
      name: "Quinoa Power Bowl",
      price: 219,
      image: "https://images.unsplash.com/photo-1520066391310-428f06ebd602?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8UXVpbm9hJTIwQm93bHxlbnwwfHwwfHx8MA%3D%3D",
      isVeg: true,
      vendor: "Fresh N Healthy",
      rating: 3.9,
      reviewCount: 35,
      description: "Protein-packed quinoa with chickpeas, cherry tomatoes, and a lemon-tahini dressing.",
      customizable: true
    },
    {
      id: "avocado-mix",
      name: "Avocado Mix",
      price: 249,
      image: "https://plus.unsplash.com/premium_photo-1704898879544-285830a360b0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGF2b2NhZG8lMjBib3dsfGVufDB8fDB8fHww",
      isVeg: true,
      vendor: "Fresh N Healthy",
      rating: 3.4,
      reviewCount: 56,
      description: "Creamy avocado slices with mixed greens, sunflower seeds, and a citrus vinaigrette.",
      customizable: true
    },
    {
      id: "tangy-beetroot",
      name: "Tangy Beetroot Salad",
      price: 199,
      image: "https://media.istockphoto.com/id/871203882/photo/vegetable-salad-with-beetroot-carrot-pea-and-onion-russian-style-cuisine.jpg?s=1024x1024&w=is&k=20&c=AVE8JTat6T_0Q64J6I6nP055Cif6adkjK1Nl1yNHHfs=",
      isVeg: true,
      vendor: "Fresh N Healthy",
      rating: 4.4,
      reviewCount: 76,
      description: "Roasted beetroot, arugula, and walnuts with a tangy balsamic glaze.",
      customizable: true
    }
  ];

  searchTerm: string = '';
  activeFilter: 'all' | 'veg' | 'non-veg' | 'bestseller' = 'all';
  cartItems: CartItem[] = [];
  private cartSubscription: Subscription | null = null;
  constructor(private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
    this.route.params.subscribe(params => {
      this.vendor = params['vendor']; 
      this.loadMenuItems();
    });
  }

  loadMenuItems(): void {
    this.menuItems = this.allMenuItems.filter(item => item.vendor === this.vendor);
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  addToCart(item: MenuItem): void {
    this.cartService.addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      isVeg: item.isVeg,
      vendor: item.vendor,
    });
  }
    incrementQuantity(itemId: string): void {
    const cartItem = this.cartItems.find(item => item.id === itemId);
    if (cartItem) {
      this.cartService.updateQuantity(itemId, cartItem.quantity + 1);
    }
  }

  decrementQuantity(itemId: string): void {
    const cartItem = this.cartItems.find(item => item.id === itemId);
    if (cartItem) {
      this.cartService.updateQuantity(itemId, cartItem.quantity - 1);
    }
  }

  getItemQuantity(itemId: string): number {
    const cartItem = this.cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  }

  isItemInCart(itemId: string): boolean {
    return this.cartItems.some(item => item.id === itemId);
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

  getVendorConfig(): { ratings: string; price: string; cuisine: string } {
  return this.vendorConfig[this.vendor] || { ratings: '', price: '', cuisine: '' };
}
}