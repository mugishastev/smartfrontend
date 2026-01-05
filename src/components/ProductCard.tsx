import React from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Product } from '@/lib/types'
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ShoppingCart, Eye } from "lucide-react"

interface ProductCardProps {
  product: Product
  onView: () => void
  onAddToCart?: () => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onView, onAddToCart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden rounded-xl bg-gradient-to-br from-white/70 to-green-50/80 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300 hover:scale-[1.01] max-w-sm mx-auto">
        <div className="relative overflow-hidden h-52">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=Product+Image'}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <Button
              onClick={onView}
              className="bg-white/90 text-gray-800 hover:bg-white shadow-md backdrop-blur-sm font-medium text-sm"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            {onAddToCart && (
              <Button
                onClick={onAddToCart}
                className="bg-gradient-to-r from-[#8ccc15] to-[#8ccc15] text-white hover:opacity-90 shadow-md font-medium text-sm"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-3">
          <div className="mb-1">
            <Badge
              variant="outline"
              className="text-[10px] font-semibold bg-gradient-to-r from-[#8ccc15] to-[#8ccc15] text-white border-none shadow-sm px-2 py-0.5"
            >
              {product.cooperative?.name || 'Unknown'}
            </Badge>
          </div>

          <h3 className="font-semibold text-base mb-1 text-gray-800 group-hover:text-[#8ccc15] transition-colors leading-tight truncate">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 line-clamp-2 mb-2 h-10">
            {product.description}
          </p>

          <p className="text-lg font-bold bg-gradient-to-r from-[#8ccc15] to-[#8ccc15] bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </p>
        </CardContent>

        <CardFooter className="px-3 py-2 border-t bg-gradient-to-t from-green-50/60 to-transparent">
          <div className="flex items-center justify-between w-full text-xs text-gray-600">
            <span className="font-medium text-gray-700 truncate">
              {product.cooperative?.name || 'Unknown'}
            </span>
            <span className="italic text-gray-400">{product.quality || 'Organic'}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default ProductCard
