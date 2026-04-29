import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

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
  cartService = inject(CartService);

  featuredProducts = signal<Product[]>([]);
  categories = signal<{ slug: string; name: string }[]>([]);

  ngOnInit(): void {
    this.productService.getProducts(8).subscribe(res => {
      this.featuredProducts.set(res.products);
    });

    this.productService.getCategories().subscribe(cats => {
      this.categories.set(cats.slice(0, 8));
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
    this.cartService.addToCart(product);
  }
}
