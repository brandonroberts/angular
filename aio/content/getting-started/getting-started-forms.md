# Forms

#### Create cart page

1. Generate cart component

Add cart route

1. Add a route in the `AppModule` for the cart, with a `path` of `cart` and `CartComponent` for the `component`.

<code-example header="src/app/app.module.ts" path="getting-started-v2/src/app/app.module.ts">
</code-example>

#### List cart items and create checkout form

Import

1. Import the `FormBuilder` service from the `@angular/forms` package.
1. Import the `DataService` from the `data.service.ts` file.

<code-example header="src/app/cart/cart.component.ts" path="getting-started-v2/src/app/cart/cart.component.ts" region="imports">
</code-example>

Properties and Inject Services

1. Define `checkoutForm` and `items` properties in the cart component class to store the form model and cart items.
1. Inject the `FormBuilder`, and `DataService` services to build form models and access cart information.
1. Use the `FormBuilder#group()` method to set the `checkoutForm` property with a form model containing `name` and `address` fields.
1. Set the `items` property using the `DataService#getCartItems()` that returns the items in the cart.

<code-example header="src/app/cart/cart.component.ts" path="getting-started-v2/src/app/cart/cart.component.ts" region="props-services">
</code-example>

1. Add a `submit` method to process the form data and clear the cart. In a real-world app, you would submit this data to an external server.
1. Use the `DataService#clearCart()` method to empty the cart items and reset the form after it is submitted.

<code-example header="src/app/cart/cart.component.ts" path="getting-started-v2/src/app/cart/cart.component.ts" region="submit">
</code-example>

Update Template

Display cart items

1. Update the template with a header and use a div with an `*ngFor` to display the cart items and totals.

<code-example header="src/app/cart/cart.component.html" path="getting-started-v2/src/app/cart/cart.component.html" region="cart-items">
</code-example>

Checkout form

1. Add an HTML form to your template to capture user information.
1. Use a `formGroup` property binding to bind the `checkoutForm` to the `form` tag in the template.
1. Use an `ngSubmit` event binding on the `form` tag to listen for form submission and call the `submit` method with the `checkoutForm` value.

<code-example header="src/app/cart/cart.component.html" path="getting-started-v2/src/app/cart/cart.component.html" region="checkout-form-1">
</code-example>


1. Define input fields inside the `form` element for `name` and `address`.
1. Use the `formControlName` attribute binding to bind the `checkoutForm` fields for `name` and `address` to their input fields.
1. Add a `submit` button that says `Purchase` to trigger form submission.

<code-example header="src/app/cart/cart.component.html" path="getting-started-v2/src/app/cart/cart.component.html" region="checkout-form-2">
</code-example>

## Finish