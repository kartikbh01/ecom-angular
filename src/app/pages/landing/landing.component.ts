import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { forkJoin, map } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  private authService = inject(AuthService);
  cartService = inject(CartService);

  featuredProducts = signal<Product[]>([]);
  categories = signal<{ slug: string; name: string; image?: string }[]>([]);

  ngOnInit(): void {
    this.productService.getProducts(8).subscribe(res => {
      this.featuredProducts.set(res.products);
    });

    this.productService.getCategories().subscribe(cats => {
      const topCats = cats.slice(0, 24);
      
      const requests = topCats.map(cat => 
        this.productService.getProductsByCategory(cat.slug).pipe(
          map(res => ({
            ...cat,
            image: res.products[0]?.thumbnail || ''
          }))
        )
      );

      forkJoin(requests).subscribe(catsWithImages => {
        this.categories.set(catsWithImages);
      });
    });
  }

  navigateToCategory(slug: string): void {
    this.router.navigate(['/products'], { queryParams: { category: slug } });
  }

  discountedPrice(product: Product): number {
    return product.price * (1 - product.discountPercentage / 100);
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
}

