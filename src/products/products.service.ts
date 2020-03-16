import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.model';

@Injectable()
export class ProductsService {
  errorMessage = `Couldn't find product.`;

  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  async insertProduct(
    title: string,
    description: string,
    price: number,
  ): Promise<string> {
    const newProduct = new this.productModel({
      title,
      description,
      price,
    });

    const { id } = await newProduct.save();
    return id;
  }

  async getProducts() {
    const products = await this.productModel.find().exec();
    return products.map(prod => ({
      id: prod.id,
      title: prod.title,
      description: prod.description,
      price: prod.price,
    })) as Product[];
  }

  async getSingleProduct(productId: string): Promise<Product> {
    const product = await this.findProduct(productId);

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
    } as Product;
  }

  async updateProduct(
    productId: string,
    title: string,
    desc: string,
    price: number,
  ): Promise<void> {
    const updatedProduct = await this.findProduct(productId);

    title && (updatedProduct.title = title);
    desc && (updatedProduct.description = desc);
    price && (updatedProduct.price = price);

    updatedProduct.save();
  }

  async deleteProduct(prodId: string): Promise<void> {
    const result = await this.productModel.deleteOne({ _id: prodId }).exec();

    if (result.n === 0) {
      throw new NotFoundException(this.errorMessage);
    }
  }

  private async findProduct(id: string): Promise<Product> {
    let product: Product;

    try {
      product = await this.productModel.findById(id).exec();
    } catch (error) {
      throw new NotFoundException(this.errorMessage);
    }

    if (!product) {
      throw new NotFoundException(this.errorMessage);
    }

    return product;
  }
}
