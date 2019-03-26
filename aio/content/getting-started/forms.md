# Forms

Welcome to lesson 4 of Angular Getting Started. 

At the end of [Lesson 3: Managing Data](getting-started/data), you had an online store application with a product catalog and shopping cart.

In this lesson, you'll finish the app by adding the shopping cart page and a form-based checkout feature. You'll create a form to collect user information as part of checkout. 

## Create the cart page

Creating the cart page is just like creating any other component and setting up routing for it: 

1. Generate a cart component, named `cart`. 

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`. 
    
    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts"></code-example>

    <div class="callout is-critical">
    <header>To Do</header>
    Example needs a `cart.component.1.ts` that shows what the component looks like at generation. 
    </div>

1. Add routing (a URL pattern) for the cart component. 

    Reminder: Open `app.module.ts` and a route for the cart, with a `path` of `cart`:

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="cart-route">
    </code-example>

The new cart component isn't hooked into any other component yet, but you can see it in the preview pane by entering the URL specified by its route. The URL has the pattern `https://getting-started.stackblitz.io/cart`,  where `getting-started.stackblitz.io` may be different for your StackBlitz project. 

<figure>
  <img src='generated/images/guide/getting-started/cart-works.png' alt="Display cart page before customizing">
</figure>


## Display the cart items 

Next, you'll create the view for the list of cart items, which will have a link to display the shipping prices. 
As you set up the cart, you'll also begin setting up the checkout form. 

### Import services

1. Open `cart.component.ts`.

1. Import the `FormBuilder` service from the `@angular/forms` package.

1. Import the `CartService` from the `cart.service.ts` file.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="imports">
    </code-example>

### Inject services

Continue working in `cart.component.ts`. 

1. Inject the `FormBuilder` service to build form models. 

1. Inject the `CartService` to manage cart information.

    ```
    export class CartComponent {
      checkoutForm;
      items;

    constructor(
      private formBuilder: FormBuilder,
      private cartService: CartService
    ) { }
    ```

### Define properties

Continue working in `cart.component.ts`. 

1. In the `CartComponent` class, define the `checkoutForm` property to store the form model.

    ```
    export class CartComponent {
      checkoutForm;
    }
    ```

1. Define the `items` property to store the products in the cart.

    ```
    export class CartComponent {
      checkoutForm;
      items;
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
      this.checkoutForm = this.formBuilder.group({
        name: '',
        address: ''
      });
    ```

The resulting `CartComponent` class should look like this: 

<code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="props-services">
</code-example>


### Define methods

For the checkout process, users will need to be able to submit the form data (their name and address). When the order is submitted, the form should reset and the cart should clear. 

1. Add a `submit` method to process the form data and clear the cart. In a real-world app, you would submit this data to an external server.

1. Use the `DataService#clearCart()` method to empty the cart items and reset the form after it is submitted.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="submit">
    </code-example>

<!--
JAF: These aren't used in this section about defining the cart list. The cart component template doesn't have a way to initiate submit or clear data. 
-->


### Update the template

Update the template with a header and use a div with an `*ngFor` to display the cart items and totals.

<code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.html" region="cart-items">
</code-example>

To see the cart page in the preview pane, click `Checkout`. 
The app displays the cart page title and link to the shipping prices. 
Items from the cart will not show up yet. 

<figure>
  <img src='generated/images/guide/getting-started/cart-page-no-items.png' alt="Display cart page before items can be added">
</figure>

<div class="callout is-critical">
<header>To Debug</header>
JAF: At this point, the app doesn't display the items in my cart. It seems like it should.
</div>


## Create the checkout form

Next, you'll add a checkout form at the bottom of the "Cart" page. 

1. Open `cart.component.html`.

1. Add an HTML form to your template to capture user information. Include input fields for name and address, plus a button to submit the purchase. 

    ```
    <form>

    <div>
      <label>Name</label>
      <input type="text" formControlName="name">
    </div>

    <div>
      <label>Address</label>
      <input type="text" formControlName="address">
    </div>

    <button class="button" type="submit">Purchase</button>
    </form>
    ```

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.html" region="checkout-form-1">
    </code-example>

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

1. Add a `submit` button that says `Purchase` to trigger form submission.

<code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.html" region="checkout-form-2">
</code-example>


<figure>
  <img src='generated/images/guide/getting-started/cart-page-checkout-form-empty.png' alt="Display cart page with checkout form">
</figure>



## Next steps

Congratulations! You have a complete online store application with a product catalog, a shopping cart, and a checkout function.  

[Continue to the "Deployment" section](getting-started/deployment) to deploy your app to Firebase or move to local development. 

