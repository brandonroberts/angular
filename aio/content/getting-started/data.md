# Managing Data

Welcome to lesson 3 of Angular Getting Started. 

At the end of [Lesson 2: Routing](getting-started/routing), the online store application had a product catalog with two views: a product list and product details. 
Users can click on a product name from the list to see details in a new view, with a distinct URL (route).

In this lesson, you'll create the shopping cart. You'll:
* Update the product details page to include a "Buy" button, which adds the current product to a list of products managed by a cart service
* Add a cart component, which displays the items you added to your cart.
* Add a shipping component, which retrieves shipping prices for the items in the cart by using Angular's HttpClient to retrieve shipping data from a `.json` file.

## Services

Services are an integral part of Angular applications. Services in Angular are an instance of a class that can be made available to any part of your application using Angular's dependency injection system.

Services are the place where you share data between parts of your application. For the online store, the cart service is where you to store your cart data and methods.

## Create the shopping cart service

Up to this point, users can view product information, and simulate sharing and being notified about product changes. They cannot, however, buy products. 

In this section, you'll add a "Buy" button the product details page. 
You'll also set up a cart service to store information about products in the cart.

<div class="alert is-helpful">

Later, in the [Forms](getting-started/forms) part of this tutorial, this cart service will be accessible from the page where the user checks out.

</div>

### Define a cart service

1. Generate a cart service.

    1. Right click on the `app` folder, and use the `Angular Generator` to generate a new service named `cart`.

        <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.1.ts"></code-example>

    1. If the generated `@Injectable()` decorator does not include the `{ providedIn: 'root'}` statement, then insert it as shown above. 

1. In the `CartService` class, define an `items` property to store the list (array) of the current products in the cart. 

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="props"></code-example>

1. Define methods to add items to the cart, return cart items, and clear the cart items: 

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="methods"></code-example>

    <!-- 
    * The `addToCart()` method appends a product to an array of `items`. 

    * The `getItems()` method collects the items added to the cart and returns each item with its associated quantity.

    * The `clearCart()` method returns an empty array of items. 
    -->

### Use the cart service 

In this section, you'll update the product details component to use the cart service. 
You'll add a "Buy" button to the product details view. 
When the "Buy" button is clicked, you'll use the cart service to add the current product to the cart. 

1. Open `product-details.component.ts`.

1. Set up the component to be able to use the cart service. 

    1. Import the cart service. 

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="cart-service">
        </code-example>

    1. Inject the cart service.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="inject-cart-service">
        </code-example>

1. Define the `addToCart()` method, which adds the current product to the cart. 

    The `addToCart()` method:
    * Receives the current `product`
    * Uses the cart service's `#addToCart()` method to add the product the cart
    * Displays a message that the product has been added to the cart
    
    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="add-to-cart"></code-example>

1. Update the product details template to have a "Buy" button that adds the current product to the cart. 

    1. Open `product-details.component.html`.

    1. Add a button with the label "Buy", and bind the `click()` event to the `addToCart()` method: 

        <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html">
        </code-example>

1. To see the new "Buy" button, refresh the application and click on a product's name to display its details.

   <figure>
     <img src='generated/images/guide/getting-started/product-details-buy.png' alt="Display details for selected product with a Buy button">
   </figure>
 
 1. Click the "Buy" button. The product is added to the stored list of items in the cart, and a message is displayed. 

    <figure>
      <img src='generated/images/guide/getting-started/buy-alert.png' alt="Display details for selected product with a Buy button">
    </figure>

<!-- 
JAF: Is there an easy way that we can see what's in the cart at this point?
BR: Added steps to create cart page here and refined forms page to only talk about constructing a form.
-->

## Create the cart page

Creating the cart page is just like creating any other component and setting up routing for it: 

1. Generate a cart component, named `cart`. 

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`. 
    
    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.1.ts"></code-example>

1. Add routing (a URL pattern) for the cart component. 

    Reminder: Open `app.module.ts` and a route for the cart, with a `path` of `cart`:

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="cart-route">
    </code-example>

The new cart component isn't hooked into any other component yet, but you can see it in the preview pane by entering the URL specified by its route. The URL has the pattern `https://getting-started.stackblitz.io/cart`,  where `getting-started.stackblitz.io` may be different for your StackBlitz project. 

<figure>
  <img src='generated/images/guide/getting-started/cart-works.png' alt="Display cart page before customizing">
</figure>

### Display the cart items 

Services can be used to share data across components. The product details component uses the `CartService` to add products to the cart,
and the cart component uses the `CartService` to display the products in the cart.

Next, you'll update the cart component to list the cart items.

1. Open `cart.component.ts`.

1. Import the `CartService` from the `cart.service.ts` file.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="imports">
    </code-example>

Continue working in `cart.component.ts`. 

