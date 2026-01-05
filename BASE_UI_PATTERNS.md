# Base UI Patterns

This document describes how to create polymorphic components using Base UI's `useRender` and `mergeProps` utilities.

## useRender and mergeProps

When creating custom components that support polymorphic rendering (render prop pattern), **always** use Base UI's `useRender` and `mergeProps` utilities:

```tsx
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

interface MyComponentProps extends useRender.ComponentProps<"button"> {
  variant?: "default" | "ghost";
}

function MyComponent({ className, render, ...props }: MyComponentProps) {
  const defaultProps: useRender.ElementProps<"button"> = {
    className: cn("my-styles", className),
    "data-slot": "my-component",
  };

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });

  return element;
}
```

## Key Rules

1. **Never call `useRender` conditionally** - It's a React hook and must follow the rules of hooks. Always call it at the top level of your component, then conditionally return `null` after if needed:

   ```tsx
   // ✅ Correct
   function MyComponent({ children, render, ...props }: Props) {
     const element = useRender({ ... });
     if (!children) return null;
     return element;
   }

   // ❌ Incorrect - violates rules of hooks
   function MyComponent({ children, render, ...props }: Props) {
     if (!children) return null;
     const element = useRender({ ... });
     return element;
   }
   ```

2. **Use `useRender.ComponentProps<'tagname'>`** for your component's public props interface - this automatically includes the properly-typed `render` prop

3. **Use `useRender.ElementProps<'tagname'>`** for typing the internal `defaultProps` object (optional - note that `data-*` attributes are not included in this type, so skip typing if using `data-slot` or other data attributes)

4. **Always include `defaultTagName` parameter** in `useRender()` (required)

5. **Pass `render` prop directly** without fallback (`render || <button />` is incorrect)

6. **Use type parameter in `mergeProps<'tagname'>()`** matching your defaultTagName

## TypeScript Types

Two interfaces are provided for typing props:

- **`useRender.ComponentProps<'tagname'>`** - For external (public) props. Types the `render` prop and HTML attributes.
- **`useRender.ElementProps<'tagname'>`** - For internal (private) props. Types HTML attributes alone.

```tsx
interface ButtonProps extends useRender.ComponentProps<"button"> {}

function Button({ render, ...props }: ButtonProps) {
  const defaultProps: useRender.ElementProps<"button"> = {
    className: "btn",
    type: "button",
    children: "Click me",
  };

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });

  return element;
}
```

## Render Prop Forms

The `render` prop accepts two forms:

### Element Form

Pass a React element to change the rendered tag:

```tsx
<Button render={<a href="/contact" />}>Contact</Button>
```

### Callback Form

Pass a function for full control over rendering. The callback receives `props` and `state`:

```tsx
<Counter
  render={(props, state) => (
    <button {...props}>
      {props.children}
      <span>{state.count}</span>
    </button>
  )}
/>
```

## Passing State

To expose component state to render callbacks, use the `state` parameter. Always memoize the state object:

```tsx
interface CounterState {
  count: number;
  isEven: boolean;
}

interface CounterProps extends useRender.ComponentProps<
  "button",
  CounterState
> {}

function Counter({ render, ...props }: CounterProps) {
  const [count, setCount] = React.useState(0);
  const isEven = count % 2 === 0;

  const state = React.useMemo(() => ({ count, isEven }), [count, isEven]);

  const defaultProps: useRender.ElementProps<"button"> = {
    onClick: () => setCount((c) => c + 1),
    children: `Count: ${count}`,
  };

  const element = useRender({
    defaultTagName: "button",
    render,
    state,
    props: mergeProps<"button">(defaultProps, props),
  });

  return element;
}
```

## Ref Merging

When you need an internal ref while still allowing external refs, use the `ref` parameter. In React 19, the external ref is already in `props`:

```tsx
function MyComponent({ render, ...props }: MyComponentProps) {
  const internalRef = React.useRef<HTMLDivElement | null>(null);

  const element = useRender({
    defaultTagName: "div",
    ref: internalRef,
    render,
    props,
  });

  return element;
}
```

## Wrapping with Context or Other Elements

When wrapping the rendered element with Context providers or other elements, assign the `useRender` result to a variable first:

```tsx
function MyComponent({ render, ...props }: MyComponentProps) {
  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return (
    <MyContext.Provider value={contextValue}>{element}</MyContext.Provider>
  );
}
```

## Benefits

This pattern ensures:

- Proper prop merging between default and user-provided props
- Correct ref forwarding
- Polymorphic rendering (users can change the underlying element)
- Type-safe render prop API
- State exposure to render callbacks
