# Base UI Patterns

This document describes how to create polymorphic components using Base UI's `useRender` and `mergeProps` utilities.

## useRender and mergeProps

When creating custom components that support polymorphic rendering (render prop pattern), **always** use Base UI's `useRender` and `mergeProps` utilities:

```tsx
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

interface MyComponentProps extends useRender.ComponentProps<"button"> {
  // Add your custom props here (NOT the render prop - it's included automatically)
  variant?: "default" | "ghost";
}

function MyComponent({ className, render, ...props }: MyComponentProps) {
  const defaultProps = {
    className: cn("my-styles", className),
    "data-slot": "my-component",
    // ...other default props
  };

  const element = useRender({
    defaultTagName: "button", // Required: specify the default HTML element
    render: render, // Pass render prop directly (no fallback needed)
    props: mergeProps<"button">(defaultProps, props), // Merge with type parameter
  });

  return element;
}
```

## Key Rules

1. **Use `useRender.ComponentProps<'tagname'>`** instead of `React.ComponentProps<'tagname'>` - this automatically includes the properly-typed `render` prop

2. **Do NOT manually add `render` to your interface** - it's included via `useRender.ComponentProps`

3. **Always include `defaultTagName` parameter** in `useRender()` (required)

4. **Pass `render` prop directly** without fallback (`render || <button />` is incorrect)

5. **Use type parameter in `mergeProps<'tagname'>()`** matching your defaultTagName

6. **For components wrapping with Context or other elements**, assign `useRender` result to a variable first:

```tsx
function MyComponent({ render, ...props }: MyComponentProps) {
  const element = useRender({
    defaultTagName: "div",
    render: render,
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
