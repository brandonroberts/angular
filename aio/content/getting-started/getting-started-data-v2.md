# Routing and Managing Data

Welcome to lesson 2 of Angular Getting Started.

At the end of [Lesson 1: Your First App](getting-started/index-v2), the online store application had a basic product catalog:

* The app displays a top bar and a product list
* Users can click on a product name from the list to see details below
* Users can click on the `Share` button to share a product from the list or details

<div class="alert is-helpful">

[Return to the previous Getting Started lesson: Your First App.](getting-started/index-v2)

</div>


In this lesson, you'll extend the app to be more scalable. You'll:
* Change how product details are displayed so they are on their own page, using routing
* Change how product data is managed, to use services, the HttpClient, and an external data source (`json` file)
* Add a checkout page

<!--
## Introduction

Data your app needs can come from many different sources. Whether it be a static file, a backend API that exposes data through a JSON-based API, or other different formats, your app consumes and makes use of this data to make decisions and display content. Your app also needs data to be entered from users to fill out forms for processing. Angular provides libraries to help you consume and receive data by building on top of existing browser APIs.
-->

## Routing and navigation

At the end of part 1, the user displays product details by clicking a product name. The details are displayed in the same page, below the list. This is done by using a simple click event on the product name. Notice that the preview pane URL does not change.

In this section, we'll modify the app to display the product details in a separate page.

To do this, you'll use the Angular router.

<!--
JAF: Do we show them that the app is configured to use the router? Part 1 actually used the router to display the product list. Did it need to?
-->

1. Open the `product-list.component.html` file.

1. On the anchor that displays the product name, replace the click event binding (`(click)="selectProduct(product)"`) with a `routerLink` to the product list template (`/products`).

  ```
  <h3>
    <a [title]="product.name"  [routerLink]="['/products', product.id]>
      <!-- interpolation -->
      {{ product.name }}
    </a>
  </h3>
  ```

1. Remove the Share buttons from the product list.

<!--
JAF: Why? Extra step seems unnecessary
-->

1. Remove the product details component from below the product list.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started-v2/src/app/product-list/product-list.component.html">
    </code-example>

1. Update the product details component template (`product-list.component.html`), so that the title "Product Details" is always displayed, but the product details information are only displayed if they exist. To do this, wrap the product details with an `*ngIf`.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started-v2/src/app/product-details/product-details.component.1.html">
    </code-example>



    Now, when the user clicks on a name in the product list, the product list is replaced by the product details.

1. Add a route in the `AppModule` for product details, with a `path` of `products/:productId` and `ProductDetailsComponent` for the `component`.

<code-example header="src/app/app.module.ts" path="getting-started-v2/src/app/app.module.ts" region="product-details-route">
</code-example>

Click on each product to display the product details. Notice that the URL in the preview window changes. The final digit (1 or 2) is the product's `id` property.

No product detail information is shown yet.

## Predefined services and data

For the purpose of this Getting Started, we have provided a data service and product data.

* `data.service.ts` contains the definition of a data service with cart functionality.

    <code-example header="src/app/data.service.ts" path="getting-started-v2/src/app/data.service.ts" region="v1">
    </code-example>

* `assets/products.json` defines some product data, to simulate fetching data from an external source.

    <code-example header="src/assets/products.json" path="getting-started-v2/src/assets/products.json">
    </code-example>


## Accessing data with HttpClient

HttpClient can be used to access external data, in our case product details from a `json` file.

### Import HttpClient

However, before you can use it, you must set up your app to use HttpClientModule.

1. Open `app.module.ts`.

1. Import `HttpClientModule` from the `@angular/common/http` package.

    <code-example header="src/app/app.module.ts" path="getting-started-v2/src/app/app.module.ts" region="http-client-module-import">
    </code-example>

1. Add `HttpClientModule` to the `imports` array of the app module.

    This registers Angular's Http Client providers globally.

    <code-example header="src/app/app.module.ts" path="getting-started-v2/src/app/app.module.ts" region="http-client-module">
    </code-example>


