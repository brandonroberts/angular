# Managing Data

Welcome to lesson 3 of Angular Getting Started. 

At the end of [Lesson 2: Routing](getting-started/routing), the online store application had a product catalog with two views: a product list and product details. 
Users can click on a product name from the list to see details in a new view, with a distinct URL (route).

In this lesson, you'll extend the app to be more robust and scalable. You'll:
* Change how product data is managed, to use a data service and Angular's HttpClient to retrieve data from an external source (`json` file)

<!--
## Introduction

Data your app needs can come from many different sources. Whether it be a static file, a backend API that exposes data through a JSON-based API, or other different formats, your app consumes and makes use of this data to make decisions and display content. Your app also needs data to be entered from users to fill out forms for processing. Angular provides libraries to help you consume and receive data by building on top of existing browser APIs. 
-->

<!--
JAF: I'd like to move routing to its own lesson between first app and managing data, but we'd have to redesign the flow or the app to make routing work at that point. 
-->

## Predefined services and data

Data your app needs can come from many different sources. Whether it is a static file, a backend API that exposes data through a JSON-based API, or other different formats, your app consumes and makes use of this data to make decisions and display content. Your app also needs data to be entered from users to fill out forms for processing. Angular provides libraries to help you consume and receive data by building on top of existing browser APIs. 

For the purpose of this Getting Started, we have provided a data service and product data. These are already in the starter Stackblitz app. 

### Data service 

`data.service.ts` contains the definition of a data service with cart functionality. 

    <code-example header="src/app/data.service.ts" path="getting-started/src/app/data.service.ts" region="v1">
    </code-example>

### Product data

`assets/products.json` defines some product data, to simulate fetching data from an external source.

    <code-example header="src/assets/products.json" path="getting-started/src/assets/products.json">
    </code-example>


## Accessing data with the HTTP client

Data returned from servers often takes the form of a stream. Streams are useful because they make it easy to transform the data that is returned, and to make modifications to the way data is requested. The Angular HTTP client (`HttpClient`) is a built-in way to fetch data from external APIs and provide them to your application as a stream.

HttpClient can be used to access external data, in our case product details from a `json` file. 

### Import HttpClient

Before you can use Angular's HTTP client, you must set up your app to use HttpClientModule. 

Angular's HttpClientModule registers the providers needed to use a single instance of the HttpClient service throughout your app. The HttpClient service is what you inject into your services to fetch data and interact with external APIs and resources. 

1. Open `app.module.ts`. 

  This file contains imports and functionality that is available to the entire app. 

1. Import `HttpClientModule` from the `@angular/common/http` package.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module-import">
    </code-example>

1. Add `HttpClientModule` to the `imports` array of the app module.

    This registers Angular's HttpClient providers globally.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module">
    </code-example>


### Set up the data service to use HttpClient

1. Open `data.service.ts`.

1. Import `HttpClient` from the `@angular/common/http` package.

1. Import `map` operator from the `rxjs/operators` package.

    <code-example header="src/app/data.service.ts" path="getting-started/src/app/data.service.ts" region="imports">
    </code-example>

1. Inject `HttpClient` into constructor of `DataService`

    <code-example header="src/app/data.service.ts" path="getting-started/src/app/data.service.ts" region="ctor">
    </code-example>

### Retrieve the product details

Continue working in `data.service.ts`.

1. Add `getOne()` method with a `productId` argument to the `DataService`. 

1. Use the `HttpClient#get()` method to retrieve the products from the JSON file.

1. Use the `map` operator to find one product in the array of the products and return it.

    <code-example header="src/app/data.service.ts" path="getting-started/src/app/data.service.ts" region="get-one">
    </code-example>

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


## Add products to cart


1. Continue working in the product details component (`product-details.component.ts`). 

1. Define an `addToCart()` method that receives a `product` and use the previously defined `DataService#addToCart()` method to add the product your cart. 

1. Add an `alert` that the product has been added to the cart.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="add-to-cart">
    </code-example>

1. Open the product details template (`product-details.component.html`). 

1. Remove the `share` button in the template.

1. Add a `button` that says `Buy` with a `click` event binding to call the `addToCart()` method with the `product`.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html">
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


To continue exploring Angular, choose either of the following options:
* [Continue to the "Forms" section](getting-started/forms). 
* [Skip ahead to the "Deployment" section](getting-started/deployment) to deploy your app to Firebase or move to local development. 


