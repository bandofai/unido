# Example: Basic Widget (Read-Only)

This example demonstrates a simple read-only widget that displays data without user interactions.

## Use Case

Display product information in a rich, visual card format when users ask about products.

## Complete Implementation

### 1. Create React Component

**File**: `src/components/ProductCard.tsx`

```typescript
import type { FC } from 'react';
import './ProductCard.css';

interface ProductCardProps {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  rating: number;
  inStock: boolean;
}

export const ProductCard: FC<ProductCardProps> = ({
  name,
  price,
  description,
  imageUrl,
  rating,
  inStock
}) => {
  return (
    <div className="product-card">
      <img src={imageUrl} alt={name} className="product-image" />
      <div className="product-content">
        <h2 className="product-name">{name}</h2>
        <p className="product-description">{description}</p>

        <div className="product-footer">
          <div className="product-price">${price.toFixed(2)}</div>
          <div className="product-rating">
            <span className="stars">{'★'.repeat(Math.floor(rating))}</span>
            <span className="rating-number">{rating}/5</span>
          </div>
        </div>

        <div className="product-stock">
          {inStock ? (
            <span className="in-stock">✓ In Stock</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
};
```

**File**: `src/components/ProductCard.css`

```css
.product-card {
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
  font-family: system-ui, -apple-system, sans-serif;
}

.product-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.product-content {
  padding: 20px;
}

.product-name {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.product-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-price {
  font-size: 28px;
  font-weight: 700;
  color: #2563eb;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  color: #fbbf24;
  font-size: 16px;
}

.rating-number {
  font-size: 14px;
  color: #666;
}

.product-stock {
  padding-top: 12px;
  border-top: 1px solid #e5e5e5;
}

.in-stock {
  color: #16a34a;
  font-weight: 500;
}

.out-of-stock {
  color: #dc2626;
  font-weight: 500;
}
```

### 2. Register Component

**File**: `src/index.ts`

```typescript
import { createApp } from '@bandofai/unido-core';
import { openAI } from '@bandofai/unido-provider-openai';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { z } from 'zod';

// Helper to resolve component paths
function resolveComponentPath(relativePath: string): string {
  const normalized = relativePath.startsWith('./')
    ? relativePath.slice(2)
    : relativePath;

  const distUrl = new URL(
    normalized.startsWith('components/')
      ? './' + normalized
      : './components/' + normalized,
    import.meta.url
  );
  const distPath = fileURLToPath(distUrl);

  if (existsSync(distPath)) return distPath;
  return fileURLToPath(new URL('../src/' + normalized, import.meta.url));
}

const app = createApp({
  name: 'product-catalog',
  version: '1.0.0',
  providers: {
    openai: openAI({ port: 3000 })
  }
});

// Register the ProductCard component
app.component({
  type: 'product-card',
  title: 'Product Card',
  description: 'Displays product information including image, price, rating, and availability',
  sourcePath: resolveComponentPath('components/ProductCard.tsx'),
  metadata: {
    openai: {
      renderHints: {
        preferredSize: 'medium'
      }
    }
  }
});

// Create tool that uses the component
app.tool('get_product', {
  title: 'Get Product Details',
  description: 'Retrieve detailed information about a product',
  input: z.object({
    productId: z.string().describe('Product ID to lookup')
  }),
  handler: async ({ productId }) => {
    // Simulate database lookup
    const product = {
      id: productId,
      name: 'Wireless Noise-Canceling Headphones',
      price: 299.99,
      description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and premium comfort.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      rating: 4.5,
      inStock: true
    };

    return app.componentResponse(
      'product-card',
      product,
      `${product.name} - $${product.price} (${product.rating}/5 stars)${product.inStock ? ' - In Stock' : ' - Out of Stock'}`
    );
  }
});

await app.listen();
console.log('Product catalog server running on http://localhost:3000');
```

### 3. Package Configuration

**File**: `package.json`

```json
{
  "name": "product-catalog",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@bandofai/unido-core": "workspace:*",
    "@bandofai/unido-provider-openai": "workspace:*",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

## How It Works

### Data Flow

```
1. User in ChatGPT: "Show me product ABC-123"
                  ↓
2. ChatGPT calls: get_product({ productId: "ABC-123" })
                  ↓
3. Tool handler fetches product data
                  ↓
4. Returns componentResponse with product data
                  ↓
5. Unido converts to MCP response:
   {
     content: [{ type: 'text', text: '...' }],
     structuredContent: { name: '...', price: 299.99, ... },
     _meta: { 'openai/outputTemplate': 'ui://widget/product-card.html' }
   }
                  ↓
6. ChatGPT fetches ui://widget/product-card.html
                  ↓
7. Renders ProductCard component with structuredContent as props
                  ↓
8. User sees rich product card in ChatGPT
```

### What Unido Does Automatically

- **Bundles** React component with esbuild (JSX → JS, CSS inlined)
- **Creates** data URL with bundled code
- **Generates** HTML wrapper with proper script tags
- **Registers** MCP resource at `ui://widget/product-card.html`
- **Sets** `openai/outputTemplate` metadata automatically
- **Maps** component props to `structuredContent`

### What You Need to Provide

- React component with typed props interface
- Component registration with `app.component()`
- Tool that returns `componentResponse()` with props

## Testing

### 1. Start Development Server

```bash
pnpm run dev
```

### 2. Test in ChatGPT Developer Mode

1. Go to ChatGPT Settings → Actions → Developer Mode
2. Add your server: `http://localhost:3000/sse`
3. In chat: "Show me product ABC-123"
4. Should see the product card rendered

### 3. Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector http://localhost:3000/sse --transport sse

# List tools
--method tools/list

# Call tool
--method tools/call --params '{"name": "get_product", "arguments": {"productId": "ABC-123"}}'

# List resources (should include product-card widget)
--method resources/list

# Read widget HTML
--method resources/read --params '{"uri": "ui://widget/product-card.html"}'
```

## Common Variations

### Add More Data Fields

```typescript
interface ProductCardProps {
  // ... existing fields ...
  brand: string;
  category: string;
  reviews: number;
  shipping: {
    available: boolean;
    estimatedDays: number;
  };
}
```

### Conditional Rendering

```typescript
export const ProductCard: FC<ProductCardProps> = ({ ...props }) => {
  return (
    <div className="product-card">
      {/* ... existing content ... */}

      {props.shipping.available && (
        <div className="shipping-info">
          Ships in {props.shipping.estimatedDays} days
        </div>
      )}
    </div>
  );
};
```

### Multiple Products (List View)

```typescript
interface ProductListProps {
  products: ProductCardProps[];
}

export const ProductList: FC<ProductListProps> = ({ products }) => {
  return (
    <div className="product-list">
      {products.map((product, index) => (
        <ProductCard key={index} {...product} />
      ))}
    </div>
  );
};
```

## Key Takeaways

1. **Read-only widgets** don't need `widgetAccessible: true`
2. **Props are strongly typed** - TypeScript enforces shape
3. **CSS can be imported** - Unido bundles it automatically
4. **Images use external URLs** - CDN or public URLs work best
5. **Fallback text is required** - For non-UI contexts (API, CLI)
6. **Component is reusable** - Can be used in multiple tools

## Next Steps

- **Add interactivity**: See [interactive-widget.md](interactive-widget.md)
- **Multiple components**: See [multi-component.md](multi-component.md)
- **Troubleshooting**: See [../troubleshooting.md](../troubleshooting.md)

---

> 📚 **For detailed OpenAI widget specifications**: Query Context7 with `/websites/developers_openai_apps-sdk` and topic "components widgets"