### Set up the data service to use HttpClient

1. Open `data.service.ts`.

1. Import `HttpClient` from the `@angular/common/http` package.

1. Import `map` operator from the `rxjs/operators` package.

    <code-example header="src/app/data.service.ts" path="getting-started-v2/src/app/data.service.ts" region="imports">
    </code-example>

1. Inject `HttpClient` into constructor of `DataService`

    <code-example header="src/app/data.service.ts" path="getting-started-v2/src/app/data.service.ts" region="ctor">
    </code-example>

### Retrieve the product details

Continue working in `data.service.ts`.

1. Add `getOne()` method with a `productId` argument to the `DataService`.

1. Use the `HttpClient#get()` method to retrieve the products from the JSON file.

1. Use the `map` operator to find one product in the array of the products and return it.

    <code-example header="src/app/data.service.ts" path="getting-started-v2/src/app/data.service.ts" region="get-one">
    </code-example>

### Update the details component

#### Imports

1. Open `product-details.component.ts`.

1. Import the `ActivatedRoute` service from the `@angular/router` package.

1. Import the `switchMap` operator from the `rxjs/operators` package.

1. Import the `DataService` to use its `getOne()` method to fetch product details.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.ts" region="imports">
    </code-example>

#### Product property and inject services

Continue working in the product details component (`product-details.component.ts`).

1. Remove the `Input` decorator from the `product` property. Keep the property itself.

1. Remove the `share` output property.

1. Inject the `ActivatedRoute`, and `DataService` services to access route information and data access methods.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.ts" region="props-methods">
    </code-example>


#### Retrieve product details

Continue working in the product details component (`product-details.component.ts`).

1. In the `ngOnInit()` method, set the `product` property to the current route that uses the `paramMap` property on the route to access the `productId` parsed from the URL.

1. Use the `switchMap` operator on the route information stream to map it into a request for product details using the `DataService#getOne()` method
with the `productId`.

1. Subscribe to the details stream and and update the `product` property with the retrieved product details information.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.ts" region="get-product">
    </code-example>

Now the product details are available. Click on a name in the list to display the product's details page.

<figure>
  <img src='generated/images/guide/getting-started/product-details-routed.png' alt="Display details for selected product as a separate page">
</figure>


## Add products to cart


1. Continue working in the product details component (`product-details.component.ts`).

1. Define an `addToCart()` method that receives a `product` and use the previously defined `DataService#addToCart()` method to add the product your cart.

1. Add an `alert` that the product has been added to the cart.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started-v2/src/app/product-details/product-details.component.ts" region="add-to-cart">
    </code-example>

1. Open the product details template (`product-details.component.html`).

1. Remove the `share` button in the template.

1. Add a `button` that says `Buy` with a `click` event binding to call the `addToCart()` method with the `product`.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started-v2/src/app/product-details/product-details.component.html">
    </code-example>

Users can now click the Buy button to add a product to the cart.

    <figure>
      <img src='generated/images/guide/getting-started/product-details-buy.png' alt="Display details for selected product with a Buy button">
    </figure>


    <figure>
      <img src='generated/images/guide/getting-started/buy-alert.png' alt="Display details for selected product with a Buy button">
    </figure>


## Next steps

Congratulations! You have an online store application with a product catalog and shopping cart:

* The app displays a top bar and a product list
* Product data is retrieved from an external `json` file by a dedicated data service using the HttpClient
* Users can click on a product name from the list to see details in a new view, with a distinct URL (route)
* Users can click on the `Buy` button to add a product to the shopping cart


To continue exploring Angular, we recommend any of the following options:
* Do the next add-on Getting Started lessons in order: Forms, Deployment. The add-on modules extend the online store app to be more robust and scalable, introducing more Angular foundation skills.
* Skip ahead to the [Deployment](getting-started/getting-started-deployment) add-on lesson to deploy your app to Firebase or move to local development.
* Read more about the Angular app [architecture](guide/architecture).


[Continue to the next Getting Started lesson: Forms.](getting-started/getting-started-forms)

