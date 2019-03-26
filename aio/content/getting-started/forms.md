# Forms

Welcome to lesson 4 of Angular Getting Started. 

At the end of [Lesson 3: Managing Data](getting-started/data), you had an online store application with a product catalog and shopping cart.

In this lesson, you'll finish the app by adding the shopping cart page and a form-based checkout feature. You'll create a form to collect user information as part of checkout. 

## Define the checkout form model

Next, you'll set up the checkout form model. The form model is the source of truth for the status of the form and is defined in the component class. 

1. Open `cart.component.ts`.

1. Import the `FormBuilder` service from the `@angular/forms` package.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="imports">
    </code-example>

    The `FormBuilder` service is provided by the `ReactiveFormsModule`, which is already defined in the `AppModule` you modified previously.

Continue working in `cart.component.ts`. 

1. Inject the `FormBuilder` service to build form models. 

    ```
    export class CartComponent {
      checkoutForm;
      items;

      constructor(
        private cartService: CartService,
        private formBuilder: FormBuilder,
      ) { }
    }
    ```

Continue working in `cart.component.ts`. 

1. In the `CartComponent` class, define the `checkoutForm` property to store the form model.

    ```
    export class CartComponent {
      items;
      checkoutForm;
    }
    ```

1. During checkout, the app will prompt the user for a name and address. So that you can gather that information later, set the `checkoutForm` property with a form model containing `name` and `address` fields, using the  `FormBuilder#group()` method.

    ```
    export class CartComponent {
      checkoutForm;
      items;

    constructor(
      private formBuilder: FormBuilder,
      private cartService: CartService
    ) {
      this.items = this.cartService.getItems();

      this.checkoutForm = this.formBuilder.group({
        name: '',
        address: ''
      });
    ```

The resulting `CartComponent` class should look like this: 

<code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="props-services">
</code-example>

For the checkout process, users will need to be able to submit the form data (their name and address). When the order is submitted, the form should reset and the cart should clear. 

1. Add an `onSubmit` method to process the form data and clear the cart. In a real-world app, you would submit this data to an external server.

1. Use the `CartService#clearCart()` method to empty the cart items and reset the form after it is submitted.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="submit">
    </code-example>

The form model is defined in the component class. To reflect the model in the view, you'll need a checkout form.

<!--
JAF: These aren't used in this section about defining the cart list. The cart component template doesn't have a way to initiate submit or clear data. 

Update the template with a header and use a div with an `*ngFor` to display the cart items and totals.

To see the cart page in the preview pane, click `Checkout`. 
The app displays the cart page title and link to the shipping prices. 
Items from the cart will not show up yet. 

<figure>
  <img src='generated/images/guide/getting-started/cart-page-no-items.png' alt="Display cart page before items can be added">
</figure>

<div class="callout is-critical">
<header>To Debug</header>
JAF: At this point, the app doesn't display the items in my cart. It seems like it should.
</div> -->

## Create the checkout form

Next, you'll add a checkout form at the bottom of the "Cart" page. 

1. Open `cart.component.html`.

1. Add an HTML form to your template to capture user information. Include input fields for name and address, plus a button to submit the purchase. 

    ```
    <form>
    
      <div>
        <label>Name</label>
        <input type="text">
      </div>

      <div>
        <label>Address</label>
        <input type="text">
      </div>

      <button class="button" type="submit">Purchase</button>

    </form>
    ```

1. Use a `formGroup` property binding to bind the `checkoutForm` to the `form` tag in the template.

    ```    
    <form [formGroup]="checkoutForm">
    ...
    </form>
    ```

1. Use an `ngSubmit` event binding on the `form` tag to listen for form submission and call the `submit` method with the `checkoutForm` value.

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.html" region="checkout-form-1">
    </code-example>

1. Define input fields inside the `form` element for `name` and `address`.

1. Use the `formControlName` attribute binding to bind the `checkoutForm` fields for `name` and `address` to their input fields.

<!--
BR: (Already defined) 1. Add a `submit` button that says `Purchase` to trigger form submission.
-->

<code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.html" region="checkout-form-2">
</code-example>

<figure>
  <img src='generated/images/guide/getting-started/cart-page-checkout-form-empty.png' alt="Display cart page with checkout form">
</figure>


## Next steps

Congratulations! You have a complete online store application with a product catalog, a shopping cart, and a checkout function.

[Continue to the "Deployment" section](getting-started/deployment) to deploy your app to Firebase or move to local development. 

