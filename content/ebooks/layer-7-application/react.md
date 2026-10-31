React builds user interfaces out of **components**: functions that take some data and return what the screen should look like. When the data changes, React works out what changed on screen and updates only that.

## Components and props

```tsx
type Product = { id: number; name: string; price: number };

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <article>
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button onClick={() => onAdd(product)}>Add</button>
    </article>
  );
}
```

**Props** are the inputs. They flow **down**, from parent to child, and a child never changes its own props.

## State

State is data a component owns and can change. Changing it with the setter re-renders that component and its children.

```tsx
function Cart({ products }: { products: Product[] }) {
  const [items, setItems] = useState<Product[]>([]);
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      <ProductList products={products} onAdd={(p) => setItems([...items, p])} />
      <Total amount={total} />
    </>
  );
}
```

Notice that `total` is not state. It is **derived** from `items` during render, so it can never fall out of sync.

## Data down, events up

The diagram shows the pattern that keeps React apps understandable:

1. State lives in the closest common parent, here `Cart`.
2. It flows down as props to `ProductList` and `Total`.
3. A click in `ProductCard` calls a function passed down from `Cart`.
4. `Cart` updates its state, and everything that depends on it re-renders.

## Effects are for the outside world

`useEffect` synchronises a component with something outside React, such as a subscription, a timer or a browser API. It is not for computing values from props or state; do that during render.

```tsx
useEffect(() => {
  const id = setInterval(refresh, 30_000);
  return () => clearInterval(id);
}, [refresh]);
```

## Keys in lists

```tsx
<ul>
  {products.map((product) => (
    <ProductCard key={product.id} product={product} onAdd={add} />
  ))}
</ul>
```

A stable `key` lets React match each item between renders. Using the array index breaks when items are added, removed or reordered.

## When it goes wrong

- **The screen does not update:** state was mutated (`items.push(p)`) instead of replaced with a new array.
- **"Too many re-renders":** a setter is called during render instead of inside an event handler.
- **Inputs lose focus while typing:** a component is defined inside another component, so it is recreated on every render.
