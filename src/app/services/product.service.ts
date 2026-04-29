import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductsResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'https://dummyjson.com/products';

  getProducts(limit = 30, skip = 0): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.baseUrl}?limit=${limit}&skip=${skip}`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  searchProducts(query: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.baseUrl}/search?q=${query}`);
  }

  getCategories(): Observable<{ slug: string; name: string; url: string }[]> {
    return this.http.get<{ slug: string; name: string; url: string }[]>(`${this.baseUrl}/categories`);
  }

  getProductsByCategory(category: string): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.baseUrl}/category/${category}`);
  }
}
