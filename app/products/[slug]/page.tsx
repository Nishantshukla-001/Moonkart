import type { Metadata } from "next";
import { Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Carousel } from "@/components/shared/Carousel";
import { Container } from "@/components/layout/Container";
import { getProductBySlug, getRelatedProducts } from "@/features/products/services/product.service";
import { ProductCardConnected } from "@/features/products/components/ProductCardConnected";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { ProductPurchasePanel } from "@/features/products/components/ProductPurchasePanel";
import { calculateDiscountPercent } from "@/utils/calculateDiscount";
import { formatCurrency } from "@/utils/formatCurrency";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product ? (product.metaTitle || product.name) : "Product",
    description: product?.metaDescription || product?.shortDescription || "Shop this product on MoonKart.",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId);
  const effectivePrice = product.salePrice ?? product.price;
  const discountPercent = product.salePrice
    ? calculateDiscountPercent(product.price, product.salePrice)
    : 0;
  const images = [product.thumbnail, ...product.images.map((image) => image.imageUrl)];

  return (
    <>
    <Container className="flex flex-col gap-10 py-8 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.category.name, href: `/categories/${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={images} name={product.name} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {product.brand && (
              <Link
                href={`/brands/${product.brand.slug}`}
                className="text-sm font-medium tracking-[0.3px] text-blush-hover uppercase hover:text-text-primary"
              >
                {product.brand.name}
              </Link>
            )}
            <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-[34px]">
              {product.name}
            </h1>
            {product.averageRating > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-text-secondary">
                <Star className="size-4 fill-warning text-warning" />
                {product.averageRating.toFixed(1)}
                <span className="text-text-muted">({product.reviewCount} reviews)</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-text-primary">
              {formatCurrency(effectivePrice)}
            </span>
            {product.salePrice && (
              <>
                <span className="text-lg font-medium text-text-muted line-through">
                  {formatCurrency(product.price)}
                </span>
                {discountPercent > 0 && (
                  <span className="rounded-full bg-warm-yellow px-2.5 py-1 text-sm font-semibold text-text-primary">
                    -{discountPercent}%
                  </span>
                )}
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-base leading-[160%] text-text-secondary">{product.shortDescription}</p>
          )}

          <ProductPurchasePanel product={product} />

          <dl className="grid grid-cols-2 gap-3 border-t border-divider pt-5 text-sm">
            <div>
              <dt className="text-text-muted">Category</dt>
              <dd className="font-medium text-text-primary">{product.category.name}</dd>
            </div>
            {product.subCategory && (
              <div>
                <dt className="text-text-muted">Subcategory</dt>
                <dd className="font-medium text-text-primary">{product.subCategory.name}</dd>
              </div>
            )}
            {product.sku && (
              <div>
                <dt className="text-text-muted">SKU</dt>
                <dd className="font-medium text-text-primary">{product.sku}</dd>
              </div>
            )}
            {product.weight && (
              <div>
                <dt className="text-text-muted">Weight</dt>
                <dd className="font-medium text-text-primary">{product.weight} g</dd>
              </div>
            )}
            {product.dimensions && (
              <div>
                <dt className="text-text-muted">Dimensions</dt>
                <dd className="font-medium text-text-primary">{product.dimensions}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {product.description && (
        <div className="max-w-3xl border-t border-divider pt-8">
          <h2 className="mb-3 font-heading text-xl font-semibold text-text-primary">Description</h2>
          <p className="leading-[170%] whitespace-pre-line text-text-secondary">{product.description}</p>
        </div>
      )}

    </Container>

    {related.length > 0 && (
      <Carousel
        title="You May Also Like"
        viewAllHref={`/categories/${product.category.slug}`}
        ariaLabel="You May Also Like"
        background="cream"
      >
        {related.map((relatedProduct) => (
          <ProductCardConnected key={relatedProduct.id} product={relatedProduct} />
        ))}
      </Carousel>
    )}
    </>
  );
}
