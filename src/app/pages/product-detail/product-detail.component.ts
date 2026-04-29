import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  cartService = inject(CartService);

  product = signal<Product | null>(null);
  isLoading = signal(true);
  selectedImage = signal('');
  quantity = signal(1);
  addedToCart = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productService.getProduct(+params['id']).subscribe(product => {
        this.product.set(product);
        this.selectedImage.set(product.thumbnail);
        this.isLoading.set(false);
      });
    });
  }

  selectImage(url: string): void {
    this.selectedImage.set(url);
  }

  discountedPrice(product: Product): number {
    return product.price * (1 - product.discountPercentage / 100);
  }

  savings(product: Product): number {
    return product.price - this.discountedPrice(product);
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;
    for (let i = 0; i < this.quantity(); i++) {
      this.cartService.addToCart(product);
    }
    this.addedToCart.set(true);
    setTimeout(() => this.addedToCart.set(false), 2000);
  }

  incrementQty(): void {
    const max = this.product()?.stock ?? 10;
    if (this.quantity() < max) this.quantity.update(v => v + 1);
  }

  decrementQty(): void {
    if (this.quantity() > 1) this.quantity.update(v => v - 1);
  }

  stars(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }
}
