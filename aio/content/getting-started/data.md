# Managing Data

Welcome to lesson 3 of Angular Getting Started. 

At the end of [Lesson 2: Routing](getting-started/routing), the online store application had a product catalog with two views: a product list and product details. 
Users can click on a product name from the list to see details in a new view, with a distinct URL (route).

In this lesson, you'll create the shopping cart. You'll:
* Define a service and use it in product details
* Change how product data is managed, to use a data service and Angular's HttpClient to retrieve data from an external source (`json` file)
* You'll build out your store with retreiving data from and external source, displaying product details,
 and adding a checkout page.
 * You will define a data service for cart data. 

## Create the shopping cart 

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

<code-example header="src/app/assets/shipping.json" path="src/app/assets/shipping.json">
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

Continue working in `cart.service.ts`.

1. Define a new `getShippingPrices()` method  that uses the `HttpClient#get()` method to retrieve the shipping prices.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="shipping">
    </code-example>




<!-- NO LONGER USED 

### Update the details component

#### Imports

1. Open `product-details.component.ts`. 

1. Import the `ActivatedRoute` service from the `@angular/router` package.

1. Import the `switchMap` operator from the `rxjs/operators` package.

1. Import the `DataService` to use its `getOne()` method to fetch product details.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="imports">
    </code-example>

#### Product property and inject services

Continue working in the product details component (`product-details.component.ts`). 

1. Remove the `Input` decorator from the `product` property. Keep the property itself. 

1. Remove the `share` output property.

1. Inject the `ActivatedRoute`, and `DataService` services to access route information and data access methods.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="props-methods">
    </code-example>


#### Retrieve product details

Continue working in the product details component (`product-details.component.ts`). 

1. In the `ngOnInit()` method, set the `product` property to the current route that uses the `paramMap` property on the route to access the `productId` parsed from the URL.

1. Use the `switchMap` operator on the route information stream to map it into a request for product details using the `DataService#getOne()` method
with the `productId`.

1. Subscribe to the details stream and and update the `product` property with the retrieved product details information.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="get-product">
    </code-example>

Now the product details are available. Click on a name in the list to display the product's details page. 

<figure>
  <img src='generated/images/guide/getting-started/product-details-routed.png' alt="Display details for selected product as a separate page">
</figure>

-->



## Next steps

Congratulations! You have an online store application with a product catalog and shopping cart: 

* The app displays a top bar and a product list
* Product data is retrieved from an external `json` file by a dedicated data service using the HttpClient
* Users can click on a product name from the list to see details in a new view, with a distinct URL (route)
* Users can click on the `Buy` button to add a product to the shopping cart


To continue exploring Angular, choose either of the following options:
* [Continue to the "Forms" section](getting-started/forms). 
* [Skip ahead to the "Deployment" section](getting-started/deployment) to deploy your app to Firebase or move to local development. 


