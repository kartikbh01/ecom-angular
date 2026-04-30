import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  allProducts = signal<Product[]>([]);
  categories = signal<{ slug: string; name: string }[]>([]);
  isLoading = signal(true);

  selectedCategories = signal<string[]>([]);
  searchQuery = signal('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  sortBy = signal('default');
  sidebarOpen = signal(false);

  minPriceStr = '';
  maxPriceStr = '';

  filteredProducts = computed(() => {
    let products = this.allProducts();
    const cats = this.selectedCategories();
    const search = this.searchQuery().toLowerCase();
    const min = this.minPrice();
    const max = this.maxPrice();

    if (cats.length > 0) products = products.filter(p => cats.includes(p.category));
    if (search) products = products.filter(p =>
      p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
    );
    if (min !== null) products = products.filter(p => p.price >= min);
    if (max !== null) products = products.filter(p => p.price <= max);

    const sort = this.sortBy();
    if (sort === 'price-asc') products = [...products].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') products = [...products].sort((a, b) => b.price - a.price);
    else if (sort === 'rating') products = [...products].sort((a, b) => b.rating - a.rating);
    else if (sort === 'name') products = [...products].sort((a, b) => a.title.localeCompare(b.title));

    return products;
  });

  ngOnInit(): void {
    this.productService.getCategories().subscribe(cats => this.categories.set(cats));
    this.productService.getProducts(100).subscribe(res => {
      this.allProducts.set(res.products);
      this.isLoading.set(false);
    });

    this.route.queryParams.subscribe(params => {
      if (params['categories']) {
        this.selectedCategories.set(params['categories'].split(','));
      } else if (params['category']) {
        this.selectedCategories.set([params['category']]);
      }
      if (params['search']) this.searchQuery.set(params['search']);
    });
  }

  toggleCategory(slug: string): void {
    if (!slug) {
      this.selectedCategories.set([]);
    } else {
      const current = this.selectedCategories();
      if (current.includes(slug)) {
        this.selectedCategories.set(current.filter(c => c !== slug));
      } else {
        this.selectedCategories.set([...current, slug]);
      }
    }
    const cats = this.selectedCategories();
    this.router.navigate([], { queryParams: { categories: cats.length ? cats.join(',') : null, category: null }, queryParamsHandling: 'merge' });
  }

  clearFilters(): void {
    this.selectedCategories.set([]);
    this.searchQuery.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.minPriceStr = '';
    this.maxPriceStr = '';
    this.sortBy.set('default');
    this.router.navigate(['/products']);
  }

  applyPriceFilter(): void {
    this.minPrice.set(this.minPriceStr ? parseFloat(this.minPriceStr) : null);
    this.maxPrice.set(this.maxPriceStr ? parseFloat(this.maxPriceStr) : null);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.authService.isLoggedIn()) {
      this.authService.openModal('signin');
      return;
    }
    this.cartService.addToCart(product);
  }

  discountedPrice(product: Product): number {
    return product.price * (1 - product.discountPercentage / 100);
  }
}