1. Inject the `CartService` to manage cart information.

    ```
    export class CartComponent {
      constructor(
        private formBuilder: FormBuilder,
        private cartService: CartService
      ) { }
    }
    ```

Continue working in `cart.component.ts`. 

1. Define the `items` property to store the products in the cart.

    ```
    export class CartComponent {
      items;
    }
    ```

The resulting `CartComponent` class should look like this: 

<code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="props-services">
</code-example>

Update the template with a header and use a div with an `*ngFor` to display the cart items and totals.

The resulting `CartComponent` template should look like this: 

<code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html" region="prices">
</code-example>

<!--
BR: A page refresh clears the cart, so we need to instruct them to "buy" the items again.
-->

Go back to the product list page, and buy each product.
To see the cart page in the preview pane, click `Checkout`. 
The app displays the cart page title and the cart items.

<figure>
  <img src='generated/images/guide/getting-started/cart-page-no-items.png' alt="Display cart page before items can be added">
</figure>

<!--
JAF: These aren't used in this section about defining the cart list. The cart component template doesn't have a way to initiate submit or clear data. 
-->

<!-- JAF RESUME WORK HERE -->


## Retrieve shipping prices
<!-- Accessing data with the HTTP client -->

Data returned from servers often takes the form of a stream. 
Streams are useful because they make it easy to transform the data that is returned, and to make modifications to the way data is requested. 
The Angular HTTP client (`HttpClient`) is a built-in way to fetch data from external APIs and provide them to your application as a stream.

In this section, you'll use the HTTP client to look up and add shipping prices to the items in the cart. 

### Predefined shipping data

For the purpose of this Getting Started, we have provided shipping data in `assets/shipping.json`. 
You'll use this data to add shipping prices for items in the cart. 

<code-example header="src/assets/shipping.json" path="getting-started/src/assets/shipping.json">
</code-example>


### Enable HttpClient for app

Before you can use Angular's HTTP client, you must set up your app to use `HttpClientModule`. 

Angular's `HttpClientModule` registers the providers needed to use a single instance of the `HttpClient` service throughout your app. 
The `HttpClient` service is what you inject into your services to fetch data and interact with external APIs and resources. 

1. Open `app.module.ts`. 

  This file contains imports and functionality that is available to the entire app. 

1. Import `HttpClientModule` from the `@angular/common/http` package.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module-import">
    </code-example>

1. Add `HttpClientModule` to the `imports` array of the app module.

    This registers Angular's `HttpClient` providers globally.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module">
    </code-example>


### Enable HttpClient for cart service 

1. Open `cart.service.ts`.

1. Import `HttpClient` from the `@angular/common/http` package.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="imports">
    </code-example>

1. Inject `HttpClient` into the constructor of the `CartService` component class: 

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="import-inject">
    </code-example>


### Define the get() method

1. Continue working in `cart.service.ts`.

1. Define a new `getShippingPrices()` method  that uses the `HttpClient#get()` method to retrieve the shipping prices.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="shipping"></code-example>


## Define the shipping page

In this section, you'll create a new shipping component and associated template. 

1. Generate a new component named `shipping`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`. 
    
    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts"></code-example>

1. In `app.module.ts`, add a route for shipping. Specify a `path` of `shipping` and a component of `ShippingComponent`. 

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="shipping-route"></code-example>

1. In the shipping component: 

    1. Import Cart Service

        <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="imports"></code-example>

    1. Define shippingCosts property

        <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="props"></code-example>

    1. Inject the cart service into the `ShippingComponent` class: 

        ```
        constructor(private cartService: CartService) { }
        ```

    1. Set `shippingCosts` property using `getShippingPrices()` method from cart service

        <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="ctor"></code-example>

1. Update the shipping component's template to display the shipping costs using async pipe:

    <code-example header="src/app/shipping/shipping.component.html" path="getting-started/src/app/shipping/shipping.component.html"></code-example>

1. Add a link from the cart page to the shipping page

    <code-example header="src/app/cart/cart.component.2.html" path="getting-started/src/app/cart/cart.component.2.html"></code-example>

    Click on the Checkout icon in the top bar, and then click on the link to navigate to the shipping prices.
<!--
1. The new shipping component isn't hooked into any other component yet, but we can see it in the preview pane by entering the URL specified by its route. The URL has the pattern: `https://getting-started.stackblitz.io/shipping` where the `getting-started.stackblitz.io` part may be different for your StackBlitz project. 
-->

    <figure>
      <img src='generated/images/guide/getting-started/shipping-prices-via-route.png' alt="Display shipping prices">
    </figure>


## Next steps

Congratulations! You have an online store application with a product catalog and shopping cart. You also have the ability to look up and display shipping prices. 


To continue exploring Angular, choose either of the following options:
* [Continue to the "Forms" section](getting-started/forms). 
* [Skip ahead to the "Deployment" section](getting-started/deployment) to deploy your app to Firebase or move to local development. 


