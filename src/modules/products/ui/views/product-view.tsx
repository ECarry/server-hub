import { ProductSection } from "@/modules/products/ui/sections/product-section";

interface Props {
  productId: string;
}

export const ProductView = ({ productId }: Props) => {
  return (
    <div className="max-w-7xl w-full mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <ProductSection productId={productId} />
    </div>
  );
};
